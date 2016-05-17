var $ = require('jquery');
var createWidget = require('../../../src/widget/factory');

describe( 'widget factory', function () {

    it( 'creation', function() {
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
        expect(testWidget.prototype.widgetName).toBe('testWidget');
        expect(testWidget.prototype).toEqual(jasmine.any(Object));
        expect(testWidget.prototype._create()).toBe('_create');
        expect(testWidget.prototype.creationTest()).toBe('creationTest');
    } );

    it( 'usage', function() {

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

    it( 'Anonymous widget', function () {
        var testWidget = createWidget();
        if ('name' in testWidget) {
            expect(testWidget.name).toEqual(jasmine.stringMatching(/^Anonymous\d+$/));
        }
        expect(testWidget.prototype.widgetName).toEqual(jasmine.stringMatching(/^Anonymous\d+$/));
    });

    it( 'inheritance', function() {

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

        expect(testWidgetBase.prototype.options.obj).toEqual({key1: 'foo', key2: 'bar'});
        expect(testWidgetBase.prototype.options.arr).toEqual([ 'testing' ]);
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

} );
