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

/**
* DO NOT CHANGE
*/
if (!defined('IN_PHPBB'))
{
	exit;
}

if (empty($lang) || !is_array($lang))
{
	$lang = array();
}

// DEVELOPERS PLEASE NOTE
//
// All language files should use UTF-8 as their encoding and the files must not contain a BOM.
//
// Placeholders can now contain order information, e.g. instead of
// 'Page %s of %s' you can (and should) write 'Page %1$s of %2$s', this allows
// translators to re-order the output of data while ensuring it remains correct
//
// You do not need this where single placeholders are used, e.g. 'Message %d' is fine
// equally where a string contains only two placeholders which are used to wrap text
// in a url you again do not need to specify an order e.g., 'Click %sHERE%s' is fine

$lang = array_merge($lang, array(
	'UPLOADER_ADD_FILES'			=> 'Add files',
	'UPLOADER_DRAG_TEXTAREA'		=> 'You may also attach files by dragging and dropping them in the message box.',
	'UPLOADER_ERR_FILE_INVALID_EXT'	=> 'Invalid file extension:',
	'UPLOADER_ERR_FILE_TOO_LARGE'	=> 'File too large:',
	'UPLOADER_ERR_INPUT'			=> 'Failed to open input stream.',
	'UPLOADER_ERR_MOVE_UPLOADED'	=> 'Failed to move uploaded file.',
	'UPLOADER_ERR_OUTPUT'			=> 'Failed to open output stream.',
	'UPLOADER_ERR_RESPONSE'			=> 'Error parsing server response.',
	'UPLOADER_FILENAME'				=> 'Filename',
	'UPLOADER_SIZE'					=> 'Size',
	'UPLOADER_STATUS'				=> 'Status',
));
