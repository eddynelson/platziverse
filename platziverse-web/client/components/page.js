import React, { Component } from 'react'
import startSocket from 'socket.io-client'
import Agent from './agent'
import fetch from 'isomorphic-fetch'

const socket = startSocket()

class Page extends Component {
  constructor (props) {
    super(props)
    this.state = { agents: [] }
  }

  render () {
    const { agents } = this.state

    return (
      <div className='col s12 m2 z-depth-3 agentContainer'>
        {
          agents.map(agent => {
            return (
              <Agent
                uuid={agent.uuid}
                key={agent.uuid}
                socket={socket}
              />
            )
          })
        }
      </div>
    )
  }

  componentDidMount(){
    try{
      fetch(`http://localhost:8080/agents`)
        .then(res => {
          return res.json()
        }).then(payload => {
          this.setState({
            agents: payload
          })
        })
    }catch(err){
      console.error(err)
    }

    socket.on('agent/connected', payload => {
      const { uuid } = payload.agent.uuid

      const existing = this.state.agents.find(a => a.uuid === uuid)

      if(!existing){
        this.setState({
          agents: this.state.agents.push(payload.agent)
        })
      }
    })
  }
}

module.exports = Page
