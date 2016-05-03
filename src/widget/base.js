var $ = require('jquery');
var extend = require('../util/extend');
var md5 = require('blueimp-md5');
var vd = require('../virtual-dom');
require('./helper');

var toString = function (obj) {
    if (!obj) {
        return '';
    }
    var str = [], key, value;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            value = obj[key];
            str.push(key);
            str.push(typeof value === 'object' ? toString(value) : typeof value === 'undefined' ? value : value.toString());
        }
    }
    return str.join('');
};

var widgetUuid = 0;

function Widget() {}

Widget.prototype = {
    widgetName: "Widget",
    defaultElement: "<div>",

    options: {
        classes: {},
        disabled: false,

        // Callbacks
        create: null
    },

    createWidget: function (widget, props, children) {
        children = Array.prototype.slice.call(arguments, 2);
        children = $.grep(children, function (child) {
            return typeof child !== 'undefined';
        });
        var vdom = new vd[(typeof widget === 'string' ? 'VNode' : 'VWidget')](widget, props, children);
        vdom.key = md5(this.widgetName + widget.toString() + toString(props));
        return vdom;
    },

    _createWidget: function( options ) {
        this.options = extend({},
            this.options,
            this._getCreateOptions(),
            options);

        this.bindings = $();
        this.hoverable = $();
        this.focusable = $();
        this.classesElementLookup = {};
        this.uuid = widgetUuid++;
        this.eventNamespace = "." + this.widgetName + this.uuid;

        this.vtree = this.render();
        this.element = this.vtree ? this.vtree.render(this) : $(this.defaultElement);

        var element = this.element[0];

        $.data( element, 'widget-' + this.widgetName, this );
        $.data( element, 'widget', this.widgetName );
        this._on( true, this.element, {
            remove: function( event ) {
                if ( event.target === element ) {
                    this.destroy();
                }
            }
        } );
        this.document = $( element.style ?

            // Element within the document
            element.ownerDocument :

            // Element is window or document
            element.document || element );
        this.window = $( this.document[ 0 ].defaultView || this.document[ 0 ].parentWindow );

        this._create();

        if ( this.options.disabled ) {
            this._setOptionDisabled( this.options.disabled );
        }

        this._trigger( "create", null, this._getCreateEventData() );
        this._init();
    },

    _getCreateOptions: function() {
        return {};
    },

    _getCreateEventData: $.noop,

    _create: $.noop,

    _init: $.noop,

    destroy: function() {
        var that = this;

        this._destroy();
        $.each( this.classesElementLookup, function( key, value ) {
            that._removeClass( value, key );
        } );

        // We can probably remove the unbind calls in 2.0
        // all event bindings should go through this._on()
        this.element
            .off( this.eventNamespace )
            .removeData( this.widgetName );
        this.widget()
            .off( this.eventNamespace )
            .removeAttr( "aria-disabled" );

        // Clean up events and states
        this.bindings.off( this.eventNamespace );

        $.each(this._subWidgets, function (name, instance) {
            instance.destroy();
        });

        this._subWidgets = null;
    },

    _destroy: $.noop,

    widget: function() {
        return this.element;
    },

    option: function( key, value ) {
        var options = key;
        var parts;
        var curOption;
        var i;

        if ( arguments.length === 0 ) {

            // Don't return a reference to the internal hash
            return extend({}, this.options );
        }

        if ( typeof key === "string" ) {

            // Handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
            options = {};
            parts = key.split( "." );
            key = parts.shift();
            if ( parts.length ) {
                curOption = options[ key ] = extend({}, this.options[ key ] );
                for ( i = 0; i < parts.length - 1; i++ ) {
                    curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
                    curOption = curOption[ parts[ i ] ];
                }
                key = parts.pop();
                if ( arguments.length === 1 ) {
                    return curOption[ key ] === undefined ? null : curOption[ key ];
                }
                curOption[ key ] = value;
            } else {
                if ( arguments.length === 1 ) {
                    return this.options[ key ] === undefined ? null : this.options[ key ];
                }
                options[ key ] = value;
            }
        }

        this._setOptions( options );

        return this;
    },

    _setOptions: function( options ) {
        var key;

        for ( key in options ) {
            this._setOption( key, options[ key ] );
        }

        var vtree = this.render();
        var patches = vd.diff(this.vtree, vtree).patches;
        vd.patch(this.element, patches);
        this.vtree = vtree;

        return this;
    },

    _setOption: function( key, value ) {
        if ( key === "classes" ) {
            this._setOptionClasses( value );
        }

        this.options[ key ] = $.isPlainObject(value) ? extend({}, value) : value;

        if ( key === "disabled" ) {
            this._setOptionDisabled( value );
        }

        return this;
    },

    _setOptionClasses: function( value ) {
        var classKey, elements, currentElements;

        for ( classKey in value ) {
            currentElements = this.classesElementLookup[ classKey ];
            if ( value[ classKey ] === this.options.classes[ classKey ] ||
                    !currentElements ||
                    !currentElements.length ) {
                continue;
            }

            // We are doing this to create a new jQuery object because the _removeClass() call
            // on the next line is going to destroy the reference to the current elements being
            // tracked. We need to save a copy of this collection so that we can add the new classes
            // below.
            elements = $( currentElements.get() );
            this._removeClass( currentElements, classKey );

            // We don't use _addClass() here, because that uses this.options.classes
            // for generating the string of classes. We want to use the value passed in from
            // _setOption(), this is the new value of the classes option which was passed to
            // _setOption(). We pass this value directly to _classes().
            elements.addClass( this._classes( {
                element: elements,
                keys: classKey,
                classes: value,
                add: true
            } ) );
        }
    },

    _setOptionDisabled: function( value ) {
        this._toggleClass( this.widget(), this.widgetName + "-disabled", null, !!value );

        // If the widget is becoming disabled, then nothing is interactive
        if ( value ) {
            this._removeClass( this.hoverable, null, "ui-state-hover" );
            this._removeClass( this.focusable, null, "ui-state-focus" );
        }
    },

    enable: function() {
        return this._setOptions( { disabled: false } );
    },

    disable: function() {
        return this._setOptions( { disabled: true } );
    },

    _classes: function( options ) {
        var full = [];
        var that = this;

        options = $.extend( {
            element: this.element,
            classes: this.options.classes || {}
        }, options );

        function processClassString( classes, checkOption ) {
            var current, i;
            for ( i = 0; i < classes.length; i++ ) {
                current = that.classesElementLookup[ classes[ i ] ] || $();
                if ( options.add ) {
                    current = $( $.unique( current.get().concat( options.element.get() ) ) );
                } else {
                    current = $( current.not( options.element ).get() );
                }
                that.classesElementLookup[ classes[ i ] ] = current;
                full.push( classes[ i ] );
                if ( checkOption && options.classes[ classes[ i ] ] ) {
                    full.push( options.classes[ classes[ i ] ] );
                }
            }
        }

        if ( options.keys ) {
            processClassString( options.keys.match( /\S+/g ) || [], true );
        }
        if ( options.extra ) {
            processClassString( options.extra.match( /\S+/g ) || [] );
        }

        return full.join( " " );
    },

    _removeClass: function( element, keys, extra ) {
        return this._toggleClass( element, keys, extra, false );
    },

    _addClass: function( element, keys, extra ) {
        return this._toggleClass( element, keys, extra, true );
    },

    _toggleClass: function( element, keys, extra, add ) {
        add = ( typeof add === "boolean" ) ? add : extra;
        var shift = ( typeof element === "string" || element === null ),
            options = {
                extra: shift ? keys : extra,
                keys: shift ? element : keys,
                element: shift ? this.element : element,
                add: add
            };
        options.element.toggleClass( this._classes( options ), add );
        return this;
    },

    _on: function( suppressDisabledCheck, element, handlers ) {
        var delegateElement;
        var instance = this;

        // No suppressDisabledCheck flag, shuffle arguments
        if ( typeof suppressDisabledCheck !== "boolean" ) {
            handlers = element;
            element = suppressDisabledCheck;
            suppressDisabledCheck = false;
        }

        // No element argument, shuffle and use this.element
        if ( !handlers ) {
            handlers = element;
            element = this.element;
            delegateElement = this.widget();
        } else {
            element = delegateElement = $( element );
            this.bindings = this.bindings.add( element );
        }

        $.each( handlers, function( event, handler ) {
            function handlerProxy() {

                // Allow widgets to customize the disabled handling
                // - disabled as an array instead of boolean
                // - disabled class as method for disabling individual parts
                if ( !suppressDisabledCheck &&
                        ( instance.options.disabled === true ||
                        $( this ).hasClass( "ui-state-disabled" ) ) ) {
                    return;
                }
                return ( typeof handler === "string" ? instance[ handler ] : handler )
                    .apply( instance, arguments );
            }

            // Copy the guid so direct unbinding works
            if ( typeof handler !== "string" ) {
                handlerProxy.guid = handler.guid =
                    handler.guid || handlerProxy.guid || $.guid++;
            }

            var match = event.match( /^([\w:-]*)\s*(.*)$/ );
            var eventName = match[ 1 ] + instance.eventNamespace;
            var selector = match[ 2 ];

            if ( selector ) {
                delegateElement.on( eventName, selector, handlerProxy );
            } else {
                element.on( eventName, handlerProxy );
            }
        } );
    },

    _off: function( element, eventName ) {
        eventName = ( eventName || "" ).split( " " ).join( this.eventNamespace + " " ) +
            this.eventNamespace;
        element.off( eventName ).off( eventName );

        // Clear the stack to avoid memory leaks (#10056)
        this.bindings = $( this.bindings.not( element ).get() );
        this.focusable = $( this.focusable.not( element ).get() );
        this.hoverable = $( this.hoverable.not( element ).get() );
    },

    _delay: function( handler, delay ) {
        function handlerProxy() {
            return ( typeof handler === "string" ? instance[ handler ] : handler )
                .apply( instance, arguments );
        }
        var instance = this;
        return setTimeout( handlerProxy, delay || 0 );
    },

    _hoverable: function( element ) {
        this.hoverable = this.hoverable.add( element );
        this._on( element, {
            mouseenter: function( event ) {
                this._addClass( $( event.currentTarget ), null, "ui-state-hover" );
            },
            mouseleave: function( event ) {
                this._removeClass( $( event.currentTarget ), null, "ui-state-hover" );
            }
        } );
    },

    _focusable: function( element ) {
        this.focusable = this.focusable.add( element );
        this._on( element, {
            focusin: function( event ) {
                this._addClass( $( event.currentTarget ), null, "ui-state-focus" );
            },
            focusout: function( event ) {
                this._removeClass( $( event.currentTarget ), null, "ui-state-focus" );
            }
        } );
    },

    _trigger: function( type, event, data ) {
        var prop, orig;
        var callback = this.options[ type ];

        data = data || {};
        event = $.Event( event );
        event.type = ( this.widgetName + ':' + type ).toLowerCase();

        // The original event may come from any element
        // so we need to reset the target on the new event
        event.target = this.element[ 0 ];

        // Copy original event properties over to the new event
        orig = event.originalEvent;
        if ( orig ) {
            for ( prop in orig ) {
                if ( !( prop in event ) ) {
                    event[ prop ] = orig[ prop ];
                }
            }
        }

        this.element.trigger( event, data );
        return !( $.isFunction( callback ) &&
            callback.apply( this.element[ 0 ], [ event ].concat( data ) ) === false ||
            event.isDefaultPrevented() );
    },

    render: function () {
        return null;
    }
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
    Widget.prototype[ "_" + method ] = function( element, options, callback ) {
        if ( typeof options === "string" ) {
            options = { effect: options };
        }

        var hasOptions;
        var effectName = !options ?
            method :
            options === true || typeof options === "number" ?
                defaultEffect :
                options.effect || defaultEffect;

        options = options || {};
        if ( typeof options === "number" ) {
            options = { duration: options };
        }

        hasOptions = !$.isEmptyObject( options );
        options.complete = callback;

        if ( options.delay ) {
            element.delay( options.delay );
        }

        if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
            element[ method ]( options );
        } else if ( effectName !== method && element[ effectName ] ) {
            element[ effectName ]( options.duration, options.easing, callback );
        } else {
            element.queue( function( next ) {
                $( this )[ method ]();
                if ( callback ) {
                    callback.call( element[ 0 ] );
                }
                next();
            } );
        }
    };
} );

module.exports = Widget;
