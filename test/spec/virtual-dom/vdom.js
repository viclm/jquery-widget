var VDOM = require('../../../src/virtual-dom/vdom');
var createWidget = require('../../../src/widget/factory');
var $ = require('jquery');

describe('vdom', function () {

    it('initialization', function () {
        var instance = new VDOM();
        expect(instance.props).toEqual({});
        expect(instance.children).toEqual([]);
    });

    it('parse', function () {
        var instance = new VDOM({
            classname: 'foo',
            htmlfor: 'bar',
            id: 'barz',
            qux: 'quux',
            onclick: 'onClick',
            onsave: function () {}
        });
        var result = instance.parse();
        expect(result.attributes).toEqual({
            'class': 'foo',
            'for': 'bar',
            id: 'barz',
            qux: 'quux'
        });
        expect(result.events).toEqual({
            click: 'onClick',
            save: jasmine.any(Function)
        });
    });

    it('with widget', function () {
        this.spyClick = jasmine.createSpy('click');
        this.spySave = jasmine.createSpy('save');

        this.instance = new VDOM({
            classname: 'foo',
            htmlfor: 'bar',
            id: 'barz',
            qux: 'quux',
            onclick: 'onClick',
            onsave: this.spySave
        });

        this.element = $('<div>');
        this.widget = createWidget('testWidget', {
            'onClick': this.spyClick
        })();

        var result = this.instance.parse();
        this.instance.addEvent(result.events, this.element, this.widget);
        this.element.trigger('click');
        this.element.trigger('save');
        expect(this.spyClick).toHaveBeenCalled();
        expect(this.spySave).toHaveBeenCalled();
        expect(this.spyClick.calls.mostRecent().object).toBe(this.widget);
        expect(this.spySave.calls.mostRecent().object).toBe(this.widget);
    });

});
