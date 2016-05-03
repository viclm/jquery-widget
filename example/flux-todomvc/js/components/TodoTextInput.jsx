/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var createWidget = require('jquery-widget');

var ENTER_KEY_CODE = 13;

var TodoTextInput = createWidget('TodoTextInput', {
    
  options: {
    value: ''
  },

  /**
   * @return {object}
   */
  render: function() /*object*/ {
    return (
      <input
        classname={this.options.classname}
        id={this.options.id}
        placeholder={this.options.placeholder}
        onblur="_save"
        onchange="_onChange"
        onkeydown="_onKeyDown"
        value={this.options.value}
        autofocus={true}
      />
    );
  },

  /**
   * Invokes the callback passed in as onSave, allowing this component to be
   * used in different ways.
   */
  _save: function() {
    //this.options.onSave(this.options.value);
    this._trigger('save', null, {text: this.options.value});
    this.option({
      value: ''
    });
  },

  /**
   * @param {object} event
   */
  _onChange: function(/*object*/ event) {
    //this.option({
    //  value: event.target.value
    //});
    this.options.value = event.target.value;
  },

  /**
   * @param  {object} event
   */
  _onKeyDown: function(event) {
    if (event.keyCode === ENTER_KEY_CODE) {
      this._save();
    }
  }

});

module.exports = TodoTextInput;
