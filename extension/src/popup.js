import { render, h } from 'preact'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import browser from 'webextension-polyfill'

const App = () => {
  const lockTransfer = true

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
    const res = await browser.runtime.sendMessage({ type: 'deamon-rpc', args: { method: 'Echo' } })
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
    const res = await browser.runtime.sendMessage({ type: 'wallet-rpc', args: { method: 'Echo' } })
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
    <div class="app-title">DERO Bridge</div>
    <div class="app">
      <div>
        <div class="input-title">Deamon RPC</div>
        <div class="input-wrap">
          <input ref={refDeamonRPC} class="input" type="text" />
          <button class="input-button" onClick={setDeamonRPC}>Set</button>
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
          <button class="input-button" onClick={setWalletRPC}>Set</button>
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
      <div class="input-checkbox">
        <label>Prompt on transaction</label>
        <input type="checkbox" checked={lockTransfer} />
      </div>
    </div>
  </div>
}

render(<App />, document.getElementById('app'))
