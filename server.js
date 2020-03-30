// This script will be used to start the application in Heroku
const express = require('express')
const serveStatic = require('serve-static')
const history = require('connect-history-api-fallback')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')

const app = express()

//Here the security headers are set
app.use(helmet())

app.use(helmet.featurePolicy({
  features: {
    camera: ["'self'"]
  }
}))

app.use(helmet.referrerPolicy({
    policy: 'no-referrer'
  })
)

// This has a default behavior to serve files when they are asked from '/'
app.use(serveStatic(__dirname + "/dist"))

// This redirects a http request to https
app.use(function (req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''))
  }
  return next()
})

// At this point app is configured for use SPA history mode
// The first option disables the need for 'login.html', so you may use 'login'
// The second option actives the logging for the plugin
app.use(history({
  disableDotRule: true,
  verbose: true
}))

//This is required for resolve index.html after history redirects there
app.use(serveStatic(__dirname + "/dist"))

// The expression 'process.env.port' allows us to supply a custom port from command line
const port = process.env.PORT || 5000

app.listen(port)

console.log(`Application is running in port ${port}`)
