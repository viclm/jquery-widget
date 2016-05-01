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
        var events = this.events;
        if (widget) {
            var widgetEvents = {};
            for (var eventName in events) {
                widgetEvents[eventName] = $.proxy(events[eventName], widget);
            }
            widget._on(element, widgetEvents);
        }
        else {
            element.on(events);
        }
    }
};

module.exports = VDOM;
