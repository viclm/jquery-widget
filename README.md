# jQuery Widget
[![Build Status](https://secure.travis-ci.org/viclm/jquery-widget.png?branch=master)](http://travis-ci.org/viclm/jquery-widget)

[jQuery Widget Factory](http://api.jqueryui.com/jQuery.widget/) is a small framework for building UI components, really gorgeous.

From now it can be used as an independent view component as React with the support of JSX and virtual dom, this makes it more adaptable than before.

It's easy to integrate it with [flux](http://facebook.github.io/flux/)/[redux](http://redux.js.org/) workflow, checkout the examples of todomvc.

## Difference to the original implementation

- The option() is also used to manage the component state
- The render() is added to reflex the state changes to ui view
- Support JSX and virtual dom, the createWidget() is used to create virtual dom tree
- Make the widget class local, remove the namespace and the global reference such as `jQuery.ui`
- Remove the feature of class redefining

## Example from flux-todomvc

```javascript
var Footer = require('./Footer');
var Header = require('./Header');
var MainSection = require('./MainSection');
var $ = require('jquery-widget');
var TodoStore = require('../stores/TodoStore');

/**
 * Retrieve the current TODO data from the TodoStore
 */
function getTodoState() {
  return {
    allTodos: TodoStore.getAll(),
    areAllComplete: TodoStore.areAllComplete()
  };
}

var TodoApp = $.widget('TodoApp', {

  _getCreateOptions: getTodoState,

  _create: function() {
    this._on(TodoStore, {
        'change': '_onChange'
    });
  },

  /**
   * @return {object}
   */
  render: function() {
    return (
      <div>
        <Header />
        <MainSection
          allTodos={this.options.allTodos}
          areAllComplete={this.options.areAllComplete}
        />
        <Footer allTodos={this.options.allTodos} />
      </div>
    );
  },

  /**
   * Event handler for 'change' events coming from the TodoStore
   */
  _onChange: function() {
    this.option(getTodoState());
  }

});
```

## Installation with npm

```sh
npm install --save jquery-widget
```

## Reference

- [jQuery widget factory](https://github.com/jquery/jquery-ui/blob/master/ui/widget.js)
- [virtual-dom](https://github.com/Matt-Esch/virtual-dom/)
- [flux-todomvc](https://github.com/facebook/flux/tree/master/examples/flux-todomvc)
- [redux-todomvc](https://github.com/reactjs/redux/tree/master/examples/todomvc)

## License

Copyright (c) 2016 viclm

Licensed under the MIT license.
