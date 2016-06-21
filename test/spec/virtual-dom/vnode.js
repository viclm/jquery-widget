var $ = require('jquery');
var createWidget = require('../../../src/widget/factory');
var VNode = require('../../../src/virtual-dom/vnode');
var VText = require('../../../src/virtual-dom/vtext');

describe('vnode', function () {

    it('string child should be vtext', function () {
        var instance = new VNode('div', {}, ['foo', new VNode('span')]);
        expect(instance.children).toEqual([jasmine.any(VText), jasmine.any(VNode)]);
    });

    it('render - with props', function () {
        var widget = createWidget('testWidget', {})();
        var instance = new VNode('div', {id: 'foo', htmlfor: 'bar', classname: 'baz', qux: 'quux', obj: {}}, null, widget);
        var element = instance.render();
        expect(element).toEqual(jasmine.any($));
        expect(element[0].tagName).toBe('DIV');
        expect(element[0].attributes.length).toBe(5);

        expect(element.attr('id')).toBe('foo');
        expect(element.attr('for')).toBe('bar');
        expect(element.attr('class')).toBe('baz');
        expect(element.attr('qux')).toBe('quux');
        expect(element.attr('obj')).toBe('[object Object]');
    });

    it('render - with events', function () {
        var spyClick1 = jasmine.createSpy('click1');
        var spyClick2 = jasmine.createSpy('click2');

        var widget = createWidget('testWidget', {
            onClick: spyClick1
        })();

        var instance = new VNode('div', {id: 'foo', onclick: spyClick2, onClick: 'onClick'}, null, widget);
        var element = instance.render();

        expect(element.attr('id')).toBe('foo');
        expect(spyClick1).not.toHaveBeenCalled();
        expect(spyClick2).not.toHaveBeenCalled();
        element.trigger('click');
        element.trigger('Click');
        expect(spyClick1).toHaveBeenCalledTimes(1);
        expect(spyClick2).toHaveBeenCalledTimes(1);
        expect(spyClick1.calls.mostRecent().object).toBe(widget);
        expect(spyClick2.calls.mostRecent().object).toBe(widget);
    });

    it('render - with children', function () {
        var widget = createWidget('testWidget', {})();
        var instance = new VNode('div', null, ['foo', new VNode('span', null, null, widget)], widget);
        var element = instance.render();
        expect(element.children().length).toBe(1);
        expect(element[0].childNodes.length).toBe(2);
        expect(element[0].firstChild.nodeValue).toBe('foo');
        expect(element.find('span').length).toBe(1);
    });

    it('update', function () {
        var spyClick = jasmine.createSpy('click');
        var spySave = jasmine.createSpy('save');
        var widget = createWidget('testWidget', {})();
        var oldTree = new VNode('div', {id: 'foo', onclick: spyClick}, null, widget);
        var newTree = new VNode('div', {classname: 'bar', onsave: spySave}, null, widget);
        var diffProps = {id: null, classname: 'bar', onsave: spySave, onclick: null};

        var element = oldTree.render();
        newTree.update(diffProps, element);

        element.trigger('click');
        element.trigger('save');
        expect(element.attr('id')).toBeUndefined();
        expect(element.attr('class')).toBe('bar');
        expect(spyClick).not.toHaveBeenCalled();
        expect(spySave).toHaveBeenCalled();
        expect(spySave.calls.mostRecent().object).toBe(widget);
    });

});
