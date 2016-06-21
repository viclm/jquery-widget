var $ = require('jquery');

var reventProperty = /^on/;

var toString = function (obj) {
    var str = [], key, value, substr;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            value = obj[key];
            value = typeof value === 'object' ? toString(value) : typeof value === 'undefined' ? '' : value.toString();
            substr = key;
            if (value) {
                substr += ':' + value;
            }
            str.push(substr);
        }
    }
    return str.join(',');
};

function VDOM(props, children, context) {
    this.props = props || {};
    this.children = children || [];
    this.context = context;
}

VDOM.prototype = {
    makeKey: function (factor) {
        if ('id' in this.props) {
            return this.props['id'];
        }
        else if ('data-id' in this.props) {
            return this.props['data-id'];
        }
        else {
            return factor += '_' + toString(this.props);
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
