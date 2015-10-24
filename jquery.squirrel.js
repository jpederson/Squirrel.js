/*
 * squirrel.js
 * http://github.com/jpederson/Squirrel.js
 * Author: James Pederson (jpederson.com)
 * Licensed under the MIT, GPL licenses.
 * Version: 0.1.8
 */
; // jshint ignore:line
(function (window, $, undefined) {

    // PLUGIN LOGIC

    $.fn.extend({

        // naming our jQuery plugin function.
        squirrel: function squirrel(action, options) {

                // set our options from the defaults, overriding with the
                // parameter we pass into this function.
                options = $.extend({}, $.fn.squirrel.options, options);

                /* jscs: disable */

                // jscs only workaround
                options.clearOnSubmit = options.clear_on_submit;
                options.storageMethod = options.storage_method;
                options.storageKey = options.storage_key;
                options.storageKeyPrefix = options.storage_key_prefix;
                /* jscs: enable */

                // initialize as null by default.
                var storage = null;

                // either 'local' or 'session' has been passed if this is true.
                if (isString(options.storageMethod)) {

                    storage = options.storageMethod.toUpperCase() === 'LOCAL' ? window.localStorage : window.sessionStorage;

                    // an object that could be a valid storage object has been passed.
                } else if (options.storageMethod !== null && isObject(options.storageMethod)) {

                    storage = options.storageMethod;

                }

                // if null or the storage object doesn't contain the valid functions required, then return this.
                if (storage === null || !(isObject(storage) && 'getItem' in storage && 'removeItem' in storage && 'setItem' in storage)) {

                    // to maintain chaining in jQuery.
                    return this;

                }

                // check the action is valid and convert to uppercase.
                action = isString(action) && _regExp.ACTION.test(action) ? action.toUpperCase() : 'START';

                // strings related to the find functions and event handling.
                var eventFields = 'input[type!=file]:not(.squirrel-ignore), select:not(.squirrel-ignore), textarea:not(.squirrel-ignore)';
                var eventReset = 'button[type=reset], input[type=reset]';
                var findFields = 'input[id], input[name], select[id], select[name], textarea[id], textarea[name]';

                // sanitize the options strings.
                options.storageKey = sanitizeOption(options.storageKey, 'squirrel');
                options.storageKeyPrefix = sanitizeOption(options.storageKeyPrefix, '');

                // iterate through all the matching elements and return
                // the jQuery object to preserve chaining in jQuery.
                return this.each(function eachForm() {

                    // store a jQuery object for the form so we can use it
                    // inside the other bindings.
                    var $form = $(this);

                    // check for the data-squirrel attribute.
                    var dataAttribute = $form.attr('data-squirrel');

                    // append the custom prefix and determine if the data attribute is valid.
                    var storageKey = options.storageKeyPrefix + (isString(dataAttribute) ? dataAttribute : options.storageKey);

                    switch (action) {
                        case 'CLEAR':
                        case 'REMOVE':

                            // clear the storage if a 'clear' action is passed.
                            unstash(storage, storageKey);
                            break;

                        case 'OFF':
                        case 'STOP':

                            // stop the registered events if a 'stop' action is passed.
                            $form.find(eventFields).off(_events.CHANGE);
                            $form.find(eventReset).off(_events.CLICK);
                            $form.off(_events.SUBMIT);
                            break;

                        default:

                            // LOAD VALUES FOR ALL FORMS FROM LOCAL/SESSION STORAGE IN ORDER OF THE DOM
                            $form.find('*').filter(findFields).each(function eachNode() {

                                // cache the jQuery object.
                                var $element = $(this);

                                // get the name attribute.
                                var name = $element.attr('name');

                                // if the name attribute doesn't exist, determine the id attribute instead.
                                if (isUndefined(name)) {
                                    name = $element.attr('id');

                                    // a name attribute is required to store the element data.
                                    if (isUndefined(name)) {

                                        // return $form to maintain chaining in jQuery.
                                        return $form;
                                    }
                                }

                                // declare a variable to hold the value from the storage.
                                var value = null;

                                // tagName returns an uppercase value in HTML5.
                                switch (this.tagName) {
                                    case 'INPUT':
                                    case 'TEXTAREA':
                                        var type = $element.attr('type');

                                        if (type === 'checkbox') {

                                            // checkboxes.
                                            var checkedValue = $element.attr('value');

                                            if (!isString(checkedValue)) {
                                                checkedValue = '';
                                            }

                                            value = stash(storage, storageKey, name + checkedValue);

                                            if (value !== null && value !== this.checked) {
                                                // set the checkbox state to 'true', if the value is true
                                                this.checked = (value === true);

                                                // trigger the 'change' event.
                                                $element.trigger('change');
                                            }

                                        } else if (type === 'radio') {

                                            // radio buttons.
                                            value = stash(storage, storageKey, name);

                                            if (value !== null && value !== this.checked) {
                                                this.checked = ($element.val() === value);

                                                // trigger the 'change' event.
                                                $element.trigger('change');
                                            }

                                        } else {

                                            // load the text values from the storage.
                                            value = stash(storage, storageKey, name);

                                            if (value !== null && !$element.is('[readonly]') && $element.is(':enabled') && $element.val() !== value) {

                                                // set the value and trigger the 'change' event.
                                                $element.val(value).trigger('change');
                                            }

                                        }

                                        break;

                                    case 'SELECT':

                                        // set the select values on load.
                                        value = stash(storage, storageKey, name);

                                        if (value !== null) {

                                            $.each(($.isArray(value) ? value : [value]), function eachValue(index, option) {

                                                $element.find('option').filter(function eachOption() {

                                                    var $option = $(this);
                                                    return ($option.val() === option || $option.html() === option);

                                                })

                                                // set selected to true.
                                                .prop('selected', true)

                                                // trigger the 'change' event.
                                                .trigger('change');

                                            });
                                        }

                                        break;
                                }

                            });

                            // UPDATE VALUES FOR ALL FIELDS ON CHANGE.
                            // track changes in fields and store values as they're typed.
                            $form.find(eventFields).on(_events.CHANGE, function onEvent() {

                                // cache the jQuery object.
                                var $element = $(this);

                                // get the name attribute.
                                var name = $element.attr('name');

                                // if the name attribute doesn't exist, determine the id attribute instead.
                                if (isUndefined(name)) {
                                    // get the id attribute.
                                    name = $element.attr('id');

                                    // a name attribute is required to store the element data.
                                    if (isUndefined(name)) {
                                        return;
                                    }
                                }

                                // get the value attribute.
                                var value = $element.attr('value');

                                // pre-append the name attribute with the value if a checkbox; otherwise, use the name only.
                                var stashName = (this.type === 'checkbox' && !isUndefined(value)) ? name + value : name;

                                stash(storage, storageKey, stashName, this.type === 'checkbox' ? $element.prop('checked') : $element.val());

                            });

                            // when the reset button is clicked, clear the storage.
                            $form.find(eventReset).on(_events.CLICK, function onClick() {

                                unstash(storage, storageKey);

                            });

                            // clear the storage on submit.
                            $form.on(_events.SUBMIT, function onSubmit() {

                                // if not a boolean datatype or is equal to true, then clear the storage.
                                if (!isBoolean(options.clearOnSubmit) || options.clearOnSubmit) {

                                    unstash(storage, storageKey);

                                }

                            });

                            break;

                    } // end actions.

                }); // return each plugin call.

            } // end plugin function.

    }); // end jQuery extend.

    // EVENTS
    var _events = {
        CLICK: 'click.squirrel.js',
        CHANGE: 'blur.squirrel.js keyup.squirrel.js change.squirrel.js',
        SUBMIT: 'submit.squirrel.js'
    };

    // REGULAR EXPRESSIONS
    var _regExp = {
        ACTION: /^(?:CLEAR|REMOVE|OFF|STOP)$/i
    };

    // METHODS

    // stash or grab a value from our session store object.
    function stash(storage, storageKey, key, value) {

        // get the squirrel storage object.
        var store = window.JSON.parse(storage.getItem(storageKey));

        // if it doesn't exist, create an empty object.
        if (store === null) {

            store = {};

        }

        // if a value isn't specified.
        if (isUndefined(value) || value === null) {

            // return the store value if the store value exists; otherwise, null.
            return !isUndefined(store[key]) ? store[key] : null;

        }

        // if a value is specified.
        // create an append object literal.
        var append = {};

        // add the new value to the object that we'll append to the store object.
        append[key] = value;

        // extend the squirrel store object.
        // in ES6 this can be shortened to just $.extend(store, {[key]: value}), as there would be no need
        // to create a temporary storage object.
        $.extend(store, append);

        // re-session the squirrel store again.
        storage.setItem(storageKey, window.JSON.stringify(store));

        // return the value.
        return value;

    }

    // clear the sessionStorage key based on the options specified.
    function unstash(storage, storageKey) {

        // clear value for our storage key.
        storage.removeItem(storageKey);

    }

    // check if a value is a boolean datatype.
    function isBoolean(value) {

        return $.type(value) === 'boolean';

    }

    // check if a value is an object.
    function isObject(value) {

        return $.type(value) === 'object';

    }

    // check if a value is a string datatype and has a length greater than zero (trims whitespace as well).
    function isString(value) {

        return $.type(value) === 'string' && value.trim().length > 0;

    }

    // check if a value is undefined.
    function isUndefined(value) {

        return value === undefined;

    }

    // sanitize a particular string option.
    function sanitizeOption(key, defaultKey) {

        // if a string type, then return the key; otherwise the default key.
        return isString(key) ? key : defaultKey;

    }

    // DEFAULTS

    // default options for squirrel.js.
    /* jscs: disable */
    $.fn.squirrel.options = {
        clear_on_submit: true,
        storage_method: 'session',
        storage_key: 'squirrel',
        storage_key_prefix: ''
    };
    /* jscs: enable */

    // onload.
    $(function () {

        // load all forms that have the squirrel class or data-squirrel attribute associated with them.
        $('form.squirrel, form[data-squirrel]').squirrel();

    });

})(this, this.jQuery);
