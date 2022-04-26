import React from 'react'
import browser from 'webextension-polyfill'
import to from 'await-to-js'

import formatDero from '../components/formatDero'

export default () => {
  const [daemonRPCText, setDaemonRPCText] = React.useState(null)
  const [daemonRPCStatus, setDaemonRPCStatus] = React.useState(null)
  const refDaemonRPC = React.useRef()

  const [walletRPCText, setWalletRPCText] = React.useState(null)
  const [walletRPCStatus, setWalletRPCStatus] = React.useState(null)
  const refWalletRPC = React.useRef()

  const refUserRPC = React.useRef()
  const refPasswordRPC = React.useRef()

  const [balance, setBalance] = React.useState(null)

  const checkDaemonRPC = React.useCallback(async () => {
    setDaemonRPCText('loading...')
    setDaemonRPCStatus('loading')
    const [err, res] = await to(browser.runtime.sendMessage({ entity: 'daemon', action: 'ping' }))
    if (err) {
      setDaemonRPCText(err.message)
      setDaemonRPCStatus('error')
    } else {
      setDaemonRPCStatus('success')
      setDaemonRPCText('Connected')
    }
  })

  const checkWalletRPC = React.useCallback(async () => {
    setWalletRPCText('loading...')
    setWalletRPCStatus('loading')
    setBalance(null)
    const [echoErr, echoRes] = await to(browser.runtime.sendMessage({ entity: 'wallet', action: 'echo' }))
    if (echoErr) {
      setWalletRPCText(echoErr.message)
      setWalletRPCStatus('error')
    } else {
      setWalletRPCText('Connected')
      setWalletRPCStatus('success')

      const [balanceErr, balanceRes] = await to(browser.runtime.sendMessage({ entity: 'wallet', action: 'get-balance' }))
      const balance = balanceRes.data.result.balance
      setBalance(balance)
    }
  })

  const setDaemonRPC = React.useCallback(async () => {
    const value = refDaemonRPC.current.value
    await browser.storage.local.set({ daemonRPC: value })
    checkDaemonRPC()
  }, [])


  const setWalletRPC = React.useCallback(async () => {
    const value = refWalletRPC.current.value
    await browser.storage.local.set({ walletRPC: value })
    checkWalletRPC()
  }, [])

  const setUserRPC = React.useCallback(() => {
    const value = refUserRPC.current.value
    browser.storage.local.set({ userRPC: value })
  }, [])

  const setPasswordRPC = React.useCallback(() => {
    const value = refPasswordRPC.current.value
    browser.storage.local.set({ passwordRPC: value })
  }, [])

  React.useEffect(async () => {
    const result = await browser.storage.local.get(['daemonRPC', 'walletRPC', 'userRPC', 'passwordRPC'])
    refDaemonRPC.current.value = result.daemonRPC || ""
    refWalletRPC.current.value = result.walletRPC || ""
    refUserRPC.current.value = result.userRPC || ""
    refPasswordRPC.current.value = result.passwordRPC || ""

    checkDaemonRPC()
    checkWalletRPC()
  }, [])

  return <div class="app-popup">
    <div class="app-title">
      <img src="icon16.png" />
      DERO RPC Bridge
    </div>
    <div class="content-pad">
      <div>
        <div class="input-title">Daemon RPC</div>
        <div class="input-wrap">
          <input ref={refDaemonRPC} class="input" type="text" />
          <button class="input-button" onClick={setDaemonRPC} disabled={daemonRPCStatus === 'loading'}>Set</button>
        </div>
        <div class="status-block">
          <span class={`${daemonRPCStatus}-dot`} />
          {daemonRPCText}
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
        {balance && <div>
          <div class="input-title">Balance</div>
          <div>{formatDero(balance)}</div>
        </div>}
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
