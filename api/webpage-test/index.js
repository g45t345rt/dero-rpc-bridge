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

  const transferDERO = React.useCallback(async () => {
    const deroBridgeApi = deroBridgeApiRef.current
    const [err, res] = await to(deroBridgeApi.wallet('start-transfer', {
      transfers: [{
        destination: 'deto1qyg7mqwag7lch9267dttyrxy5jlc8tqwedtel77kpq0zh2zr7rvlsqgs2cz33',
        amount: 100,
      }]
    }))

    if (err) alert(err.message)
    else alert(JSON.stringify(res))
  }, [])

  const transferAsset = React.useCallback(async () => {
    const deroBridgeApi = deroBridgeApiRef.current
    const [err, res] = await to(deroBridgeApi.wallet('start-transfer', {
      transfers: [{
        scid: 'd80bd69e9945251b9a0127f064268d0629e743fa7fffb14ad74dbb366f932291',
        destination: 'deto1qyg7mqwag7lch9267dttyrxy5jlc8tqwedtel77kpq0zh2zr7rvlsqgs2cz33',
        amount: 1,
      }, {
        scid: 'd80bd69e9945251b9a0127f064268d0629e743fa7fffb14ad74dbb366f932291',
        destination: 'deto1qyg7mqwag7lch9267dttyrxy5jlc8tqwedtel77kpq0zh2zr7rvlsqgs2cz33',
        burn: 1,
      }]
    }))

    if (err) alert(err.message)
    else alert(JSON.stringify(res))
  }, [])

  const callSC = React.useCallback(async () => {
    const deroBridgeApi = deroBridgeApiRef.current
    const [err, res] = await to(deroBridgeApi.wallet('start-transfer', {
      ringsize: 2,
      sc_rpc: [
        { name: "SC_ACTION", datatype: "U", value: 0 },
        { name: "SC_ID", datatype: "H", value: "d80bd69e9945251b9a0127f064268d0629e743fa7fffb14ad74dbb366f932291" },
        { name: "entrypoint", datatype: "S", value: "Test" },
        { name: "arg", datatype: "S", value: "the_value" },
      ],
      transfers: [{
        scid: 'd80bd69e9945251b9a0127f064268d0629e743fa7fffb14ad74dbb366f932291',
        destination: 'deto1qyg7mqwag7lch9267dttyrxy5jlc8tqwedtel77kpq0zh2zr7rvlsqgs2cz33',
        amount: 1,
      }]
    }))

    if (err) alert(err.message)
    else alert(JSON.stringify(res))
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

  const [info, setInfo] = React.useState({})
  React.useEffect(() => {
    const deroBridgeApi = deroBridgeApiRef.current
    if (!deroBridgeApi) return

    const getInfo = async () => {
      const [err, res] = await to(deroBridgeApi.daemon('get-info'))
      if (err) setInfo(err.message)
      else setInfo(res)
    }

    const intervalId = setInterval(getInfo, 2000)
    return () => clearInterval(intervalId)
  }, [deroBridgeApiRef.current])

  return <div>
    <div>{bridgeInitText}</div>
    <div>{JSON.stringify(info, null, 2)}</div>
    <button onClick={transferDERO}>Transfer DERO</button>
    <button onClick={transferAsset}>Transfer ASSET</button>
    <button onClick={callSC}>Call SC</button>
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
