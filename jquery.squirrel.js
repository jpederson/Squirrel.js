/*
 * squirrel.js
 * http://github.com/jpederson/Squirrel.js
 * Author: James Pederson (jpederson.com)
 * Licensed under the MIT, GPL licenses.
 * Version: 0.1.7
 */
; (function($, window, document, undefined) {

    // let's start our plugin logic.
    $.fn.extend({

        // naming our jQuery plugin function.
        squirrel: function(action, options) {

                // set our options from the defaults, overriding with the
                // parameter we pass into this function.
                options = $.extend({}, $.fn.squirrel.options, options);

                // initialize as null by default.
                var storage = null;

                // either 'local' or 'session' has been passed if this is true.
                if (typeof(options.storage_method) === 'string') {

                    storage = options.storage_method.toUpperCase() === 'LOCAL' ? window.localStorage : window.sessionStorage;

                // an object that could be a valid storage object has been passed.
                } else if (options.storage_method !== null && typeof(options.storage_method) === 'object' ) {

                    storage = options.storage_method;

                }

                // if null or the storage object does not contain the valid functions required, then return this.
                if (storage === null || !(typeof(storage) === 'object' && 'getItem' in storage && 'removeItem' in storage && 'setItem' in storage)) {

                    // to maintain chaining in jQuery.
                    return this;

                }

                // check the action is valid and convert to uppercase.
                action = typeof(action) === 'string' && /^(?:CLEAR|REMOVE|OFF|STOP)$/i.test(action) ? action.toUpperCase() : 'START';

                // strings related to the find functions and event handling.
                var eventFields = 'input[type!=file]:not(.squirrel-ignore), select:not(.squirrel-ignore), textarea:not(.squirrel-ignore)',
                    eventReset = 'button[type=reset], input[type=reset]',
                    findFields = 'input[id], input[name], select[id], select[name], textarea[id], textarea[name]';

                // sanitize the options strings.
                options.storage_key = sanitize(options.storage_key, 'squirrel');
                options.storage_key_prefix = sanitize(options.storage_key_prefix, '');

                // iterate through all the matching elements and return
                // the jQuery object to preserve chaining in jQuery.
                return this.each(function() {

                    // store a jQuery object for the form so we can use it
                    // inside the other bindings.
                    var $form = $(this);

                    // check for the data-squirrel attribute.
                    var dataAttribute = $form.attr('data-squirrel'),
                        storage_key = options.storage_key_prefix + (dataAttribute ? dataAttribute: options.storage_key);

                    switch (action) {
                        case 'CLEAR':
                        case 'REMOVE':
                            // clear the storage if a 'clear' action is passed.
                            unstash(storage, storage_key);
                            break;

                        case 'OFF':
                        case 'STOP':
                            // stop the registered events if a 'stop' action is passed.
                            $form.find(eventFields).off('blur.squirrel.js keyup.squirrel.js change.squirrel.js');
                            $form.find(eventReset).off('click.squirrel.js');
                            $form.off('submit.squirrel.js');
                            break;

                        default:
                            // LOAD VALUES FOR ALL FORMS FROM LOCAL/SESSION STORAGE IN ORDER OF DOM
                            $form.find('*').filter(findFields).each(function() {

                                // cache the jQuery object.
                                var $elem = $(this),

                                    // get the name attribute.
                                    name = $elem.attr('name'),

                                    // declare a variable to hold the value from the storage.
                                    value = null;

                                // if the name attribute doesn't exist, determine the id attribute instead.
                                if (name === undefined) {
                                    name = $elem.attr('id');

                                    // a name attribute is required to store the element data.
                                    if (name === undefined) {
                                        return;
                                    }
                                }

                                // tagName returns an uppercase value in HTML5.
                                switch (this.tagName) {
                                    case 'INPUT':
                                    case 'TEXTAREA':
                                        var type = $elem.attr('type');

                                        if (type === 'checkbox') {

                                            // checkboxes.
                                            var checkedValue = $elem.attr('value');

                                            if (typeof(checkedValue) !== 'string') {
                                                checkedValue = '';
                                            }

                                            value = stash(storage, storage_key, name + checkedValue);

                                            if (value !== null && value !== this.checked) {
                                                this.checked = (value === true);
                                                $elem.trigger('change');
                                            }

                                        } else if (type === 'radio') {

                                            // radio buttons.
                                            value = stash(storage, storage_key, name);

                                            if (value !== null && value !== this.checked) {
                                                this.checked = ($elem.val() === value);
                                                $elem.trigger('change');
                                            }

                                        } else {

                                            // load the text values from the storage.
                                            value = stash(storage, storage_key, name);

                                            if (value !== null && !$elem.is('[readonly]') && $elem.is(':enabled') && $elem.val() !== value) {
                                                $elem.val(value).trigger('change');
                                            }

                                        }
                                        break;

                                    case 'SELECT':
                                        // set the select values on load.
                                        value = stash(storage, storage_key, name);

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
                            $form.find(eventFields).on('blur.squirrel.js keyup.squirrel.js change.squirrel.js', function() {

                                // cache the jQuery object.
                                var $elem = $(this),

                                    // get the name attribute.
                                    name = $elem.attr('name');

                                // if the name attribute doesn't exist, determine the id attribute instead.
                                if (name === undefined) {
                                    name = $elem.attr('id');

                                    // a name attribute is required to store the element data.
                                    if (name === undefined) {
                                        return;
                                    }
                                }

                                // get the value attribute.
                                var value = $elem.attr('value'),

                                    // pre-append the name attribute with the value if a checkbox; otherwise, use the name only.
                                    stashName = (this.type === 'checkbox' && value !== undefined) ? name + value : name;

                                stash(storage, storage_key, stashName, this.type === 'checkbox' ? $elem.prop('checked') : $elem.val());

                            });

                            // when the reset button is clicked, clear the storage.
                            $form.find(eventReset).on('click.squirrel.js', function() {

                                unstash(storage, storage_key);

                            });

                            // clear the storage on submit.
                            $form.on('submit.squirrel.js', function() {

                                // if not a boolean datatype or is equal to true, then clear the storage.
                                if (typeof(options.clear_on_submit) !== 'boolean' || options.clear_on_submit) {

                                    unstash(storage, storage_key);

                                }

                            });
                            break;

                    } // end actions.

                }); // return each plugin call.

            } // end plugin function.

    }); // end jQuery extend.

    // stash or grab a value from our session store object.
    var stash = function(storage, storage_key, key, value) {

            // get the squirrel storage object.
            var store = JSON.parse(storage.getItem(storage_key));

            // if it doesn't exist, create an empty object.
            if (store === null) {

                store = {};

            }

            // if a value isn't specified.
            if (typeof(value) === 'undefined' || value === null) {

                // return the store value if the store value exists; otherwise, null.
                return typeof(store[key]) !== 'undefined' ? store[key] : null;

            }

            // if a value is specified.
            // create an append object literal.
            var append = {};

            // add the new value to the object that we'll append to the store object.
            append[key] = value;

            // extend the squirrel store object.
            // in ES6 this can be shortened to just $.extend(store, {[key]: value}).
            $.extend(store, append);

            // re-session the squirrel store again.
            storage.setItem(storage_key, JSON.stringify(store));

            // return the value.
            return value;

        },
        // clear the sessionStorage key based on the options specified.
        unstash = function(storage, storage_key) {

            // clear value for our storage key.
            storage.removeItem(storage_key);

        },
        // sanitize a particular string option.
        sanitize = function(key, defaultKey) {

            // if a string type and is not whitespace, then return the key; otherwise the default key.
            return typeof(key) === 'string' && key.trim().length > 0 ? key : defaultKey;

        };

    // DEFAULTS
    // default options for squirrel.js.
    $.fn.squirrel.options = {
        clear_on_submit: true,
        storage_method: 'session',
        storage_key: 'squirrel',
        storage_key_prefix: ''
    };

})(jQuery, window, document);

// onload.
$(function() {

    // load all forms that have the squirrel class  or data-squirrel attribute associated with them.
    $('form.squirrel, form[data-squirrel]').squirrel();

});
