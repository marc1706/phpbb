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

namespace phpbb\db\migration\data\v400;

use phpbb\db\migration\migration;

/**
 * The attachment uploader is no longer named after the JavaScript library that
 * drives it, so the settings and the temporary upload directory it uses are
 * renamed along with it.
 */
class rename_uploader_config extends migration
{
	public function effectively_installed(): bool
	{
		return isset($this->config['uploader_salt']);
	}

	public static function depends_on(): array
	{
		return [
			'\phpbb\db\migration\data\v400\dev',
		];
	}

	public function update_data(): array
	{
		return [
			['config.add', ['uploader_salt', $this->config['plupload_salt'] ?: unique_id()]],
			['config.add', ['uploader_last_gc', (int) $this->config['plupload_last_gc'], true]],
			['custom', [[$this, 'move_temporary_directory']]],
			['config.remove', ['plupload_salt']],
			['config.remove', ['plupload_last_gc']],
		];
	}

	/**
	 * Move the directory the partially uploaded files live in. The salt is
	 * carried over unchanged, so any chunks that are still in flight keep the
	 * file names the uploader expects.
	 *
	 * @return void
	 */
	public function move_temporary_directory(): void
	{
		$upload_path = $this->phpbb_root_path . $this->config['upload_path'];

		if (is_dir($upload_path . '/plupload') && !is_dir($upload_path . '/uploader'))
		{
			@rename($upload_path . '/plupload', $upload_path . '/uploader');
		}
	}
}
