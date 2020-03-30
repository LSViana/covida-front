<template>
  <div class="pa-3">
    <transition name="scroll-x-transition" mode="out-in">
      <v-progress-circular v-if="helpsLoading" indeterminate color="primary"/>
      <p v-else-if="helps.length === 0">
        {{ i18n.noDataAvailable }}
      </p>
      <v-row v-else>
        <v-col
          cols="12"
          v-for="help in helps"
          :key="help.id"
        >
          <v-card
          >
            <v-card-title>
              <div class="d-flex align-end">
                <span>{{ getDistance({longitude: help.user.location.x,latitude: help.user.location.y}) }}  <span
                  class="body-1">{{ i18n.fromYou }}</span></span>
              </div>
            </v-card-title>
            <v-card-text>
              <span class="caption">
                {{ i18n.createdAt }} {{new Date(help.createdAt).toLocaleString()}}
              </span>
              <v-row>
                <v-col
                  v-for="category in help.categories"
                  :key="category"
                  class="pb-0"
                >
                  <v-chip>
                    {{ category }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-btn
                @click="startHelp(help)"
                text
                color="primary"
              >
                {{ i18n.help }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </transition>
  </div>
</template>

<script>
  import I18n from '@/infrastructure/i18n.en'
  import {signalRConnection} from '@/main'
  import {fetchCovida} from '@/infrastructure/fetchServices'
  import {point} from '@turf/helpers'
  import turfDistance from '@turf/distance'

  export default {
    name: "Helps",
    data: () => ({
      i18n: {
        ...I18n.actions,
        ...I18n.helps,
        ...I18n.errorMessages
      },
      helps: [],
      helpsLoading: false,
      helpsLastFetch: new Date(0),
      initializedOnce: false
    }),
    async created() {
      // Verify if it's the first creation
      if (!this.initializedOnce) {
        // Setting the flag
        this.initializedOnce = true
        // SignalR event handlers
        signalRConnection.off("newHelp", this.addNewHelp)
        signalRConnection.on("newHelp", this.addNewHelp)
        signalRConnection.off("helpAnswered", this.helpAnswered)
        signalRConnection.on("helpAnswered", this.helpAnswered)
      }
      // Verify if it should refetch
      const now = new Date()
      if ((now.getTime() - this.helpsLastFetch.getTime()) > 10 * 60 * 1000) { // 10 minutes
        this.helpsLastFetch = now
        this.helps = []
        // Fetch helps
        const response = await fetchCovida(
          // TODO (LSViana) Improve pagination
          `/help?x=${this.$root.user.location.longitude}&y=${this.$root.user.location.latitude}&pageSize=100`
        )
        if (response.status === 200) {
          const responseData = await response.json()
          this.helps = [
            ...this.helps,
            ...responseData.items
          ]
        }
      }
    },
    methods: {
      /**
       * @param {{latitude: Number, longitude: Number}} location
       */
      getDistance(location) {
        const from = point([location.latitude, location.longitude])
        const to = point([this.$root.user.location.longitude, this.$root.user.location.latitude])
        // Kilometers is the default, but setting ensures the correctness
        const distance = turfDistance(from, to, {units: 'kilometers'})
        if (distance < 1) {
          return `${(distance * 1000).toFixed(0)}m`
        }
        return `${distance.toFixed(2)}km`
      },
      addNewHelp(help) {
        this.helps.push(help)
      },
      helpAnswered(helpId) {
        this.helps = this.helps.filter(x => x.id !== helpId)
      },
      async startHelp(help) {
        const response = await fetchCovida(`/help/answer/${help.id}`)
        if (response.status === 204) {
          // Request worked
        } else {
          this.$root.$children[0].showSnackbar(this.i18n.connectionError)
        }
      }
    }
  }
</script>

<style scoped>

</style>
