'use strict'

const express = require('express')
const asyncify = require('express-asyncify')
const request = require('request-promise-native')
const { endpoint, apiToken } = require('./config')
const debug = require('debug')('platziverse:proxy')

const api = asyncify(express.Router())

api.get('/agents', async (req, res, next) => {
  debug(req.path)

  const options = {
    method: 'GET',
    url: `${endpoint}/api/agents`,
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    json: true
  }

  let agents

  try {
    agents = await request(options)
  } catch (err) {
    return next(err)
  }

  res.status(200).send(agents)
})

api.get('/agent/:uuid', async (req, res, next) => {
  const { uuid } = req.params

  const options = {
    method: 'GET',
    url: `${endpoint}/api/agent/${uuid}`,
    json: true
  }

  let agent = null

  try {
    agent = await request(options)
  } catch (err) {
    next(err)
  }

  res.status(200).send(agent)
})

api.get('/metrics/:uuid', async (req, res) => {
  const { uuid } = req.params

  const options = {
    method: 'GET',
    url: `${endpoint}/api/metrics/${uuid}`,
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    json: true
  }

  let metrics = null

  try {
    metrics = await request(options)
  } catch (err) {
    next(err)
  }

  res.status(200).send(metrics)
})

api.get('/metrics/:uuid/:type', async (req, res) => {
  const { uuid, type } = req.params

  const options = {
    method: 'GET',
    url: `${endpoint}/api/metrics/${uuid}/${type}`,
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    json: true
  }

  let metrics

  try {
    metrics = await request(options)
  } catch (err) {
    next(err)
  }

  res.status(200).send(metrics)
})

module.exports = api
