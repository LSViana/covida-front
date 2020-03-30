<template>
  <v-row class="home d-flex flex-column" no-gutters>
    <div class="route-wrapper flex-grow-1 d-flex flex-column align-stretch">
      <keep-alive>
        <transition name="scroll-x-transition" mode="out-in">
          <router-view/>
        </transition>
      </keep-alive>
    </div>
    <v-bottom-navigation
      v-model="bottomNavigation"
      fixed
    >
      <v-btn
        value="helps"
        @click="$route.path !== '/home/' && $router.replace('/home/')"
      >
        <span>{{ helps }}</span>
        <v-icon>mdi-message</v-icon>
      </v-btn>
      <v-btn
        value="my-helps"
        @click="$route.path !== '/home/my-helps' && $router.replace('/home/my-helps')"
      >
        <span>{{ myHelps }}</span>
        <v-icon>mdi-hand-heart</v-icon>
      </v-btn>
      <v-btn
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

  export default {
    name: "Home",
    data: () => ({
      bottomNavigation: '',
      ...I18n.names
    })
  }
</script>

<style lang="scss">
  .home {
    height: 100%;

    .route-wrapper {
      position: relative;
      padding-bottom: 56px;

      > * {
        position: absolute;
        width: 100%;
      }
    }
  }
</style>
