var diff = require('../../../src/virtual-dom/diff');
var patch = require('../../../src/virtual-dom/patch');
var VText = require('../../../src/virtual-dom/vtext');
var VNode = require('../../../src/virtual-dom/vnode');
var VWidget = require('../../../src/virtual-dom/vwidget');
var patchType = require('../../../src/virtual-dom/constant/patchType');
var Widget = require('../../../src/widget/base');

describe('patch', function () {

    it('patch props', function () {
        var widget = new Widget;
        var oldTree = new VNode('div', {classname: 'foo', id: 'qux'}, null, widget);
        var element = oldTree.render();

        expect(element.attr('class')).toBe('foo');
        expect(element.attr('id')).toBe('qux');

        var newTree = new VNode('div', {classname: 'bar'}, null, widget);
        var diffs = diff(oldTree, newTree).patches;
        patch(element, diffs);

        expect(element.attr('class')).toBe('bar');
        expect(element.attr('id')).toBeUndefined();
    });

    it('patch events', function () {
        var spy1 = jasmine.createSpy('1');
        var spy2 = jasmine.createSpy('2');
        var spy3 = jasmine.createSpy('3');
        var handlers = {
            h1: function () { spy1(); },
            h2: function () { spy2(); },
            h3: function () { spy3(); }
        };
        var widget = new Widget;
        var oldTree = new VNode('div', {onclick: handlers.h1, onkeyup: handlers.h2}, null, widget);
        var element = oldTree.render();

        element.trigger('click');
        element.trigger('keyup');

        expect(spy1).toHaveBeenCalledTimes(1);
        expect(spy2).toHaveBeenCalledTimes(1);
        expect(spy3).not.toHaveBeenCalled();

        var newTree = new VNode('div', {onclick: handlers.h3}, null, widget);
        var diffs = diff(oldTree, newTree).patches;
        patch(element, diffs);

        element.trigger('click');
        element.trigger('keyup');

        expect(spy1).toHaveBeenCalledTimes(1);
        expect(spy2).toHaveBeenCalledTimes(1);
        expect(spy3).toHaveBeenCalledTimes(1);
    });

    it('patch replace', function () {
        var widget = new Widget;
        var oldTree = new VNode('div', null, ['foo'], widget);
        var element = oldTree.render();

        expect(element.text()).toBe('foo');

        var newTree = new VNode('div', null, ['bar'], widget);
        var diffs = diff(oldTree, newTree).patches;
        patch(element, diffs);

        expect(element.text()).toBe('bar');
    });

    it('patch reorder', function () {
        var widget = new Widget;
        var oldTree = new VNode('div', null, [new VNode('span', {id: 'foo'}, null, widget), new VNode('span', {id: 'bar'}, null, widget)], widget);
        var element = oldTree.render();

        expect(element.children().length).toBe(2);
        expect(element.children().eq(0).attr('id')).toBe('foo');
        expect(element.children().eq(1).attr('id')).toBe('bar');

        var newTree = new VNode('div', null, [new VNode('span', {id: 'bar'}, null, widget), new VNode('span', {id: 'foo'}, null, widget)], widget);
        var diffs = diff(oldTree, newTree).patches;
        patch(element, diffs);

        expect(element.children().length).toBe(2);
        expect(element.children().eq(0).attr('id')).toBe('bar');
        expect(element.children().eq(1).attr('id')).toBe('foo');
    });

    it('patch text node', function () {
        var widget = new Widget;
        var oldTree = new VNode('div', null, [new VNode('span', null, ['foo'], widget), 'qux'], widget);
        var element = oldTree.render();

        expect(element.find('span').html()).toBe('foo');
        expect(element[0].lastChild.nodeValue).toBe('qux');

        var newTree = new VNode('div', null, [new VNode('span', null, ['foo', 'bar'], widget), 'quxx'], widget);
        var diffs = diff(oldTree, newTree).patches;
        patch(element, diffs);

        expect(element.find('span').html()).toBe('foobar');
        expect(element[0].lastChild.nodeValue).toBe('quxx');

    });

});
