import React, { Component } from 'react'
import fetch from 'isomorphic-fetch'
import Metric from './metric'
import moment from 'moment'

class Agent extends Component {
  constructor (props) {
    super(props)
    this.state = { agent: {}, metrics: [], booMetric: false }
    this.toggleMetric = this.toggleMetric.bind(this)
  }
  render () {
    const { agent, booMetric, metrics } = this.state
    console.log(this.state)
    return (
      <div>
        <div className='agent'>
          <h3>{agent.name} ({agent.pid})</h3>
          <h5>{agent.hostname}</h5>
          <h5>connected: { agent.connected ? 'true' : 'false' }</h5>
          <h5>Fecha: { moment(agent.createdAt, "YYYYMMDD").fromNow() }</h5>
          <a onClick={this.toggleMetric} className='waves-effect waves-light btn boton'>Ver metricas</a>
        </div>
        {
          booMetric ? (
            <div>
              {
                metrics.length ? (
                  <div>
                    {
                      metrics.map((m, i) => {
                        return (
                          <Metric
                            socket={this.props.socket}
                            key={i}
                            uuid={this.props.uuid}
                            type={m.type}
                            id={m.type}
                          />
                        )
                      })
                    }
                  </div>
                )
                : 'El agent No tiene Metricas'
              }
            </div>
          ) : null
        }
      </div>
    )
  }

  toggleMetric () {
    this.setState({
      booMetric: !this.state.booMetric
    })
  }

  componentWillMount () {
    const { uuid } = this.props

    try {
      fetch(`http://localhost:8080/agent/${uuid}`)
        .then(res => {
          return res.json()
        })
        .then(res => {
          this.setState({ agent: res[0] })
        })
    } catch (err) {
      return console.error(err)
    }
  }

  realTimeInit(){
    const { uuid, socket } = this.props
    const { agent } = this.state

    socket.on('agent/disconnected', payload => {
      if(payload.agent.uuid === uuid){
        agent.connected = false
        this.setState({
          agent
        })
      }
    })
  }

  componentDidMount () {
    const { uuid } = this.props

    try {
      fetch(`http://localhost:8080/metrics/${uuid}`)
        .then(res => {
          return res.json()
        })
        .then(res => {
          this.setState({ metrics: res })
        })
    } catch (err) {
      return console.error(err)
    }

    this.realTimeInit()
  }
}

module.exports = Agent
