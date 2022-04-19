import { render, h } from 'preact'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import Router from 'preact-router'
import browser from 'webextension-polyfill'
import { createHashHistory } from 'history'
import querystring from 'query-string'

const Popup = () => {
  const [deamonRPCText, setDeamonRPCText] = useState('')
  const [deamonRPCStatus, setDeamonRPCStatus] = useState('')
  const refDeamonRPC = useRef()

  const [walletRPCText, setWalletRPCText] = useState('')
  const [walletRPCStatus, setWalletRPCStatus] = useState('')
  const refWalletRPC = useRef()

  const refUserRPC = useRef()
  const refPasswordRPC = useRef()

  const checkDeamonRPC = useCallback(async () => {
    setDeamonRPCText('loading...')
    setDeamonRPCStatus('loading')
    const res = await browser.runtime.sendMessage({ entity: 'deamon', action: 'ping' })
    console.log(res)
    const { err } = res
    if (err) {
      setDeamonRPCText(err)
      setDeamonRPCStatus('error')
    } else {
      setDeamonRPCStatus('success')
      setDeamonRPCText('Connected')
    }
  })

  const checkWalletRPC = useCallback(async () => {
    setWalletRPCText('loading...')
    setWalletRPCStatus('loading')
    const res = await browser.runtime.sendMessage({ entity: 'wallet', action: 'echo' })
    console.log(res)
    const { err } = res
    if (err) {
      setWalletRPCText(err)
      setWalletRPCStatus('error')
    } else {
      setWalletRPCText('Connected')
      setWalletRPCStatus('success')
    }
  })

  const setDeamonRPC = useCallback(async () => {
    const value = refDeamonRPC.current.value
    await browser.storage.local.set({ deamonRPC: value })
    checkDeamonRPC()
  }, [])


  const setWalletRPC = useCallback(async () => {
    const value = refWalletRPC.current.value
    await browser.storage.local.set({ walletRPC: value })
    checkWalletRPC()
  }, [])

  const setUserRPC = useCallback(() => {
    const value = refUserRPC.current.value
    browser.storage.local.set({ userRPC: value })
  }, [])

  const setPasswordRPC = useCallback(() => {
    const value = refPasswordRPC.current.value
    browser.storage.local.set({ passwordRPC: value })
  }, [])

  useEffect(async () => {
    const result = await browser.storage.local.get(['deamonRPC', 'walletRPC', 'userRPC', 'passwordRPC'])
    refDeamonRPC.current.value = result.deamonRPC || ""
    refWalletRPC.current.value = result.walletRPC || ""
    refUserRPC.current.value = result.userRPC || ""
    refPasswordRPC.current.value = result.passwordRPC || ""

    checkDeamonRPC()
    checkWalletRPC()
  }, [])

  return <div>
    <div class="app-title">
      <img src="icon16.png" />
      DERO Bridge
    </div>
    <div class="app">
      <div>
        <div class="input-title">Deamon RPC</div>
        <div class="input-wrap">
          <input ref={refDeamonRPC} class="input" type="text" />
          <button class="input-button" onClick={setDeamonRPC} disabled={deamonRPCStatus === 'loading'}>Set</button>
        </div>
        <div class="status-block">
          <span class={`${deamonRPCStatus}-dot`} />
          {deamonRPCText}
        </div>
      </div>
      <div>
        <div class="input-title">Wallet RPC</div>
        <div class="input-wrap">
          <input ref={refWalletRPC} class="input" type="text" />
          <button class="input-button" onClick={setWalletRPC} disabled={walletRPCStatus === 'loading'}>Set</button>
        </div>
        <div class="status-block">
          <span class={`${walletRPCStatus}-dot`} />
          {walletRPCText}
        </div>
      </div>
      <div class="separator" />
      <div class="input-title">RPC Login</div>
      <div>
        <div class="input-title2">User</div>
        <div class="input-wrap">
          <input ref={refUserRPC} type="text" class="input" onChange={setUserRPC} />
        </div>
      </div>
      <div>
        <div class="input-title2">Password</div>
        <div class="input-wrap">
          <input ref={refPasswordRPC} type="password" class="input" onChange={setPasswordRPC} />
        </div>
      </div>
    </div>
  </div>
}

const getQuery = () => {
  const href = window.location.href
  const search = href.substring(href.indexOf('?'), href.length)
  return querystring.parse(search)
}

const Confirm = () => {
  const query = getQuery()

  const [params, setParams] = useState()
  const [res, setRes] = useState()

  useEffect(async () => {
    const { transferStateId } = query
    const res = await browser.runtime.sendMessage({ entity: 'wallet', action: 'get-transfer-state', args: { id: transferStateId } })
    setParams(res)
    console.log(res)
  }, [])

  const confirmTransfer = useCallback(async () => {
    const { transferStateId } = query
    const res = await browser.runtime.sendMessage({ entity: 'wallet', action: 'confirm-transfer', args: { id: transferStateId } })
    setRes(res)
  }, [])

  return <div>
    <div>confirm!</div>
    <div>{JSON.stringify(params)}</div>
    <button onClick={() => window.close()}>no</button>
    <button onClick={confirmTransfer}>yes</button>
    <div>{JSON.stringify(res)}</div>
  </div>
}

const App = () => {
  return <Router history={createHashHistory()}>
    <Popup path="/" />
    <Confirm path="/confirm" />
  </Router>
}

render(<App />, document.getElementById('app'))
