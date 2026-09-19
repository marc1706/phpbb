<?php
/**
*
* This file is part of the phpBB Forum Software package.
*
* @copyright (c) phpBB Limited <https://www.phpbb.com>
* @license GNU General Public License, version 2 (GPL-2.0)
*
* For full copyright and license information, please see
* the docs/CREDITS.txt file.
*
*/

namespace phpbb\uploader;

/**
* This class handles the server side of the JavaScript attachment uploader:
* it configures the client, reassembles chunked uploads and reports errors
* back as JSON.
*
* It is deliberately named after what it does rather than after the library
* that happens to drive it in the browser (currently Dropzone, see
* assets/javascript/uploader.js), so that swapping that library out does not
* ripple through the namespace, the service id, the stored configuration or
* the temporary upload directory.
*/
class uploader
{
	/**
	* @var string
	*/
	protected $phpbb_root_path;

	/**
	* @var \phpbb\config\config
	*/
	protected $config;

	/**
	* @var \phpbb\request\request
	*/
	protected $request;

	/**
	* @var \phpbb\user
	*/
	protected $user;

	/**
	* @var \bantu\IniGetWrapper\IniGetWrapper
	*/
	protected $php_ini;

	/**
	* @var \phpbb\mimetype\guesser
	*/
	protected $mimetype_guesser;

	/**
	* Final destination for uploaded files, i.e. the "files" directory.
	* @var string
	*/
	protected $upload_directory;

	/**
	* Temporary upload directory for chunked uploads.
	* @var string
	*/
	protected $temporary_directory;

	/**
	* Constructor.
	*
	* @param string $phpbb_root_path
	* @param \phpbb\config\config $config
	* @param \phpbb\request\request $request
	* @param \phpbb\user $user
	* @param \bantu\IniGetWrapper\IniGetWrapper $php_ini
	* @param \phpbb\mimetype\guesser $mimetype_guesser
	*/
	public function __construct($phpbb_root_path, \phpbb\config\config $config, \phpbb\request\request $request, \phpbb\user $user, \bantu\IniGetWrapper\IniGetWrapper $php_ini, \phpbb\mimetype\guesser $mimetype_guesser)
	{
		$this->phpbb_root_path = $phpbb_root_path;
		$this->config = $config;
		$this->request = $request;
		$this->user = $user;
		$this->php_ini = $php_ini;
		$this->mimetype_guesser = $mimetype_guesser;

		$this->set_default_directories();
	}

	/**
	* The uploader may split a file into chunks, so we must check for that and
	* assemble the whole file first before performing any checks on it.
	*
	* @param string $form_name The name of the file element in the upload form
	*
	* @return array|null	null if there are no chunks to piece together
	*						otherwise array containing the path to the
	*						pieced-together file and its size
	*/
	public function handle_upload($form_name)
	{
		$chunks_expected = $this->request->variable('chunks', 0);

		// If chunking is disabled or the file was sent in one piece, just
		// return and handle the file as usual
		if ($chunks_expected < 2)
		{
			return null;
		}

		$file_name = $this->request->variable('name', '');
		$chunk = $this->request->variable('chunk', 0);

		$this->user->add_lang('uploader');
		$this->prepare_temporary_directory();

		$file_path = $this->temporary_filepath($file_name);
		$this->integrate_uploaded_file($form_name, $chunk, $file_path);

		// If we are done with all the chunks, strip the .part suffix and then
		// handle the resulting file as normal, otherwise die and await the
		// next chunk.
		if ($chunk == $chunks_expected - 1)
		{
			rename("{$file_path}.part", $file_path);

			// Reset upload directories to defaults once completed
			$this->set_default_directories();

			// Need to modify some of the $_FILES values to reflect the new file
			return array(
				'tmp_name' => $file_path,
				'name' => $this->request->variable('real_filename', '', true),
				'size' => filesize($file_path),
				'type' => $this->mimetype_guesser->guess($file_path, $file_name),
			);
		}
		else
		{
			$json_response = new \phpbb\json_response();
			$json_response->send(array(
				'jsonrpc' => '2.0',
				'id' => 'id',
				'result' => null,
			));
			return null;
		}
	}

