var patchType = require('./constant/patchType');
var $ = require('jquery');

function patch(node, patches) {
    if (!(this instanceof patch)) {
        return new patch(node, patches);
    }
    this.root = node;
    this.widget = this.root.data('widget-' + this.root.data('widget'));
    this.patches = patches;
    this.patchesRemaining = 0;
    for (var key in patches) {
        if (patches.hasOwnProperty(key)) {
            this.patchesRemaining++;
        }
    }

    this.index = -1;
    this.walk(node[0]);
}

patch.prototype = {
    walk: function (node) {
        var index = ++this.index;
        var patch = this.patches[index];
        if (patch) {
            this.applyPatch(node, patch);
            this.patchesRemaining--;
        }

        if (node.replaceComplete) {
            delete node.replaceComplete;
            return;
        }

        if (this.patchesRemaining > 0 && (node === this.root[0] || node && node.nodeType === 1 && !$.data(node, 'widget'))) {
            var childNodes = node.childNodes;
            for (var i = 0, len = childNodes.length ; i < len ; i++) {
                if (this.walk(childNodes[i])) {
                    break;
                }
            }
        }
        return this.patchesRemaining === 0;
    },

    applyPatch: function (node, patches) {
        for (var i = 0, len = patches.length, patch ; i < len ; i++) {
            patch = patches[i];
            switch (patch.type) {
                case patchType.PROPS:
                    this.patchProps(node, patch.node, patch.props);
                    break;
                case patchType.REORDER:
                    this.patchReorder(node, patch.move);
                    break;
                case patchType.REPLACE:
                    this.patchReplace(node, patch.node);
                    break;
            }
        }
    },

    patchProps: function (node, vdom, props) {
        vdom.update(props, $(node), this.widget);
    },

    patchReorder: function (node, move) {
        var childNodes = Array.prototype.slice.call(node.childNodes, 0);
        var remove = [], insert = [], tmp = [];
        var i, len, item;
        for (i = 0, len = move.length ; i < len ; i++) {
            item = move[i];
            if (item.type === patchType.REMOVE) {
                remove.push({method: 'removeChild', args: [childNodes[item.index]]});
                childNodes.splice(item.index, 1, null);
            }
            else {
                break;
            }
        }
        insert = move.slice(i);
        for (i = 0, len = childNodes.length ; i < len ; i++) {
            item = childNodes[i];
            if (item !== null) {
                tmp.push(item);
            }
        }
        childNodes = tmp;
        for (i = 0, len = insert.length ; i < len ; i++) {
            if (insert[i].type === patchType.INSERT) {
                item = insert[i].node.render(this.widget)[0];
                if (childNodes[insert[i].index]) {
                    insert[i] = {method: 'insertBefore', args: [item, childNodes[insert[i].index]]};
                }
                else {
                    insert[i] = {method: 'appendChild', args: [item]};
                }
            }
            else if (insert[i].type === patchType.REMOVE) {
                insert[i] = {method: 'removeChild', args: [childNodes[insert[i].index]]};
            }
        }
        tmp = remove.concat(insert);
        for (i = 0, len = tmp.length ; i < len ; i++) {
            item = tmp[i];
            node[item.method].apply(node, item.args);
        }
    },

    patchReplace: function (node, vdom) {
        var newNode = vdom.render(this.widget)[0];
        node.parentNode.insertBefore(newNode, node);
        node.parentNode.removeChild(node);
        node.replaceComplete = true;
    }
};

module.exports = patch;
