<template>
  <div class="d-flex flex-column align-center pa-2">
    <h1 class="title">
      {{ notFound }}
    </h1>
    <div class="pa-2"></div>
    <v-btn
      @click="$router.push('/home')"
      color="primary"
    >
      {{ goHome }}
    </v-btn>
  </div>
</template>

<script>
  import I18n from '@/infrastructure/i18n.en'

  export default {
    name: "NotFound",
    data: () => ({
      ...I18n.errorMessages,
      ...I18n.actions
    })
  }
</script>

<style scoped>

</style>