	/**
	* Fill in the uploader configuration options in the template
	*
	* @param \phpbb\cache\service		$cache
	* @param \phpbb\template\template	$template
	* @param string						$s_action The URL to submit the POST data to
	* @param int						$forum_id The ID of the forum
	* @param int						$max_files Maximum number of files allowed. 0 for unlimited.
	*
	* @return void
	*/
	public function configure(\phpbb\cache\service $cache, \phpbb\template\template $template, $s_action, $forum_id, $max_files)
	{
		$filters = $this->generate_filter_string($cache, $forum_id);
		$chunk_size = $this->get_chunk_size();
		$resize = $this->generate_resize_string();

		$template->assign_vars(array(
			'S_RESIZE'			=> $resize,
			'S_UPLOADER'		=> true,
			'FILTERS'			=> $filters,
			'CHUNK_SIZE'		=> $chunk_size,
			'S_UPLOADER_URL'	=> html_entity_decode($s_action, ENT_COMPAT),
			'MAX_ATTACHMENTS'	=> $max_files,
			'ATTACH_ORDER'		=> ($this->config['display_order']) ? 'asc' : 'desc',
			'L_TOO_MANY_ATTACHMENTS'	=> $this->user->lang('TOO_MANY_ATTACHMENTS', $max_files),
		));

		$this->user->add_lang('uploader');
	}

	/**
	* Checks whether the page request was sent by the JavaScript uploader or not
	*
	* @return bool
	*/
	public function is_active()
	{
		return (bool) $this->request->header('X-PHPBB-USING-UPLOADER', false);
	}

	/**
	* Returns whether the current HTTP request is a multipart request.
	*
	* @return bool
	*/
	public function is_multipart()
	{
		$content_type = $this->request->server('CONTENT_TYPE');

		return strpos($content_type, 'multipart') === 0;
	}

	/**
	* Sends an error message back to the client via JSON response
	*
	* @param int $code		The error code
	* @param string $msg	The translation string of the message to be sent
	*
	* @return void
	*/
	public function emit_error($code, $msg)
	{
		$json_response = new \phpbb\json_response();
		$json_response->send(array(
			'jsonrpc' => '2.0',
			'id' => 'id',
			'error' => array(
				'code' => $code,
				'message' => $this->user->lang($msg),
			),
		));
	}

