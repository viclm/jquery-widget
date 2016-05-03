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

var Header = createWidget('Header', {

  /**
   * @return {object}
   */
  render: function() {
    return (
      <header id="header">
        <h1>todos</h1>
        <TodoTextInput
          id="new-todo"
          placeholder="What needs to be done?"
          onsave="_onSave"
        />
      </header>
    );
  },

  /**
   * Event handler called within TodoTextInput.
   * Defining this here allows TodoTextInput to be used in multiple places
   * in different ways.
   * @param {string} text
   */
  _onSave: function(e, ui) {
    var text = ui.text;
    if (text.trim()){
      TodoActions.create(text);
    }

  }

});

module.exports = Header;
