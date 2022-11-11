'use strict'

// Read the .env file.
require('dotenv').config()

// Require the framework
const Fastify = require('fastify')

// Instantiate Fastify with some config
console.log("Start initialisation ...")
const app = Fastify({
  logger: false,
  pluginTimeout: 120000
})

console.log("Before register ...")
// Register your application as a normal plugin.
app.register(require('./app.js'))

console.log("After register ...")
// Start listening.
app.listen(process.env.PORT || 3000, '0.0.0.0', (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})