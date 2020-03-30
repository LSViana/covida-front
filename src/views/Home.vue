<template>
  <v-row class="home d-flex flex-column" no-gutters>
    <div class="route-wrapper flex-grow-1 d-flex flex-column align-stretch">
      <keep-alive>
        <transition name="scroll-x-transition" mode="out-in">
          <router-view/>
        </transition>
      </keep-alive>
    </div>
    <v-card class="input-container px-6 py-0 d-flex align-center"
            v-if="$route.meta && $route.meta.hasInput"
    >
      <v-row
        align="center"
        no-gutters
      >
        <v-spacer>
          <v-text-field
            solo
            hide-details
            v-model="message"
            @keydown.enter="onSendMessage()"
          />
        </v-spacer>
        <div class="px-2"></div>
        <v-btn
          icon
          x-large
          @click="onSendMessage()"
        >
          <v-icon color="primary">mdi-send</v-icon>
        </v-btn>
      </v-row>
    </v-card>
    <v-bottom-navigation
      v-model="bottomNavigation"
      height="72"
      fixed
      v-else
    >
      <v-btn
        v-if="$root.user.isVolunteer"
        value="helps"
        @click="$route.path !== '/home/' && $router.replace('/home/')"
      >
        <span>{{ helps }}</span>
        <v-icon>mdi-message</v-icon>
      </v-btn>
      <v-btn
        v-if="!$root.user.isVolunteer"
        value="ask-for-help"
        @click="$route.path !== '/home/ask-for-help' && $router.replace('/home/ask-for-help')"
      >
        <span>{{ request }}</span>
        <v-icon>mdi-message</v-icon>
      </v-btn>
      <v-btn
        value="my-helps"
        @click="$route.path !== '/home/my-helps' && $router.replace('/home/my-helps')"
      >
        <span>{{ $root.user.isVolunteer ? myHelps : myRequests }}</span>
        <v-icon>mdi-hand-heart</v-icon>
      </v-btn>
      <v-btn
        v-if="false /* Will be reenabled later */"
        value="profile"
        @click="$route.path !== '/home/profile' && $router.replace('/home/profile')"
      >
        <span>{{ profile }}</span>
        <v-icon>mdi-account</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-row>
</template>

<script>
  import I18n from '@/infrastructure/i18n.en'
  import {fetchCovida} from '@/infrastructure/fetchServices'

  export default {
    name: "Home",
    data: () => ({
      bottomNavigation: '',
      message: '',
      ...I18n.names,
      ...I18n.actions
    }),
    methods: {
      async onSendMessage() {
        const response = await fetchCovida('/help/send-message-chat', {
          method: 'POST',
          body: JSON.stringify({
            helpId: this.$route.params.helpId,
            text: this.message
          })
        })
        this.message = ''
        if (response.status === 200) {
          // Success
        } else {
          this.$root.$children[0].showSnackbar(this.i18n.connectionError)
        }
      }
    }
  }
</script>

<style lang="scss">
  .home {
    height: 100%;

    .route-wrapper {
      position: relative;
      padding-bottom: 72px;

      > * {
        position: absolute;
        width: 100%;
      }
    }

    .input-container {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 72px;
    }
  }
</style>
