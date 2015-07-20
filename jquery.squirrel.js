/*
 * squirrel.js
 * http://github.com/jpederson/Squirrel.js
 * Author: James Pederson (jpederson.com)
 * Licensed under the MIT, GPL licenses.
 * Version: 0.1.5
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
            var stash = function(storage_key, key, value) {

                value = typeof value !== 'undefined' ? value : null;

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
                        localStorage.setItem( storage_key, JSON.stringify(store) );
                    } else {
                        sessionStorage.setItem( storage_key, JSON.stringify(store) );
                    }

                }

                // return the store value if the store isn't empty and the key exists.
                // else return null
                return (store !== null ? (typeof(store[key]) !== 'undefined' ? store[key] : null) : null);

            },

            // clear the sessionStorage key based on the options specified.
            unstash = function( storage_key ) {

                // clear value for our storage key
                if (options.storage_method.toLowerCase() === 'local') {
                    localStorage.removeItem( storage_key );
                } else {
                    sessionStorage.removeItem( storage_key );
                }

            };

            // Iterate through all the matching elements and return
            // the jquery object to preserve chaining.
            return this.each(function() {

                // we're doin' nothing if we don't have a valid sessionStorage or localStorage object.
                if (typeof(window.sessionStorage) === 'undefined' || typeof(window.localStorage) === 'undefined') {

                    return;

                } // if sessionStorage


                // Store a jQuery object for the form so we can use it
                // inside our other bindings.
                var form = $(this);

	            // check for data-squirrel attribute
	            var storage_key = form.attr('data-squirrel') ? form.data('squirrel') : options.storage_key;

                // clear the stash if clear is passed
                if (action.toLowerCase() === 'clear') {

                    unstash( storage_key );

                } else {

                    // LOAD VALUES FOR ALL FORMS FROM SESSION STORAGE
                    // load text values from session storage
                    form.find('input[type=color][name], input[type=date][name], input[type=datetime][name], input[type=datetime-local], input[type=email][name], input[type=month][name], input[type=number][name], input[type=range][name], input[type=search][name], input[type=tel][name], input[type=text][name], input[type=time][name], input[type=url][name], input[type=week][name], textarea[name]').each(function() {
                        var elem = $(this),
                            value = stash(storage_key, elem.attr('name'));
                        if (value !== null && !elem.is('[readonly]') && elem.is(':enabled') && elem.val()!==value ) {
                            elem.val(value).trigger('change');
                        }
                    });

                    // set select values on load
                    form.find('select[name]').each(function() {
                        var elem = $(this),
                            value = stash(storage_key, elem.attr('name'));
                        if (value !== null) {
                            // if value is not enumerable then make it enumerable. Then for each value in the array, find the option
                            // with that value and set the property called selected to true
                            $.each(typeof(value) !== 'object' ? [value] : value, function (index, option) {
                                elem.find('option[value=' + option + ']:not(:checked)').prop('selected', true).trigger('change');
                            });
                        }
                    });

                    // radio buttons
                    form.find('input[type=radio][name]').each(function() {
                        var elem = $(this),
                            value = stash(storage_key, elem.attr('name'));
                        if (value !== null && value !== this.checked) {
                            this.checked = (elem.val() === value);
                            elem.trigger('change');
                        }
                    });

                    // checkboxes
                    form.find('input[type=checkbox][name]').each(function() {
                        var elem = $(this),
                            chkval = elem.attr('value');
                        if ( typeof chkval !== 'string' ) {
                            chkval = '';
                        }

                        var value = stash(storage_key, elem.attr('name')+chkval);
                        if (value !== null && value !== this.checked) {
                            this.checked = (value === true);
                            elem.trigger('change');
                        }
                    });

                    // UPDATE VALUES FOR ALL FIELDS ON CHANGE
                    // track changes in fields and store values as they're typed
                    form.find('input[type!=file], select, textarea').on('blur keyup change', function() {
                        var elem = $(this),
                            stashname = (this.type === 'checkbox' && elem.attr('value') !== undefined) ? elem.attr('name')+elem.attr('value') : elem.attr('name');
                        stash(storage_key, stashname, this.type === 'checkbox' ? elem.prop('checked') : elem.val());
                    });

                    // when the reset button is clicked, clear the sessionStorage as well
                    // so it doesn't creepily load on next refresh.
                    form.find('button[type=reset], input[type=reset]').click(function() {
                        unstash( storage_key );
                    });

                    // clear storage on submit as well.
                    form.submit(function() {
                        if (options.clear_on_submit) {
                            unstash( storage_key );
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