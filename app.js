'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const fastify = require('fastify')()
const userVerfiy = require('./service/user_service')
const config = require('config');


module.exports = async function (fastify, opts) {
  // Place here your custom code!

  fastify.register(require('fastify-cors'), (instance) => (req, callback) => {
    let corsOptions;
    const frontendHost = config.get('endpoint.frontend.host');
    console.log(frontendHost);
    if(frontendHost == "https://quizpre.orangelabschina.cn") {
      corsOptions = { origin: [frontendHost, "http://127.0.0.1:3000"],  credentials: true, allowedHeaders: ["Cookie", "cookie", "X-Requested-With", "X-Prototype-Version", "Content-Type", "Origin", "Allow"], preflightContinue: true}
    } else {
      corsOptions = { origin: [frontendHost], credentials: true, allowedHeaders: ["cookie", "X-Requested-With", "X-Prototype-Version", "Content-Type", "Origin", "Allow"], preflightContinue: true}
    }
   
    callback(null, corsOptions)
  })

  fastify.register(require('fastify-cookie'))

  fastify.register(require('fastify-raw-body'), {
    field: 'rawBody', 
    global: false, 
    encoding: 'utf8', 
    runFirst: true, 
    routes: [] 
  })

  fastify.addHook('onRequest', async (request, reply) => {
    if(request.routerPath == '/user/login') {
      return
    }
    let user = false;
    if(request.headers.cookie) {
      let token = request.cookies.orange_quiz_token
      user = await userVerfiy.verifyToken(token, false)
    }
    if(!user) {
      reply.statusCode = 401
      return new Error("user not authorized") 
    }
    request.headers.user = user;
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
