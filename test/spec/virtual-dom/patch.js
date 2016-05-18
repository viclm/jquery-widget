var diff = require('../../../src/virtual-dom/diff');
var patch = require('../../../src/virtual-dom/patch');
var VText = require('../../../src/virtual-dom/vtext');
var VNode = require('../../../src/virtual-dom/vnode');
var VWidget = require('../../../src/virtual-dom/vwidget');
var patchType = require('../../../src/virtual-dom/constant/patchType');
var createWidget = require('../../../src/widget/factory');

describe('patch', function () {

    it('patch props', function () {
        var oldTree = new VNode('div', {classname: 'foo', id: 'qux'});
        var newTree = new VNode('div', {classname: 'bar'});
        var diffs = diff(oldTree, newTree).patches;
        var widget = new (createWidget({
            render: function () {
                return oldTree;
            }
        }));
        var element = widget.element;

        expect(element.attr('class')).toBe('foo');
        expect(element.attr('id')).toBe('qux');

        patch(element, diffs);

        expect(element.attr('class')).toBe('bar');
        expect(element.attr('id')).toBeUndefined();
    });

    it('patch replace', function () {
        var oldTree = new VNode('div', null, ['foo']);
        var newTree = new VNode('div', null, ['bar']);
        var diffs = diff(oldTree, newTree).patches;
        var widget = new (createWidget({
            render: function () {
                return oldTree;
            }
        }));
        var element = widget.element;

        expect(element.text()).toBe('foo');

        patch(element, diffs);

        expect(element.text()).toBe('bar');
    });

    it('patch reorder', function () {
        var oldTree = new VNode('div', null, [new VNode('span', {id: 'foo'}), new VNode('span', {id: 'bar'})]);
        var newTree = new VNode('div', null, [new VNode('span', {id: 'bar'}), new VNode('span', {id: 'qux'})]);
        var diffs = diff(oldTree, newTree).patches;
        var widget = new (createWidget({
            render: function () {
                return oldTree;
            }
        }));
        var element = widget.element;
        var bar = element.children().eq(1)[0];

        expect(element.children().length).toBe(2);
        expect(element.children().eq(0).attr('id')).toBe('foo');
        expect(element.children().eq(1).attr('id')).toBe('bar');

        patch(element, diffs);

        expect(element.children().length).toBe(2);
        expect(element.children().eq(0).attr('id')).toBe('bar');
        expect(element.children().eq(1).attr('id')).toBe('qux');

        expect(element.children().eq(0)[0]).toBe(bar);
    });

});
