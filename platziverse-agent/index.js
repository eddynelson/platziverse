'use strict'

const EventEmitter = require('events')
const debug = require('debug')('platziverse:agent')
const defaults = require('defaults')
const util = require('util')
const mqtt = require('mqtt')
const uuid = require('uuid')
const os = require('os')
const { parsePayload } = require('../platziverse-mqtt/utils')

const options = {
  name: 'undefined',
  usename: 'undefined',
  interval: 2000,
  mqtt: {
    host: 'mqtt://localhost'
  }
}

class PlatziverseAgent extends EventEmitter {
  constructor (opts) {
    super()
    this._timer = null
    this._options = defaults(opts, options)
    this._started = false
    this._agentId = null
    this._client = null
    this._metrics = new Map()
  }

  addMetric (type, fn) {
    this._metrics.set(type, fn)
  }

  removeMetric (type) {
    this._metrics.delete(type)
  }
  connect () {
    if (!this._started) {
      this._started = true
      const opts = this._options
      console.log(this._options)
      this._client = mqtt.connect(opts.mqtt.host)

      this._client.subscribe('agent/message')
      this._client.subscribe('agent/connected')
      this._client.subscribe('agent/disconnected')

      this._client.on('connect', () => {
        this._agentId = uuid.v4()
        debug(this._agentId)
        this.emit('connected', this._agentId)

        this._timer = setInterval(async () => {
          if (this._metrics.size > 0) {
            let message = {
              agent: {
                name: opts.name,
                username: opts.username,
                hostname: os.hostname() || 'localhost',
                uuid: this._agentId,
                pid: process.pid
              },
              metrics: [],
              timestamp: new Date().getTime()
            }

            for (let [ type, fn ] of this._metrics) {
              if (fn.length === 1) {
                fn = util.promisify(fn)
              }

              message.metrics.push({
                type,
                value: await Promise.resolve(fn())
              })
            }

            debug('send', message)
            this._client.publish('agent/message', JSON.stringify(message))
            this.emit('message', message)
          }
        }, opts.interval)
      })

      this._client.on('message', (topic, payload) => {
        payload = parsePayload(payload)

        let broadcast = false
        switch (topic) {
          case 'agent/message':
          case 'agent/connected':
          case 'agent/disconnected':
            broadcast = payload && payload.agent && payload.agent.uuid !== this._agentId
            break
        }

        if (broadcast) {
          this.emit(topic, payload)
        }
      })

      this._client.on('error', () => this.disconnect())
    }
  }

  disconnect () {
    if (this._started) {
      clearInterval(this._timer)
      this._started = false
      this.emit('disconnected', this._agentId)
      this._client.end()
    }
  }
}

module.exports = PlatziverseAgent
