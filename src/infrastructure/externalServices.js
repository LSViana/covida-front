import {isProduction} from '@/infrastructure/environment'

export default {
  openCage: {
    key: '8465c928b1fd4ac2b63f5138f3e6bcf7',
    root: 'https://api.opencagedata.com/geocode/v1/json'
  },
  covida: {
    token: '',
    root: isProduction() ?
      'https://covida-back.herokuapp.com/api/v1' :
      'https://localhost:5001/api/v1'
  }
}
