<template>
  <v-app>
    <v-row no-gutters>
      <v-app-bar
        app
        color="primary"
        dark
      >
        <v-btn
          v-if="$route.meta && $route.meta.hasBack"
          icon
          @click="$router.history.go(-1)"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div class="d-flex align-center">
          <h1 class="title">
            {{ name }}
          </h1>
        </div>
        <v-spacer></v-spacer>
      </v-app-bar>
      <v-spacer>
        <v-content>
          <router-view/>
        </v-content>
      </v-spacer>
    </v-row>
    <v-snackbar
      v-model="snackbar"
      :bottom="true"
      :right="true"
      :timeout="5000"
    >
      {{ snackbarText }}
      <v-btn
        dark
        text
        @click="snackbar = false"
      >
        Close
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
  import I18n from '@/infrastructure/i18n.en'
  import storageKeys from '@/infrastructure/storageKeys'
  import '@/infrastructure/veeValidateRules'

  export default {
    name: 'App',
    data: () => ({
      ...I18n.app,
      firstVisit: true,
      snackbar: false,
      snackbarText: ''
    }),
    created() {
      // Initializing state
      this.firstVisit = !Boolean(localStorage.getItem(storageKeys.user))
      if (this.firstVisit) {
        // Going to Welcome if it's first visit
        this.$router.push('/welcome')
      } else {
        // Going to Home/MyHelps if it's not first visit
        if (this.$root.user.isVolunteer) {
          this.$router.push('/home')
        } else {
          this.$router.push('/home/my-helps')
        }
      }
      // Setting page title
      document.title = 'Covida'
    },
    methods: {
      showSnackbar(message = '') {
        this.snackbarText = message
        this.snackbar = true
      }
    }
  }
</script>

<style lang="scss">
  html {
    overflow-y: hidden !important;
  }

  main {
    min-height: 100vh;
  }
</style>
