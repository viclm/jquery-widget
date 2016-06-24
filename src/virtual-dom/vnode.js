var VDOM = require('./vdom');
var inherit = require('../util/inherit');
var VText = require('./vtext');
var $ = require('jquery');

var attrfix = {
    classname: 'class',
    htmlfor: 'for'
};

function VNode(tagName, props, children, context) {
    VDOM.call(this, props, children, context);
    this.tagName = tagName;
    children = [];
    for (var i = 0, child ; i < this.children.length ; i++) {
        child = this.children[i];
        if ($.isArray(child)) {
            child.unshift(1);
            child.unshift(i);
            Array.prototype.splice.apply(this.children, child);
            i--;
        }
        else {
            if (child == null) {
                continue;
            }
            else if (typeof child === 'string' || typeof child === 'number') {
                child = new VText(child);
            }
            child.makeKey(i);
            children.push(child);
        }
    }
    this.children = children;
}

inherit(VNode, VDOM);

VNode.prototype.parse = function (props) {
    var result = VDOM.prototype.parse.call(this, props);
    var attributes = {};
    $.each(result.attributes, function (key, value) {
        attributes[attrfix[key] || key] = value;
    });
    result.attributes = attributes;
    return result;
};

VNode.prototype.render = function () {
    var result = this.parse();
    var element = $('<' + this.tagName + '>', result.attributes);
    this.addEvent(result.events, element);
    element.append($.map(this.children, function (child) {
        return child.render();
    }));
    return element;
};

VNode.prototype.update = function (props, element) {
    var result = this.parse(props), eventsRemove = {}, eventsUpdate = {};
    $.each(result.attributes, function (key, value) {
        if (value == null) {
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
        if (value != null) {
            eventsUpdate[key] = value;
        }
    });
    this.addEvent(eventsRemove, element);
    this.addEvent(eventsUpdate, element);
};


module.exports = VNode;
