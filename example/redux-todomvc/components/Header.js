import { Widget } from 'jquery-widget'
import TodoTextInput from './TodoTextInput'

class Header extends Widget {
  handleSave(e, ui) {
    let text = ui.text
    if (text.length !== 0) {
      this.options.addTodo(text)
    }
  }
  
  render() {
    return (
      <header className="header">
          <h1>todos</h1>
          <TodoTextInput newTodo
                         onsave={this.handleSave}
                         placeholder="What needs to be done?" />
      </header>
    )
  }  
}

export default Header
