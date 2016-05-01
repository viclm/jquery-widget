var $ = require('jquery');
var extend = require('../util/extend');
var Widget = require('./base');

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

function widget( name, base, prototype ) {
    var constructor, basePrototype;

    // ProxiedPrototype allows the provided prototype to remain unmodified
    // so that it can be used as a mixin for multiple widgets (#8876)
    var proxiedPrototype = {};

    if ( !prototype ) {
        prototype = base;
        base = Widget;
    }

    if ( $.isArray( prototype ) ) {
        prototype = $.extend.apply( null, [ {} ].concat( prototype ) );
    }

    var bak = window[name];

    window.eval([
    'window.'+name+' = function '+name+'( options, element ) {',
        // Allow instantiation without "new" keyword
        'if ( !this._createWidget ) {',
        '    return new '+name+'( options, element );',
        '}',
        // Allow instantiation without initializing for simple inheritance
        // must use "new" keyword (the code above always passes args)
        'if ( arguments.length ) {',
            'this._createWidget( options, element );',
        '}',
    '};'
    ].join(''));

    constructor = window[name];

    if (typeof bak === 'undefined') {
        delete window[name];
    }
    else {
        window[name] = bak;
    }

    // Extend with the existing constructor to carry over any static properties
    $.extend( constructor, {
        version: prototype.version,

        // Copy the object used to create the prototype in case we need to
        // redefine the widget later
        _proto: $.extend( {}, prototype )
    } );

    basePrototype = new base();

    // We need to make the options hash a property directly on the new instance
    // otherwise we'll modify the options hash on the prototype that we're
    // inheriting from
    basePrototype.options = extend({}, basePrototype.options );
    $.each( prototype, function( prop, value ) {
        if ( !$.isFunction( value ) ) {
            proxiedPrototype[ prop ] = value;
            return;
        }
        proxiedPrototype[ prop ] = ( function() {
            function _super() {
                return base.prototype[ prop ].apply( this, arguments );
            }

            function _superApply( args ) {
                return base.prototype[ prop ].apply( this, args );
            }

            return function() {
                var __super = this._super;
                var __superApply = this._superApply;
                var returnValue;

                this._super = _super;
                this._superApply = _superApply;

                returnValue = value.apply( this, arguments );

                this._super = __super;
                this._superApply = __superApply;

                return returnValue;
            };
        } )();
    } );
    constructor.prototype = extend(basePrototype, {

        // TODO: remove support for widgetEventPrefix
        // always use the name + a colon as the prefix, e.g., draggable:start
        // don't prefix for widgets that aren't DOM-based
        widgetEventPrefix: name
    }, proxiedPrototype, {
        constructor: constructor,
        widgetName: name
    } );

    //$.widget.bridge( name, constructor );

    return constructor;
}

module.exports = widget;
