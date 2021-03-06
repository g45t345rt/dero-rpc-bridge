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
      scid: '00000000000000000000000000000000',
      destination: 'deto1qyg7mqwag7lch9267dttyrxy5jlc8tqwedtel77kpq0zh2zr7rvlsqgs2cz33',
      amount: 100,
    }))

    console.log(err)
    console.log(res)
  }, [])

  const getWalletBalance = React.useCallback(async () => {
    const deroBridgeApi = deroBridgeApiRef.current
    const [err, res] = await to(deroBridgeApi.wallet('get-balance'))
    if (err) alert(err.message)
    else alert(JSON.stringify(res))
  }, [])

  const getWalletTokenBalance = React.useCallback(async () => {
    const deroBridgeApi = deroBridgeApiRef.current
    const [err, res] = await to(deroBridgeApi.wallet('get-balance', { SCID: '90029633f266d6d520f3415a83a7afeab6e45f5050f1fd703926e5df931f80cf' }))
    if (err) alert(err.message)
    else alert(JSON.stringify(res))
  }, [])

  const getWalletAddress = React.useCallback(async () => {
    const deroBridgeApi = deroBridgeApiRef.current
    const [err, res] = await to(deroBridgeApi.wallet('get-address'))
    if (err) alert(err.message)
    else alert(JSON.stringify(res))
  }, [])

  const getWalletHeight = React.useCallback(async () => {
    const deroBridgeApi = deroBridgeApiRef.current
    const [err, res] = await to(deroBridgeApi.wallet('get-height'))
    if (err) alert(err.message)
    else alert(JSON.stringify(res))
  }, [])

  const getDaemonHeight = React.useCallback(async () => {
    const deroBridgeApi = deroBridgeApiRef.current
    const [err, res] = await to(deroBridgeApi.daemon('get-height'))
    if (err) alert(err.message)
    else alert(JSON.stringify(res))
  }, [])

  const makeIntegratedAddress = React.useCallback(async () => {
    const deroBridgeApi = deroBridgeApiRef.current
    const [err, res] = await to(deroBridgeApi.wallet('make-integrated-address', {
      payload_rpc: [
        {
          name: 'Comment',
          datatype: 'S',
          value: 'Hello from integrated address !'
        }
      ]
    }))
    if (err) alert(err.message)
    else alert(JSON.stringify(res))
  }, [])

  const splitIntegratedAddress = React.useCallback(async () => {
    const deroBridgeApi = deroBridgeApiRef.current
    const [err, res] = await to(deroBridgeApi.wallet('split-integrated-address', {
      integrated_address: 'detoi1qyvyeyzrcm2fzf6kyq7egkes2ufgny5xn77y6typhfx9s7w3mvyd5q9pdppk7mtdv4h8g5mcrayx2mrvdusxvun0d5sxjmn5v4nhyct5v4jzqctyv3ex2umnyqssr5tm0n'
    }))
    if (err) alert(err.message)
    else alert(JSON.stringify(res))
  }, [])

  return <div>
    <div>{bridgeInitText}</div>
    <button onClick={transfer}>Send transfer</button>
    <button onClick={getWalletBalance}>Get balance</button>
    <button onClick={getWalletTokenBalance}>Get token balance</button>
    <button onClick={getWalletAddress}>Get address</button>
    <button onClick={getWalletHeight}>Get height</button>
    <button onClick={getDaemonHeight}>Get daemon height</button>
    <button onClick={makeIntegratedAddress}>Make integrated address</button>
    <button onClick={splitIntegratedAddress}>Split integrated address</button>
  </div>
}

ReactDOM.render(<App />, document.getElementById('app'))
