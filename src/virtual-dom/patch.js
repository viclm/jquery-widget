var patchType = require('./constant/patchType');
var $ = require('jquery');

function patch(node, patches) {
    if (!(this instanceof patch)) {
        return new patch(node, patches);
    }
    this.root = node;
    this.patches = patches;
    this.index = -1;
    this.walk(node);
}

patch.prototype = {
    walk: function (node) {
        var index = ++this.index;
        var patch = this.patches[index];
        if (patch) {
            this.applyPatch(node, patch);
        }
        if (node[0] === this.root[0] || node[0] && !node.data('widget')) {
            var childNodes = node[0].childNodes;
            for (var i = 0, len = childNodes.length ; i < len ; i++) {
                this.walk($(childNodes[i]));
            }
        }
    },

    applyPatch: function (node, patch) {
        var that = this;
        $.each(patch, function (i, p) {
            switch (p.type) {
                case patchType.PROPS:
                    p.node.update(p.props, node);
                    break;
                case patchType.REORDER:
                    var siblings = node.children();
                    var widget = that.root.data('widget-' + that.root.data('widget'));
                    $.each(p.move, function (i, p) {
                        if (p.type === patchType.INSERT) {
                            var originNode = node.children().eq(p.index);
                            if (originNode[0]) {
                                originNode.before(p.node.render(widget));
                            }
                            else {
                                node.append(p.node.render(widget));
                            }
                        }
                        else if (p.type === patchType.REMOVE) {
                            siblings.eq(p.index).remove();
                        }
                    });
                    break;
                case patchType.REPLACE:
                    node.replaceWith(p.node.render());
                    break;
            }
        });
    }
};

module.exports = patch;
