import './assets/main.css'
import { config } from '/src/firebaseResources'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initializeApp, getApps } from 'firebase/app'

if (!getApps().length) {
  initializeApp(firebaseConfig)
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')