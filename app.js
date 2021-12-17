'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const fastify = require('fastify')()

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  fastify.register(require('fastify-cors'), (instance) => (req, callback) => {
    let corsOptions;
    corsOptions = { origin: true }
    callback(null, corsOptions)
  })

  fastify.register(require('fastify-raw-body'), {
    field: 'rawBody', 
    global: false, 
    encoding: 'utf8', 
    runFirst: true, 
    routes: [] 
  })

  fastify.addHook('onRequest', (request, reply, done) => {
    //reply.statusCode = 400
    //done(new Error("user not authorized"))
    //TODO do user authroization check
    done()
  })

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}
