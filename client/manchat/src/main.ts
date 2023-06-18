/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'
import {register} from "@/components/panes/plugin";

const app = createApp(App)

register(app)
registerPlugins(app)

app.mount('#app')
