import { render, h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import to from 'await-to-js'

import DeroBridgeApi from '../src'

const App = () => {
  const [bridgeInitText, setBridgeInitText] = useState('')

  useEffect(async () => {
    const deroBridgeApi = new DeroBridgeApi()
    const [err] = await to(deroBridgeApi.init())
    if (err) {
      setBridgeInitText('failed to connect to extension')
    } else {
      setBridgeInitText('connected to extension')
      const res = await deroBridgeApi.deamonRPC('Echo')
      console.log(res)
    }
  }, [])

  return <div>{bridgeInitText}</div>
}

render(<App />, document.getElementById('app'))
