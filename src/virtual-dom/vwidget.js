var VDOM = require('./vdom');
var inherit = require('../util/inherit');
var $ = require('jquery');

function VWidget(widget, props) {
    VDOM.call(this, props);
    this.widget = widget;
}

inherit(VWidget, VDOM);

VWidget.prototype.render = function (parentWidget) {
    var widget = this.widget(this.props);
    if (parentWidget) {
        this.parse(widget);
        this.addEvent(widget.element, parentWidget);
    }
    return widget.widget();
};

VWidget.prototype.update = function (props, element) {
    this.props = props;
    var widget = $.data(element[0], 'widget-' + element.data('widget'));
    widget.option(props);
};

VWidget.prototype.parse = function (widget) {
    VDOM.prototype.parse.call(this);
    var events = {}, eventName;
    for (eventName in this.events) {
        events[widget.widgetName.toLowerCase() + eventName] = this.events[eventName];
    }
    this.events = events;
};

module.exports = VWidget;
