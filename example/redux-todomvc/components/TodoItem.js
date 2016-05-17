import { Widget } from 'jquery-widget'
import classnames from 'classnames'
import TodoTextInput from './TodoTextInput'

class TodoItem extends Widget {

  _getCreateOptions() {
    return {
       editing: false
    }
  }

  handleDoubleClick() {
    this.option({ editing: true })
  }

  handleSave(id, text) {
    if (text.length === 0) {
      this.options.deleteTodo(id)
    } else {
      this.options.editTodo(id, text)
    }
    this.option({ editing: false })
  }

  render() {
    const { todo, completeTodo, deleteTodo } = this.options

    let element
    if (this.options.editing) {
      element = (
        <TodoTextInput text={todo.text}
                       editing={this.options.editing}
                       onsave={(e, ui) => this.handleSave(todo.id, ui.text)} />
      )
    } else {
      element = (
        <div classname="view">
          <input classname="toggle"
                 type="checkbox"
                 checked={todo.completed}
                 onchange={() => completeTodo(todo.id)} />
          <label ondblclick={this.handleDoubleClick}>
            {todo.text}
          </label>
          <button classname="destroy"
                  onclick={() => deleteTodo(todo.id)} />
        </div>
      )
    }

    return (
      <li classname={classnames({
        completed: todo.completed,
        editing: this.options.editing
      })}>
        {element}
      </li>
    )
  }
}

export default TodoItem
