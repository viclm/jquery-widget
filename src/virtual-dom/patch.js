var patchType = require('./constant/patchType');
var $ = require('jquery');

function patch(node, patches) {
    if (!(this instanceof patch)) {
        return new patch(node, patches);
    }
    this.root = node;
    this.patches = patches;
    this.index = -1;
    this.walk(node[0]);
}

patch.prototype = {
    walk: function (node) {
        var index = ++this.index;
        var patch = this.patches[index];
        if (patch) {
            this.applyPatch(node, patch);
        }
        if (node === this.root[0] || node && node.nodeType === 1 && !$.data(node, 'widget')) {
            var childNodes = node.childNodes;
            for (var i = 0, len = childNodes.length ; i < len ; i++) {
                this.walk(childNodes[i]);
            }
        }
    },

    applyPatch: function (node, patch) {
        var widget = this.root.data('widget-' + this.root.data('widget'));
        $.each(patch, function (i, p) {
            switch (p.type) {
                case patchType.PROPS:
                    p.node.update(p.props, $(node), widget);
                    break;
                case patchType.REORDER:
                    var siblings = node.childNodes;
                    $.each(p.move, function (i, p) {
                        if (p.type === patchType.INSERT) {
                            var originNode = node.childNodes[p.index];
                            if (originNode) {
                                node.insertBefore(p.node.render(widget)[0]);
                            }
                            else {
                                node.appendChild(p.node.render(widget)[0]);
                            }
                        }
                        else if (p.type === patchType.REMOVE) {
                            node.removeChild(siblings[p.index]);
                        }
                    });
                    break;
                case patchType.REPLACE:
                    if (node.nodeType === 3) {
                        node.parentNode.appendChild(p.node.render(widget)[0]);
                    }
                    else {
                        node.replaceWith(p.node.render(widget));
                    }
                    break;
            }
        });
    }
};

module.exports = patch;
