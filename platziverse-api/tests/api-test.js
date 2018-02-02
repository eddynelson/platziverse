'use strict'

const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
const util = require('util')
const proxyquire = require('proxyquire')
const { agent, metric } = require('platziverse-test')
const auth = require('../auth')
const sign = util.promisify(auth.sign)

let tokenAdmin = null
let tokenNoAdmin = null
const metricType = 'Humedad'
const uuid = 'yyy-yyy-yyy'
const username = 'platziverse'
let server = null
let sandbox = null
let dbStub = null
let AgentStub = {}
let MetricStub = {}

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()

  // AgentStub for findByConnect and findByUsername
  AgentStub.findByConnected = sandbox.stub()
  AgentStub.findByConnected.returns(Promise.resolve(agent.connected))

  AgentStub.findByUsername = sandbox.stub()
  AgentStub.findByUsername.withArgs(username).returns(Promise.resolve(agent.byUsername(username)))

  // AgentStub for findByUuid
  AgentStub.findByUuid = sandbox.stub()
  AgentStub.findByUuid.withArgs(uuid).returns(Promise.resolve(agent.byUuid(uuid)))

  // MetricStub for findByAgentUuid
  MetricStub.findByAgentUuid = sandbox.stub()
  MetricStub.findByAgentUuid.withArgs(uuid).returns(Promise.resolve(metric.byAgentId(agent.byUuid(uuid).id)))

  // MetricStub for findByTypeAgentUuid
  MetricStub.findByTypeAgentUuid = sandbox.stub()
  MetricStub.findByTypeAgentUuid.withArgs(metricType, uuid).returns(Promise.resolve(metric.byTypeAgentId(agent.byUuid(uuid).id, metricType)))
  // tokens
  tokenAdmin = await sign({ username, admin: true, permissions: ['metrics:read'] }, 'platziverse')
  tokenNoAdmin = await sign({ username }, 'platziverse')

  dbStub = sandbox.stub()
  dbStub.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))

  const api = proxyquire('../api', {
    '../platziverse-db': dbStub
  })

  server = proxyquire('../server', {
    './api': api
  })
})

test.afterEach(async () => {
  if (sandbox) sandbox = sinon.sandbox.restore()
})

test.serial.cb('/api/agents', t => {
  request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .expect('X-Powered-By', /Express/)
    .end((err, res) => {
      t.falsy(err, `Hay un error en la ruta /api/agents`)

      const body = JSON.stringify(res.body)
      const agentConnected = JSON.stringify(agent.connected)

      t.deepEqual(body, agentConnected, `La respuesta ${res.body.message}, no es la correcta `)
      t.end()
    })
})

test.serial.cb('/api/agents - not admin', t => {
  request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${tokenNoAdmin}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .expect('X-Powered-By', /Express/)
    .end((err, res) => {
      t.falsy(err, 'No puede ocurrir un error en la ruta /api/agents')

      const body = JSON.stringify(res.body)
      const data = JSON.stringify(agent.byUsername(username))

      t.deepEqual(body, data, 'Los datos tienen que ser correcto en la ruta /api/agents')
      t.end()
    })
})

test.serial.cb('/api/agent/:uuid', t => {
  request(server)
    .get('/api/agent/yyy-yyy-yyy')
    .expect(200)
    .expect('Content-Type', /json/)
    .expect('X-Powered-By', /Express/)
    .end((err, res) => {
      t.falsy(err, 'No puede haber un error en la ruta /api/agent/yyy-yyy-yyy')

      const body = JSON.stringify(res.body)
      const data = JSON.stringify(agent.byUuid(uuid))

      t.deepEqual(body, data, 'Los datos que retorna la ruta /api/agent/yyy-yyy-yyy tienen que ser correcto')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid', t => {
  request(server)
    .get(`/api/metrics/${uuid}`)
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .expect('X-Powered-By', /Express/)
    .end((err, res) => {
      t.falsy(err, 'No puede ocurrir un error en la ruta /api/metric/' + uuid)

      const body = JSON.stringify(res.body)
      const data = JSON.stringify(metric.byAgentId(agent.byUuid(uuid).id))

      t.deepEqual(body, data, `Los datos tienen que ser correctos en la ruta /api/metrics${uuid}/${metricType}`)
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid - not permissions', t => {
  request(server)
    .get(`/api/metrics/${uuid}`)
    .set('Authorization', `Bearer ${tokenNoAdmin}`)
    .expect(500)
    .expect('Content-Type', /json/)
    .expect('X-Powered-By', /Express/)
    .end((err, res) => {
      t.falsy(err, 'No puede ocurrir un error en la ruta /api/metric/' + uuid)
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid/:type', t => {
  request(server)
    .get(`/api/metrics/${uuid}/${metricType}`)
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .expect('X-Powered-By', /Express/)
    .end((err, res) => {
      t.falsy(err, 'No puede ocurrir un error en la ruta /api/metric/' + uuid)

      const body = JSON.stringify(res.body)
      const data = JSON.stringify(metric.byTypeAgentId(agent.byUuid(uuid).id, metricType))

      t.deepEqual(body, data, `Los datos de la ruta /api/metric/${uuid}/${metricType}`)
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid/:type - not permissions', t => {
  request(server)
    .get(`/api/metrics/${uuid}/${metricType}`)
    .set('Authorization', `Bearer ${tokenNoAdmin}`)
    .expect(500)
    .expect('Content-Type', /json/)
    .expect('X-Powered-By', /Express/)
    .end((err, res) => {
      t.falsy(err, 'No puede ocurrir un error en la ruta /api/metric/' + uuid)
      t.end()
    })
})
