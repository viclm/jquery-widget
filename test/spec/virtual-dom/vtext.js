var VText = require('../../../src/virtual-dom/vtext');

describe('vtext', function () {

    it('render', function () {
        var instance = new VText('foo');
        var element = instance.render();
        expect(element[0].nodeType).toBe(3);
        expect(element.text()).toBe('foo');
    });

});
