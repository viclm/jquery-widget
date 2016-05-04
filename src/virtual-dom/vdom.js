var $ = require('jquery');

var reventProperty = /^on/;

var attrfix = {
    classname: 'class',
    htmlfor: 'for'
};

function VDOM(props, children) {
    this.props = props || {};
    this.children = children || [];
    this.key = null;
}

VDOM.prototype = {
    parse: function (props) {
        var attributes = {}, events = {}, propertyName;
        props = props || this.props;
        for (propertyName in props) {
            if (props.hasOwnProperty(propertyName)) {
                if (reventProperty.test(propertyName)) {
                    events[propertyName.slice(2)] = props[propertyName];
                }
                else {
                    attributes[attrfix[propertyName] || propertyName] = props[propertyName];
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
