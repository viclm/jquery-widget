var VDOM = require('./vdom');
var inherit = require('../util/inherit');

function VWidget(widget, props, context) {
    VDOM.call(this, props, null, context);
    this.widget = widget;
    //this.key = this.makeKey(widget.prototype.getWidgetName()); TODO getWidgetName should drop?
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

VWidget.prototype.render = function () {
    var widget = new this.widget(this.props);
    var element = widget.element;
    var result = this.parse(widget.widgetName);
    this.context.subWidgets.push(widget);
    this.addEvent(result.events, element);
    return element;
};

VWidget.prototype.update = function (props, element) {
    var result = this.parse(element.data('widget'), props);
    this.addEvent(result.events, element);
    element.data('widget-' + element.data('widget')).option(props);
};


module.exports = VWidget;
