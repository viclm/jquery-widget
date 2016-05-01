var patchType = require('./constant/patchType');
var VText = require('./vtext');
var VNode = require('./vnode');
var VWidget = require('./vwidget');
var $ = require('jquery');

var undef = $.noop();

function diff(oldTree, newTree) {
    if (!(this instanceof diff)) {
        return new diff(oldTree, newTree);
    }
    this.index = -1;
    this.patches = {};
    this.walk(oldTree, newTree);
}

diff.prototype = {
    walk: function (oldTree, newTree) {
        var patch = [], index = ++this.index;
        if (!oldTree || !newTree) {
            return;
        }
        else if (oldTree.constructor !== newTree.constructor) {
            patch.push({type: patchType.REPLACE, node: newTree});
        }
        else {
            if (oldTree.constructor === VText) {
                if (oldTree.text !== newTree.text) {
                    patch.push({type: patchType.REPLACE, node: newTree});
                }
            }
            else if (oldTree.constructor === VNode) {
                var diffProps = this.diffProps(oldTree.props, newTree.props);
                if (diffProps) {
                    patch.push({type: patchType.PROPS, node: newTree, props: diffProps});
                }
                var diffChildren = this.diffChildren(oldTree.children, newTree.children);
                if (diffChildren.move.length) {
                    patch.push({type: patchType.REORDER, move: diffChildren.move});
                }
                for (var i = 0, len = oldTree.children.length ; i < len ; i++) {
                    this.walk(oldTree.children[i], diffChildren.children[i])
                }
            }
            else if (oldTree.constructor === VWidget) {
                var diffProps = this.diffProps(oldTree.props, newTree.props);//eslint-disable-line
                if (diffProps) {
                    patch.push({type: patchType.PROPS, node: newTree, props: diffProps});
                }
            }
        }

        if (patch.length) {
            this.patches[index] = patch;
        }
    },

    diffProps: function (oldProps, newProps) {
        var diffProps = {}, that = this;
        $.each(oldProps, function (key, value) {
            var newValue = newProps[key];
            if (newValue === undef) {
                diffProps[key] = null;
            }
            else if ($.isPlainObject(value) && $.isPlainObject(newValue)) {
                var dp = that.diffProps(value, newValue);
                if (dp) {
                    diffProps[key] = newValue;
                }
            }
            else if (value !== newValue) {
                diffProps[key] = newValue;
            }
        });
        $.each(newProps, function (key, value) {
            if (!oldProps[key]) {
                diffProps[key] = value;
            }
        });
        return $.isEmptyObject(diffProps) ? null : diffProps;
    },

    diffChildren: function (oldChildren, newChildren) {
        var getIndex = function (list) {
            var hash = {};
            for (var i = 0, len = list.length ; i < len ; i++) {
                hash[list[i].key] = i;
            }
            return hash;
        };
        var oldIndex = getIndex(oldChildren);
        var newIndex = getIndex(newChildren);
        var move = [];
        var children = [], transChildren = [], transRepeat = {};
        var i, len, node;
        for (i = 0, len = oldChildren.length ; i < len ; i++) {
            node = oldChildren[i];
            if (newIndex[node.key] > -1) {
                transChildren.push(children[i] = newChildren[newIndex[node.key]]);
            }
            else {
                children[i] = null;
                move.push({type: patchType.REMOVE, index: i});
            }
        }
        for (i = 0, len = newChildren.length ; i < len ; i++) {
            node = newChildren[i];
            if (transRepeat[node.key]) {
                transRepeat[node.key] = false;
                transChildren.splice(i, 1);
            }
            if (transChildren[i]) {
                if (node.key === transChildren[i].key) {
                    continue;
                }
                else {
                    move.push({type: patchType.INSERT, node: node, index: i});
                    if (oldIndex[node.key] > -1) {
                        transChildren.splice(i, 0, node);
                        transRepeat[node.key] = true;
                    }
                }
            }
            else {
                move.push({type: patchType.INSERT, node: node, index: i});
            }
        }

        return {
            move: move,
            children: children
        };
    }
};

module.exports = diff;
