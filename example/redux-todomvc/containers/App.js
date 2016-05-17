import { Widget } from 'jquery-widget'
import Header from '../components/Header'
import MainSection from '../components/MainSection'

class App extends Widget {
   render() {
    const { todos, actions } = this.options
    return (
      <div>
        <Header addTodo={actions.addTodo} />
        <MainSection todos={todos} actions={actions} />
      </div>
    )
  }
}

export default App