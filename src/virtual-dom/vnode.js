var VDOM = require('./vdom');
var inherit = require('../util/inherit');
var VText = require('./vtext');
var $ = require('jquery');

var attrfix = {
    classname: 'class',
    htmlfor: 'for'
};

function VNode(tagName, props, children) {
    VDOM.call(this, props, children);
    this.tagName = tagName;
    this.children = $.map(this.children, function (child) {
        if (typeof child === 'string' || typeof child === 'number') {
            return new VText(child);
        }
        return child;
    });
    this.key = this.makeKey(tagName);
}

inherit(VNode, VDOM);

VNode.prototype.parse = function (props) {
    var result = VDOM.prototype.parse.call(this, props);
    var attributes = {}, attributeName;
    for (attributeName in result.attributes) {
        if (result.attributes.hasOwnProperty(attributeName)) {
            attributes[attrfix[attributeName] || attributeName] = result.attributes[attributeName];
        }
    }
    result.attributes = attributes;
    return result;
};

VNode.prototype.render = function (widget) {
    var result = this.parse();
    var element = $('<' + this.tagName + '>', result.attributes);
    this.addEvent(result.events, element, widget);
    element.append($.map(this.children, function (child) {
        return child.render(widget);
    }));
    return element;
};

VNode.prototype.update = function (props, element, widget) {
    var result = this.parse(props), eventsRemove = {}, eventsUpdate = {};
    $.each(result.attributes, function (key, value) {
        if (value === null) {
            element.removeProp(key);
            element.removeAttr(key);
        }
        else {
            element.prop(key, value);
            element.attr(key, value);
        }
    });
    $.each(result.events, function (key, value) {
        eventsRemove[key] = null;
        if (value !== null) {
            eventsUpdate[key] = value;
        }
    });
    this.addEvent(eventsRemove, element, widget);
    this.addEvent(eventsUpdate, element, widget);
};


module.exports = VNode;
