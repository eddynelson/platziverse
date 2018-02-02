'use strict'

const http = require('http')
const express = require('express')
const chalk = require('chalk')
const debug = require('debug')('platziverse:web:server')
const path = require('path')
const socketio = require('socket.io')
const PlatziverseAgent = require('../platziverse-agent')
const { pipe } = require('./utils')
const proxy = require('./proxy')
const asyncify = require('express-asyncify')

const app = asyncify(express())
const server = http.createServer(app)
const PORT = process.env.PORT || 8080
const io = socketio(server)
const agent = new PlatziverseAgent()

// Error express
app.use((err, req, res, next) => {
  debug(`Error ${err}`)

  if (err.message.match(err, /not found/)) {
    res.status(404).send({ error: err.message, stack: err.stack})
  }

  res.status(500).send({ error: err.message, stack: err.stack})
})

app.use(express.static(path.join(__dirname, 'public')))
app.use('/', proxy)

io.on('connection', socket => {
  debug(`Connected: ${socket.id}`)
  pipe(agent, socket)
})

function handleFatalError (err) {
  console.error(`${chalk.red(`[Fatal Error]`)} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

process.on('uncaugthExeption', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(PORT, () => {
  console.log(`${chalk.green(`[platziverse-web]`)} Server running on port ${PORT}`)
  agent.connect()
})
