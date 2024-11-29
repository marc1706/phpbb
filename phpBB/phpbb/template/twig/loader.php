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

namespace phpbb\template\twig;

use Twig\Error\LoaderError;

/**
* Twig Template loader
*/
class loader extends \Twig\Loader\FilesystemLoader
{
	protected $safe_directories = array();

	/**
	 * @var \phpbb\filesystem\filesystem_interface
	 */
	protected $filesystem;

	/**
	 * Constructor
	 *
	 * @param \phpbb\filesystem\filesystem_interface $filesystem
	 * @param string $phpbb_root_path
	 */
	public function __construct(\phpbb\filesystem\filesystem_interface $filesystem, string $phpbb_root_path = '')
	{
		$this->filesystem = $filesystem;

		parent::__construct([], $phpbb_root_path);
	}

	/**
	* Set safe directories
	*
	* @param array $directories Array of directories that are safe (empty to clear)
	* @return \Twig\Loader\FilesystemLoader
	*/
	public function setSafeDirectories($directories = array())
	{
		$this->safe_directories = array();

		if (!empty($directories))
		{
			foreach ($directories as $directory)
			{
				$this->addSafeDirectory($directory);
			}
		}

		return $this;
	}

	/**
	* Add safe directory
	*
	* @param string $directory Directory that should be added
	* @return \Twig\Loader\FilesystemLoader
	*/
	public function addSafeDirectory($directory)
	{
		$directory = $this->filesystem->realpath($directory);

		if ($directory !== false)
		{
			$this->safe_directories[] = $directory;
		}

		return $this;
	}

	/**
	* Get current safe directories
	*
	* @return array
	*/
	public function getSafeDirectories()
	{
		return $this->safe_directories;
	}

	/**
	* Override for parent::validateName()
	*
	* This is done because we added support for safe directories, and when Twig
	*	findTemplate() is called, validateName() is called first, which would
	*	always throw an exception if the file is outside of the configured
	*	template directories.
	*/
	protected function validateName($name)
	{
		return;
	}

	/**
	 * Find the template
	 *
	 * Override for \Twig\Loader\FilesystemLoader::findTemplate
	 * to add support for loading from safe directories.
	 */
	protected function findTemplate($name, $throw = true)
	{
		$name = (string) $name;

		// normalize name
		$name = preg_replace('#/{2,}#', '/', strtr($name, '\\', '/'));

		// If this is in the cache we can skip the entire process below
		//	as it should have already been validated
		if (isset($this->cache[$name]))
		{
			return $this->cache[$name];
		}

		// First, find the template name. The override above of validateName
		//	causes the validateName process to be skipped for this call
		$file = parent::findTemplate($name, $throw);

		try
		{
			// Try validating the name (which may throw an exception)
			$this->validateName($name);
		}
		catch (LoaderError $e)
		{
			if (strpos($e->getRawMessage(), 'Looks like you try to load a template outside configured directories') === 0)
			{
				// Ok, so outside of the configured template directories, we
				//	can now check if we're within a "safe" directory

				// Find the real path of the directory the file is in
				$directory = $this->filesystem->realpath(dirname($file));

				if ($directory === false)
				{
					// Some sort of error finding the actual path, must throw the exception
					throw $e;
				}

				foreach ($this->safe_directories as $safe_directory)
				{
					if (strpos($directory, $safe_directory) === 0)
					{
						// The directory being loaded is below a directory
						// that is "safe". We're good to load it!
						return $file;
					}
				}
			}

			// Not within any safe directories
			throw $e;
		}

		// No exception from validateName, safe to load.
		return $file;
	}

	/**
	 * Find template asset path
	 *
	 * @param string $name Name of asset
	 * @param bool $throw Whether to throw exception in case of issues
	 *
	 * @return bool|string Asset path or false if there was an issue finding the path
	 * @throws LoaderError
	 */
	public function findAsset(string $name, bool $throw = true)
	{
		// normalize name
		$name = preg_replace('#/{2,}#', '/', strtr($name, '\\', '/'));

		try
		{
			list($namespace, $shortname) = $this->parseName($name);

			$this->validateName($shortname);
		}
		catch (LoaderError $e)
		{
			if (!$throw)
			{
				return false;
			}

			throw $e;
		}

		if (!isset($this->paths[$namespace]))
		{
			$this->errorCache[$name] = sprintf('There are no registered paths for namespace "%s".', $namespace);

			if (!$throw)
			{
				return false;
			}

			throw new LoaderError($this->errorCache[$name]);
		}

		foreach ($this->paths[$namespace] as $path)
		{
			if (is_file($path . '/' . $shortname))
			{
				return $path . '/' . $shortname;
			}
		}

		$this->errorCache[$name] = sprintf('Unable to find template "%s" (looked into: %s).', $name, implode(', ', $this->paths[$namespace]));

		if (!$throw)
		{
			return false;
		}

		throw new LoaderError($this->errorCache[$name]);
	}

	/**
	 * Parse name, copy from twig
	 *
	 * @throws LoaderError
	 */
	private function parseName($name): array
	{
		if (isset($name[0]) && '@' == $name[0])
		{
			if (false === $pos = strpos($name, '/'))
			{
				throw new LoaderError(sprintf('Malformed namespaced template name "%s" (expecting "@namespace/template_name").', $name));
			}

			$namespace = substr($name, 1, $pos - 1);
			$shortname = substr($name, $pos + 1);

			return [$namespace, $shortname];
		}

		return [self::MAIN_NAMESPACE, $name];
	}
}
