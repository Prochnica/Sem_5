import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router.js'
import { useAuthStore } from './stores/auth.js'
import { useCatalogStore } from './stores/catalog.js'
import '@fontsource/fraunces/600.css'
import '@fontsource/source-sans-3/400.css'
import '@fontsource/source-sans-3/600.css'
import './style.css'

const app = createApp(App)
app.use(createPinia())
await useAuthStore().loadCurrentUser()
await useCatalogStore().loadCatalog()
app.use(router).mount('#app')
