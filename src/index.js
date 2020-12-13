import React from './package/react/react'
import ReactDOM from './package/react-dom/react-dom'

class Liu extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div>
        <h1>1111</h1>
        <h2>2222</h2>
        <h3>3333<span>4444</span></h3>
      </div>
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return <div style={{ color: 'red'}}>
        111
        <Liu />
      </div>
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));
