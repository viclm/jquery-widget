var VDOM = require('./vdom');
var inherit = require('../util/inherit');
var $ = require('jquery');

function VText(text) {
    VDOM.call(this);
    this.text = text.toString();
    this.key = this.text;
}

inherit(VText, VDOM);

VText.prototype.render = function () {
    return $(document.createTextNode(this.text));
};

module.exports = VText;
