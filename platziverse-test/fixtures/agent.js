'use strict'

const casual = require('casual')
const agents = []

for (let i = 0; i < 10; i++) {
  const obj = {
    id: i + 1,
    uuid: i === 0 ? 'yyy-yyy-yyy' : casual.uuid,
    username: i === 0 ? 'platziverse' : casual.username,
    name: casual.first_name,
    pid: casual.day_of_week,
    connected: casual.boolean,
    hotname: casual.url,
    createdAt: new Date(),
    updateAt: new Date()
  }

  agents[i] = obj
}

module.exports = {
  agents,
  single: agents[0],
  all: () => agents,
  connected: agents.filter(agent => agent.connected),
  byUuid: uuid => agents.filter(agent => agent.uuid === uuid)[0],
  byId: id => agents.filter(agent => agent.id === id)[0],
  byUsername: name => agents.filter(agent => agent.username === name)[0]
}
