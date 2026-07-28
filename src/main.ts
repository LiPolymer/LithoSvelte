import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import * as themeModule from './lib/theme'

let disposeTheme = themeModule.installTheme()

if (import.meta.hot) {
  import.meta.hot.accept('./lib/theme', (nextModule) => {
    disposeTheme()
    disposeTheme = nextModule?.installTheme() ?? (() => {})
  })

  import.meta.hot.dispose(() => disposeTheme())
}


const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
