<template>
  <div ref="helpChat" class="help-chat pa-6">
    <transition name="scroll-x-transition" mode="out-in">
      <v-progress-circular v-if="messagesLoading" indeterminate color="primary"/>
      <p v-else-if="messages.length === 0">
        {{ i18n.noDataAvailable }}
      </p>
      <v-row v-else>
        <v-col
          cols="12"
          v-for="message in messages"
          :key="message.id"
        >
          <v-row
            :justify="message.authorName === $root.user.name ? 'end' : 'start'"
          >
            <v-card>
              <v-card-text>
                <p class="subtitle">
                  {{ message.authorName }}
                </p>
                <span class="body-1">
                  {{ message.text }}
                </span>
              </v-card-text>
            </v-card>
          </v-row>
        </v-col>
      </v-row>
    </transition>
  </div>
</template>

<script>
  import {signalRConnection} from '@/main'
  import I18n from '@/infrastructure/i18n.en'
  import {fetchCovida} from '@/infrastructure/fetchServices'

  export default {
    name: "HelpChat",
    props: {
      helpId: {
        type: String,
        required: true
      }
    },
    data: () => ({
      i18n: {
        ...I18n.errorMessages
      },
      messages: [],
      messagesLoading: false
    }),
    updated() {
      this.scrollDown()
    },
    methods: {
      async scrollDown() {
        // Awaiting for next frame
        await new Promise(res => setTimeout(res, 500))
        /** @var {HTMLDivElement} */
        const helpChat = this.$refs.helpChat
        helpChat.scroll({
          top: helpChat.scrollHeight,
          behavior: 'smooth'
        })
      },
      async onMessage(authorId, messageId, authorName, text) {
        this.messages.push({
          messageId,
          authorName,
          text
        })
      }
    },
    async mounted() {
      // Connecting SignalR
      await signalRConnection.send("JoinChat", this.helpId)
      signalRConnection.on("message", this.onMessage)
      // Get current messages
      const response = await fetchCovida(`/help/help-messages/${this.helpId}?pageSize=100`)
      if (response.status === 200) {
        const responseData = await response.json()
        /** @var {[]} */
        const freshMessages = responseData.items
        freshMessages.reverse()
        this.messages = [
          ...freshMessages,
          ...this.messages
        ]
        await this.scrollDown()
      } else {
        this.$root.$children[0].showSnackbar(this.i18n.connectionError)
      }
    },
    beforeDestroy() {
      // Disconnecting SignalR
      signalRConnection.send("LeaveChat", this.helpId)
    }
  }
</script>

<style lang="scss">
  .help-chat {
    height: calc(100% - 72px);
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
