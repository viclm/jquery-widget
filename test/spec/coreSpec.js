define( ['dist/jquery-widget'], function( createWidget ) {

    describe( 'widget factory', function () {

        it( 'widget creation', function() {
            var testWidget = createWidget( 'testWidget', {
                _create: function() {
                    return '_create';
                },
                creationTest: function() {
                    return 'creationTest';
                }
            } );

            expect($.isFunction( testWidget )).toBeTruthy();
            if ('name' in testWidget) {
                expect(testWidget.name).toBe('testWidget');
            }
            expect(testWidget.prototype).toEqual(jasmine.any(Object));
            expect(testWidget.prototype._create()).toBe('_create');
            expect(testWidget.prototype.creationTest()).toBe('creationTest');
            expect(testWidget.prototype.option).toBe(createWidget.Widget.prototype.option);
        } );

        it ( 'element normalization', function() {
            var elem;
            var testWidget = createWidget( 'testWidget', {} );

            testWidget.prototype._create = function() {
                expect(this.element.is( 'div' )).toBeTruthy();
                expect(this.element.data('widget')).toBe('testWidget');
                expect(this.element.data('widget-testWidget')).toBe(this);
            };
            testWidget();

            testWidget.prototype.defaultElement = '<span data-test="pass"></span>';
            testWidget.prototype._create = function() {
                expect(this.element.is( 'span[data-test=pass]' )).toBeTruthy();
            };
            testWidget();

            elem = $( '<input>' );
            testWidget.prototype._create = function() {
                expect(this.element.parent()[0]).toBe(elem[0]);
            };
            testWidget( {}, elem[ 0 ] );

            elem = $( '<div>' );
            testWidget.prototype._create = function() {
                expect(this.element.parent()[0]).toBe(elem[0]);
            };
            testWidget( {}, elem );
        } );

        it( 'direct usage', function() {

            var testWidget, instance, ret;

            testWidget = createWidget( 'testWidget', {
                getterSetterVal: 5,
                methodWithParams: function( param1, param2 ) {
                    return this;
                },
                getterSetterMethod: function( val ) {
                    if ( val ) {
                        this.getterSetterVal = val;
                    } else {
                        return this.getterSetterVal;
                    }
                }
            } );

            instance = new testWidget( {} );

            spyOn(instance, 'methodWithParams').and.callThrough();

            ret = instance.methodWithParams( 'value1', 'value2' );
            expect(instance.methodWithParams).toHaveBeenCalledWith('value1', 'value2');
            expect(ret).toBe(instance);

            ret = instance.getterSetterMethod();
            expect(ret).toBe(5);
            instance.getterSetterMethod( 30 );
            expect(instance.getterSetterVal).toBe(30);
        } );

        xit( '._getCreateOptions()', function() {
            var testWidget = createWidget( 'testWidget', {
                options: {
                    option1: 'valuex',
                    option2: 'valuex',
                    option3: 'value3'
                },
                _getCreateOptions: function() {
                    var superOptions = this._super();

                    expect($.isEmptyObject(superOptions)).toBeTruthy();

                    return {
                        option1: 'override1',
                        option2: 'overideX'
                    };
                },
                _create: function() {
                    expect(this.options).toEqual({
                        classes: {},
                        create: null,
                        disabled: false,
                        option1: 'override1',
                        option2: 'value2',
                        option3: 'value3'
                    });
                }
            } );
            testWidget( { option2: 'value2' } );
        } );

        it( '._getCreateEventData()', function() {
            var data = { foo: 'bar' };
            var testWidget = createWidget( 'testWidget', {
                _getCreateEventData: function() {
                    return data;
                }
            } );
            testWidget( {
                create: function( event, ui ) {
                    expect(ui).toBe(data);
                }
            } );
        } );

        xit( 'inheritance', function() {

            var testWidgetBase = createWidget( 'testWidgetBase', {
                options: {
                    obj: {
                        key1: 'foo',
                        key2: 'bar'
                    },
                    arr: [ 'testing' ]
                }
            } );

            var testWidgetExtension = createWidget( 'testWidgetExtension', testWidgetBase, {
                options: {
                    obj: {
                        key1: 'baz'
                    },
                    arr: [ 'alpha', 'beta' ]
                }
            } );

            expect(testWidgetBase.prototype.widgetEventPrefix).toBe('testWidgetBase');
            expect(testWidgetBase.prototype.options.obj).toEqual({key1: 'foo', key2: 'bar'});
            expect(testWidgetBase.prototype.options.arr).toEqual([ 'testing' ]);
            expect(testWidgetExtension.prototype.widgetEventPrefix).toBe('testWidgetExtension');
            expect(testWidgetExtension.prototype.options.obj).toEqual({key1: 'baz', key2: 'bar'});
            expect(testWidgetExtension.prototype.options.arr).toEqual([ 'alpha', 'beta' ]);

        } );

        it( '._super()', function() {
            var instance;
            var testWidget = createWidget( 'testWidget', {
                method: function( a, b ) {
                    expect(this).toBe(instance);
                    expect(a).toBe(5);
                    expect(b).toBe(20);
                    return a + b;
                }
            } );

            var testWidget2 = createWidget( 'testWidget2', testWidget, {
                method: function( a, b ) {
                    expect(this).toBe(instance);
                    expect(a).toBe(5);
                    expect(b).toBe(10);
                    return this._super( a, b * 2 );
                }
            } );

            var testWidget3 = createWidget( 'testWidget3', testWidget2, {
                method: function( a ) {
                    expect(this).toBe(instance);
                    expect(a).toBe(5);
                    var ret = this._super( a, a * 2 );
                    expect(ret).toBe(25);
                }
            } );

            instance = testWidget3();
            instance.method( 5 );
        } );

        it( '._superApply()', function() {
            var instance;
            var testWidget = createWidget( 'testWidget', {
                method: function( a, b ) {
                    expect(this).toBe(instance);
                    expect(a).toBe(5);
                    expect(b).toBe(10);
                    return a + b;
                }
            } );

            var testWidget2 = createWidget( 'testWidget2', testWidget, {
                method: function( a, b ) {
                    expect(this).toBe(instance);
                    expect(a).toBe(5);
                    expect(b).toBe(10);
                    return this._superApply( arguments );
                }
            } );

            var testWidget3 = createWidget( 'testWidget3', testWidget2, {
                method: function( a, b ) {
                    expect(this).toBe(instance);
                    expect(a).toBe(5);
                    expect(b).toBe(10);
                    var ret = this._superApply( arguments );
                    expect(ret).toBe(15);
                }
            } );

            instance = testWidget3();
            instance.method( 5, 10 );
        } );

        it( 'mixins', function() {

            var mixin1 = {
                foo: function() {
                    return 'foo';
                }
            };
            var mixin2 = {
                bar: function() {
                    return 'bar';
                }
            };
            var prototype = {
                baz: function() {
                    return 'baz';
                }
            };
            var existingBar = mixin2.bar;
            var method;

            var testWidget = createWidget( 'testWidget', [ mixin1, mixin2, prototype ] );

            expect(testWidget.prototype.foo()).toBe('foo');
            expect(testWidget.prototype.bar()).toBe('bar');
            expect(testWidget.prototype.baz()).toBe('baz');

            mixin1.foo = function() {
                return 'foo2';
            };
            expect(testWidget.prototype.foo()).not.toBe('foo2');

            testWidget.prototype.bar = function() {};
            expect(mixin2.bar).toBe(existingBar);
        } );
        
        it( 'mixins with inheritance', function() {

            var mixin1 = {
                foo: function() {
                    return 'foo';
                }
            };
            var mixin2 = {
                bar: function() {
                    return 'bar';
                }
            };
            var parentPrototype = {
                baz: function() {
                    return 'baz';
                }
            };
            var childPrototype = {
                qux: function() {
                    return 'qux';
                }
            };
            var method;

            var testWidget = createWidget('testWidget', [mixin1, parentPrototype]);
            var testWidget2 = createWidget('testWidget2', testWidget, [mixin2, childPrototype]);
            
            expect(testWidget2.prototype.foo()).toBe('foo');
            expect(testWidget2.prototype.bar()).toBe('bar');
            expect(testWidget2.prototype.baz()).toBe('baz');
            expect(testWidget2.prototype.qux()).toBe('qux');
        });
        
        it('.option() - getter', function() {
            var testWidget = createWidget('testWidget', {
                _create: function() { }
            });

            var options,
                instance = testWidget({
                    foo: 'bar',
                    baz: 5,
                    qux: ['quux', 'quuux']
                });
                
            expect(instance.option('x')).toBeNull();
            expect(instance.option('foo')).toBe('bar');
            expect(instance.option('baz')).toBe(5);
            expect(instance.option('qux')).toEqual(['quux', 'quuux']);

            options = instance.option();
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

        it('.option() - deep option getter', function() {
            var testWidget = createWidget('testWidget', {});
            var instance = testWidget({
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

        it('.option() - delegate to ._setOptions()', function() {
            var calls = [];
            var testWidget = createWidget('testWidget', {
                _create: function() { },
                _setOptions: function(options) {
                    calls.push(options);
                }
            });
            var instance = testWidget();

            calls = []
            instance.option('foo', 'bar');
            expect(calls).toEqual([{ foo: 'bar' }]);

            calls = [];
            instance.option({
                bar: 'qux',
                quux: 'quuux'
            });
            expect(calls).toEqual([{ bar: 'qux', quux: 'quuux' }]);
        });
        
        it('.option() - delegate to ._setOption()', function() {
            var calls = [];
            var testWidget = createWidget('testWidget', {
                _create: function() { },
                _setOption: function(key, val) {
                    calls.push({
                        key: key,
                        val: val
                    });
                }
            });
            var instance = testWidget();

            calls = [];
            instance.option('foo', 'bar');
            expect(calls).toEqual([{ key: 'foo', val: 'bar' }]);

            calls = [];
            instance.option('foo', undefined);
            expect(calls).toEqual([{ key: 'foo', val: undefined }]);

            calls = [];
            instance.option({
                bar: 'qux',
                quux: 'quuux'
            });
            expect(calls).toEqual([
                { key: 'bar', val: 'qux' },
                { key: 'quux', val: 'quuux' }
            ]);
        });

        it('.option() - deep option setter', function() {
            var testWidget = createWidget('testWidget', {});
            var result, instance = testWidget();
            function deepOption(from, to, msg) {
                instance.options.foo = from;
                testWidget.prototype._setOption = function(key, value) {
                    expect(key).toBe('foo');
                    expect(value).toEqual(to);
                };
            }

            deepOption({ bar: 'baz' }, { bar: 'qux' });
            instance.option('foo.bar', 'qux');

            deepOption({ bar: 'baz' }, { bar: undefined });
            result = instance.option('foo.bar', undefined);
            expect(result).toBe(instance);

            deepOption(null, { bar: 'baz' });
            instance.option('foo.bar', 'baz');

            deepOption({ bar: 'baz', qux: { quux: 'quuux' } }, { bar: 'baz', qux: { quux: 'quuux', newOpt: 'newVal' } });
            instance.option('foo.qux.newOpt', 'newVal');
        });

        it('.enable()', function() {
            var testWidget = createWidget('testWidget', {
                _create: function() { },
                _setOption: function(key, val) {
                    expect(key).toBe('disabled');
                    expect(val).toBeFalsy();
                }
            });
            testWidget().enable();
        });

        it('.disable()', function() {
            var testWidget = createWidget('testWidget', {
                _create: function() { },
                _setOption: function(key, val) {
                    expect(key).toBe('disabled');
                    expect(val).toBeTruthy();
                }
            });
            testWidget().disable();
        });

        it('._setOptionDisabled()', function() {

            var testWidget = createWidget('testWidget', {
                _setOptionDisabled: function(value) {
                }
            });

            spyOn(testWidget.prototype, '_setOptionDisabled');
            
            testWidget();
            expect(testWidget.prototype._setOptionDisabled).not.toHaveBeenCalled();

            testWidget({ disabled: true });
            expect(testWidget.prototype._setOptionDisabled).toHaveBeenCalledWith(true);

            testWidget().enable();
            expect(testWidget.prototype._setOptionDisabled).toHaveBeenCalledWith(false);

            testWidget().option('disabled', true);
            expect(testWidget.prototype._setOptionDisabled).toHaveBeenCalledWith(true);
        });
        
        it( '._on() to element (default)', function() {
            var instance, element, event;
            var testWidget = createWidget('testWidget', {
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
          
            instance = testWidget();
            element = instance.element;
            
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
            var instance, element, event;
            var testWidget = createWidget('testWidget', {
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
          
            instance = testWidget();
            element = instance.element;
            
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
            var instance, element, descendant, event;
            var testWidget = createWidget('testWidget', {
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

            instance = testWidget();
            element = instance.element;
            descendant = element.find('strong');

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
            var testWidget = createWidget('testWidget', {
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
                    expect(this.element.on).toHaveBeenCalledWith('click.testWidget' + uuid, jasmine.any(Function));
                    expect(this.widgetElement.on.calls.count()).toBe(1);
                    expect(this.widgetElement.on).toHaveBeenCalledWith('click.testWidget' + uuid, 'a', jasmine.any(Function));

                    this._on({
                        'change form fieldset > input': 'handler'
                    });
                    expect(this.element.on.calls.count()).toBe(1);
                    expect(this.widgetElement.on.calls.count()).toBe(2);
                    expect(this.widgetElement.on).toHaveBeenCalledWith('change.testWidget' + uuid, 'form fieldset > input', jasmine.any(Function));                   
                }
            });
            testWidget();
        });
        
        it('_on() with delegate to descendent', function() {
            var testWidget = createWidget('testWidget', {
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
            testWidget();
        });
        
        it( '_on() to common element', function() {
            var testWidget = createWidget('testWidget', {
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
            var instance = testWidget();
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
            var testWidget = createWidget( 'testWidget', {} );
            var instance = testWidget();
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
            var testWidget = createWidget('testWidget', {});
            var instance = testWidget();
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
            var testWidget = createWidget('testWidget', {});
            var instance = testWidget();
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

        it('._trigger() - no event, no ui', function() {
            var spyListener = jasmine.createSpy('listener');
            var spyCallback = jasmine.createSpy('callback');
            var testWidget = createWidget('testWidget', {
                _create: function () {}
            });
            
            var instance = testWidget({foo: spyCallback}, document.body);
            
            $(document).add(instance.element).on('testwidgetfoo', spyListener);
            expect(instance._trigger('foo')).toBeTruthy();
            expect(spyCallback).toHaveBeenCalledWith(jasmine.objectContaining({type: 'testwidgetfoo'}), {});
            expect(spyCallback.calls.mostRecent().object).toBe(instance.element[0]);
            expect(spyListener.calls.count()).toBe(2);
            expect(spyListener.calls.mostRecent().object).toBe(document);
            expect(spyListener.calls.first().object).toBe(instance.element[0]);

            instance.element.remove();
            $(document).off('testwidgetfoo');
        });
        
        it('._trigger() - cancelled event', function() {
            var spyListener = jasmine.createSpy('listener').and.returnValue(false);
            var spyCallback = jasmine.createSpy('callback');
            var testWidget = createWidget('testWidget', {
                _create: function() { }
            });

            var instance = testWidget({foo: spyCallback});
            instance.element.on('testwidgetfoo', spyListener);
            
            expect(instance._trigger('foo')).toBeFalsy();
            expect(spyListener).toHaveBeenCalled();
            expect(spyCallback).toHaveBeenCalled();
        });

        it('._trigger() - cancelled callback', function() {
            var testWidget = createWidget('testWidget', {
                _create: function() { }
            });

            var instance = testWidget({
                foo: function() {
                    return false;
                }
            });
            
            expect(instance._trigger('foo')).toBeFalsy();
        });
        
        it('._trigger() - provide event and ui', function() {
            var originalEvent = $.Event('originalTest');
            var testWidget = createWidget('testWidget', {
                _create: function() { },
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
            var instance = testWidget({
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
            instance.element.on('testwidgetfoo', function (event, ui) {
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
            var testWidget = createWidget('testWidget', {
                _create: function() { },
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
            var instance = testWidget({foo: spyCallback});
            instance.element.on('testwidgetfoo', spyListener);
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
            var testWidget = createWidget('testWidget', {
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
            testWidget();
        });

        xdescribe('destroy', function() {

            beforeEach(function () {
                function destroy() {
                    this.destroyed = true;
                }
                this.destroyed = false;
                this.testWidget = createWidget('testWidget', {
                    _create: function() { },
                    destroy: function() {
                        destroy();
                    },
                    render: function () {
                        return this.createWidget('div', null,
                            this.createWidget('div'));
                    }
                });
            });


            it('auto-destroy - .remove()', function() {
                this.testWidget().element.remove();
                expect(this.destroyed).toBeTruthy();
            });

            it('auto-destroy - .remove() when disabled', function() {
                this.testWidget({ disabled: true }).element.remove();
                expect(this.destroyed).toBeTruthy();
            });

            it('auto-destroy - .remove() on parent', function() {
                var parent = $('<div>').appendTo(document.body);
                this.testWidget(null, parent);
                parent.remove();
                expect(this.destroyed).toBeTruthy();
            });

            it('auto-destroy - .remove() on child', function() {
                this.testWidget().element.children().remove();
                expect(this.destroyed).toBeFalsy();
            });

            it('auto-destroy - .empty()', function() {
                this.testWidget().element.empty();
                expect(this.destroyed).toBeFalsy();
            });

            it('auto-destroy - .empty() on parent', function() {
                var parent = $('<div>').appendTo(document.body);
                this.testWidget(null, parent);
                parent.empty();
                expect(this.destroyed).toBeTruthy();
                parent.remove();
            });

            it('auto-destroy - .detach()', function() {
                this.testWidget().element.detach();
                expect(this.destroyed).toBeFalsy();
            });

            it('destroy - remove event bubbling', function() {
                $('<div>child</div>').appendTo(this.testWidget().element).trigger('remove');
                expect(this.destroyed).toBeFalsy();
            });
            
        });

    } );
    
} );