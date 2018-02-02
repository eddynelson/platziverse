'use strict'

const http = require('http')
const express = require('express')
const chalk = require('chalk')
const api = require('./api')
const asyncify = require('express-asyncify')
const debug = require('debug')('platziverse:api')

const app = asyncify(express())
const port = process.env.PORT || 3000
const server = http.createServer(app)

app.use('/api', api)

// express error handle
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)

  if (err.message.match(/not found/)) {
    return res.status(404).send({ message: err.message, stack: err.stack })
  }

  res.status(500).send({ message: err.message, stack: err.stack })
})

function handlefatalError (err) {
  console.error(`${chalk.red('[fatal Error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

if (!module.parent) {
  process.on('uncaughtExection', handlefatalError)
  process.on('unhandledRejection', handlefatalError)

  server.listen(port, () => {
    console.log(`${chalk.green('[platziverse-api]')} server listening on port ${port}.`)
  })
}

module.exports = server
