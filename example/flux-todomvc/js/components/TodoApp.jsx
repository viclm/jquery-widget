/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * This component operates as a "Controller-View".  It listens for changes in
 * the TodoStore and passes the new data to its children.
 */

var Footer = require('./Footer');
var Header = require('./Header');
var MainSection = require('./MainSection');
var createWidget = require('jquery-widget');
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

var TodoApp = createWidget('TodoApp', {
    
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

module.exports = TodoApp;
