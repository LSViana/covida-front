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
              {{ help.user.name }}
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
              <div class="py-2"></div>
              <v-expansion-panels>
                <v-expansion-panel>
                  <v-expansion-panel-header>{{ i18n.needs }}</v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-checkbox
                      v-for="helpItem in help.helpItems"
                      :key="helpItem.id"
                      v-model="helpItem.complete"
                      :label="helpItem.name"
                      @change="updateHelpItem(helpItem.id, $event)"
                      :disabled="helpItemUpdating"
                    />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
            <v-card-actions>
              <v-btn
                @click="openChat(help.id)"
                text
                color="primary"
              >
                {{ i18n.chat }}
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
  import {fetchCovida} from '@/infrastructure/fetchServices'
  import {signalRConnection} from '@/main'

  export default {
    name: "MyHelps",
    data: () => ({
      i18n: {
        ...I18n.names,
        ...I18n.actions,
        ...I18n.helps,
        ...I18n.errorMessages
      },
      helps: [],
      helpsLoading: false,
      helpItemUpdating: false
    }),
    async created() {
      signalRConnection.off('updateHelpItem', this.updateHelpItemComplete)
      signalRConnection.on('updateHelpItem', this.updateHelpItemComplete)
      // Fetch helps
      const response = await fetchCovida(
        // TODO (LSViana) Improve pagination
        `/help/mine`
      )
      if (response.status === 200) {
        const responseData = await response.json()
        this.helps = [
          ...this.helps,
          ...responseData.items
        ]
      }
    },
    methods: {
      openChat(helpId) {
        this.$router.push(`/home/help-chat/${helpId}`)
      },
      updateHelpItemComplete(helpItemId, complete) {
        helpLoop:
          for (const help of this.helps) {
            for (const helpItem of help.items) {
              if (helpItem.id === helpItemId) {
                console.log('achei')
                helpItem.complete = complete
                // This is a special break to get out of both for(...)
                break helpLoop
              }
            }
          }
      },
      async updateHelpItem(helpItemId, complete) {
        this.helpItemUpdating = true
        const response =
          await fetchCovida(`/help/update-help-item/${helpItemId}/${complete}`)
        if (response.status === 204) {
          // Successful request
        } else {
          this.$root.$children[0].showSnackBar(this.i18n.connectionError)
        }
        this.helpItemUpdating = false
      }
    }
  }
</script>

<style scoped>

</style>
