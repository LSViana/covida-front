import externalServices from '@/infrastructure/externalServices'

/**
 * Perform a request to OpenCage API to forward geocode the given address
 * @param {String} address
 * @returns {Promise<Response>}
 */
export async function fetchOpenCageByAddress(address = '') {
  return await fetch(
    `${externalServices.openCage.root}?key=${externalServices.openCage.key}&q=${address}`
  )
}

/**
 * Perform a request to OpenCage API to reverse geocode the given coordinates
 * @param latitude
 * @param longitude
 * @returns {Promise<Response>}
 */
export async function fetchOpenCageByCoordinates(latitude, longitude) {
  return await fetch(
    `${externalServices.openCage.root}?key=${externalServices.openCage.key}&q=${latitude},${longitude}`
  )
}

/**
 * Perform a request to Covida API with, if token available, Authorization header
 * @param {String|Request} input
 * @param {RequestInit} init
 * @returns {Promise<Response>}
 */
export async function fetchCovida(
  input = '',
  init
) {
  // Configure headers
  const headers = {...(init && init.headers || {})}
  if (externalServices.covida.token) {
    headers['Authorization'] = `Bearer ${externalServices.covida.token}`
  }
  if (init && init.body) {
    headers['Content-Type'] = `application/json`
  }
  // Send request
  return await fetch(
    `${externalServices.covida.root}${input}`,
    {
      headers,
      ...init
    }
  )
}
