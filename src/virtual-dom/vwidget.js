var VDOM = require('./vdom');
var inherit = require('../util/inherit');

function VWidget(widget, props) {
    VDOM.call(this, props);
    this.widget = widget;
}

inherit(VWidget, VDOM);

VWidget.prototype.parse = function (widgetName, props) {
    var result = VDOM.prototype.parse.call(this, props);
    var events = {}, eventName;
    for (eventName in result.events) {
        if (result.events.hasOwnProperty(eventName)) {
            events[(widgetName + ':' + eventName).toLowerCase()] = result.events[eventName];
        }
    }
    result.events = events;
    return result;
};

VWidget.prototype.render = function (parentWidget) {
    var result = this.parse(this.widget.prototype.widgetName);
    var element = this.widget(this.props).element;
    this.addEvent(result.events, element, parentWidget);
    return element;
};

VWidget.prototype.update = function (props, element, parentWidget) {
    var result = this.parse(element.data('widget'), props);
    this.addEvent(result.events, element, parentWidget);
    element.data('widget-' + element.data('widget')).option(props);
};


module.exports = VWidget;
