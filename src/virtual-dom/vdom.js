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
    this.attributes = {};
    this.events = {};
}

VDOM.prototype = {
    parse: function () {
        var props = this.props, attributes = {}, events = {}, propertyName;
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
        this.attributes = attributes;
        this.events = events;
    },

    addEvent: function (element, widget) {
        var events = this.events, eventName;
        if (widget) {
            var widgetEvents = {};
            for (eventName in events) {
                widgetEvents[eventName] = $.isFunction(events[eventName]) ? $.proxy(events[eventName], widget): events[eventName];
            }
            widget._on(element, widgetEvents);
        }
        else {
            for (eventName in events) {
                if (events.hasOwnProperty(eventName) && $.isFunction(events[eventName])) {
                    element.on(eventName, events[eventName]);
                }
            }
        }
    }
};

module.exports = VDOM;
