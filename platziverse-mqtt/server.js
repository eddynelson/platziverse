'use strict'

const debug = require('debug')('platziverse:mqtt')
const chalk = require('chalk')
const redis = require('redis')
const mosca = require('mosca')
const db = require('../platziverse-db')
const config = require('../platziverse-db/db-config')(false)
const { parsePayload } = require('./utils')

let Metric, Agent
let clients = new Map()

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

const setting = {
  port: 1883,
  backend
}

const server = new mosca.Server(setting)

server.on('clientConnected', client => {
  debug(`client: ${client.id}`)
  clients.set(client.id, null)
})

server.on('clientDisconnected', async client => {
  debug(`clientDisconnected: ${client.id}`)

  const agent = clients.get(client.id)
  console.log(chalk.cyan(agent))

  if (agent) {
    agent.connected = false

    try {
      await Agent.createOrUpdate(agent)
    } catch (err) {
      return handleError(err)
    }

    server.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })

    debug(`El cleint ${client.id} del agente ${agent.uuid} se marco como desconectado`)
  }

  clients.delete(client.id)
})

server.on('published', async (packet, client) => {
  debug('publish')
  debug(`Receibe: ${packet.topic}`)

  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      debug(packet.payload)
      break
    case 'agent/message':
      debug(`payload: ${packet.payload}`)
      const payload = parsePayload(packet.payload)
      let agent

      if (payload) {
        payload.agent.connected = true

        agent = await Agent.createOrUpdate(payload.agent).catch(handleError)
        debug(`agent with ID ${agent.id} this saved`)

        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          server.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                id: agent.id,
                uuid: agent.uuid,
                username: agent.username,
                hostname: agent.hostname,
                pid: agent.pid,
                name: agent.name,
                connected: agent.connected
              }
            })
          })
        }

        // strore metrics
        let query = []

        payload.metrics.forEach(metric => {
          query.push(Metric.create(agent.uuid, metric))
        })

        await Promise.all(query).catch(err => handleError(err))
      }

      break
  }
})

server.on('ready', async () => {
  const service = await db(config).catch(handleFatalError)

  Agent = service.Agent
  Metric = service.Metric

  console.log(chalk.green('Server running!'))
})

server.on('error', handleFatalError)

process.on('uncaughtExeption', handleFatalError)
process.on('unhandledRejection', handleFatalError)

function handleError (err) {
  console.error(`${chalk.red(`[error]`)}: ${err}`)
  console.error(err.stack)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal pop Error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}
