import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#FF5050',
        secondary: '#ff5096',
        accent: '#8c9eff',
        error: '#ff6400'
      }
    }
  }
})
