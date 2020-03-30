import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import vuetify from './plugins/vuetify'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import '@/infrastructure/componentScanner'
import storageKeys from '@/infrastructure/storageKeys'
import externalServices from '@/infrastructure/externalServices'
import {HubConnectionBuilder} from '@microsoft/signalr'

Vue.config.productionTip = false

export const signalRConnection = new HubConnectionBuilder()
  .withUrl(`${externalServices.covida.root}/messages`, {
    accessTokenFactory: () => localStorage.getItem(storageKeys.authorization)
  })
  .build()

new Vue({
  // TODO (LSViana) This approach must be changed to Vuex
  data: {
    user: {
      firstVisit: false,
      isVolunteer: false,
      name: '',
      address: '',
      location: {latitude: 0, longitude: 0}
    }
  },
  methods: {
    saveUserData() {
      // Set user data to localStorage
      localStorage.setItem(storageKeys.user, JSON.stringify(this.user))
    },
    saveToken(token = '') {
      externalServices.covida.token = token
      localStorage.setItem(storageKeys.authorization, token)
    },
    async connectWebSocket() {
      // Start connection
      await signalRConnection.start()
      await signalRConnection.send('SetIsVolunteer', this.user.isVolunteer)
    },
    async disconnectWebSocket() {
      // Stop connection
      await signalRConnection.stop()
    }
  },
  async created() {
    // Load user and authorization, if available
    if (localStorage.getItem(storageKeys.authorization)) {
      externalServices.covida.token = localStorage.getItem(storageKeys.authorization)
      this.user = JSON.parse(localStorage.getItem(storageKeys.user))
      // Connect WebSocket after user is loaded
      await this.connectWebSocket()
    }
  },
  router,
  vuetify,
  render: (h) => h(App)
}).$mount('#app')
