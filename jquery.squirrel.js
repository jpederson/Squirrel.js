/*
 * squirrel.js
 * http://github.com/jpederson/Squirrel.js
 * Author: James Pederson (jpederson.com)
 * Licensed under the MIT, GPL licenses.
 * Version: 0.1.6
 */
; (function($, window, document, undefined) {

    // let's start our plugin logic.
    $.extend($.fn, {

        // naming our jQuery plugin function.
        squirrel: function(action, options) {

                // set our options from the defaults, overriding with the
                // parameter we pass into this function.
                options = $.extend($.fn.squirrel.options, options);

                // get the storage property.
                var storage = typeof(options.storage_method) === 'string' && options.storage_method.toLowerCase() === 'local' ? window.localStorage : window.sessionStorage;

                // we're doing nothing if we don't have a valid sessionStorage or localStorage object.
                if (typeof(storage) === 'undefined') {

                    return;

                } // if not storage

                // stash or grab a value from our session store object.
                var stash = function(storage_key, key, value) {

                        value = typeof(value) !== 'undefined' ? value : null;

                        // get the squirrel storage object.
                        var store = JSON.parse(storage.getItem(storage_key)),
                            append = {};

                        // if it doesn't exist, create an empty object.
                        if (store === null) {

                            store = {};

                        }

                        // if value a value is specified.
                        if (value !== null) {

                            // add the new value to the object we'll append to the store object.
                            append[key] = value;

                            // extend the squirrel store object.
                            store = $.extend(store, append);

                            // session the squirrel store again.
                            storage.setItem(storage_key, JSON.stringify(store));

                        }

                        // return the store value if the store isn't empty and the key exists,
                        // else return null
                        return (store !== null ? (typeof(store[key]) !== 'undefined' ? store[key] : null) : null);

                    },

                    // clear the sessionStorage key based on the options specified.
                    unstash = function(storage_key) {

                        // clear value for our storage key.
                        storage.removeItem(storage_key);

                    },

                    // check if the action has been set to 'clear'.
                    // defaults to false if any of the following conditions are false.
                    isClear = typeof(action) === 'string' && action.toLowerCase() === 'clear';

                // iterate through all the matching elements and return
                // the jQuery object to preserve chaining.
                return this.each(function() {

                    // store a jQuery object for the form so we can use it
                    // inside our other bindings.
                    var $form = $(this);

                    // check for data-squirrel attribute.
                    var storage_key = $form.attr('data-squirrel') ? $form.data('squirrel') : options.storage_key;

                    // clear the stash if clear is passed.
                    if (isClear) {

                        unstash(storage_key);

                    } else {

                        // LOAD VALUES FOR ALL FORMS FROM LOCAL/SESSION STORAGE IN ORDER OF DOM
                        var $formFields = $form.find('*').filter('input[id], input[name], select[name], select[id], textarea[id], textarea[name]');
                        $formFields.each(function() {

                            // cache the jQuery object.
                            var $elem = $(this),

                                // get the name attribute.
                                name = $elem.attr('name'),

                                // declare a variable to hold the value from the storage.
                                value = null;

                            // if the name attribute doesn't exist, determine the id attribute instead.
                            if (name === undefined) {
                                name = $elem.attr('id');
                            }

                            // a name attribute is required to store the element data.
                            if (name === undefined) {
                                return;
                            }

                            switch (this.tagName.toLowerCase()) {
                                case 'input':
                                case 'textarea':
                                    var type = $elem.attr('type');

                                    if (type === 'checkbox') {

                                        // checkboxes.
                                        var checkedValue = $elem.attr('value');

                                        if (typeof(checkedValue) !== 'string') {
                                            checkedValue = '';
                                        }

                                        value = stash(storage_key, name + checkedValue);

                                        if (value !== null && value !== this.checked) {
                                            this.checked = (value === true);
                                            $elem.trigger('change');
                                        }

                                    } else if (type === 'radio') {

                                        // radio buttons.
                                        value = stash(storage_key, name);

                                        if (value !== null && value !== this.checked) {
                                            this.checked = ($elem.val() === value);
                                            $elem.trigger('change');
                                        }

                                    } else {

                                        // load text values from session storage.
                                        value = stash(storage_key, name);

                                        if (value !== null && !$elem.is('[readonly]') && $elem.is(':enabled') && $elem.val() !== value) {
                                            $elem.val(value).trigger('change');
                                        }

                                    }
                                    break;

                                case 'select':
                                    // set select values on load.
                                    value = stash(storage_key, name);

                                    if (value !== null) {

                                        $.each(typeof(value) !== 'object' ? [value] : value, function(index, option) {
                                            $elem.find('option').filter(function() {
                                                var $option = $(this);
                                                return ($option.val() === option || $option.html() === option);
                                            }).prop('selected', true).trigger('change');

                                        });
                                    }
                                    break;
                            }

                        });

                        // UPDATE VALUES FOR ALL FIELDS ON CHANGE.
                        // track changes in fields and store values as they're typed.
                        $form.find('input[type!=file]:not(.squirrel-ignore), select:not(.squirrel-ignore), textarea:not(.squirrel-ignore)').on('blur.squirrel.js keyup.squirrel.js change.squirrel.js', function() {

                            // cache the jQuery object.
                            var $elem = $(this),

                                // get the name attribute.
                                name = $elem.attr('name');

                            // if the name attribute doesn't exist, determine the id attribute instead.
                            if (name === undefined) {
                                name = $elem.attr('id');
                            }

                            // a name attribute is required to store the element data.
                            if (name === undefined) {
                                return;
                            }

                            // get the value attribute.
                            var value = $elem.attr('value'),

                                // pre-append the name attribute with the value if a checkbox; otherwise use the name only.
                                stashName = (this.type === 'checkbox' && value !== undefined) ? name + value : name;

                            stash(storage_key, stashName, this.type === 'checkbox' ? $elem.prop('checked') : $elem.val());

                        });

                        // when the reset button is clicked, clear the sessionStorage as well
                        // so it doesn't creepily load on next refresh.
                        $form.find('button[type=reset], input[type=reset]').on('click.squirrel.js', function() {

                            unstash(storage_key);

                        });

                        // clear storage on submit as well.
                        $form.on('submit.squirrel.js', function() {

                            // if not boolean dataype or is true, then unstach the storage key.
                            if (typeof(options.clear_on_submit) !== 'boolean' || options.clear_on_submit) {

                                unstash(storage_key);

                            }

                        });

                    } // end default action.

                }); // return each plugin call.

            } // end plugin function.

    }); // end jQuery extend

    // some default options for squirrel.js.
    $.fn.squirrel.options = {
        clear_on_submit: true,
        storage_method: 'session',
        storage_key: 'squirrel'
    };

})(jQuery, window, document);


// onload.
$(function() {

    $('form.squirrel, form[data-squirrel]').squirrel();

});
