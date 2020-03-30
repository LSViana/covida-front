import {extend} from 'vee-validate'
import {max, min, required} from 'vee-validate/dist/rules'
import I18n from './i18n.en'

extend('required', {
  ...required,
  message: I18n.validationMessages.fieldIsRequired
})

extend('min', {
  ...min,
  message: I18n.validationMessages.fieldIsTooShort
})

extend('max', {
  ...max,
  message: I18n.validationMessages.fieldIsTooLong
})
