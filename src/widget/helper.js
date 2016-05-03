var $ = require('jquery');

$.cleanData = ( function( orig ) {
    return function( elems ) {
        var events, elem, i;
        for ( i = 0; ( elem = elems[ i ] ) != null; i++ ) {
            try {

                // Only trigger remove when necessary to save time
                events = $._data( elem, "events" );
                if ( events && events.remove ) {
                    $( elem ).triggerHandler( "remove" );
                }

                // Http://bugs.jquery.com/ticket/8235
            } catch ( e ) {} //eslint-disable-line
        }
        orig( elems );
    };
} )( $.cleanData );
