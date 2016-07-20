var diff = require('../../../src/virtual-dom/diff');
var VText = require('../../../src/virtual-dom/vtext');
var VNode = require('../../../src/virtual-dom/vnode');
var VWidget = require('../../../src/virtual-dom/vwidget');
var patchType = require('../../../src/virtual-dom/constant/patchType');
var createWidget = require('../../../src/widget/factory');

describe('diff', function () {

    it('vtext vs vtext, same', function () {
        var oldTree = new VText('foo');
        var newTree = new VText('foo');
        var diffs = diff(oldTree, newTree).patches;

        expect(diffs[0]).toBeUndefined();
    });

    it('vtext vs vtext, different', function () {
        var oldTree = new VText('foo');
        var newTree = new VText('bar');
        var diffs = diff(oldTree, newTree).patches;

        expect(diffs[0]).toEqual([{type: patchType.REPLACE, node: newTree}]);
    });

    it('vnode transform string child to vtext automatically', function () {
        var vnode = new VNode('div', null, ['foo']);

        expect(vnode.children[0]).toEqual(jasmine.any(VText));
    });

    it('vnode vs vnode, same', function () {
        var oldTree = new VNode('div', {classname: 'foo'}, [new VText('bar')]);
        var newTree = new VNode('div', {classname: 'foo'}, [new VText('bar')]);
        var diffs = diff(oldTree, newTree).patches;

        expect(diffs[0]).toBeUndefined();
    });

    it('vnode vs vnode, different with tagName', function () {
        var oldTree = new VNode('div', {classname: 'foo'}, [new VText('bar')]);
        var newTree = new VNode('span', {classname: 'foo'}, [new VText('bar')]);
        var diffs = diff(oldTree, newTree).patches;

        expect(diffs[0]).toEqual([{type: patchType.REPLACE, node: newTree}]);
    });

    it('vnode vs vnode, different with props', function () {
        var oldTree, newTree, diffs;

        oldTree = new VNode('div');
        newTree = new VNode('div', {classname: 'bar'});
        diffs = diff(oldTree, newTree).patches;

        expect(diffs[0]).toEqual([{type: patchType.PROPS, node: newTree, props: {classname: 'bar'}}]);

        oldTree = new VNode('div', {classname: 'bar'});
        newTree = new VNode('div');
        diffs = diff(oldTree, newTree).patches;

        expect(diffs[0]).toEqual([{type: patchType.PROPS, node: newTree, props: {classname: null}}]);

        oldTree = new VNode('div', {classname: 'bar'});
        newTree = new VNode('div', {classname: 'foo'});
        diffs = diff(oldTree, newTree).patches;

        expect(diffs[0]).toEqual([{type: patchType.PROPS, node: newTree, props: {classname: 'foo'}}]);

        oldTree = new VNode('div', {classname: 'bar'});
        newTree = new VNode('div', {classname: 'foo', id: 'qux'});
        diffs = diff(oldTree, newTree).patches;

        expect(diffs[0]).toEqual([{type: patchType.PROPS, node: newTree, props: {classname: 'foo', id: 'qux'}}]);
    });

    it('vnode vs vnode, different with children', function () {
        var oldTree, newTree, diffs;

        oldTree = new VNode('div');
        newTree = new VNode('div', null, ['foo']);
        diffs = diff(oldTree, newTree).patches;

        expect(diffs[0]).toEqual([{type: patchType.REORDER, move: [{type: patchType.INSERT, node: jasmine.any(VText), index: 0}]}]);

        oldTree = new VNode('div', null, ['foo']);
        newTree = new VNode('div');
        diffs = diff(oldTree, newTree).patches;

        expect(diffs[0]).toEqual([{type: patchType.REORDER, move: [{type: patchType.REMOVE, index: 0}]}]);

        oldTree = new VNode('div', null, ['foo']);
        newTree = new VNode('div', null, ['bar']);
        diffs = diff(oldTree, newTree).patches;

        expect(diffs[1][0].type).toBe(patchType.REPLACE);
        expect(diffs[1][0].node.text).toBe('bar');

        oldTree = new VNode('div', null, ['foo']);
        newTree = new VNode('div', null, ['foo', 'bar']);
        diffs = diff(oldTree, newTree).patches;

        expect(diffs[0][0].move.length).toBe(1);
        expect(diffs[0][0].move[0].type).toBe(patchType.INSERT);
        expect(diffs[0][0].move[0].node.text).toBe('bar');

        oldTree = new VNode('div', null, [new VNode('span', null, ['foo']), 'qux']);
        newTree = new VNode('div', null, [new VNode('span', null, ['foo', new VNode('i', null, ['bar'])]), 'quxx']);
        diffs = diff(oldTree, newTree).patches;

        expect(diffs[1]).toEqual([{type: patchType.REORDER, move: [{type: patchType.INSERT, node: jasmine.any(VNode), index: 1}]}]);
        expect(diffs[5]).toEqual([{type: patchType.REPLACE, node: jasmine.any(VText)}]);

        oldTree = new VNode('div', null, [new VNode('span', {'data-id': 'foo'}), new VNode('span', {'data-id': 'bar'})]);
        newTree = new VNode('div', null, [new VNode('span', {'data-id': 'bar'}), new VNode('span', {'data-id': 'foo'})]);
        diffs = diff(oldTree, newTree).patches;

        expect(diffs[0][0].move.length).toBe(2);
        expect(diffs[0][0].move[0].type).toBe(patchType.INSERT);
        expect(diffs[0][0].move[1].type).toBe(patchType.REMOVE);
    });

    it('vwidget vs vwidget, same', function () {
        var widget = createWidget({});
        var oldTree = new VWidget(widget, {foo: 'foo'});
        var newTree = new VWidget(widget, {foo: 'foo'});
        diffs = diff(oldTree, newTree).patches;

        expect(diffs[0]).toBeUndefined();
    });

    it('vwidget vs vwidget, different with widget', function () {
        var widget1 = createWidget({});
        var widget2 = createWidget({});
        var oldTree = new VWidget(widget1);
        var newTree = new VWidget(widget2);
        diffs = diff(oldTree, newTree).patches;

        expect(diffs[0]).toEqual([{type: patchType.REPLACE, node: newTree}]);
    });

    it('vwidget vs vwidget, different with props', function () {
        var widget = createWidget({});
        var oldTree = new VWidget(widget, {foo: 'foo'});
        var newTree = new VWidget(widget, {bar: 'bar'});
        diffs = diff(oldTree, newTree).patches;

        expect(diffs[0]).toEqual([{type: patchType.PROPS, node: newTree, props: {foo: null, bar: 'bar'}}]);
    });

    it('vtext vs vnode vs vwidget', function () {
        var vtext = new VText('foo');
        var vnode = new VNode('div');
        var vwidget = new VWidget(createWidget({}));

        var diffsTN = diff(vtext, vnode).patches;
        var diffsTW = diff(vtext, vwidget).patches;
        var diffsNW = diff(vnode, vwidget).patches;

        expect(diffsTN[0]).toEqual([{type: patchType.REPLACE, node: vnode}]);
        expect(diffsTW[0]).toEqual([{type: patchType.REPLACE, node: vwidget}]);
        expect(diffsNW[0]).toEqual([{type: patchType.REPLACE, node: vwidget}]);
    });


});
