/* global phpbb, Dropzone, attachInline, activateSubPanel */
/* eslint camelcase: 0 */
/* eslint no-var: 0 */

/**
 * phpBB attachment uploader, built on top of Dropzone.
 *
 * This file and assets/dropzone/ are the only places that know which library
 * does the uploading; everything else on both sides talks in terms of phpBB's
 * own uploader. Files are posted to the posting script as multipart/form-data
 * using the "fileupload" field, and large files are split into chunks that are
 * described by the "chunk", "chunks" and "name" POST fields and reassembled
 * server side by \phpbb\uploader\uploader.
 */
(function($) { // Avoid conflicts with other libraries

'use strict';

phpbb.uploader.ids = [];

/**
 * Turn the list of attachment extension groups into a value for Dropzone's
 * acceptedFiles option.
 *
 * @returns {string|null} Comma separated list of extensions, or null if any
 *	file type is allowed.
 */
phpbb.uploader.getAcceptedFiles = function() {
	var extensions = [];
	var unrestricted = false;

	$.each(phpbb.uploader.filters, function(i, filter) {
		$.each(filter.extensions.split(','), function(j, extension) {
			extension = $.trim(extension);

			if (extension === '*') {
				unrestricted = true;
				return false;
			}

			if (extension !== '' && $.inArray('.' + extension, extensions) === -1) {
				extensions.push('.' + extension);
			}

			return true;
		});

		return !unrestricted;
	});

	return (unrestricted || !extensions.length) ? null : extensions.join(',');
};

/**
 * Get the maximum file size that applies to a given file name, based on the
 * per extension group limits configured in the ACP.
 *
 * @param {string} fileName The name of the file.
 * @returns {int} The limit in bytes, 0 if the group has no limit and -1 if no
 *	group matches the file name.
 */
phpbb.uploader.getMaxFileSize = function(fileName) {
	var maxFileSize = -1;

	$.each(phpbb.uploader.filters, function(i, filter) {
		var patterns = [];

		$.each(filter.extensions.split(','), function(j, extension) {
			extension = $.trim(extension);

			if (extension === '*') {
				patterns.push('\\.[^.]+');
			} else if (extension !== '') {
				patterns.push('\\.' + extension.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
			}
		});

		if (!patterns.length) {
			return true;
		}

		if (new RegExp('(' + patterns.join('|') + ')$', 'i').test(fileName)) {
			maxFileSize = filter.max_file_size;
			return false;
		}

		return true;
	});

	return maxFileSize;
};

/**
 * Convert the array of attachment objects into an object that PHP would expect as POST data.
 *
 * @returns {object} An object in the form 'attachment_data[i][key]': value as
 *	expected by the server
 */
phpbb.uploader.getSerializedData = function() {
	var obj = {};

	for (var i = 0; i < phpbb.uploader.data.length; i++) {
		var datum = phpbb.uploader.data[i];

		for (var key in datum) {
			if (!datum.hasOwnProperty(key)) {
				continue;
			}

			obj['attachment_data[' + i + '][' + key + ']'] = datum[key];
		}
	}

	// Insert form data
	var $form = $(phpbb.uploader.config.form_hook).first();
	obj.creation_time = $form.find('input[type=hidden][name="creation_time"]').val();
	obj.form_token = $form.find('input[type=hidden][name="form_token"]').val();

	return obj;
};

/**
 * Get the index from the phpbb.uploader.data array where the given
 * attachment id appears.
 *
 * @param {int} attachId The attachment id of the file.
 * @returns {bool|int} Index of the file if exists, otherwise false.
 */
phpbb.uploader.getIndex = function(attachId) {
	var index = $.inArray(Number(attachId), phpbb.uploader.ids);
	return (index !== -1) ? index : false;
};

/**
 * Set the data in phpbb.uploader.data and phpbb.uploader.ids arrays.
 *
 * @param {Array} data	Array containing the new data to use. In the form of
 * array(index => object(property: value). Requires attach_id to be one of the object properties.
 */
phpbb.uploader.setData = function(data) {
	phpbb.uploader.ids = [];
	phpbb.uploader.data = data;

	for (var i = 0; i < data.length; i++) {
		phpbb.uploader.ids.push(Number(data[i].attach_id));
	}
};

/**
 * Update the attachment data in the HTML and the phpbb & phpbb.uploader objects.
 *
 * @param {Array} data			Array containing the new data to use.
 * @param {string} action		The action that required the update. Used to update the inline attachment bbcodes.
 * @param {int} index			The index from phpbb.uploader.ids that was affected by the action.
 * @param {Array} downloadUrl	Optional array of download urls to update.
 */
phpbb.uploader.update = function(data, action, index, downloadUrl) {
	phpbb.uploader.updateBbcode(action, index);
	phpbb.uploader.setData(data);
	phpbb.uploader.updateRows(downloadUrl);
};

/**
 * Update the relevant elements and hidden data for all attachments.
 *
 * @param {Array} downloadUrl Optional array of download urls to update.
 */
phpbb.uploader.updateRows = function(downloadUrl) {
	for (var i = 0; i < phpbb.uploader.ids.length; i++) {
		phpbb.uploader.updateRow(i, downloadUrl);
	}
};

/**
 * Insert a row for a new attachment. This expects an HTML snippet in the HTML
 * using the id "attach-row-tpl" to be present. This snippet is cloned and the
 * data for the file inserted into it. The row is then appended or prepended to
 * #file-list based on the attach_order setting.
 *
 * @param {object} file Dropzone file object for the new attachment.
 */
phpbb.uploader.insertRow = function(file) {
	var row = $(phpbb.uploader.rowTpl);

	row.attr('id', phpbb.uploader.rowId(file));
	row.find('.file-name').text(file.name);
	row.find('.file-size').text(phpbb.uploader.formatSize(file.size));

	if (phpbb.uploader.order === 'desc') {
		$('#file-list').prepend(row);
	} else {
		$('#file-list').append(row);
	}
};

/**
 * Format a file size the same way get_formatted_filesize() does server side.
 *
 * @param {int} size Size in bytes.
 * @returns {string} The formatted size.
 */
phpbb.uploader.formatSize = function(size) {
	var units = phpbb.uploader.lang.units,
		keys = [ 'tb', 'gb', 'mb', 'kb' ];

	for (var i = 0; i < keys.length; i++) {
		var cutoff = Math.pow(1024, 4 - i);

		if (size >= cutoff) {
			return (Math.round((size / cutoff) * 100) / 100) + ' ' + units[keys[i]];
		}
	}

	return size + ' ' + units.b;
};

/**
 * Get the id of the attachment row that belongs to a file.
 *
 * @param {object} file Dropzone file object.
 * @returns {string} The DOM id of the row.
 */
phpbb.uploader.rowId = function(file) {
	return 'attach-file-' + file.upload.uuid;
};

/**
 * Get the attachment row that belongs to a file.
 *
 * @param {object} file Dropzone file object.
 * @returns {object} jQuery object for the row.
 */
phpbb.uploader.getRow = function(file) {
	return $(document.getElementById(phpbb.uploader.rowId(file)));
};

/**
 * Update the relevant elements and hidden data for an attachment.
 *
 * @param {int} index The index from phpbb.uploader.ids of the attachment to edit.
 * @param {Array} downloadUrl Optional array of download urls to update.
 */
phpbb.uploader.updateRow = function(index, downloadUrl) {
	var attach = phpbb.uploader.data[index],
		row = $('[data-attach-id="' + attach.attach_id + '"]');

	// Add the link to the file
	if (typeof downloadUrl !== 'undefined' && typeof downloadUrl[index] !== 'undefined') {
		var url = downloadUrl[index].replace('&amp;', '&'),
			link = $('<a></a>');

		link.attr('href', url).text(attach.real_filename);
		row.find('.file-name').html(link);
	}

	row.find('textarea').attr('name', 'comment_list[' + index + ']');
	phpbb.uploader.updateHiddenData(row, attach, index);
};

/**
 * Update hidden input data for an attachment.
 *
 * @param {object} row		jQuery object for the attachment row.
 * @param {object} attach	Attachment data object from phpbb.uploader.data
 * @param {int} index		Attachment index from phpbb.uploader.ids
 */
phpbb.uploader.updateHiddenData = function(row, attach, index) {
	row.find('input[type="hidden"]').remove();

	for (var key in attach) {
		if (!attach.hasOwnProperty(key)) {
			return;
		}

		var input = $('<input />')
			.attr('type', 'hidden')
			.attr('name', 'attachment_data[' + index + '][' + key + ']')
			.attr('value', attach[key]);
		$(row).append(input);
	}
};

/**
 * Deleting a file removes it from the queue and fires an AJAX event to the
 * server to tell it to remove the temporary attachment. The server
 * responds with the updated attachment data list so that any future
 * uploads can maintain state with the server
 *
 * @param {object} row		jQuery object for the attachment row.
 * @param {int} attachId	Attachment id of the file to be removed.
 */
phpbb.uploader.deleteFile = function(row, attachId) {
	// If there's no attach id, then the file hasn't been uploaded. Simply delete the row.
	if (typeof attachId === 'undefined') {
		phpbb.uploader.removeFileByRow(row);

		row.slideUp(100, function() {
			row.remove();
			phpbb.uploader.hideEmptyList();
		});

		return;
	}

	var index = phpbb.uploader.getIndex(attachId);
	row.find('.file-status').toggleClass('file-uploaded file-working');

	if (index === false) {
		return;
	}

	var fields = {};
	fields['delete_file[' + index + ']'] = 1;

	var always = function() {
		row.find('.file-status').removeClass('file-working');
	};

	var done = function(response) {
		if (typeof response !== 'object') {
			return;
		}

		// trigger_error() was called which likely means a permission error was encountered.
		if (typeof response.title !== 'undefined') {
			phpbb.alert(phpbb.uploader.lang.ERROR, response.message);
			// We will have to assume that the deletion failed. So leave the file status as uploaded.
			row.find('.file-status').toggleClass('file-uploaded');

			return;
		}

		// Handle errors while deleting file
		if (typeof response.error !== 'undefined') {
			phpbb.alert(phpbb.uploader.lang.ERROR, response.error.message);

			// We will have to assume that the deletion failed. So leave the file status as uploaded.
			row.find('.file-status').toggleClass('file-uploaded');

			return;
		}

		phpbb.uploader.update(response, 'removal', index);
		// Check if the user can upload files now if he had reached the max files limit.
		phpbb.uploader.handleMaxFilesReached();

		phpbb.uploader.removeFileByRow(row);

		row.slideUp(100, function() {
			row.remove();
			// Hide the file list if it's empty now.
			phpbb.uploader.hideEmptyList();
		});
	};

	$.ajax(phpbb.uploader.config.url, {
		type: 'POST',
		data: $.extend(fields, phpbb.uploader.getSerializedData()),
		headers: phpbb.uploader.config.headers,
	})
	.always(always)
	.done(done);
};

/**
 * Remove the Dropzone file that belongs to an attachment row, if any.
 *
 * @param {object} row jQuery object for the attachment row.
 */
phpbb.uploader.removeFileByRow = function(row) {
	var rowId = row.attr('id');

	if (!rowId) {
		return;
	}

	$.each(phpbb.uploader.uploader.files.slice(0), function(i, file) {
		if (phpbb.uploader.rowId(file) === rowId) {
			phpbb.uploader.uploader.removeFile(file);
			return false;
		}

		return true;
	});
};

/**
 * Check the attachment list and hide its container if it's empty.
 */
phpbb.uploader.hideEmptyList = function() {
	if (!$('#file-list').children().length) {
		$('#file-list-container').slideUp(100);
	}
};

/**
 * Update the indices used in inline attachment bbcodes. This ensures that the
 * bbcodes correspond to the correct file after a file is added or removed.
 * This should be called before the phpbb.uploader.data and phpbb.uploader.ids
 * arrays are updated, otherwise it will not work correctly.
 *
 * @param {string} action	The action that occurred -- either "addition" or "removal"
 * @param {int} index		The index of the attachment from phpbb.uploader.ids that was affected.
 */
phpbb.uploader.updateBbcode = function(action, index) {
	var	textarea = $('#message', phpbb.uploader.form),
		text = textarea.val(),
		removal = (action === 'removal');

	// Return if the bbcode isn't used at all.
	if (typeof text === 'undefined' || text.indexOf('[attachment=') === -1) {
		return;
	}

	function runUpdate(i) {
		var regex = new RegExp('\\[attachment=' + i + '\\](.*?)\\[\\/attachment\\]', 'g');
		text = text.replace(regex, function updateBbcode(_, fileName) {
			// Remove the bbcode if the file was removed.
			if (removal && index === i) {
				return '';
			}
			var newIndex = i + ((removal) ? -1 : 1);
			return '[attachment=' + newIndex + ']' + fileName + '[/attachment]';
		});
	}

	// Loop forwards when removing and backwards when adding ensures we don't
	// corrupt the bbcode index.
	var i;
	if (removal) {
		for (i = index; i < phpbb.uploader.ids.length; i++) {
			runUpdate(i);
		}
	} else {
		for (i = phpbb.uploader.ids.length - 1; i >= index; i--) {
			runUpdate(i);
		}
	}

	textarea.val(text);
};

/**
 * Count the files that are going to occupy an attachment slot once the queue
 * has been worked through: the attachments the server already knows about plus
 * the files that are still on their way up.
 *
 * @returns {int} Number of attachments.
 */
phpbb.uploader.countFiles = function() {
	var pending = 0;

	$.each(phpbb.uploader.uploader.files, function(i, file) {
		if (file.accepted !== false && !file.attachmentData &&
			file.status !== Dropzone.ERROR && file.status !== Dropzone.CANCELED) {
			pending++;
		}
	});

	return phpbb.uploader.ids.length + pending;
};

/**
 * Check whether the user has reached the maximum number of files that they are
 * allowed to upload and enable or disable the uploader accordingly.
 *
 * @returns {bool} True if the limit has been reached. False if otherwise.
 */
phpbb.uploader.handleMaxFilesReached = function() {
	// If there is no limit, the user is an admin or moderator.
	if (phpbb.uploader.maxFiles && phpbb.uploader.maxFiles <= phpbb.uploader.countFiles()) {
		phpbb.uploader.disableUploader();

		return true;
	}

	phpbb.uploader.enableUploader();

	return false;
};

/**
 * Disable the uploader
 */
phpbb.uploader.disableUploader = function() {
	$('#add_files').addClass('disabled').prop('disabled', true);
};

/**
 * Enable the uploader
 */
phpbb.uploader.enableUploader = function() {
	$('#add_files').removeClass('disabled').prop('disabled', false);
};

/**
 * Marks a file as failed and sets the error message for it.
 *
 * @param {object} file		Dropzone file object that failed.
 * @param {string} error	Error message to present to the user.
 */
phpbb.uploader.fileError = function(file, error) {
	var row = phpbb.uploader.getRow(file);

	row.find('.file-progress').hide();
	row.find('.file-status')
		.removeClass('file-working file-uploaded')
		.addClass('file-error')
		.attr({
			'data-error-title': phpbb.uploader.lang.ERROR,
			'data-error-message': error,
		});
};

/**
 * Normalise whatever the server or Dropzone handed us into an error message,
 * or return false if the response does not describe an error at all.
 *
 * @param {object|string} response Parsed JSON response or plain string.
 * @returns {string|bool} The error message or false.
 */
phpbb.uploader.getResponseError = function(response) {
	if (typeof response === 'string') {
		// A JSON response is what we expect; anything else means something
		// went wrong before phpBB could answer.
		try {
			response = JSON.parse(response);
		} catch (e) {
			return phpbb.uploader.lang.RESPONSE_ERROR;
		}
	}

	if (typeof response !== 'object' || response === null) {
		return phpbb.uploader.lang.RESPONSE_ERROR;
	}

	// If trigger_error() was called, then a permission error likely occurred.
	if (typeof response.title !== 'undefined') {
		return response.message;
	}

	if (response.error) {
		return response.error.message;
	}

	return false;
};

/**
 * Build the option set that is handed to Dropzone.
 *
 * @returns {object} Dropzone options.
 */
phpbb.uploader.getOptions = function() {
	var config = phpbb.uploader.config,
		chunkSize = parseInt(config.chunk_size, 10),
		maxFilesize = parseInt(config.max_file_size, 10),
		options = {
			url: config.url,
			paramName: config.file_data_name,
			headers: config.headers,
			timeout: 0,

			// phpBB renders its own attachment rows, so Dropzone's previews
			// and thumbnails are not needed.
			previewsContainer: false,
			disablePreviews: true,
			createImageThumbnails: false,

			// The server keeps the attachment list in step with every single
			// request, so the files have to go up one after the other.
			uploadMultiple: false,
			parallelUploads: 1,
			autoProcessQueue: true,

			// Only the "Add files" button opens the file dialog; the drop
			// targets are wired up separately below.
			clickable: '#add_files',

			// Enforced in phpbb.uploader.accept() so that the per extension
			// group limits are taken into account as well.
			maxFilesize: null,
			maxFiles: null,

			chunking: chunkSize > 0,
			forceChunking: false,
			chunkSize: chunkSize > 0 ? chunkSize : 2 * 1024 * 1024,
			parallelChunkUploads: false,
			retryChunks: false,

			// Only used to set the accept attribute of the file dialog; the
			// checks themselves are done in phpbb.uploader.accept(), which
			// replaces Dropzone's own accept() so that phpBB's language
			// strings and limits are the ones that apply.
			acceptedFiles: phpbb.uploader.getAcceptedFiles(),
			params: phpbb.uploader.getRequestParams,
		};

	phpbb.uploader.maxFilesize = maxFilesize > 0 ? maxFilesize : 0;

	if (phpbb.uploader.resize) {
		options.resizeWidth = phpbb.uploader.resize.width;
		options.resizeHeight = phpbb.uploader.resize.height;
		options.resizeQuality = phpbb.uploader.resize.quality / 100;
		options.resizeMethod = 'contain';

		// Dropzone can only copy the EXIF headers of a resized JPEG over from
		// the original if it has read the image into a data URL first, which
		// is what the thumbnail generation does.
		options.createImageThumbnails = phpbb.uploader.resize.preserve_headers;
	}

	return options;
};

/**
 * Decide whether a file may be uploaded. Runs the checks that Dropzone would
 * normally run itself, using phpBB's limits and language strings.
 *
 * @param {object} file			Dropzone file object.
 * @param {function} done		Callback; called with an error message to reject the file.
 */
phpbb.uploader.accept = function(file, done) {
	var maxFileSize = phpbb.uploader.getMaxFileSize(file.name);

	if (maxFileSize === -1) {
		done(phpbb.uploader.lang.INVALID_EXTENSION + ' ' + file.name);
		return;
	}

	// The board wide limit and the limit of the extension group the file
	// belongs to both apply; the lower one wins.
	if (phpbb.uploader.maxFilesize && (!maxFileSize || phpbb.uploader.maxFilesize < maxFileSize)) {
		maxFileSize = phpbb.uploader.maxFilesize;
	}

	if (maxFileSize && file.size > maxFileSize) {
		done(phpbb.uploader.lang.FILE_TOO_LARGE + ' ' + file.name);
		return;
	}

	if (phpbb.uploader.maxFiles && phpbb.uploader.maxFiles < phpbb.uploader.countFiles()) {
		done(phpbb.uploader.lang.TOO_MANY_ATTACHMENTS);
		return;
	}

	done();
};

/**
 * Build the POST fields that accompany a file or a chunk of a file.
 *
 * @param {Array} files			The files being sent (always exactly one).
 * @param {object} xhr			The request object.
 * @param {object|null} chunk	The chunk being sent, if this is a chunked upload.
 * @returns {object} The POST fields.
 */
phpbb.uploader.getRequestParams = function(files, xhr, chunk) {
	var file = files[0],
		params = phpbb.uploader.getSerializedData();

	params.add_file = phpbb.uploader.config.add_file;
	params.real_filename = file.name;

	if (chunk) {
		// \phpbb\uploader\uploader reassembles the file from these: "name" is
		// the name the partial file is stored under while it is being put back
		// together, so it has to be unique and to keep the extension.
		params.chunk = chunk.index;
		params.chunks = chunk.file.upload.totalChunkCount;
		params.name = phpbb.uploader.temporaryName(file);
	}

	return params;
};

/**
 * Build a unique name for the temporary file the chunks are assembled into.
 * The extension is preserved because the server uses it to guess the mimetype.
 *
 * @param {object} file Dropzone file object.
 * @returns {string} The name to send along with each chunk.
 */
phpbb.uploader.temporaryName = function(file) {
	var match = /\.[a-z0-9]+$/i.exec(file.name);

	return file.upload.uuid + (match ? match[0] : '');
};

/**
 * Find the index of the chunk a request belongs to.
 *
 * @param {object} file	Dropzone file object.
 * @param {object} xhr	The request object.
 * @returns {int|bool} The chunk index, or false if the request is not a chunk.
 */
phpbb.uploader.getChunkIndex = function(file, xhr) {
	var chunks = file.upload.chunks || [];

	for (var i = 0; i < chunks.length; i++) {
		if (chunks[i] && chunks[i].xhr === xhr) {
			return i;
		}
	}

	return false;
};

/**
 * Set up the uploader.
 */
phpbb.uploader.initialize = function() {
	var $attachRowTemplate = $('#attach-row-tpl');

	phpbb.uploader.form = $(phpbb.uploader.config.form_hook)[0];

	$attachRowTemplate.removeClass('attach-row-tpl');
	phpbb.uploader.rowTpl = $attachRowTemplate[0].outerHTML;

	// Hide the basic upload panel and remove the attach row template.
	$('#attach-row-tpl, #attach-panel-basic').remove();
	// Show multi-file upload options.
	$('#attach-panel-multi').show();
	// Point out the drag-and-drop zone.
	$('#drag-n-drop-message').show();

	phpbb.uploader.uploader = new Dropzone(
		document.getElementById('attach-panel-multi'),
		phpbb.uploader.getOptions()
	);

	// Replaces Dropzone's own checks, which would report the rejections in
	// Dropzone's wording rather than phpBB's.
	phpbb.uploader.uploader.accept = phpbb.uploader.accept;

	phpbb.uploader.setData(phpbb.uploader.data);
	phpbb.uploader.bindEvents();
	phpbb.uploader.bindDropTargets();
	phpbb.uploader.handleMaxFilesReached();
};

/**
 * Let files be dropped onto the message box as well as onto the attachment
 * panel. Dropzone only listens on its own element, so the events are handed
 * over by hand.
 */
phpbb.uploader.bindDropTargets = function() {
	var uploader = phpbb.uploader.uploader,
		$targets = $(phpbb.uploader.config.drop_element, phpbb.uploader.form);

	if (!$targets.length) {
		return;
	}

	function containsFiles(e) {
		var types = e.originalEvent.dataTransfer.types;

		for (var i = 0; i < types.length; i++) {
			if (types[i] === 'Files') {
				return true;
			}
		}

		return false;
	}

	$targets.on('dragover dragenter', function(e) {
		if (!containsFiles(e)) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();
		e.originalEvent.dataTransfer.dropEffect = 'copy';
		$(this).addClass('drag-hover');
	});

	$targets.on('dragleave dragend drop', function() {
		$(this).removeClass('drag-hover');
	});

	$targets.on('drop', function(e) {
		if (!containsFiles(e)) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();
		uploader.drop(e.originalEvent);
	});
};

/**
 * Bind the Dropzone event handlers.
 */
phpbb.uploader.bindEvents = function() {
	var uploader = phpbb.uploader.uploader;

	/**
	 * Fires when a file is added to the queue, before it is accepted or
	 * rejected, so that every file the user picked gets a row.
	 */
	uploader.on('addedfile', function(file) {
		// Switch the active tab if the style supports it
		if (typeof activateSubPanel === 'function') {
			activateSubPanel('attach-panel');
		}

		// Show the file list if there aren't any files currently.
		var $fileListContainer = $('#file-list-container');
		if (!$fileListContainer.is(':visible')) {
			$fileListContainer.show(100);
		}

		phpbb.uploader.insertRow(file);
	});

	/**
	 * Fires when a file was removed from the queue. The row is taken care of
	 * by phpbb.uploader.deleteFile(), which is the only caller.
	 */
	uploader.on('removedfile', function() {
		phpbb.uploader.handleMaxFilesReached();
	});

	/**
	 * Fires before a file, or a chunk of it, is sent. The response of every
	 * intermediate chunk is inspected here: phpBB answers with HTTP 200 and a
	 * JSON error for things like an invalid form token, and the remaining
	 * chunks would otherwise be appended to a file that the server has already
	 * given up on.
	 */
	uploader.on('sending', function(file, xhr) {
		if (!file.upload.chunked) {
			return;
		}

		var chunkIndex = phpbb.uploader.getChunkIndex(file, xhr);

		// The last chunk carries the real response, which the success handler
		// deals with.
		if (chunkIndex === false || chunkIndex >= file.upload.totalChunkCount - 1) {
			return;
		}

		// Dropzone's own load handler starts the next chunk, so the response
		// has to be looked at before it runs rather than alongside it.
		var chunkUploaded = xhr.onload;

		xhr.onload = function(e) {
			var error = (file.status === Dropzone.CANCELED)
				? false
				: phpbb.uploader.getResponseError(xhr.responseText);

			if (error === false) {
				if (chunkUploaded) {
					chunkUploaded.call(xhr, e);
				}

				return;
			}

			file.phpbbError = error;
			uploader.cancelUpload(file);
		};
	});

	/**
	 * Fires while a file is being uploaded.
	 */
	uploader.on('uploadprogress', function(file, progress) {
		phpbb.uploader.getRow(file).find('.file-progress-bar').css('width', progress + '%');
	});

	/**
	 * Fires while the queue is being uploaded.
	 */
	uploader.on('totaluploadprogress', function(progress) {
		$('#file-total-progress-bar').css('width', progress + '%');
	});

	/**
	 * Fires when a file is about to be uploaded.
	 */
	uploader.on('processing', function() {
		// Do not allow more files to be added to the running queue.
		phpbb.uploader.disableUploader();
	});

	/**
	 * Fires when an entire file has been uploaded. Parses the list of
	 * attachment data returned by the server and hands it to the next upload
	 * so that the server can maintain state with regards to the attachments in
	 * a given post.
	 */
	uploader.on('success', function(file, response) {
		var error = phpbb.uploader.getResponseError(response);

		if (error === false && (typeof response !== 'object' || !response.data || !response.data.length)) {
			error = phpbb.uploader.lang.RESPONSE_ERROR;
		}

		if (error !== false) {
			// _finished() has already marked the file as successful; put that
			// right so the queue accounting stays correct.
			file.status = Dropzone.ERROR;
			uploader.emit('error', file, error);
			return;
		}

		var row = phpbb.uploader.getRow(file);

		file.attachmentData = response.data[0];

		row.find('.file-progress').hide();
		row.attr('data-attach-id', file.attachmentData.attach_id);
		row.find('.file-inline-bbcode').show();
		row.find('.file-status').addClass('file-uploaded');

		phpbb.uploader.update(response.data, 'addition', 0, [ response.download_url ]);
	});

	/**
	 * Fires when a file could not be uploaded, was rejected before it was sent
	 * or was cancelled.
	 */
	uploader.on('error', function(file, message) {
		var error = file.phpbbError || message;

		if (typeof error !== 'string') {
			error = phpbb.uploader.getResponseError(error) || phpbb.uploader.lang.RESPONSE_ERROR;
		}

		delete file.phpbbError;

		phpbb.uploader.fileError(file, error);
		phpbb.alert(phpbb.uploader.lang.ERROR, error);
	});

	/**
	 * Fires when a file is done with, successfully or not.
	 */
	uploader.on('complete', function() {
		phpbb.uploader.handleMaxFilesReached();
	});

	/**
	 * Fires when the entire queue of files has been dealt with.
	 */
	uploader.on('queuecomplete', function() {
		// Hide the progress bar
		setTimeout(function() {
			$('#file-total-progress-bar').fadeOut(500, function() {
				$(this).css('width', 0).show();
			});
		}, 2000);

		phpbb.uploader.handleMaxFilesReached();
	});
};

var $fileList = $('#file-list');

/**
 * Insert inline attachment bbcode.
 */
$fileList.on('click', '.file-inline-bbcode', function(e) {
	var attachId = $(this).parents('.attach-row').attr('data-attach-id'),
		index = phpbb.uploader.getIndex(attachId);

	attachInline(index, phpbb.uploader.data[index].real_filename);
	e.preventDefault();
});

/**
 * Delete a file.
 */
$fileList.on('click', '.file-delete', function(e) {
	var row = $(this).parents('.attach-row'),
		attachId = row.attr('data-attach-id');

	phpbb.uploader.deleteFile(row, attachId);
	e.preventDefault();
});

/**
 * Display the error message for a particular file when the error icon is clicked.
 */
$fileList.on('click', '.file-error', function(e) {
	phpbb.alert($(this).attr('data-error-title'), $(this).attr('data-error-message'));
	e.preventDefault();
});

if (document.getElementById('attach-panel-multi') && Dropzone.isBrowserSupported()) {
	phpbb.uploader.initialize();
}

})(jQuery); // Avoid conflicts with other libraries
