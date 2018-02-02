'use strict'

const PlatziverseAgent = require('./')
const casual = require('casual')

const agent = new PlatziverseAgent({
  name: casual.name,
  username: casual.username,
  mqtt: {
    host: 'mqtt://localhost'
  },
  interval: 2000
})

agent.connect()

agent.addMetric('rss', function getRss () {
  return process.memoryUsage().rss
})

agent.addMetric('promiseMetric', function getPrimiseRandom () {
  return Promise.resolve(Math.random())
})

agent.addMetric('callback', function getCallback (callback) {
  setTimeout(() => {
    callback(null, Math.random())
  }, 2000)
})

// this agent only
agent.on('connected', handle)
agent.on('disconnected', handle)
agent.on('message', handle)

agent.on('agent/connected', handle)
agent.on('agent/disconnected', handle)
agent.on('agent/message', handle)

function handle (payload) {
  console.log(payload)
}
