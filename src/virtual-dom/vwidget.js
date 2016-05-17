var VDOM = require('./vdom');
var inherit = require('../util/inherit');

function VWidget(widget, props) {
    VDOM.call(this, props);
    this.widget = widget;
    this.key = this.makeKey(widget.prototype.getWidgetName());
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
    var widget = new this.widget(this.props);
    var element = widget.element;
    var result = this.parse(widget.widgetName);
    this.addEvent(result.events, element, parentWidget);
    return element;
};

VWidget.prototype.update = function (props, element, parentWidget) {
    var result = this.parse(element.data('widget'), props);
    this.addEvent(result.events, element, parentWidget);
    element.data('widget-' + element.data('widget')).option(props);
};


module.exports = VWidget;
