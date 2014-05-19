/*
 * squirrel.js
 * http://github.com/jpederson/Squirrel.js
 * Author: James Pederson (jpederson.com)
 * Licensed under the MIT, GPL licenses.
 * Version: 1.0.0
 *
 * http://github.com/hmandir/Squirrel.js
 * HSK Mod Version: 0.0.1
 */
;
(function ($, window, document, undefined) {

	// let's start our plugin logic
	$.extend($.fn, {

		// core formStore function
		squirrel : function (options) {

			// set our options from the defaults, overriding with the
			// parameter we pass into this function.
			options = $.extend($.fn.squirrel.options, options);

			// Iterate through all the matching elements and return
			// the jquery object to preserve chaining.
			return this.each(function () {

				// Store a jQuery object for our element so we can use it
				// inside our other bindings.
				var elem = $(this);

				// we're doin' nothing if we don't have sessionStorage.
				if (window.sessionStorage) {

					// initially load all values from the sessionStorage
					restore_values(elem, options);

					// bind keyup and change events to field types, and store
					// their values.
					bind_events(elem, options);

				}

				// set up validation
				if (typeof options.validate_form === 'function')
					options.validate_form(elem, options);

			});

		}

	});

	// restore field values from sessionStorage
	var restore_values = function (elem, options) {
		var prefix = options.session_storage_prefix;

		// load text values from session storage
		elem.find("input:not([type]), input[type=text], textarea").filter('[name]').each(function () {
			var value = sessionStorage.getItem(prefix+$(this).attr("name"));
			if (value !== null) {
				$(this).val(value);
			}
		});

		// set select values on load
		elem.find("select[name]").each(function () {
			var value = sessionStorage.getItem(prefix+$(this).attr("name"));
			if (value !== null) {
				$(this).find("option").each(function () {
					this.selected = (this.value == value);
				});
			}
		});

		// radio buttons
		elem.find("input[type=radio][name]").each(function () {
			var value = sessionStorage.getItem(prefix+$(this).attr("name"));
			if (value !== null) {
				this.checked = ($(this).val() == value);
			}
		});

		// checkboxes
		elem.find("input[type=checkbox][name]").each(function () {
			var value = sessionStorage.getItem(prefix+$(this).attr("name"));
			if (value !== null) {
				this.checked = (value == "yes");
			}
		});

	};

	// event bindings
	var bind_events = function (elem, options) {

		// track changes in fields and store values as they're typed
		elem.find("input, select, textarea").on('blur keyup change', function () {
			store_field($(this), options);
		});

		// when the clear button is clicked, clear the sessionStorage as well
		// so it doesn't creepily load next refresh.
		elem.find("input[type=clear]").click(function () {
			sessionStorage.clear();
		});

		// if clear_on_submit is true, clear on form submit
		if (options.clear_on_submit === true) {
			elem.one('submit', function(){sessionStorage.clear();});
		}

	};

	// store field
	var store_field = function (field, options) {

		// if we have session storage
		if (window.sessionStorage) {

			// store some values.
			var field_name = field.attr("name"),
			field_type = field.attr("type"),
			field_value = field.val();
			
			// if it's a text field and the value is null set it to string value
			if (field_type === "text" && field_value === null) {
				field_value = '';
			}

			// if it's a checkbox, we've got to set the value differently
			if (field_type === "checkbox") {
				field_value = (field.is(":checked") ? "yes" : "no");
			}

			// set the item in session storage
			sessionStorage.setItem(options.session_storage_prefix+field_name, field_value);

		}

	};

	// some default options for squirrel.js
	$.fn.squirrel.options = {
		clear_on_submit : true,
		validate_form : function (elem, data) {},
		session_storage_prefix : "squirrel_"
	};

})(jQuery, window, document);

// initialize squirrel for form elements with squirrel class on document ready
$(function () {

	$("form.squirrel").squirrel();

});
