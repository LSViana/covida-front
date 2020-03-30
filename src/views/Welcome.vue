<template>
  <v-container
    class="welcome"
  >
    <transition-group tag="div" name="scroll-x-transition" mode="out-in" class="welcome-steps">
      <v-card v-if="step === 1" :key="1">
        <v-card-title>
        <span>
          {{ iAmHereBecause }}
        </span>
        </v-card-title>
        <v-card-text>
          <v-container
            fluid
          >
            <v-row
              align="center"
              justify="center"
            >
              <v-col cols="12">
                <v-row justify="center">
                  <v-btn
                    class="primary"
                    @click="setIsVolunteer(true)"
                  >
                    {{ iWantToHelp }}
                  </v-btn>
                </v-row>
              </v-col>
              <v-col cols="12">
                <v-row justify="center">
                  <span class="body-1 mx-4">
                  {{ or }}
                </span>
                </v-row>
              </v-col>
              <v-col cols="12">
                <v-row justify="center">
                  <v-btn
                    class="primary"
                    @click="setIsVolunteer(false)"
                  >
                    {{ iNeedHelp }}
                  </v-btn>
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
      <v-card v-else-if="step === 2" :key="2">
        <v-card-title>
          <span>{{ tellMeMoreAboutYou }}</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <validation-observer v-slot="{ invalid }">
                <v-form
                  ref="firstVisitForm"
                  v-model="firstVisitFormValid"
                  :lazy-validation="true"
                  @submit.prevent="submitFirstVisitForm()"
                >
                  <validation-provider name="Name" rules="required|min:2|max:64">
                    <v-text-field
                      v-model="$root.user.name"
                      slot-scope="{ errors, valid }"
                      :error-messages="errors"
                      :success="valid"
                      :label="name"
                      :hint="yourName"
                      aria-required="true"
                      required="true"
                      :counter="64"
                    />
                  </validation-provider>
                  <v-row no-gutters align="center">
                    <v-spacer>
                      <validation-provider name="Address" rules="required|min:6|max:64">
                        <v-text-field
                          v-model="$root.user.address"
                          slot-scope="{ errors, valid }"
                          :error-messages="errors"
                          :success="valid"
                          :label="address"
                          :hint="yourAddress"
                          :disabled="locationLoading"
                          @keydown.enter="geocodeUserAddress()"
                          :counter="64"
                        />
                      </validation-provider>
                    </v-spacer>
                    <span class="mx-1"/>
                    <v-btn
                      :disabled="!locationAllowed || locationLoading"
                      color="primary"
                      icon
                      @click="getUserLocation()"
                    >
                      <v-icon>
                        mdi-crosshairs-gps
                      </v-icon>
                    </v-btn>
                  </v-row>
                  <v-col cols="12">
                    <span class="caption">{{ noDisclosureWarning }}</span>
                  </v-col>
                  <v-row justify="end" no-gutters>
                    <v-btn
                      @click="submitFirstVisitForm()"
                      color="primary"
                      text
                      :disabled="!locationValid || invalid"
                    >
                      {{ begin }}
                    </v-btn>
                  </v-row>
                </v-form>
              </validation-observer>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </transition-group>
  </v-container>
</template>

<script>
  import I18n from '@/infrastructure/i18n.en'
  import {ValidationObserver, ValidationProvider} from 'vee-validate'
  import {
    fetchCovida,
    fetchOpenCageByAddress,
    fetchOpenCageByCoordinates
  } from '@/infrastructure/fetchServices'

  export default {
    name: "Welcome",
    data: () => ({
      ...I18n.welcome,
      ...I18n.names,
      ...I18n.actions,
      step: 1,
      firstVisitFormValid: true,
      locationAllowed: true,
      locationLoading: false,
      locationValid: false
    }),
    components: {
      ValidationProvider,
      ValidationObserver
    },
    methods: {
      setIsVolunteer(isVolunteer = false) {
        this.$root.user.isVolunteer = isVolunteer
        this.step++
      },
      async submitFirstVisitForm() {
        // Create authorization in Covida API
        const covidaResponse = await fetchCovida('/authentication', {
          body: JSON.stringify(this.userToAPIFormat),
          method: 'POST'
        })
        if (covidaResponse.status === 201) {
          const covidaResponseData = await covidaResponse.json()
          // Save user data to localStorage
          this.$root.saveUserData()
          this.$root.saveToken(covidaResponseData.token)
          // Redirect to home page
          this.$router.push('/home/my-helps')
        } else {
          // TODO (LSViana) Add custom handling for authentication error
        }
      },
      async geocodeUserAddress() {
        this.locationLoading = true
        const response = await fetchOpenCageByAddress(this.$root.user.address)
        if (response.status === 200) {
          const responseData = await response.json()
          if (responseData.results.length > 0) {
            const addressGeometry = responseData.results[0].geometry
            this.$root.user.location = {
              latitude: addressGeometry.lng,
              longitude: addressGeometry.lat
            }
            this.locationAllowed = false
            this.locationValid = true
          } else {
            // TODO (LSViana) Add custom handling for no results found
          }
        } else {
          // TODO (LSViana) Add custom handling for request error
        }
        this.locationLoading = false
      },
      getUserLocation() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async position => {
              this.$root.user.location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
              this.locationLoading = true
              await this.getUserAddress()
              this.locationLoading = false
            },
            positionError => {
              this.locationAllowed = false
            },
            {
              enableHighAccuracy: true
            }
          )
        } else {
          this.locationAllowed = false
        }
      },
      async getUserAddress() {
        const response = await fetchOpenCageByCoordinates(
          this.$root.user.location.latitude,
          this.$root.user.location.longitude
        )
        if (response.status === 200) {
          const responseData = await response.json()
          if (responseData.results.length > 0) {
            this.$root.user.address = responseData.results[0].formatted
            this.locationValid = true
          } else {
            // TODO (LSViana) Add custom handling for no results found
          }
        } else {
          // TODO (LSViana) Add custom handling for request error
          this.locationAllowed = false
        }
      }
    },
    computed: {
      userToAPIFormat() {
        return {
          name: this.$root.user.name,
          address: this.$root.user.address,
          isVolunteer: this.$root.user.isVolunteer,
          location: {
            x: this.$root.user.location.longitude,
            y: this.$root.user.location.latitude
          }
        }
      }
    }
  }
</script>

<style lang="scss">
  .welcome {
    max-width: 320px;

    .welcome-steps {
      position: relative;

      > * {
        position: absolute;
      }
    }
  }
</style>
