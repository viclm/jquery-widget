import { Widget } from 'jquery-widget'
import TodoItem from './TodoItem'
import Footer from './Footer'
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../constants/TodoFilters'

const TODO_FILTERS = {
  [SHOW_ALL]: () => true,
  [SHOW_ACTIVE]: todo => !todo.completed,
  [SHOW_COMPLETED]: todo => todo.completed
}

class MainSection extends Widget {
  
  _getCreateOptions() {
    return {
      filter: SHOW_ALL
    }
  }

  handleClearCompleted() {
    this.options.actions.clearCompleted()
  }

  handleShow(e, ui) {
    this.option({ filter: ui.filter })
  }

  renderToggleAll(completedCount) {
    const { todos, actions } = this.options
    if (todos.length > 0) {
      return (
        <input classname="toggle-all"
               type="checkbox"
               checked={completedCount === todos.length}
               onchange={actions.completeAll} />
      )
    }
  }

  renderFooter(completedCount) {
    const { todos } = this.options
    const { filter } = this.options
    const activeCount = todos.length - completedCount

    if (todos.length) {
      return (
        <Footer completedCount={completedCount}
                activeCount={activeCount}
                filter={filter}
                onclearcompleted={this.handleClearCompleted}
                onshow={this.handleShow} />
      )
    }
  }

  render() {
    const { todos, actions, filter } = this.options

    const filteredTodos = todos.filter(TODO_FILTERS[filter])
    const completedCount = todos.reduce((count, todo) =>
      todo.completed ? count + 1 : count,
      0
    )

    return (
      <section classname="main">
        {this.renderToggleAll(completedCount)}
        <ul classname="todo-list">
          {filteredTodos.map(function (todo) {
            return (<TodoItem key={todo.id} todo={todo} {...actions} />)
          }.bind(this))}
        </ul>
        {this.renderFooter(completedCount)}
      </section>
    )
  }
}

export default MainSection
