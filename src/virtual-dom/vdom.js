var $ = require('jquery');

var reventProperty = /^on/;

var toString = function (obj) {
    if (!obj) {
        return 'undefined';
    }
    var str = [], key, value;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            value = obj[key];
            str.push(key);
            str.push(':');
            str.push(typeof value === 'object' ? toString(value) : typeof value === 'undefined' ? value : value.toString());
        }
    }
    return str.join(',');
};

function VDOM(props, children) {
    this.props = props || {};
    this.children = children || [];
}

VDOM.prototype = {
    makeKey: function (factor) {
        var id = this.props.id || this.props['data-id'];
        if (id) { return id; }
        var propsStr = toString(this.props);
        var childrenStr = $.map(this.children, function (child) {
            return child.key;
        }).join('_');
        if (propsStr) {
            factor += '_' + propsStr;
        }
        if (childrenStr) {
            factor += '_' + childrenStr;
        }
        return factor;
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

    addEvent: function (events, element, widget) {
        var name, handler, widgetEvents = {};
        for (name in events) {
            if (events.hasOwnProperty(name)) {
                handler = events[name];
                if (handler === null) {
                    widget._off(element, name);
                }
                else {
                    widgetEvents[name] = $.isFunction(handler) ? $.proxy(handler, widget): handler;
                }
            }
        }
        widget._on(element, widgetEvents);
    }
};

module.exports = VDOM;