	/**
	 * Looks at the list of allowed extensions and generates the JSON encoded
	 * list of extension groups that the uploader is configured with
	 *
	 * @param \phpbb\cache\service	$cache		Cache service object
	 * @param int					$forum_id	The forum identifier
	 *
	 * @return string JSON encoded array of objects with the keys title,
	 *                extensions and max_file_size
	 */
	public function generate_filter_string(\phpbb\cache\service $cache, int $forum_id)
	{
		$groups = [];
		$filters = [];

		$attach_extensions = $cache->obtain_attach_extensions($forum_id);
		unset($attach_extensions['_allowed_']);

		// Re-arrange the extension array to $groups[$group_name][]
		foreach ($attach_extensions as $extension => $extension_info)
		{
			$groups[$extension_info['group_name']]['extensions'][] = $extension;
			$groups[$extension_info['group_name']]['max_file_size'] = (int) $extension_info['max_filesize'];
		}

		foreach ($groups as $group => $group_info)
		{
			$filters[] = [
				'title'			=> ucfirst(strtolower($group)),
				'extensions'	=> implode(',', $group_info['extensions']),
				'max_file_size'	=> $group_info['max_file_size'],
			];
		}

		return json_encode($filters, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
	}

	/**
	* Generates the JSON encoded settings that are used to tell the uploader to
	* automatically resize images before uploading them.
	*
	* @return string JSON encoded object with the keys width, height, quality
	*                and preserve_headers, or "null" if resizing is disabled
	*/
	public function generate_resize_string()
	{
		$resize = null;

		if ($this->config['img_max_height'] > 0 && $this->config['img_max_width'] > 0)
		{
			$resize = [
				'width'				=> (int) $this->config['img_max_width'],
				'height'			=> (int) $this->config['img_max_height'],
				'quality'			=> (int) $this->config['img_quality'],
				'preserve_headers'	=> !$this->config['img_strip_metadata'],
			];
		}

		return json_encode($resize);
	}

	/**
	 * Checks various php.ini values to determine the maximum chunk
	 * size a file should be split into for upload.
	 *
	 * The intention is to calculate a value which reflects whatever
	 * the most restrictive limit is set to.  And to then set the chunk
	 * size to half that value, to ensure any required transfer overhead
	 * and POST data remains well within the limit.  Or, if all of the
	 * limits are set to unlimited, the chunk size will also be unlimited.
	 *
	 * @return int
	 *
	 * @access public
	 */
	public function get_chunk_size()
	{
		$max = 0;

		$limits = [
			$this->php_ini->getBytes('memory_limit'),
			$this->php_ini->getBytes('upload_max_filesize'),
			$this->php_ini->getBytes('post_max_size'),
		];

		foreach ($limits as $limit_type)
		{
			if ($limit_type > 0)
			{
				$max = ($max !== 0) ? min($limit_type, $max) : $limit_type;
			}
		}

		return (int) floor($max / 2);
	}

	protected function temporary_filepath($file_name)
	{
		// Must preserve the extension so that the mimetype can be guessed.
		return sprintf(
			'%s/%s_%s%s',
			$this->temporary_directory,
			$this->config['uploader_salt'],
			md5($file_name),
			\phpbb\files\filespec::get_extension($file_name)
		);
	}

	/**
	* Checks whether the chunk we are about to deal with was actually uploaded
	* by PHP and actually exists, if not, it generates an error
	*
	* @param string $form_name The name of the file in the form data
	* @param int $chunk Chunk number
	* @param string $file_path File path
	*
	* @return void
	*/
	protected function integrate_uploaded_file($form_name, $chunk, $file_path)
	{
		$is_multipart = $this->is_multipart();
		$upload = $this->request->file($form_name);
		if ($is_multipart && (!isset($upload['tmp_name']) || !is_uploaded_file($upload['tmp_name'])))
		{
			$this->emit_error(103, 'UPLOADER_ERR_MOVE_UPLOADED');
		}

		$tmp_file = $this->temporary_filepath($upload['tmp_name']);
		$filesystem = new \phpbb\filesystem\filesystem();

		if (!$filesystem->is_writable($this->temporary_directory) || !move_uploaded_file($upload['tmp_name'], $tmp_file))
		{
			$this->emit_error(103, 'UPLOADER_ERR_MOVE_UPLOADED');
		}

		$out = fopen("{$file_path}.part", $chunk == 0 ? 'wb' : 'ab');
		if (!$out)
		{
			$this->emit_error(102, 'UPLOADER_ERR_OUTPUT');
		}

		$in = fopen(($is_multipart) ? $tmp_file : 'php://input', 'rb');
		if (!$in)
		{
			$this->emit_error(101, 'UPLOADER_ERR_INPUT');
		}

		while ($buf = fread($in, 4096))
		{
			fwrite($out, $buf);
		}

		fclose($in);
		fclose($out);

		if ($is_multipart)
		{
			unlink($tmp_file);
		}
	}

	/**
	* Creates the temporary directory if it does not already exist.
	*
	* @return void
	*/
	protected function prepare_temporary_directory()
	{
		if (!file_exists($this->temporary_directory))
		{
			mkdir($this->temporary_directory);

			copy(
				$this->upload_directory . '/index.htm',
				$this->temporary_directory . '/index.htm'
			);
		}
	}

	/**
	* Sets the default directories for uploads
	*
	* @return void
	*/
	protected function set_default_directories()
	{
		$this->upload_directory = $this->phpbb_root_path . $this->config['upload_path'];
		$this->temporary_directory = $this->upload_directory . '/uploader';
	}

	/**
	* Sets the upload directories to the specified paths
	*
	* @param string $upload_directory Upload directory
	* @param string $temporary_directory Temporary directory
	*
	* @return void
	*/
	public function set_upload_directories($upload_directory, $temporary_directory)
	{
		$this->upload_directory = $upload_directory;
		$this->temporary_directory = $temporary_directory;
	}
}
