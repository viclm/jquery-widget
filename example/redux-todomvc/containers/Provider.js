import { bindActionCreators } from 'redux'
import * as TodoActions from '../actions'

function Provider(store, widget, appendTo) {
    let instance = new widget({
        todos: store.getState().todos,
        actions: bindActionCreators(TodoActions, dispatch)
    });
    instance.widget().appendTo(appendTo);
    
    function dispatch(action) {
        store.dispatch(action);
        instance.option('todos', store.getState().todos)
    }
}

export default Provider