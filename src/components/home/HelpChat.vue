<template>
  <p>
    Help Chat {{helpId}}
  </p>
</template>

<script>
  export default {
    name: "HelpChat",
    props: {
      helpId: {
        type: String,
        required: true
      }
    }
  }
</script>

<style scoped>

</style>
