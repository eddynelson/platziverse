import React, { Component } from 'react'
import Line from './line'
import moment from 'moment'
import fetch from 'isomorphic-fetch'

class Metric extends Component {
  constructor (props) {
    super(props)
    this.state = { data: [], labels: [], title: null }
  }
  render () {
    return (
      <div>
        <Line backgroundColor={this.props.backgroundColor || '#F7F39A'}
          borderColor={this.props.borderColor || '#239D60'}
          labels={this.state.labels}
          data={this.state.data}
          title={this.state.title}
          id={this.props.id}
        />
      </div>
    )
  }

  async componentDidMount () {
    const { uuid, type } = this.props

    let result
    const labels = [], data = []

    try {
      const res = await fetch(`http://localhost:8080/metrics/${uuid}/${type}`)
      result = await res.json()

      console.log(result)
    } catch (err) {
      return console.error(err)
    }

    if (!Array.isArray(result)) {
      return console.error(new Error('Los datos no son los esperados'))
    }

    result.forEach(m => {
      labels.push(moment(m.createdAt).format('HH:mm:ss'))
      data.push(m.value)
    })

    this.setState({
      labels,
      data,
      title: result[0].type
    })

    this.startRealTime()
  }

  shouldComponentUpdate (nextProps, nextState) {
    return this.state.data != nextState.data
  }

  startRealTime () {
    const { socket, type, uuid } = this.props

    socket.on('agent/message', payload => {
      console.log('agent/message')
      if (payload.agent.uuid === uuid) {
        const metric = payload.metrics.find(m => m.type === type)

        const { data, labels } = this.state

        if (data.length >= 20) {
          data.shift()
          labels.shift()
        }

        data.push(metric.value)
        labels.push(moment(metric.createdAt).format('HH:mm:ss'))

        this.setState({
          data,
          labels
        })
      }
    })
  }
}

module.exports = Metric
