import './style/main'
import 'babel-polyfill'
import Promise from 'promise-polyfill'

if (!window.Promise) {
  window.Promise = Promise
}

Promise.all([System.import('./app')]).then(() => {
  console.log('App loaded!')
})
