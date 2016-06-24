var $ = require('jquery');

var reventProperty = /^on/;

function VDOM(props, children, context) {
    this.props = props || {};
    this.children = children || [];
    this.context = context;
}

VDOM.prototype = {
    makeKey: function (index) {
        if ('id' in this.props) {
            this.key = this.props['id'];
        }
        else if ('data-id' in this.props) {
            this.key = this.props['data-id'];
        }
        else {
            this.key = index;
        }
    },
    parse: function (props) {
        var attributes = {}, events = {}, propertyName;
        props = props || this.props;
        for (propertyName in props) {
            if (props.hasOwnProperty(propertyName)) {
                if (reventProperty.test(propertyName)) {
                    events[propertyName.slice(2)] = props[propertyName];
                }
                else {
                    attributes[propertyName] = props[propertyName];
                }
            }
        }
        return {
            attributes: attributes,
            events: events
        };
    },

    addEvent: function (events, element) {
        var name, handler, widgetEvents = {}, widget = this.context;
        for (name in events) {
            if (events.hasOwnProperty(name)) {
                handler = events[name];
                if (handler === null) {
                    widget._off(element, name);
                }
                else {
                    widgetEvents[name] = typeof handler === 'string' ? handler: $.proxy(handler, widget);
                }
            }
        }
        widget._on(element, widgetEvents);
    }
};

module.exports = VDOM;
