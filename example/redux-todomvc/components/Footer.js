import createWidget from 'jquery-widget'
import classnames from 'classnames'
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../constants/TodoFilters'

const FILTER_TITLES = {
  [SHOW_ALL]: 'All',
  [SHOW_ACTIVE]: 'Active',
  [SHOW_COMPLETED]: 'Completed'
}

const Footer = createWidget('Footer', {
  renderTodoCount() {
    const { activeCount } = this.options
    const itemWord = activeCount === 1 ? 'item' : 'items'

    return (
      <span classname="todo-count">
        <strong>{activeCount || 'No'}</strong> {itemWord} left
      </span>
    )
  },

  renderFilterLink(filter) {
    const title = FILTER_TITLES[filter]
    const { filter: selectedFilter } = this.options

    return (
      <a classname={classnames({ selected: filter === selectedFilter })}
         style={{ cursor: 'pointer' }}
         onclick={() => this._trigger('show', null, {filter})}>
        {title}
      </a>
    )
  },

  renderClearButton() {
    const { completedCount } = this.options
    if (completedCount > 0) {
      return (
        <button classname="clear-completed"
                onclick={() => this._trigger('clearcompleted')} >
          Clear completed
        </button>
      )
    }
  },

  render() {
    return (
      <footer classname="footer">
        {this.renderTodoCount()}
        <ul classname="filters">
          {[ SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED ].map(function (filter) {
            return (
              <li key={filter}>
                {this.renderFilterLink(filter)}
              </li>
            )
          }.bind(this))}
        </ul>
        {this.renderClearButton()}
      </footer>
    )
  }
})

export default Footer