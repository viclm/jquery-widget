var VDOM = require('./vdom');
var inherit = require('../util/inherit');
var $ = require('jquery');

function VText(text) {
    this.text = text;
}

inherit(VText, VDOM);

VText.prototype.render = function () {
    return $(document.createTextNode(this.text));
};

module.exports = VText;
