'use strict'

const parseJSON = require('parse-json')
function parsePayload (payload) {
  if (payload instanceof Buffer) {
    payload = payload.toString('utf8')
  }

  try {
    payload = parseJSON(payload)
  } catch (err) {
    payload = null
  }

  return payload
}

module.exports = {
  parsePayload
}
