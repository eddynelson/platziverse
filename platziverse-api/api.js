'use strict'

const debug = require('debug')('platziverse:api:routers')
const express = require('express')
const asyncify = require('express-asyncify')
const dbSetup = require('../platziverse-db')
const auth = require('express-jwt')
const config = require('../platziverse-db/db-config')(false)
const jwtConfig = require('./config')
const guard = require('express-jwt-permissions')()

let db, Agent, Metric
const api = asyncify(express.Router())

api.use('*', async (req, res, next) => {
  if (!db) {
    try {
      db = await dbSetup(config)
    } catch (err) {
      next(err)
    }

    Agent = db.Agent
    Metric = db.Metric
  }
  next()
})

api.get('/agents', auth(jwtConfig.auth), async (req, res, next) => {
  debug(req.path)

  const { user } = req

  if (!user || !user.username) {
    return next(new Error('not authotized'))
  }

  let agents

  try {
    if (user.admin) {
      agents = await Agent.findByConnected()
    } else {
      agents = await Agent.findByUsername(user.username)
    }
  } catch (err) {
    debug(err.message)
    return next(err)
  }

  if (!agents || agents.length === 0) {
    debug(new Error(`${agents}agents not found!! in router ${req.path}`))
    return next(new Error(`agents not found!! in router ${req.path}`))
  }

  res.status(200).send(agents)
})

api.get('/agent/:uuid', async (req, res, next) => {
  debug(req.path)
  const { uuid } = req.params
  let agent

  try {
    agent = await Agent.findByUuid(uuid)
  } catch (err) {
    debug(err.message)
    return next(err)
  }

  if (!agent || agent.length === 0) {
    return next(new Error(`Agent not found!! In router ${req.path}`))
  }

  res.status(200).send(agent)
})

api.get('/metrics/:uuid', auth(jwtConfig.auth), guard.check(['metrics:read']), async (req, res, next) => {
  debug(req.path)
  const { uuid } = req.params
  let metrics

  try {
    metrics = await Metric.findByAgentUuid(uuid)
  } catch (err) {
    debug(err.message)
    return next(err)
  }

  if (!metrics || metrics.length === 0) {
    return next(new Error(`Metric not found!! for agent ${uuid}`))
  }

  res.status(200).send(metrics)
})

api.get('/metrics/:uuid/:type', auth(jwtConfig.auth), guard.check(['metrics:read']), async (req, res, next) => {
  debug(req.path)
  const { uuid, type } = req.params
  let metrics

  const agent = await Agent.findByUuid(uuid)
  if (!agent || agent.length !== 0) {
    try {
      metrics = await Metric.findByTypeAgentUuid(type, uuid)
    } catch (err) {
      debug(err.message)
      return next(err)
    }
  }

  if (!metrics || metrics.length === 0) {
    return next(new Error(`metrics or agent not found in router ${req.path}`))
  }

  res.status(200).send(metrics)
})

module.exports = api
