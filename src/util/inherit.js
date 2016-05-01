module.exports = function (child, parent) {
    function proxy() {}
    proxy.prototype = parent.prototype;
    child.prototype = new proxy();
    child.prototype.constructor = child;
};
