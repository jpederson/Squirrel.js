/*
 * squirrel.js
 * http://github.com/jpederson/Squirrel.js
 * Author: James Pederson (jpederson.com)
 * Licensed under the MIT, GPL licenses.
 * Version: 1.0.0
 */

;(function( $, window, document, undefined ){

    // let's start our plugin logic
    $.extend($.fn, {

    	// core formStore function
        squirrel: function( options ){

            // set our options from the defaults, overriding with the
            // parameter we pass into this function.
			options = $.extend( $.fn.squirrel.options, options );


            // Iterate through all the matching elements and return
            // the jquery object to preserve chaining.
	        return this.each(function(){

                // Store a jQuery object for our element so we can use it
                // inside our other bindings.
	            var elem = $(this);

	            // we're doin' nothing if we don't have sessionStorage.
				if ( window.sessionStorage ) {


					// stash or grab a value from our session store object.
					var stash = function( key, value ) {
						value = ( typeof( value ) !== "undefined" ? value : null );

						// get the squirrel storage object
						var store = JSON.parse( sessionStorage.getItem( "squirrel" ) ),
							append = {};

						if ( store == null ) {
							store = {};
						}

						// if value a value is specified
						if ( value !== null ) {

							// add the new value to the object we'll append to the store object.
							append[key] = value;

							// extend the squirrel store object
							store = $.extend( store, append );

							// session the squirrel store again.
							sessionStorage.setItem( "squirrel", JSON.stringify( store ) );

						}

						// return the store value if the store isn't empty and the key exists.
						// else return empty strings
						return ( store !== null ? ( typeof( store[key] ) !== "undefined" ? store[key] : "" ) : "" );

					},


					// clear the stash
					unstash = function() {

						// remove our sessionStorage item
						sessionStorage.removeItem( "squirrel" );
						
					};


					// LOAD VALUES FOR ALL FORMS FROM SESSION STORAGE
					// load text values from session storage
					elem.find("input[type=text], textarea").each(function(){
						var value = stash( $(this).attr( "name" ) );
						if ( value !== null ) {
							$(this).val( value );
						}
					});


					// set select values on load
					elem.find("select").each(function(){
						var value = stash( $(this).attr( "name" ) );
						if ( value !== null ) {
							$(this).find("option").each(function(){ 
								this.selected = ( this.value == value ); 
							});
						}
					});


					// radio buttons
					elem.find("input[type=radio]").each(function(){
						var value = stash( $(this).attr( "name" ) );
						if ( value !== null ) {
							this.checked = ( $(this).val() == value );
						}
					});


					// checkboxes
					elem.find("input[type=checkbox]").each(function(){
						var value = stash( $(this).attr( "name" ) );
						if ( value !== null ) {
							this.checked = ( value == "yes" );
						}
					});


					// UPDATE VALUES FOR ALL FIELDS ON CHANGE
					// track changes in fields and store values as they're typed
					elem.find("input, select, textarea").on( 'blur keyup change', function() {
						stash( $(this).attr("name"), $(this).val() );
					});


					// when the clear button is clicked, clear the sessionStorage as well 
					// so it doesn't creepily load next refresh.
					elem.find("input[type=clear]").click(function(){
						unstash();
					});


					// clear storage on submit as well.
					elem.submit(function(){
						if ( options.clear_on_submit ) {
							unstash();
						}
					});


				}

	        });

	    }

    });



    // some default options for squirrel.js
    $.fn.squirrel.options = {
    	clear_on_submit: true
    };



})( jQuery, window, document );


// onload
$(function(){

	$("form.squirrel").squirrel();

});
