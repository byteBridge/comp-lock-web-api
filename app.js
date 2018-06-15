
'use strict'

const appConfig = require('./config/app')
const socketIOConfig = require('./config/socket.io')
const routesConfig = require('./config/routes')
const errorConfig = require('./config/error')

const express = require('express')
const app = express()
const http = require('http')

appConfig.mount(app, express)
routesConfig.mount(app)
errorConfig.mount(app)

// mount socket.io after all the setup has been done
const server = http.createServer(app)
socketIOConfig.mount(server)

module.exports = server
