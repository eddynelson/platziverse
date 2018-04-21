# platziverse-agent

## usage

``` js
'use strict'

const PlatziverseAgent = require('platziverse-agent')

const agent = new PlatziverseAgent({
  name: 'app-name',
  username: 'user',
  mqtt: {
    host: 'mqtt://test.host.com'
  },
  interval: 2000
})

agent.connect()

agent.addMetric('rss', function getRss(){
  return process.memoryUsage().rss
})

agent.addMetric('promiseMetric', function getPrimiseRandom(){
  return Promise.resolve(Math.random())
})

agent.addMetric('callback', function getCallback(callback){
  setTimeout(() => {
    callback(null, Math.random())
  }, 2000)
})

//this agent only
agent.on('connected', handle)
agent.on('disconnected', handle)
agent.on('message', handle)

agent.on('agent/connected', handle)
agent.on('agent/disconnected', handle)
agent.on('agent/message', handle)

function handle(payload){
  console.log(payload)
}

setTimeout(() => agent.disconnect(), 20000)

```
