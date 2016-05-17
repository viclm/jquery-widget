import $ from 'jquery';
import Widget from '../../../src/widget/base';

describe('Widget class', function () {

    var proto = Widget.prototype;

    beforeEach(function () {
        class TestWidget extends Widget {}
        this.TestWidget = TestWidget;
    });

    it( 'widget name', function () {
        var instance = new this.TestWidget();
        expect(instance.widgetName).toBe('TestWidget');
    });

    it( '._getCreateOptions()', function() {
        this.TestWidget.prototype.options = {
            option1: 'valuex',
            option2: 'valuex',
            option3: 'value3'
        };
        this.TestWidget.prototype._getCreateOptions = function() {
            return {
                option1: 'override1',
                option2: 'overideX'
            };
        };
        var instance = new this.TestWidget( { option2: 'value2' } );
        expect(instance.option()).toEqual({
            option1: 'override1',
            option2: 'value2',
            option3: 'value3'
        });
    } );

    it( '._getCreateEventData()', function() {
        var data = { foo: 'bar' };
        this.TestWidget.prototype._getCreateEventData = function() {
            return data;
        };
        var instance = new this.TestWidget();
        var instance = new this.TestWidget( {
            create: function( event, ui ) {
                expect(ui).toBe(data);
            }
        } );
    } );

    it ( 'element normalization', function() {
        this.TestWidget.prototype._create = function() {
            expect(this.element.is( 'div' )).toBeTruthy();
            expect(this.element.data('widget')).toBe('TestWidget');
            expect(this.element.data('widget-TestWidget')).toBe(this);
        };
        new this.TestWidget();

        this.TestWidget.prototype.defaultElement = '<span data-test="pass"></span>';
        this.TestWidget.prototype._create = function() {
            expect(this.element.is( 'span[data-test=pass]' )).toBeTruthy();
        };
        new this.TestWidget();

        this.TestWidget.prototype._create = function() {
            expect(this.element.is( 'span[data-test=render]' )).toBeTruthy();
        };
        this.TestWidget.prototype.render = function () {
            return this.createWidget('span', {'data-test': 'render'});
        };
        new this.TestWidget();
    } );

    it('getter', function() {
        var instance = new this.TestWidget({
            foo: 'bar',
            baz: 5,
            qux: ['quux', 'quuux']
        });

        expect(instance.option('x')).toBeNull();
        expect(instance.option('foo')).toBe('bar');
        expect(instance.option('baz')).toBe(5);
        expect(instance.option('qux')).toEqual(['quux', 'quuux']);

        var options = instance.option();
        expect(options).toEqual({
            baz: 5,
            classes: {},
            create: null,
            disabled: false,
            foo: 'bar',
            qux: ['quux', 'quuux']
        });
        options.foo = 'notbar';
        expect(instance.option('foo')).not.toBe('notbar');
    });

    it('deep option getter', function() {
        var instance = new this.TestWidget({
            foo: {
                bar: 'baz',
                qux: {
                    quux: 'xyzzy'
                }
            }
        });

        expect(instance.option('foo.bar')).toBe('baz');
        expect(instance.option('foo.qux')).toEqual({ quux: 'xyzzy' });
        expect(instance.option('foo.qux.quux')).toBe('xyzzy');
        expect(instance.option('x.y')).toBeNull();
        expect(instance.option('foo.x.y')).toBeNull();
    });

    it('delegate to ._setOptions()', function() {
        var instance = new this.TestWidget();

        spyOn(proto, '_setOptions');

        expect(proto._setOptions.calls.count()).toBe(0);

        instance.option('foo', 'bar');
        expect(proto._setOptions.calls.count()).toBe(1);
        expect(proto._setOptions).toHaveBeenCalledWith({ foo: 'bar' });

        instance.option({
            bar: 'qux',
            quux: 'quuux'
        });
        expect(proto._setOptions.calls.count()).toBe(2);
        expect(proto._setOptions).toHaveBeenCalledWith({ bar: 'qux', quux: 'quuux' });
    });

    it('delegate to ._setOption()', function() {
        var instance = new this.TestWidget();

        spyOn(proto, '_setOption');

        expect(proto._setOption.calls.count()).toBe(0);

        instance.option('foo', 'bar');
        expect(proto._setOption.calls.count()).toBe(1);
        expect(proto._setOption).toHaveBeenCalledWith('foo', 'bar');

        instance.option('foo', undefined);
        expect(proto._setOption.calls.count()).toBe(2);
        expect(proto._setOption).toHaveBeenCalledWith('foo', undefined);

        instance.option({
            bar: 'qux',
            quux: 'quuux'
        });
        expect(proto._setOption.calls.count()).toBe(4);
        expect(proto._setOption).toHaveBeenCalledWith('bar', 'qux');
        expect(proto._setOption).toHaveBeenCalledWith('quux', 'quuux');
    });

    it('deep option setter', function() {
        var instance = new this.TestWidget();
        spyOn(proto, '_setOption');
        function deepOption(from, to, fn) {
            instance.options.foo = from;
            fn();
            expect(proto._setOption.calls.mostRecent().args).toEqual(['foo', to]);
        }

        deepOption({ bar: 'baz' }, { bar: 'qux' }, function () {
            instance.option('foo.bar', 'qux');
        });

        deepOption({ bar: 'baz' }, { bar: undefined }, function () {
            instance.option('foo.bar', undefined);
        });

        deepOption(null, { bar: 'baz' }, function () {
            instance.option('foo.bar', 'baz');
        });

        deepOption({ bar: 'baz', qux: { quux: 'quuux' } }, { bar: 'baz', qux: { quux: 'quuux', newOpt: 'newVal' } }, function () {
            instance.option('foo.qux.newOpt', 'newVal');
        });
    });

    it('.enable()', function() {
        var instance = new this.TestWidget();
        spyOn(proto, '_setOption');
        instance.enable();
        expect(proto._setOption).toHaveBeenCalledWith('disabled', false);
    });

    it('.disable()', function() {
        var instance = new this.TestWidget();
        spyOn(proto, '_setOption');
        instance.disable();
        expect(proto._setOption).toHaveBeenCalledWith('disabled', true);
    });

    it('._setOptionDisabled()', function() {
        var instance;
        spyOn(proto, '_setOptionDisabled');

        instance = new this.TestWidget();
        expect(proto._setOptionDisabled).not.toHaveBeenCalled();

        instance = new this.TestWidget({ disabled: true });
        expect(proto._setOptionDisabled).toHaveBeenCalledWith(true);

        instance.enable();
        expect(proto._setOptionDisabled).toHaveBeenCalledWith(false);

        instance.option('disabled', true);
        expect(proto._setOptionDisabled).toHaveBeenCalledWith(true);
    });

    it( '._on() to element (default)', function() {
        $.extend(this.TestWidget.prototype, {
            _create: function() {
                this._on({
                    keyup: this.keyup,
                    keydown: 'keydown'
                });
            },
            keyup: function(e) {
                event = {
                    type: e.type,
                    currentTarget: e.currentTarget,
                    context: this
                };
            },
            keydown: function(e) {
                event = {
                    type: e.type,
                    currentTarget: e.currentTarget,
                    context: this
                };
            }
        });

        var eventExpector = function (type, testNull) {
            event = null;
            element.trigger(type);
            if (testNull) {
                expect(event).toBeNull();
            }
            else {
                expect(event.type).toBe(type);
                expect(event.currentTarget).toBe(element[0]);
                expect(event.context).toBe(instance);
            }
        };

        var instance = new this.TestWidget();
        var element = instance.element, event;

        eventExpector('keyup');
        eventExpector('keydown');

        instance.disable();
        eventExpector('keyup', true);
        eventExpector('keydown', true);

        instance.enable();
        eventExpector('keyup');
        eventExpector('keydown');

        instance.destroy();
        eventExpector('keyup', true);
        eventExpector('keydown', true);
    });

    it('._on() to element with suppressDisabledCheck', function() {
        $.extend(this.TestWidget.prototype, {
            _create: function() {
                this._on(true, {
                    keyup: this.keyup,
                    keydown: 'keydown'
                });
            },
            keyup: function(e) {
                event = {
                    type: e.type,
                    currentTarget: e.currentTarget,
                    context: this
                };
            },
            keydown: function(e) {
                event = {
                    type: e.type,
                    currentTarget: e.currentTarget,
                    context: this
                };
            }
        });
        var eventExpector = function (type, testNull) {
            event = null;
            element.trigger(type);
            if (testNull) {
                expect(event).toBeNull();
            }
            else {
                expect(event.type).toBe(type);
                expect(event.currentTarget).toBe(element[0]);
                expect(event.context).toBe(instance);
            }
        };

        var instance = new this.TestWidget();
        var element = instance.element, event;

        eventExpector('keyup');
        eventExpector('keydown');

        instance.disable();
        eventExpector('keyup');
        eventExpector('keydown');

        instance.enable();
        eventExpector('keyup');
        eventExpector('keydown');

        instance.destroy();
        eventExpector('keyup', true);
        eventExpector('keydown', true);
    });

    it('._on() to descendent', function() {
        $.extend(this.TestWidget.prototype, {
            _create: function() {
                this._on(this.element.find('strong'), {
                    keyup: this.keyup,
                    keydown: 'keydown'
                });
            },
            keyup: function(e) {
                event = {
                    type: e.type,
                    currentTarget: e.currentTarget,
                    context: this
                };
            },
            keydown: function(e) {
                event = {
                    type: e.type,
                    currentTarget: e.currentTarget,
                    context: this
                };
            },
            render: function() {
                return this.createWidget('div', null,
                    this.createWidget('p', null,
                        this.createWidget('strong', null, 'hello'), ' world'));
            }
        });

        var eventExpector = function (element, type, testNull) {
            event = null;
            element.trigger(type);
            if (testNull) {
                expect(event).toBeNull();
            }
            else {
                expect(event.type).toBe(type);
                expect(event.currentTarget).toBe(descendant[0]);
                expect(event.context).toBe(instance);
            }
        };

        var instance = new this.TestWidget();
        var element = instance.element;
        var descendant = element.find('strong');
        var event;

        // Trigger events on both widget and descendent to ensure that only descendent receives them
        eventExpector(element, 'keyup', true);
        eventExpector(element, 'keyup', true);

        eventExpector(descendant, 'keyup');
        eventExpector(descendant, 'keyup');

        instance.disable();

        eventExpector(element, 'keyup', true);
        eventExpector(element, 'keyup', true);

        eventExpector(descendant, 'keyup', true);
        eventExpector(descendant, 'keyup', true);

        instance.enable();

        eventExpector(element, 'keyup', true);
        eventExpector(element, 'keyup', true);

        eventExpector(descendant, 'keyup');
        eventExpector(descendant, 'keyup');

        instance.destroy();

        eventExpector(element, 'keyup', true);
        eventExpector(element, 'keyup', true);

        eventExpector(descendant, 'keyup', true);
        eventExpector(descendant, 'keyup', true);

    });

    it('_on() with delegate', function() {
        $.extend(this.TestWidget.prototype, {
            _create: function() {
                var uuid = this.uuid;
                this.element = {
                    on: function(event, handler) {},
                    trigger: $.noop
                };
                this.widgetElement = {
                    on: function(event, selector, handler) {}
                };
                this.widget = function() {
                    return this.widgetElement;
                };
                spyOn(this.element, 'on');
                spyOn(this.widgetElement, 'on');
                this._on({
                    'click': 'handler',
                    'click a': 'handler'
                });
                expect(this.element.on.calls.count()).toBe(1);
                expect(this.element.on).toHaveBeenCalledWith('click.TestWidget' + uuid, jasmine.any(Function));
                expect(this.widgetElement.on.calls.count()).toBe(1);
                expect(this.widgetElement.on).toHaveBeenCalledWith('click.TestWidget' + uuid, 'a', jasmine.any(Function));

                this._on({
                    'change form fieldset > input': 'handler'
                });
                expect(this.element.on.calls.count()).toBe(1);
                expect(this.widgetElement.on.calls.count()).toBe(2);
                expect(this.widgetElement.on).toHaveBeenCalledWith('change.TestWidget' + uuid, 'form fieldset > input', jasmine.any(Function));                   
            }
        });
        new this.TestWidget();
    });

    it('_on() with delegate to descendent', function() {
        $.extend(this.TestWidget.prototype, {
            _create: function() {
                this.target = $('<p><strong>hello</strong> world</p>');
                this.child = this.target.children();
                this._on(this.target, {
                    'keyup': 'handlerDirect',
                    'keyup strong': 'handlerDelegated'
                });
                this.child.trigger('keyup');
            },
            handlerDirect: function(event) {
                expect(event.currentTarget).toBe(this.target[0]);
                expect(event.target).toBe(this.child[0]);
            },
            handlerDelegated: function(event) {
                expect(event.currentTarget).toBe(this.child[0]);
                expect(event.target).toBe(this.child[0]);
            }
        });
        new this.TestWidget();
    });

    it( '_on() to common element', function() {
        $.extend(this.TestWidget.prototype, {
            _create: function() {
                this._on(this.document, {
                    'customevent': '_handler',
                    'with:colons': '_colonHandler',
                    'with-dashes': '_dashHandler',
                    'with-dashes:and-colons': '_commbinedHandler'
                });
            },
            _handler: function() {},
            _colonHandler: function() {},
            _dashHandler: function() {},
            _commbinedHandler: function() {}
        });
        var instance = new this.TestWidget();
        spyOn(instance, '_handler');
        spyOn(instance, '_colonHandler');
        spyOn(instance, '_dashHandler');
        spyOn(instance, '_commbinedHandler');

        $(document).trigger('customevent');
        $(document).trigger('with:colons');
        $(document).trigger('with-dashes');
        $(document).trigger('with-dashes:and-colons');

        expect(instance._handler).toHaveBeenCalled();
        expect(instance._colonHandler).toHaveBeenCalled();
        expect(instance._dashHandler).toHaveBeenCalled();
        expect(instance._commbinedHandler).toHaveBeenCalled();

        instance.destroy();
        $(document).trigger('customevent');
        $(document).trigger('with:colons');
        $(document).trigger('with-dashes');
        $(document).trigger('with-dashes:and-colons');

        expect(instance._handler.calls.count()).toBe(1);
        expect(instance._colonHandler.calls.count()).toBe(1);
        expect(instance._dashHandler.calls.count()).toBe(1);
        expect(instance._commbinedHandler.calls.count()).toBe(1);
    });

    it( '_off() - single event', function() {
        var instance = new this.TestWidget();
        var element = $('<div>');
        var spyFooWidget = jasmine.createSpy('fooWidget');
        var spyFooElement = jasmine.createSpy('fooElement');
        instance._on( element, {
            foo: spyFooWidget
        } );
        element.on( 'foo', spyFooElement );

        element.trigger( 'foo' );
        expect(spyFooWidget).toHaveBeenCalled();
        expect(spyFooElement).toHaveBeenCalled();
        instance._off( element, 'foo' );
        element.trigger( 'foo' );
        expect(spyFooWidget.calls.count()).toBe(1);
        expect(spyFooElement.calls.count()).toBe(2);
    } );

    it('_off() - multiple events', function() {
        var instance = new this.TestWidget();
        var element = $('<div>');
        var spyFooWidget = jasmine.createSpy('fooWidget');
        var spyBarWidget = jasmine.createSpy('barWidget');
        var spyFooBarElement = jasmine.createSpy('foobarElement');
        instance._on(element, {
            foo: spyFooWidget,
            bar: spyBarWidget
        });
        element.on('foo bar', spyFooBarElement);
        element.trigger('foo');
        element.trigger('bar');
        expect(spyFooWidget.calls.count()).toBe(1);
        expect(spyBarWidget.calls.count()).toBe(1);
        expect(spyFooBarElement.calls.count()).toBe(2);
        instance._off(element, 'foo bar');
        element.trigger('foo');
        element.trigger('bar');
        expect(spyFooWidget.calls.count()).toBe(1);
        expect(spyBarWidget.calls.count()).toBe(1);
        expect(spyFooBarElement.calls.count()).toBe(4);
    });

    it( '_off() - all events', function() {
        var instance = new this.TestWidget();
        var element = $('<div>');
        var spyFooWidget = jasmine.createSpy('fooWidget');
        var spyBarWidget = jasmine.createSpy('barWidget');
        var spyFooBarElement = jasmine.createSpy('foobarElement');
        instance._on(element, {
            foo: spyFooWidget,
            bar: spyBarWidget
        });
        element.on('foo bar', spyFooBarElement);
        element.trigger('foo');
        element.trigger('bar');
        expect(spyFooWidget.calls.count()).toBe(1);
        expect(spyBarWidget.calls.count()).toBe(1);
        expect(spyFooBarElement.calls.count()).toBe(2);
        instance._off(element);
        element.trigger('foo');
        element.trigger('bar');
        expect(spyFooWidget.calls.count()).toBe(1);
        expect(spyBarWidget.calls.count()).toBe(1);
        expect(spyFooBarElement.calls.count()).toBe(4);
    });

    it('._trigger() - no event, no ui', function() {
        var spyListener = jasmine.createSpy('listener');
        var spyCallback = jasmine.createSpy('callback');

        var instance = new this.TestWidget({foo: spyCallback});
        instance.element.appendTo(document.body);

        $(document).add(instance.element).on('testwidget:foo', spyListener);
        expect(instance._trigger('foo')).toBeTruthy();
        expect(spyCallback).toHaveBeenCalledWith(jasmine.objectContaining({type: 'testwidget:foo'}), {});
        expect(spyCallback.calls.mostRecent().object).toBe(instance.element[0]);
        expect(spyListener.calls.count()).toBe(2);
        expect(spyListener.calls.mostRecent().object).toBe(document);
        expect(spyListener.calls.first().object).toBe(instance.element[0]);

        instance.element.remove();
        $(document).off('foo');
    });

    it('._trigger() - cancelled event', function() {
        var spyListener = jasmine.createSpy('listener').and.returnValue(false);
        var spyCallback = jasmine.createSpy('callback');

        var instance = new this.TestWidget({foo: spyCallback});
        instance.element.on('testwidget:foo', spyListener);

        expect(instance._trigger('foo')).toBeFalsy();
        expect(spyListener).toHaveBeenCalled();
        expect(spyCallback).toHaveBeenCalled();
    });

    it('._trigger() - cancelled callback', function() {
        var instance = new this.TestWidget({
            foo: function() {
                return false;
            }
        });

        expect(instance._trigger('foo')).toBeFalsy();
    });

    it('._trigger() - provide event and ui', function() {
        var originalEvent = $.Event('originalTest');
        $.extend(this.TestWidget.prototype, {
            testEvent: function() {
                var ui = {
                    foo: 'bar',
                    baz: {
                        qux: 5,
                        quux: 20
                    }
                };
                this._trigger('foo', originalEvent, ui);
                expect(ui).toEqual({
                    foo: 'notbar',
                    baz: {
                        qux: 5,
                        quux: 'jQuery'
                    }
                });
            }
        });
        var instance = new this.TestWidget({
            foo: function (event, ui) {
                expect(event).toEqual(jasmine.objectContaining({originalEvent: originalEvent}));
                expect(ui).toEqual({
                    foo: 'notbar',
                    baz: {
                        qux: 5,
                        quux: 20
                    }
                });
                ui.baz.quux = 'jQuery';
            }
        });
        instance.element.on('testwidget:foo', function (event, ui) {
            expect(event).toEqual(jasmine.objectContaining({originalEvent: originalEvent}));
            expect(ui).toEqual({
                foo: 'bar',
                baz: {
                    qux: 5,
                    quux: 20
                }
            });
            ui.foo = 'notbar';
        });
        spyOn(instance.options, 'foo').and.callThrough();
        instance.testEvent();
        expect(instance.options.foo).toHaveBeenCalled();
    });

    it( '._trigger() - array as ui', function() {
        var spyListener = jasmine.createSpy('listener');
        var spyCallback = jasmine.createSpy('callback');
        $.extend(this.TestWidget.prototype, {
            testEvent: function() {
                var ui = {
                    foo: 'bar',
                    baz: {
                        qux: 5,
                        quux: 20
                    }
                },
                extra = {
                    bar: 5
                };
                this._trigger('foo', null, [ui, extra]);
            }
        });
        var instance = new this.TestWidget({foo: spyCallback});
        instance.element.on('testwidget:foo', spyListener);
        instance.testEvent();
        expect(spyCallback).toHaveBeenCalledWith(
            jasmine.any(Object),
            {
                foo: 'bar',
                baz: {
                    qux: 5,
                    quux: 20
                }
            },
            {
                bar: 5
            }
        );
        expect(spyListener).toHaveBeenCalledWith(
            jasmine.any(Object),
            {
                foo: 'bar',
                baz: {
                    qux: 5,
                    quux: 20
                }
            },
            {
                bar: 5
            }
        );
    });

    it('_delay', function() {
        $.extend(this.TestWidget.prototype, {
            _create: function() {
                jasmine.clock().install();

                var spy = jasmine.createSpy('callback');
                spyOn(this, 'callback');

                var timer = this._delay(spy, 500);
                expect(timer).not.toBeUndefined();
                timer = this._delay('callback');
                expect(timer).not.toBeUndefined();
                expect(spy).not.toHaveBeenCalled();
                expect(this.callback).not.toHaveBeenCalled();

                jasmine.clock().tick(0);
                expect(spy).not.toHaveBeenCalled();
                expect(this.callback).toHaveBeenCalled();
                expect(this.callback.calls.mostRecent().object).toBe(this);

                jasmine.clock().tick(500);
                expect(spy).toHaveBeenCalled();
                expect(spy.calls.mostRecent().object).toBe(this);
                expect(this.callback).toHaveBeenCalled();

                expect(spy.calls.count()).toBe(1);
                expect(this.callback.calls.count()).toBe(1);

                jasmine.clock().uninstall();
            },
            callback: function() {}
        });
        var instance = new this.TestWidget();
    });

    xit('._hoverable()', function() {
        var testWidget = createWidget('testWidget', {
            _create: function() {
                this._hoverable(this.element.children());
            }
        });

        var div = $('#widget').testWidget().children();
        assert.lacksClasses(div, 'ui-state-hover', 'not hovered on init');
        div.trigger('mouseenter');
        assert.hasClasses(div, 'ui-state-hover', 'hovered after mouseenter');
        div.trigger('mouseleave');
        assert.lacksClasses(div, 'ui-state-hover', 'not hovered after mouseleave');

        div.trigger('mouseenter');
        assert.hasClasses(div, 'ui-state-hover', 'hovered after mouseenter');
        $('#widget').testWidget('disable');
        assert.lacksClasses(div, 'ui-state-hover', 'not hovered while disabled');
        div.trigger('mouseenter');
        assert.lacksClasses(div, 'ui-state-hover', 'can\'t hover while disabled' );
        $('#widget').testWidget('enable');
        assert.lacksClasses(div, 'ui-state-hover', 'enabling doesn\'t reset hover' );

        div.trigger('mouseenter');
        assert.hasClasses(div, 'ui-state-hover', 'hovered after mouseenter');
        $('#widget').testWidget('destroy');
        assert.lacksClasses(div, 'ui-state-hover', 'not hovered after destroy');
        div.trigger('mouseenter');
        assert.lacksClasses(div, 'ui-state-hover', 'event handler removed on destroy');
    });

    xit('._focusable()', function() {
        createWidget('testWidget', {
            _create: function() {
                this._focusable(this.element.children());
            }
        });

        var div = $('#widget').testWidget().children();
        assert.lacksClasses(div, 'ui-state-focus', 'not focused on init');
        div.trigger('focusin');
        assert.hasClasses(div, 'ui-state-focus', 'focused after explicit focus');
        div.trigger('focusout');
        assert.lacksClasses(div, 'ui-state-focus', 'not focused after blur');

        div.trigger('focusin');
        assert.hasClasses(div, 'ui-state-focus', 'focused after explicit focus');
        $('#widget').testWidget('disable');
        assert.lacksClasses(div, 'ui-state-focus', 'not focused while disabled');
        div.trigger('focusin');
        assert.lacksClasses(div, 'ui-state-focus', 'can\'t focus while disabled' );
        $('#widget').testWidget('enable');
        assert.lacksClasses(div, 'ui-state-focus', 'enabling doesn\'t reset focus' );

        div.trigger('focusin');
        assert.hasClasses(div, 'ui-state-focus', 'focused after explicit focus');
        $('#widget').testWidget('destroy');
        assert.lacksClasses(div, 'ui-state-focus', 'not focused after destroy');
        div.trigger('focusin');
        assert.lacksClasses(div, 'ui-state-focus', 'event handler removed on destroy');
    });

    describe('Widget destroy', function() {

        beforeEach(function () {
            var self = this;
            this.destroyed = false;
            $.extend(this.TestWidget.prototype, {
                destroy: function() {
                    self.destroyed = true;
                },
                render: function () {
                    return this.createWidget('div', null,
                        this.createWidget('div'));
                }
            });
        });


        it('auto-destroy - .remove()', function() {
            var instance = new this.TestWidget();
            instance.element.remove();
            expect(this.destroyed).toBeTruthy();
        });

        it('auto-destroy - .remove() when disabled', function() {
            var instance = new this.TestWidget({ disabled: true });
            instance.element.remove();
            expect(this.destroyed).toBeTruthy();
        });

        it('auto-destroy - .remove() on parent', function() {
            var parent = $('<div>').appendTo(document.body);
            var instance = new this.TestWidget();
            instance.element.appendTo(parent);
            parent.remove();
            expect(this.destroyed).toBeTruthy();
        });

        it('auto-destroy - .remove() on child', function() {
            var instance = new this.TestWidget();
            instance.element.children().remove();
            expect(this.destroyed).toBeFalsy();
        });

        it('auto-destroy - .empty()', function() {
            var instance = new this.TestWidget();
            instance.element.empty();
            expect(this.destroyed).toBeFalsy();
        });

        it('auto-destroy - .empty() on parent', function() {
            var parent = $('<div>').appendTo(document.body);
            var instance = new this.TestWidget();
            instance.element.appendTo(parent);
            parent.empty();
            expect(this.destroyed).toBeTruthy();
            parent.remove();
        });

        it('auto-destroy - .detach()', function() {
            var instance = new this.TestWidget();
            instance.element.detach();
            expect(this.destroyed).toBeFalsy();
        });

        it('destroy - remove event bubbling', function() {
            var instance = new this.TestWidget();
            $('<div>child</div>').appendTo(instance.element).trigger('remove');
            expect(this.destroyed).toBeFalsy();
        });

    });
});
