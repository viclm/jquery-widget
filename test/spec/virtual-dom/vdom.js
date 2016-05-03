var VDOM = require('../../../src/virtual-dom/vdom');
var createWidget = require('../../../src/widget/factory');
var $ = require('jquery');

describe('vdom', function () {

    it('initialization', function () {
        var instance = new VDOM();
        expect(instance.props).toEqual({});
        expect(instance.children).toEqual([]);
        expect(instance.attributes).toEqual({});
        expect(instance.events).toEqual({});
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
        instance.parse();
        expect(instance.attributes).toEqual({
            'class': 'foo',
            'for': 'bar',
            id: 'barz',
            qux: 'quux'
        });
        expect(instance.events).toEqual({
            click: 'onClick',
            save: jasmine.any(Function)
        });
    });

    describe('addEvent', function () {

        beforeEach(function () {
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
        });

        it('no parse', function () {
            this.instance.addEvent(this.element, this.widget);
            this.element.trigger('click');
            this.element.trigger('save');
            expect(this.spyClick).not.toHaveBeenCalled();
            expect(this.spySave).not.toHaveBeenCalled();
        });

        it('not widget', function () {
            this.instance.parse();
            this.instance.addEvent(this.element);
            this.element.trigger('click');
            this.element.trigger('save');
            expect(this.spyClick).not.toHaveBeenCalled();
            expect(this.spySave).toHaveBeenCalled();
            expect(this.spySave.calls.mostRecent().object).toBe(this.element[0]);
        });

        it('with widget', function () {
            this.instance.parse();
            this.instance.addEvent(this.element, this.widget);
            this.element.trigger('click');
            this.element.trigger('save');
            expect(this.spyClick).toHaveBeenCalled();
            expect(this.spySave).toHaveBeenCalled();
            expect(this.spyClick.calls.mostRecent().object).toBe(this.widget);
            expect(this.spySave.calls.mostRecent().object).toBe(this.widget);
            expect(this.spyClick).toHaveBeenCalledTimes(1);
            expect(this.spySave).toHaveBeenCalledTimes(1);
        });

    });
});
