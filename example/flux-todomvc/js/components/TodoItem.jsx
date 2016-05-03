/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var createWidget = require('jquery-widget');
var TodoActions = require('../actions/TodoActions');
var TodoTextInput = require('./TodoTextInput');

var classNames = require('classnames');

var TodoItem = createWidget('TodoItem', {
    
  _getCreateOptions: function () {
    return {
      isEditing: false
    };
  },

  /**
   * @return {object}
   */
  render: function() {
    var todo = this.options.todo;

    var input;
    if (this.options.isEditing) {
      input =
        <TodoTextInput
          classname="edit"
          onsave="_onSave"
          value={todo.text}
        />;
    }

    // List items should get the class 'editing' when editing
    // and 'completed' when marked as completed.
    // Note that 'completed' is a classification while 'complete' is a state.
    // This differentiation between classification and state becomes important
    // in the naming of view actions toggleComplete() vs. destroyCompleted().
    return (
      <li
        classname={classNames({
          'completed': todo.complete,
          'editing': this.options.isEditing
        })}
        key={todo.id}>
        <div classname="view">
          <input
            classname="toggle"
            type="checkbox"
            checked={todo.complete}
            onchange="_onToggleComplete"
          />
          <label ondblclick="_onDoubleClick">
            {todo.text}
          </label>
          <button classname="destroy" onclick="_onDestroyClick" />
        </div>
        {input}
      </li>
    );
  },

  _onToggleComplete: function() {
    TodoActions.toggleComplete(this.options.todo);
  },

  _onDoubleClick: function() {
    this.option({isEditing: true});
  },

  /**
   * Event handler called within TodoTextInput.
   * Defining this here allows TodoTextInput to be used in multiple places
   * in different ways.
   * @param  {string} text
   */
  _onSave: function(e, ui) {
    var text = ui.text;
    TodoActions.updateText(this.options.todo.id, text);
    this.option({isEditing: false});
  },

  _onDestroyClick: function() {
    TodoActions.destroy(this.options.todo.id);
  }

});

module.exports = TodoItem;
