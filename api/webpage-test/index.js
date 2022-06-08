import React from 'react'
import ReactDOM from 'react-dom'
import to from 'await-to-js'

import DeroBridgeApi from '../src'

const App = () => {
  const deroBridgeApiRef = React.useRef()
  const [bridgeInitText, setBridgeInitText] = React.useState('')

  React.useEffect(() => {
    const load = async () => {
      deroBridgeApiRef.current = new DeroBridgeApi()
      const deroBridgeApi = deroBridgeApiRef.current
      const [err] = await to(deroBridgeApi.init())
      if (err) {
        setBridgeInitText('failed to connect to extension')
      } else {
        setBridgeInitText('connected to extension')
      }
    }

    window.addEventListener('load', load)
    return () => window.removeEventListener('load', load)
  }, [])

  const transfer = React.useCallback(async () => {
    const deroBridgeApi = deroBridgeApiRef.current
    const [err, res] = await to(deroBridgeApi.wallet('start-transfer', {
      scid: "00000000000000000000000000000000",
      destination: "deto1qyg7mqwag7lch9267dttyrxy5jlc8tqwedtel77kpq0zh2zr7rvlsqgs2cz33",
      amount: 100,
    }))

    console.log(err)
    console.log(res)
  }, [])

  const getBalance = React.useCallback(async () => {
    const deroBridgeApi = deroBridgeApiRef.current
    const [err, res] = await to(deroBridgeApi.wallet('get-balance'))
    if (err) alert(err.message)
    else alert(JSON.stringify(res))
  })

  const getAddress = React.useCallback(async () => {
    const deroBridgeApi = deroBridgeApiRef.current
    const [err, res] = await to(deroBridgeApi.wallet('get-address'))
    if (err) alert(err.message)
    else alert(JSON.stringify(res))
  })

  return <div>
    <div>{bridgeInitText}</div>
    <button onClick={transfer}>Send transfer</button>
    <button onClick={getBalance}>Get balance</button>
    <button onClick={getAddress}>Get address</button>
  </div>
}

ReactDOM.render(<App />, document.getElementById('app'))
