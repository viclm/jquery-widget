var VDOM = require('./vdom');
var inherit = require('../util/inherit');
var VText = require('./vtext');
var $ = require('jquery');

function VNode(tagName, props, children) {
    VDOM.call(this, props, children);
    this.tagName = tagName;
    this.children = $.map(this.children, function (child) {
        if (typeof child === 'string' || typeof child === 'number') {
            return new VText(child);
        }
        return child;
    });
}

inherit(VNode, VDOM);

VNode.prototype.render = function (widget) {
    this.parse();
    var element = $('<' + this.tagName + '>', this.attributes);
    this.addEvent(element, widget);
    element.append($.map(this.children, function (child) {
        return child.render(widget);
    }));
    return element;
};

VNode.prototype.update = function (props, element) {
    this.props = props;
    this.parse();
    element.prop(this.attributes);
};


module.exports = VNode;
