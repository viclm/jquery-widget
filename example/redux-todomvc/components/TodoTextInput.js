import { Widget } from 'jquery-widget'
import classnames from 'classnames'

class TodoTextInput extends Widget {

  _getCreateOptions() {
    return {
      text: ''
    }
  }

  handleSubmit(e) {
    const text = e.target.value.trim()
    if (e.which === 13) {
      this._trigger('save', null, {text: text})
      if (this.options.newTodo) {
        this.option({ text: '' })
      }
    }
  }

  handleChange(e) {
    this.options.text = e.target.value
  }

  handleBlur(e) {
    if (!this.options.newTodo) {
      this._trigger('save', null, {text: e.target.value})
    }
  }

  render() {
    return (
      <input classname={
        classnames({
          edit: this.options.editing,
          'new-todo': this.options.newTodo
        })}
        type="text"
        placeholder={this.options.placeholder}
        autofocus="true"
        value={this.options.text}
        onblur={this.handleBlur}
        onchange={this.handleChange}
        onkeydown={this.handleSubmit} />
    )
  }
}

export default TodoTextInput
