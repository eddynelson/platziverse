'use strict'

const metrics = [{
  type: 'Humedad',
  value: '200',
  agentId: 1,
  createAt: new Date(),
  updateAt: new Date()
},
{
  type: 'Humedad',
  value: '458',
  agentId: 1,
  createAt: new Date(),
  updateAt: new Date()
},
{
  type: 'Humedad',
  value: '586',
  agentId: 1,
  createAt: new Date(),
  updateAt: new Date()
},
{
  type: 'Sond',
  value: '487',
  agentId: 2,
  createAt: new Date(),
  updateAt: new Date()
},
{
  type: 'sond',
  value: '890',
  agentId: 1,
  createAt: new Date(),
  updateAt: new Date()
}
]

module.exports = {
  byAgentId: id => metrics.filter(metric => metric.agentId === id),
  byTypeAgentId: (id, type) => metrics.filter(metric => metric.agentId === id && metric.type === type)
}