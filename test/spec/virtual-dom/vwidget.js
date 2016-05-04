var VWidget = require('../../../src/virtual-dom/vwidget');
var createWidget = require('../../../src/widget/factory');

describe('vwidget', function () {

    it('render', function () {
        var parentWidget = createWidget('parentWidget', {})();
        var instance = new VWidget(createWidget('testWidget', {}), {foo: 'foo'});
        var element = instance.render(parentWidget);

        expect(parentWidget.option('foo')).toBeNull();
        expect(element.data('widget')).toBe('testWidget');
        expect(element.data('widget-testWidget').widgetName).toBe('testWidget');
        expect(element.data('widget-testWidget').option('foo')).toBe('foo');
    });

    it('render - with events', function () {
        var spyClick = jasmine.createSpy('click');
        var parentWidget = createWidget('parentWidget', {})();
        var instance = new VWidget(createWidget('testWidget', {}), {foo: 'foo', onclick: spyClick});
        var element = instance.render(parentWidget);

        element.data('widget-testWidget')._trigger('click');
        expect(parentWidget.option('onclick')).toBeNull();
        expect(element.data('widget-testWidget').option('onclick')).toBe(spyClick);
        expect(spyClick).toHaveBeenCalledTimes(1);
        expect(spyClick.calls.mostRecent().object).toBe(parentWidget);
    });

});
