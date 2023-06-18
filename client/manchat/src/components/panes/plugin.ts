import { App } from 'vue'
import Panes from './index'

export const register = (app: App<Element>): void => {
  Panes.forEach(pane => {
    // Convert to kebab-case and register
    const kebab = pane.info.name.replace(/([a-z0–9])([A-Z])/g, '$1-$2').toLowerCase()
    app.component(kebab, pane.component)
  })
}