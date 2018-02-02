import React, { Component } from 'react'
import Chart from 'chart.js'

const chartContainer = {
  position: 'relative',
  height: '30vh',
  width: '60vw',
  borderWidth: '20px',
  margin: '30px',
  marginLeft: '300px'
}

class Line extends Component {
  constructor (props) {
    super(props)
    this.state = { count: 0 }
  }
  render () {
    return (
      <div className='chart-container'>
        <canvas id={this.props.id} />
      </div>
    )
  }

  componentWillUnMount () {
    clearInterval(this._timer)
  }

  componentDidMount () {
    var ctx = document.getElementById(this.props.id)

    this._timer = setInterval(() => {
      console.log(`Line Component: ${this.props.data}`)

      var myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.props.labels,
          datasets: [{
            label: 'Valores de metricas',
            data: this.props.data,
            backgroundColor: [
              this.props.backgroundColor
            ],
            borderColor: [
              this.props.borderColor
            ],
            borderWidth: 5
          }]
        },
        options: {
          title: {
            display: true,
            text: this.props.title || 'Metrica',
            fontSize: 25
          }
        }
      })

      this.setState({ count: this.state.count + 1 })
    }, 2000)
  }
}

module.exports = Line
