var $ = require('jquery');
var extend = require('../util/extend');
var Widget = require('./base');

var anonymousWidgetIndex = 0;

function widget( name, base, prototype ) {
    var constructor, basePrototype, globalVarBak;

    var bridge = function () {};

    // ProxiedPrototype allows the provided prototype to remain unmodified
    // so that it can be used as a mixin for multiple widgets (#8876)
    var proxiedPrototype = {};

    if (typeof name !== 'string') {
        prototype = base;
        base = name;
        name = 'Anonymous' + (++anonymousWidgetIndex);
    }

    if ( !prototype ) {
        prototype = base;
        base = Widget;
    }

    if ( $.isArray( prototype ) ) {
        prototype = $.extend.apply( null, [ {} ].concat( prototype ) );
    }

    globalVarBak = window[name];

    window.eval([
    'window.'+name+' = function '+name+'( options ) {',
        // Allow instantiation without "new" keyword
        'if ( !this._createWidget ) {',
        '    return new '+name+'( options );',
        '}',
        'this._createWidget( options );',
    '};'
    ].join(''));

    constructor = window[name];

    if (typeof bak === 'undefined') {
        delete window[name];
    }
    else {
        window[name] = globalVarBak;
    }

    bridge.prototype = base.prototype;
    basePrototype = new bridge();

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
    constructor.prototype = extend(basePrototype, proxiedPrototype, {
        constructor: constructor,
        widgetName: name
    } );

    return constructor;
}

module.exports = widget;
