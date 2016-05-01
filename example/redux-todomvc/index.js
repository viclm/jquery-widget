import 'babel-polyfill'
import Provider from './containers/Provider'
import App from './containers/App'
import configureStore from './store/configureStore'
import 'todomvc-app-css/index.css'

const store = configureStore()

Provider(store, App, '#root')