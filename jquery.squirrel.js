/*
 * squirrel.js
 * http://github.com/jpederson/Squirrel.js
 * Author: James Pederson (jpederson.com)
 * Licensed under the MIT, GPL licenses.
 * Version: 0.1.4
 */
; (function($, window, document, undefined) {

    // let's start our plugin logic
    $.extend($.fn, {

        // naming our jquery plugin function
        squirrel: function(action, options) {

            // set our options from the defaults, overriding with the
            // parameter we pass into this function.
            options = $.extend($.fn.squirrel.options, options);

            // validate passed action, defaulting to init.
            action = (typeof(action) !== 'undefined' ? action : 'init');

            // stash or grab a value from our session store object.
            var stash = function(key, value, storage_key) {

                value = (typeof(value) !== 'undefined' ? value : null);

                // get the squirrel storage object
                var storage_method = options.storage_method.toLowerCase(),
                    store = JSON.parse((storage_method === 'local' ? localStorage.getItem(storage_key) : sessionStorage.getItem(storage_key))),
                    append = {};

                // if it doesn't exist, create an empty object.
                if (store === null) {
                    store = {};
                }

                // if value a value is specified
                if (value !== null) {

                    // add the new value to the object we'll append to the store object.
                    append[key] = value;

                    // extend the squirrel store object
                    store = $.extend(store, append);

                    // session the squirrel store again.
                    if (storage_method === 'local') {
                        localStorage.setItem(storage_key, JSON.stringify(store));
                    } else {
                        sessionStorage.setItem(storage_key, JSON.stringify(store));
                    }

                }

                // return the store value if the store isn't empty and the key exists.
                // else return null
                return (store !== null ? (typeof(store[key]) !== 'undefined' ? store[key] : null) : null);

            },

            // clear the sessionStorage key based on the options specified.
            unstash = function(storage_key) {

                // clear value for our storage key
                if (options.storage_method.toLowerCase() === 'local') {
                    localStorage.removeItem(storage_key);
                } else {
                    sessionStorage.removeItem(storage_key);
                }

            };

            // Iterate through all the matching elements and return
            // the jquery object to preserve chaining.
            return this.each(function() {

                // we're doin' nothing if we don't have a valid sessionStorage or localStorage object.
                if (typeof(window.sessionStorage) === 'undefined' || typeof(window.localStorage) === 'undefined') {

                    return;

                } // if sessionStorage

                // Store a jQuery object for our element so we can use it
                // inside our other bindings.
                var elem = $(this);

                // check for data-squirrel attribute
                var storage_key = (elem.attr('data-squirrel') ? elem.data('squirrel') : options.storage_key);

                // clear the stash if clear is passed
                if (action.toLowerCase() === 'clear') {

                    unstash(storage_key);

                } else {
                    // LOAD VALUES FOR ALL FORMS FROM SESSION STORAGE
                    // load text values from session storage
                    elem.find('input[type=color][name], input[type=date][name], input[type=datetime][name], input[type=datetime-local], input[type=email][name], input[type=month][name], input[type=number][name], input[type=range][name], input[type=search][name], input[type=tel][name], input[type=text][name], input[type=time][name], input[type=url][name], input[type=week][name], textarea[name]').each(function() {
                        var $this = $(this),
                            value = stash($this.attr('name'), null, storage_key);
                        if (value !== null && !$this.is('[readonly]') && $this.is(':enabled')) {
                            $this.val(value).trigger('change');
                        }
                    });

                    // set select values on load
                    elem.find('select[name]').each(function() {
                        var $this = $(this),
                            value = stash($this.attr('name'), null, storage_key);
                        if (value !== null) {
                            $this.find('option').each(function() {
                                this.selected = (this.value === value);
                            });
                        }
                    });

                    // radio buttons
                    elem.find('input[type=radio][name]').each(function() {
                        var $this = $(this),
                            value = stash($this.attr('name'), null, storage_key);
                        if (value !== null) {
                            this.checked = ($this.val() === value);
                        }
                    });

                    // checkboxes
                    elem.find('input[type=checkbox][name]').each(function() {
                        var $this = $(this),
                            checkboxValue = $this.attr('value');
                        if (typeof(checkboxValue) !== 'string') {
                            checkboxValue = '';
                        }

                        var value = stash($this.attr('name') + checkboxValue, null, storage_key);
                        if (value !== null) {
                            this.checked = (value === true);
                        }
                    });

                    // UPDATE VALUES FOR ALL FIELDS ON CHANGE
                    // track changes in fields and store values as they're typed
                    elem.find('input[type!=file], select, textarea').on('blur keyup change', function() {
                        var $this = $(this),
                            name = $this.attr('name'),
                            value = $this.attr('value'),
                            stashName = (this.type === 'checkbox' && value !== undefined) ? name + value : name;
                        stash(stashName, this.type === 'checkbox' ? $this.prop('checked') : $this.val(), storage_key);
                    });

                    // when the reset button is clicked, clear the sessionStorage as well
                    // so it doesn't creepily load on next refresh.
                    elem.find('button[type=reset], input[type=reset]').click(function() {
                        unstash(storage_key);
                    });

                    // clear storage on submit as well.
                    elem.submit(function() {
                        if (options.clear_on_submit) {
                            unstash(storage_key);
                        }
                    });

                } // end default action

            }); // return each plugin call

        } // end plugin function

    }); // end jQuery extend

    // some default options for squirrel.js
    $.fn.squirrel.options = {
        clear_on_submit: true,
        storage_method: 'session',
        storage_key: 'squirrel'
    };

})(jQuery, window, document);


// onload
$(function() {

    $('form.squirrel, form[data-squirrel]').squirrel();

});
