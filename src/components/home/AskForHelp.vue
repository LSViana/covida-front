<template>
  <div id="ask-for-help" class="pa-3">
    <v-container class="help-steps">
      <transition name="scroll-x-transition" mode="out-in">
        <v-card v-if="step === 1">
          <v-card-title>
            {{ i18n.whatAreTheCategoriesOfYourNeeds }}
          </v-card-title>
          <v-card-text>
            <v-checkbox
              v-for="helpCategory in helpCategories"
              :key="helpCategory.id"
              :label="helpCategory.name"
              :value="helpCategory.id"
              v-model="selectedHelpCategories[helpCategory.id]"
            />
          </v-card-text>
        </v-card>
        <v-card v-else-if="step === 2">
          <v-card-title>
            {{ i18n.whatAreTheItemsYouNeed }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                cols="12"
              >
                <v-spacer>
                  <v-text-field
                    v-model="helpItem.name"
                    :label="i18n.name"
                    ref="helpItemName"
                    minlength="2"
                    maxlength="256"
                  />
                </v-spacer>
                <v-text-field
                  v-model="helpItem.amount"
                  :label="i18n.amount"
                  type="number"
                  @keydown.enter="addHelpItem()"
                  min="1"
                  max="100"
                />
              </v-col>
              <v-col
                cols="12"
                class="pt-0"
              >
                <v-row justify="end" no-gutters>
                  <v-btn
                    color="primary"
                    @click="addHelpItem()"
                  >
                    {{ i18n.add }}
                  </v-btn>
                </v-row>
              </v-col>
            </v-row>
            <v-data-table
              :headers="headers"
              :items="helpItems"
              hide-default-footer
            >
              <template v-slot:top>
                <v-toolbar flat color="white">
                  <v-toolbar-title>
                    {{ i18n.helpItems }}
                  </v-toolbar-title>
                </v-toolbar>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon
                  small
                  @click="deleteItem(item)"
                >
                  mdi-delete
                </v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </transition>
    </v-container>
    <v-btn
      v-if="step === 2"
      fixed
      bottom
      right
      :style="{transform: 'translateY(calc(-72px - 48px))'}"
      color="primary"
      @click="previousStep()"
    >
      {{ i18n.previous }}
    </v-btn>
    <v-btn
      fixed
      bottom
      right
      :style="{transform: 'translateY(-72px)'}"
      color="primary"
      @click="nextStep()"
    >
      {{ step === 2 ? i18n.finish : i18n.next }}
    </v-btn>
  </div>
</template>

<script>
  import I18n from '@/infrastructure/i18n.en'
  import {fetchCovida} from '@/infrastructure/fetchServices'

  function getFreshHelpItem() {
    return {
      name: '',
      amount: 1
    }
  }

  export default {
    name: "AskForHelp",
    data: () => ({
      i18n: {
        ...I18n.names,
        ...I18n.actions,
        ...I18n.errorMessages,
        ...I18n.askForHelp
      },
      headers: [
        {
          text: 'Name',
          align: 'start',
          sortable: false,
          value: 'name'
        },
        {
          text: 'Amount',
          align: 'end',
          sortable: false,
          value: 'amount'
        },
        {
          text: 'Actions',
          value: 'actions',
          align: 'end',
          sortable: false
        }
      ],
      helpCategories: [],
      selectedHelpCategories: {},
      helpItems: [],
      helpItem: getFreshHelpItem(),
      step: 1
    }),
    created() {
      this.fetchHelpCategories()
    },
    methods: {
      deleteItem(helpItem) {
        this.helpItems = this.helpItems.filter(x => x.id !== helpItem.id)
      },
      addHelpItem() {
        // Add to list
        this.helpItems.push({
          id: new Date().getTime(),
          ...this.helpItem
        })
        // Reset helpItem
        this.helpItem = getFreshHelpItem()
        // Focus on helpItemName node
        this.$refs.helpItemName.focus()
      },
      async fetchHelpCategories() {
        const response = await fetchCovida('/helpcategory?pageSize=1000')
        if (response.status === 200) {
          const responseData = await response.json()
          this.helpCategories = responseData.items
        }
      },
      previousStep() {
        if (this.step === 2) {
          this.step--
        }
      },
      nextStep() {
        if (this.step === 1) {
          this.step++
        } else if (this.step === 2) {
          let isValid = true
          const selectedCategories = Object.keys(this.selectedHelpCategories)
            .filter(x => Boolean(this.selectedHelpCategories[x]))
            .map(x => Number(x))
          if (selectedCategories.length === 0) {
            this.$root.$children[0].showSnackbar(this.i18n.selectOneOrMoreCategories)
            isValid = false
          }
          if (!isValid) {
            return
          }
          if (this.helpItems.length === 0) {
            isValid = false
            this.$root.$children[0].showSnackbar(this.i18n.youMustCreateAtLeastOneHelpItem)
          } else {
            for (const helpItem of this.helpItems) {
              helpItem.amount = Number(helpItem.amount)
              if (helpItem.name.length < 2 || helpItem.amount === 0) {
                isValid = false
                this.$root.$children[0].showSnackbar(this.i18n.allHelpItemsMustHaveAName)
                break
              }
            }
          }
          if (isValid) {
            const help = {
              categories: selectedCategories,
              items: this.helpItems
            }
            this.createHelp(help)
          }
        }
      },
      async createHelp(help) {
        const response = await fetchCovida('/help/', {
          method: 'POST',
          body: JSON.stringify(help)
        })
        if (response.status === 201) {
          await this.$router.push('/home/my-helps')
        } else {
          this.$root.$children[0].showSnackbar(this.i18n.connectionError)
        }
      }
    }
  }
</script>

<style lang="scss">
  #ask-for-help {
    height: calc(100% - 72px);
    padding-bottom: 112px !important;
    overflow-x: hidden;
    overflow-y: auto;

    .help-steps {
      max-width: 480px;
    }
  }
</style>
