'use strict'

const jwt = require('jsonwebtoken')
const secret = require('./config').auth.secret

const token = jwt.sign({ name: 'eddy', year: 17 }, secret)
console.log(token)

setTimeout(() => {
  const data = jwt.verify(token, secret)
  console.log(data)
}, 2000)
