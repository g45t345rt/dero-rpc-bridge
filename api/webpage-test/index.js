import { render, h } from 'preact'
import { useEffect, useState, useCallback } from 'preact/hooks'
import to from 'await-to-js'

import DeroBridgeApi from '../src'
const deroBridgeApi = new DeroBridgeApi()

const App = () => {
  const [bridgeInitText, setBridgeInitText] = useState('')

  useEffect(async () => {
    const [err] = await to(deroBridgeApi.init())
    if (err) {
      setBridgeInitText('failed to connect to extension')
    } else {
      setBridgeInitText('connected to extension')
      const res = await deroBridgeApi.deamonRPC('Echo')
      console.log(res)
    }
  }, [])

  const transfer = useCallback(async () => {
    const [err] = await to(deroBridgeApi.walletRPC('Transfer', {
      destination: "deto1qyg7mqwag7lch9267dttyrxy5jlc8tqwedtel77kpq0zh2zr7rvlsqgs2cz33",
      amount: 10000,
    }))

    console.log(err)
  }, [])

  return <div>
    <div>{bridgeInitText}</div>
    <button onClick={transfer}>Send transfer</button>
  </div>
}

render(<App />, document.getElementById('app'))
