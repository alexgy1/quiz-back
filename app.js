'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const fastify = require('fastify')()
const userVerfiy = require('./service/user_service')

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  fastify.register(require('fastify-cors'), (instance) => (req, callback) => {
    let corsOptions;
    corsOptions = { origin: ["*"], credentials: true, allowedHeaders: ["cookie", "X-Requested-With", "X-Prototype-Version", "Content-Type", "Origin", "Allow"], preflightContinue: true}
    callback(null, corsOptions)
  })

  fastify.register(require('fastify-raw-body'), {
    field: 'rawBody', 
    global: false, 
    encoding: 'utf8', 
    runFirst: true, 
    routes: [] 
  })

  fastify.addHook('onRequest', async (request, reply) => {
    // if(request.routerPath == '/user/login') {
    //   return
    // }
    // let user = false;
    // if(request.headers.cookie) {
    //   user = await userVerfiy.verifyToken(request.headers.cookie.split("=")[1], false)
    // }
    // if(!user) {
    //   reply.statusCode = 400
    //   return new Error("user not authorized") 
    // }
    request.headers.user = {id: "61c2e9fee95cb68085e36ef0", email: "cheng.chen@orange.com"};
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
