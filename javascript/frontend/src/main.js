import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router.js'
import '@fontsource/fraunces/600.css'
import '@fontsource/source-sans-3/400.css'
import '@fontsource/source-sans-3/600.css'
import './style.css'

createApp(App).use(router).mount('#app')
