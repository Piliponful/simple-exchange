import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import App from './App'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

const rootEl = document.getElementById('app')
const render = Component =>
  ReactDOM.render(
    <MuiThemeProvider>
      <AppContainer>
        <Component />
      </AppContainer>
    </MuiThemeProvider>,
    rootEl
  )

render(App)
if (module.hot) module.hot.accept('./App', () => render(App))
