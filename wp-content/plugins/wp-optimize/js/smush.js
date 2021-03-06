jQuery(document).ready(function($) {
	WP_Optimize_Smush = WP_Optimize_Smush();
});

var WP_Optimize_Smush = function() {

	var $ = jQuery;

	/**
	 * Variables for smushing.
	 */
	var smush_nav_tab = $('#wp-optimize-images-nav-tab-smush'),
		smush_images_grid = $('#wpo_smush_images_grid'),
		smush_images_optimization_message = $('#smush_info_images'),
		smush_images_pending_tasks_container = $('#wpo_smush_images_pending_tasks_container'),
		smush_images_pending_tasks_btn = $('#wpo_smush_images_pending_tasks_button'),
		smush_images_pending_tasks_cancel_btn = $('#wpo_smush_images_pending_tasks_cancel_button'),
		smush_images_save_options_btn = $('.wpo-fieldgroup #wpo_smush_images_save_options_button'),
		smush_images_refresh_btn = $('#wpo_smush_images_refresh'),
		smush_images_select_all_btn = $('#wpo_smush_images_select_all'),
		smush_images_select_none_btn = $('#wpo_smush_images_select_none'),
		smush_images_stats_clear_btn = $('#wpo_smush_clear_stats_btn'),
		smush_selected_images_btn = $('#wpo_smush_images_btn'),
		smush_single_image_btn = $('.wpo_smush_single_image .button'),
		smush_single_restore_btn = $('.wpo_restore_single_image .button'),
		smush_view_logs_btn = $('.wpo_smush_get_logs'),
		compression_server_select = $('.compression_server'),
		smush_images_tab_loaded = false,
		smush_service_features = [],
		smush_total_seconds = 0,
		smush_timer_locked = false,
		smush_timer_handle = 0,
		smush_image_list = [],
		smush_completed = false;


	/**
	 *  Checks if smush is active and loads images if yes.
	 */
	$('#wp-optimize-nav-tab-wrapper .nav-tab').on('click', function() {
		if ($('#wp-optimize-nav-tab-wrapper .nav-tab-active').is('#wp-optimize-nav-tab-wpo_images-smush')) {
			get_info_from_smush_manager();
		}
	});

	if ($('#wp-optimize-nav-tab-wrapper .nav-tab-active').is('#wp-optimize-nav-tab-wpo_images-smush')) {
		get_info_from_smush_manager();
	}

	if ($('#smush-metabox').length > 0) {
		update_view_available_options();
	}

	/**
	 * Handles change of smush service provider
	 */
	compression_server_select.on('change', function(e) {
		update_view_available_options();
		save_options();
	});

	/**
	 * Process bulk smush
	 */
	smush_selected_images_btn.off().on('click', function() {
		
		if (0 == $('#wpo_smush_images_grid input[type="checkbox"]:checked').length) {
			$('#smush-information-modal #smush-information').text(wposmush.please_select_images)
			update_view_modal_message($('#smush-information-modal'), $.unblockUI);
			return;
		}

		$('#smush-information-modal #smush-information').text(wposmush.server_check);
		update_view_modal_message($('#smush-information-modal'));

		data = { 'server': $("input[name='compression_server']:checked").val() };
		smush_manager_send_command('check_server_status', data, function(resp) {
			if (resp.online) {
				bulk_smush_selected_images();
			} else {
				if (resp.error) {
					error_message = resp.error + '<br>' + wposmush.server_error
					$('#smush-information-modal #smush-information').html(error_message);
				} else {
					$('#smush-information-modal #smush-information').text(wposmush.server_error);
				}
				update_view_modal_message($('#smush-information-modal'), $.unblockUI);
			}
		});
	});

	/**
	 * Refresh image list
	 */
	smush_images_refresh_btn.off().on('click', function() {
		get_info_from_smush_manager();
	});

	/**
	 * Bind select all / select none controls
	 */
	smush_images_select_all_btn.off().on('click', function() {
		$('#wpo_smush_images_grid input[type="checkbox"]').prop("checked", true);
	});


	/**
	 * Bind select all / select none controls
	 */
	smush_images_select_none_btn.off().on('click', function() {
		$('#wpo_smush_images_grid input[type="checkbox"]').prop("checked", false);
	});

	/**
	 * Diplays logs in a modal
	 */
	smush_view_logs_btn.off().on('click', function() {
		$("#log-panel").text("Please wait, fetching logs.");
		smush_manager_send_command('get_smush_logs', {}, function(resp) {
			$.blockUI({
				message: $("#smush-log-modal"),
				onOverlayClick: $.unblockUI(),
				css: {
					width: '80%',
					height: '80%',
					top: '15%',
					left: '15%',
				}
			});
			$("#log-panel").html("<pre>" + resp + "</pre>");
			download_link = ajaxurl + "?action=updraft_smush_ajax&subaction=get_smush_logs&nonce=" + wposmush.smush_ajax_nonce;
			$("#smush-log-modal a").attr('href', download_link);
			console.log(download_link);
		}, false);
	});

	/**
	 * Saves options
	 */
	smush_images_save_options_btn.off().on('click', function(e) {
		save_options();
	});

	/**
	 * Binds clear stats button
	 */
	smush_images_stats_clear_btn.off().on('click', function(e) {
		$('#wpo_smush_images_clear_stats_spinner').show().delay(3000).fadeOut();

		smush_manager_send_command('clear_smush_stats', {}, function(resp) {
			$('#wpo_smush_images_clear_stats_spinner').hide();
			$('#wpo_smush_images_clear_stats_done').show().delay(3000).fadeOut();
		});
	});

	/**
	 * Binds pending tasks button
	 */
	smush_images_pending_tasks_btn.off().on('click', function(e) {
		$('#smush-information-modal #smush-information').text(wposmush.server_check);
		update_view_modal_message($('#smush-information-modal'), $.unblockUI);
		data = { 'server': $("input[name='compression_server']:checked").val() };
		smush_manager_send_command('check_server_status', data, function(resp) {
			if (resp.online) {
				update_view_bulk_smush_start();
				smush_manager_send_command('process_pending_images', {}, function(resp) {
					handle_response_from_smush_manager(resp, update_view_bulk_smush_progress);
				});
			} else {
				if (resp.error) {
					error_message = resp.error + '<br>' + wposmush.server_error
					$('#smush-information-modal #smush-information').html(error_message);
				} else {
					$('#smush-information-modal #smush-information').text(wposmush.server_error);
				}
				update_view_modal_message($('#smush-information-modal'), $.unblockUI);
			}
		});

	});


	/**
	 * Binds pending tasks cancel button
	 */
	smush_images_pending_tasks_cancel_btn.on('click', function(e) {
		smush_manager_send_command('clear_pending_images', {}, function(resp) {
			if (resp.status) {
				smush_images_pending_tasks_container.delay(3000).fadeOut();
			}
		});
	});

	/**
	 * Single image compression
	 */
	smush_single_image_btn.on('click', function() {
		var clicked_image = $(this).attr('id');
		if (!clicked_image) { return; }
		image_id = clicked_image.substring(15);


		if ($('#enable_custom_compression').is(":checked")) {
			image_quality = $('#custom_compression_slider').val();
			lossy_compression = image_quality < 100 ? true : false;
		} else {
			image_quality = $('#enable_lossy_compression').is(":checked") ? 90 : 100;
			lossy_compression = image_quality < 100 ? true : false;
		}

		smush_options = {
			'compression_server': $("input[name='compression_server_" + image_id+ "']:checked").val(),
			'image_quality': image_quality,
			'lossy_compression': lossy_compression,
			'back_up_original': $('#smush_backup_' + image_id).is(":checked"),
			'preserve_exif': $('#smush_exif_' + image_id).is(":checked"),
		}

		console.log("Compressing Image : " + image_id);
		data = { 'server':  $("input[name='compression_server_" + image_id+ "']:checked").val() };
		update_view_modal_message(wposmush.server_check);
		smush_manager_send_command('check_server_status', data, function(resp) {
			if (resp.online) {
				smush_selected_image(image_id, smush_options);
			} else {
				if (resp.error) {
					error_message = resp.error + '<br>' + wposmush.server_error

					update_view_modal_message(error_message, $.unblockUI);
				} else {
					update_view_modal_message(wposmush.server_error, $.unblockUI);
				}
			}
		});
	});

	/**
	 * Single image restore
	 */
	smush_single_restore_btn.on('click', function() {
		var clicked_image = $(this).attr('id');
		if (!clicked_image) { return; }
		image_id = clicked_image.substring(25);
		console.log("Restoring Image : " + image_id);
		restore_selected_image(image_id);
	});

	$('#smush-log-modal .close, #smush-information-modal .information-modal-close').on('click', function() {
		$.unblockUI();
	});

	$('.wpo_smush_stats_cta_btn, .wpo_smush_get_logs, #smush-complete-summary .close').on('click', function() {
		$.unblockUI();
		get_info_from_smush_manager();
		setTimeout(reset_view_bulk_smush, 500);
	});

	$('.toggle-smush-advanced').on('click', function() {
		$('.smush-advanced').toggle('fast');
	});

	$('.wpo-fieldgroup .autosmush input, .wpo-fieldgroup .compression_level, .wpo-fieldgroup .image_options').on('change', function() {
		save_options();
	});

	$('.smush-options.compression_level').change(function() {
		if ($('#enable_custom_compression').is(':checked')) {
			$('.smush-options.custom_compression').show();
		} else {
			$('.smush-options.custom_compression').hide();
		}
	});

	/**
	 * Load and show information about uncompressed images.
	 *
	 * @param {Boolean}   use_cache     Use the request cache
	 *
	 * @return void
	 */
	function get_info_from_smush_manager(use_cache) {

		var use_cache = (typeof use_cache === 'undefined') ? true : use_cache;
		var data = { 'use_cache': use_cache };
		
		console.log('Loading information about uncompressed images.');
		
		smush_images_optimization_message.html('...');
		smush_images_pending_tasks_container.hide();

		disable_image_optimization_controls(true);
		
		smush_manager_send_command('get_ui_update', data, function(resp) {
			console.log('Information about uncompressed images loaded.');
			handle_response_from_smush_manager(resp, update_view_show_uncompressed_images);
			update_view_available_options();
			disable_image_optimization_controls(false);
		});
	}


	/**
	 * Get selected images and make an ajax request to compress them.
	 *
	 * @return void
	 */
	function bulk_smush_selected_images() {
				
		$('#wpo_smush_images_grid input:checked').each(function() {
			smush_image_list.push($(this).val());
		});

		data = {
			optimization_id: 'smush',
			selected_images: smush_image_list,
			smush_options: {
				'compression_server': $("input[name='compression_server']:checked").val(),
				'image_quality': $('#image_quality').val(),
				'lossy_compression': $('#smush-lossy-compression').is(":checked"),
				'back_up_original': $('#smush-backup-original').is(":checked"),
				'preserve_exif': $('#smush-preserve-exif').is(":checked"),
			}
		}
		
		update_view_bulk_smush_start();
		smush_manager_send_command('process_bulk_smush', data);
	}

	/**
	 * Save options in the DB
	 *
	 * @return void
	 */
	function save_options() {
		$('#wpo_smush_images_save_options_spinner').show().delay(3000).fadeOut();

		if ($('#enable_custom_compression').is(":checked")) {
			image_quality = $('#custom_compression_slider').val();
			lossy_compression = image_quality < 100 ? true : false;
		} else {
			image_quality = $('#enable_lossy_compression').is(":checked") ? 90 : 100;
			lossy_compression = image_quality < 100 ? true : false;
		}

		var smush_options = {
			'compression_server': $("input[name='compression_server']:checked").val(),
			'image_quality': image_quality,
			'lossy_compression': lossy_compression,
			'back_up_original': $('#smush-backup-original').is(":checked"),
			'preserve_exif': $('#smush-preserve-exif').is(":checked"),
			'autosmush': $('#smush-automatically').is(":checked"),
		}

		smush_manager_send_command('update_smush_options', smush_options, function(resp) {
			$('#wpo_smush_images_save_options_spinner').hide();
			if (resp.hasOwnProperty('saved') && resp.saved) {
				$('#wpo_smush_images_save_options_done').show().delay(3000).fadeOut();
				smush_images_save_options_btn.hide();
			} else {
				$('#wpo_smush_images_save_options_fail').show().delay(3000).fadeOut();
				smush_images_save_options_btn.show();
			}
		});
	}

	/**
	 * A timer to run for the duration of the bulk smush operation.
	 *
	 * @return void
	 */
	function smush_timer() {
		smush_timer_locked = true;
		smush_total_seconds++;
		seconds = (smush_total_seconds % 60) + '' < 10 ? '0' + (smush_total_seconds % 60) : (smush_total_seconds % 60);
		minutes = parseInt(smush_total_seconds / 60) + '' < 10 ? '0' + parseInt(smush_total_seconds / 60) : parseInt(smush_total_seconds / 60);
		
		$('#smush_stats_timer').text(minutes + ":" + seconds);
		trigger_events(smush_total_seconds);
	}

	/**
	 * A timer to run for the duration of the bulk smush operation.
	 *
	 * @param {Number} time_elapsed - time in seconds
	 *
	 * @return void
	 */
	function trigger_events(time_elapsed) {
		
		if (0 == time_elapsed % 3) {
			update_smush_stats();
		}

		if (0 == time_elapsed % 60) {
			smush_manager_send_command('process_pending_images', {}, function(resp) {
				handle_response_from_smush_manager(resp, update_view_bulk_smush_progress);
			});
		}
	}

	/**
	 * Updates the UI with stats
	 *
	 * @param {Boolean}   use_cache     Use the request cache
	 *
	 * @return void
	 */
	function update_smush_stats(use_cache) {

		var use_cache = (typeof use_cache === 'undefined') ? true : use_cache;

		data = {
			update_ui: true,
			use_cache: false
		}

		smush_manager_send_command('get_ui_update', data, function(resp) {
			handle_response_from_smush_manager(resp, update_view_bulk_smush_progress);
		});
	}

	/**
	 * Update images optimization tab view with data returned from images optimization.
	 *
	 * @param {Object} data - meta data returned from task manager
	 *
	 * @return void
	 */
	function update_view_show_uncompressed_images(data) {
		smush_images_grid.html('');

		if (!data || !data.hasOwnProperty('unsmushed_images')) return;

		var unsmushed_images = data.unsmushed_images;
		var pending_tasks = data.pending_tasks;

		if (0 == data.unsmushed_images.length && 0 == data.pending_tasks) {
			smush_images_grid.text(wposmush.all_images_compressed).wrapInner("<h2 class='center'> </h2>");
		}

		if (0 != data.pending_tasks) {
			smush_images_pending_tasks_container.show().find('.red').text(data.pending);
		}

		// Used to have upload.php?item= on multisite (using data.is_multisite), and no suffix
		var admin_url_pre_id = 'post.php?post=';
		var admin_url_post_id = '&action=edit';
		
		for (blog_id in data.unsmushed_images) {
			for (i in data.unsmushed_images[blog_id]) {
				if (!data.unsmushed_images[blog_id].hasOwnProperty(i)) continue;
				image = data.unsmushed_images[blog_id][i];
				add_image_to_grid(image, data.admin_urls[blog_id] + admin_url_pre_id + image.id + admin_url_post_id);
			}
		}
	}

	/**
	 * Updates the view when bulk smush starts
	 *
	 * @return void
	 */
	function update_view_bulk_smush_start() {
		if (smush_timer_locked) return;
		update_view_modal_message($('#wpo_smush_images_information_container'));

		service = $('.compression_server input[type="radio"]:checked + label small').text();
		$('#wpo_smush_images_information_server').html(service);

		// Clear stats
		$('#smush_stats_pending_images').html("...");
		$('#smush_stats_completed_images').html("...");
		$('#smush_stats_bytes_saved').html("...");
		$('#smush_stats_percent_saved').html("...");
		$('#smush_stats_timer').html("...");

		smush_timer_handle = window.setInterval(smush_timer, 1000);
		disable_image_optimization_controls(true);
	}

	/**
	 * Updates the view with progress related stats
	 *
	 * @param {Object} resp - response from smush manager.
	 *
	 * @return void
	 */
	function update_view_bulk_smush_progress(resp) {
		
		// Update stats
		$('#smush_stats_pending_images').html(resp.pending_tasks);
		$('#smush_stats_completed_images').html(resp.completed_task_count);
		$('#smush_stats_bytes_saved').html(resp.bytes_saved);
		$('#smush_stats_percent_saved').html(resp.percent_saved);

		// Show summary and close the modal
		if (true == resp.smush_complete) {
			// Force a delay here to avoid stale data
			setTimeout(update_view_bulk_smush_complete, 1500);
		}
	}

	/**
	 * Updates the view when bulk smush completes
	 *
	 * @return void
	 */
	function update_view_bulk_smush_complete() {

		data = {
			update_ui: true,
			use_cache: false,
			image_list: smush_image_list
		}

		smush_manager_send_command('get_ui_update', data, function(resp) {

				summary = resp.session_stats;

				if (0 != resp.completed_task_count) {
					summary += '<hr>' + resp.summary;
				}

				show_smush_summary(summary);
		});
	}

	/**
	 * Displays a modal with compression data
	 *
	 * @param {string} summary - stats and info
	 *
	 * @return void
	 */
	function show_smush_summary(summary) {
		
		if (smush_completed) return;

		$('#summary-message').html(summary);
		reset_view_bulk_smush();
		update_view_modal_message($('#smush-complete-summary'));
		smush_completed = true;
	}

	/**
	 * Updates the view when bulk smush completes
	 *
	 * @return void
	 */
	function reset_view_bulk_smush() {
		// Reset timer and locks
		smush_total_seconds = 0;
		smush_timer_locked = false;
		smush_completed = false;
		smush_image_list = [];
		window.clearInterval(smush_timer_handle);
		disable_image_optimization_controls(false);
	}

	/**
	 * Append the image to the grid
	 *
	 * @param {Object} image	 - image data returned from smush manager
	 * @param {String} admin_url - The URL to link to for viewing the image
	 *
	 * @return void
	 */
	function add_image_to_grid(image, admin_url) {

		image_html = '<div class="wpo_smush_image" data-filesize="'+image.filesize+'">';
		image_html += '<a class="button" href="'+admin_url+'" target="_blank"> ' + wposmush.view_image + ' </a>';
		image_html += '<input id="wpo_smush_'+image.id+'" type="checkbox" class="wpo_smush_image__input" value="'+image.id+'">';
		image_html += '<label for="wpo_smush_'+image.id+'"></a>';
		image_html += '<div class="thumbnail">';
		image_html += '<img class="lazyload" src="'+image.thumb_url+'">';
		image_html += '</div></label></div>';

		smush_images_grid.append(image_html);
	}

	/**
	 * Updates UI based on service provider selected
	 *
	 * @param {Object} features - image data returned from smush manager
	 *
	 * @return void
	 */
	function update_view_available_options() {
		features = wposmush.features;
		service = $("input[name^='compression_server']:checked").val();

		for (feature in features[service]) {
			$('.' + feature).prop('disabled', !features[service][feature]);
			$('.' + feature).prop('checked', features[service][feature]);
		}

		$('.wpo_smush_image').each(function() {
			if ($(this).data('filesize') > wposmush.features[service]["max_filesize"]) {
				$(this).hide();
			} else {
				$(this).show();
			}
		})
	}

	/**
	 * Disable smush controls (buttons, checkboxes) in bulk mode
	 *
	 * @param {boolean} disable - if true then disable controls, false - enable.
	 *
	 * @return void
	 */
	function disable_image_optimization_controls(disable) {
		$.each([
			smush_selected_images_btn,
			smush_images_select_all_btn,
			smush_images_select_none_btn,
			smush_images_save_options_btn,
			smush_images_refresh_btn,
			smush_images_pending_tasks_btn,
		], function(i, el) {
			el.prop('disabled', disable);
		});

		if (disable) {
			$('#wpo_smush_images_refresh').hide();
			$('.wpo_smush_images_loader').show();
		} else {
			$('#wpo_smush_images_refresh').show();
			$('.wpo_smush_images_loader').hide();
		}
	}

	/**
	 * Gets selected image and make an ajax request to compress it.
	 *
	 * @param {Number} selected_image - The image id
	 * @param {Array} smush_options - The options to use
	 *
	 * @return void
	 */
	function smush_selected_image(selected_image, smush_options) {
		
		// if no selected images then exit.
		if (0 == selected_image.length) return;

		data = {
			selected_image: selected_image,
			smush_options: smush_options
		}

		update_view_modal_message(wposmush.compress_single_image_dialog);
		smush_manager_send_command('compress_single_image', data, function(resp) {
			handle_response_from_smush_manager(resp, update_view_single_image_complete);
		});
	}

	/**
	 * Get selected image and make an ajax request to compress it.
	 *
	 * @param {Number} selected_image - The image id
	 *
	 * @return void
	 */
	function restore_selected_image(selected_image) {
		
		// if no selected images then exit.
		if (0 == selected_image.length) return;
		
		update_view_modal_message(wposmush.please_wait, $.unblockUI);
		data = { 'selected_image': selected_image }
		smush_manager_send_command('restore_single_image', data, function(resp) {
			handle_response_from_smush_manager(resp, update_view_single_image_complete);
		});
	}

	/**
	 * Updates the view once a single image is compressed or restored.
	 *
	 * @param {Object} resp - response from smush manager.
	 *
	 * @return void
	 */
	function update_view_single_image_complete(resp) {

		if (resp.hasOwnProperty('success') && resp.success) {
			$("#smush-information").text(resp.summary);
			update_view_modal_message($("#smush-information-modal"), $.unblockUI);
			if ('compress' == resp.operation) {
				$(".wpo_smush_single_image").hide();
				$(".wpo_restore_single_image").show();

				$("#smush_info").text(resp.summary);
				
				if (resp.restore_possible) {
					$(".restore_possible").show();
				} else {
					$(".restore_possible").hide();
				}
			} else {
				$(".wpo_smush_single_image").show();
				$(".wpo_restore_single_image").hide();
			}
		} else {
			$("#smush-information").text(resp.error_message)
			update_view_modal_message($("#smush-information-modal"), $.unblockUI);
		}
	}

	/**
	 * Display a modal message
	 *
	 * @param {string}   message	 The message or element to display
	 * @param {Function} callback	 Called when the overlay is clicked
	 *
	 * @return void
	 */
	function update_view_modal_message(message, callback) {

		$.blockUI({
			message: message,
			onOverlayClick: callback,
			css: {
				width: '400px',
				padding: '20px',
				cursor: 'pointer',
			}
		});
	}

	/**
	 * Check returned response from the smush manager and call update view callback.
	 *
	 * @param {Object} resp - response from smush manager.
	 * @param {Function} update_view_callback - callback function to update view.
	 *
	 * @return void
	 */
	function handle_response_from_smush_manager(resp, update_view_callback) {
		if (resp && resp.hasOwnProperty('status') && resp.status) {
			if (update_view_callback) update_view_callback(resp);
		} else {
			alert(wposmush.error_unexpected_response);
			console.log(resp);
		}
	}

	/**
	 * Parse JSON string, including automatically detecting unwanted extra input and skipping it
	 *
	 * @param {string} json_mix_str - JSON string which need to parse and convert to object
	 *
	 * @throws SyntaxError|String (including passing on what JSON.parse may throw) if a parsing error occurs.
	 *
	 * @return mixed parsed JSON object. Will only return if parsing is successful (otherwise, will throw)
	 */
	function wpo_parse_json(json_mix_str) {
		// Here taking first and last char in variable, because these are used more than once in this function
		var first_char = json_mix_str.charAt(0);
		var last_char = json_mix_str.charAt(json_mix_str.length - 1);
		
		// Just try it - i.e. the 'default' case where things work (which can include extra whitespace/line-feeds, and simple strings, etc.).
		try {
			var result = JSON.parse(json_mix_str);
			return result;
		} catch (e) {
			console.log("WPO: Exception when trying to parse JSON (1) - will attempt to fix/re-parse");
			console.log(json_mix_str);
		}
		
		var json_start_pos = json_mix_str.indexOf('{');
		var json_last_pos = json_mix_str.lastIndexOf('}');
		
		// Case where some php notice may be added after or before json string
		if (json_start_pos > -1 && json_last_pos > -1) {
			var json_str = json_mix_str.slice(json_start_pos, json_last_pos + 1);
			try {
				var parsed = JSON.parse(json_str);
				console.log("WPO: JSON re-parse successful");
				return parsed;
			} catch (e) {
				console.log("WPO: Exception when trying to parse JSON (2)");
				// Throw it again, so that our function works just like JSON.parse() in its behaviour.
				throw e;
			}
		}
		
		throw "WPO: could not parse the JSON";
		
	}
	
	/**
	 * Send an action to the task manager via admin-ajax.php.
	 *
	 * @param {string}   action	 The action to send
	 * @param {[type]}   data	   Data to send
	 * @param {Function} callback   Will be called with the results
	 * @param {boolean}  json_parse JSON parse the results
	 *
	 * @return {JSON}
	 */
	function smush_manager_send_command(action, data, callback, json_parse) {

		json_parse = ('undefined' === typeof json_parse) ? true : json_parse;
		data = $.isEmptyObject(data) ? {'use_cache' : false} : data;
		
		var ajax_data = {
			action: 'updraft_smush_ajax',
			subaction: action,
			nonce: wposmush.smush_ajax_nonce,
			data: data
		};

		var ajax_opts = {
			type: 'POST',
			url: ajaxurl,
			data: ajax_data,
			success: function(response) {
				
				if (json_parse) {
					try {
						var resp = wpo_parse_json(response);
					} catch (e) {
						console.log("smush_manager_send_command JSON parse error");
						console.log(e);
						console.log(response);
						alert(wposmush.error_unexpected_response);
					}
					if ('undefined' !== typeof callback) callback(resp);
				} else {
					if ('undefined' !== typeof callback) callback(response);
				}
			},
			error: function(response, status, error_code) {
				console.log("smush_manager_send_command AJAX parse error: "+status+" ("+error_code+")");
				if ('undefined' !== typeof callback) {
					callback(response);
				} else {
					console.log(response);
					alert(wposmush.error_unexpected_response);
				}
			},
			dataType: 'text'
			
		}
		
		$.ajax(ajax_opts);
		
	};

}
