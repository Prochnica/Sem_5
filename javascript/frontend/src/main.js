import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router.js'
import { loadCatalog } from './state/catalog.js'
import { loadCurrentUser } from './state/auth.js'
import '@fontsource/fraunces/600.css'
import '@fontsource/source-sans-3/400.css'
import '@fontsource/source-sans-3/600.css'
import './style.css'

await loadCurrentUser()
await loadCatalog()
createApp(App).use(router).mount('#app')
