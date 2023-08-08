import React from 'react'
import browser from 'webextension-polyfill'
import to from 'await-to-js'

import FormatAsset from '../components/formatAsset'
import manifest from '../../../manifest_3/manifest.json'

export default () => {
  const [daemonRPCText, setDaemonRPCText] = React.useState(null)
  const [daemonRPCStatus, setDaemonRPCStatus] = React.useState(null)
  const refDaemonRPC = React.useRef()

  const [walletRPCText, setWalletRPCText] = React.useState(null)
  const [walletRPCStatus, setWalletRPCStatus] = React.useState(null)
  const refWalletRPC = React.useRef()

  const refUserRPC = React.useRef()
  const refPasswordRPC = React.useRef()

  const [nodeHeight, setNodeHeight] = React.useState(null)
  const [balance, setBalance] = React.useState(null)

  const checkDaemonRPC = React.useCallback(async () => {
    setDaemonRPCText('loading...')
    setDaemonRPCStatus('loading')
    setNodeHeight(null)
    const [err, res] = await to(browser.runtime.sendMessage({ entity: 'daemon', action: 'get-info' }))
    if (err) {
      setDaemonRPCText(err.message)
      setDaemonRPCStatus('error')
      return
    }

    if (res.data.error) {
      console.log(res.data)
      setDaemonRPCText(`Not a deamon`)
      setDaemonRPCStatus('error')
      return
    }

    setNodeHeight(res.data.result.height)
    setDaemonRPCStatus('success')
    setDaemonRPCText('Connected')
  })

  const checkWalletRPC = React.useCallback(async () => {
    setWalletRPCText('loading...')
    setWalletRPCStatus('loading')
    setBalance(null)

    const [err, res] = await to(browser.runtime.sendMessage({ entity: 'wallet', action: 'get-balance' }))

    if (err) {
      setWalletRPCText(err.message)
      setWalletRPCStatus('error')
      return
    }

    if (res.data.error) {
      setWalletRPCText(`Not a wallet`)
      setWalletRPCStatus('error')
      return
    }

    setBalance(res.data.result.balance)
    setWalletRPCText('Connected')
    setWalletRPCStatus('success')
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

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (event.target === refDaemonRPC.current) setDaemonRPC()
      else if (event.target === refWalletRPC.current) setWalletRPC()
      else if (event.target === refUserRPC.current) {
        setUserRPC()
        checkWalletRPC()
      } else if (event.target === refPasswordRPC.current) {
        setPasswordRPC()
        checkWalletRPC()
      }
    }
  }

  const handleBlur = (event) => {
    if (event.target === refDaemonRPC.current) setDaemonRPC()
    else if (event.target === refWalletRPC.current) setWalletRPC()
    else if (event.target === refUserRPC.current) {
      setUserRPC()
      checkWalletRPC()
    } else if (event.target === refPasswordRPC.current) {
      setPasswordRPC()
      checkWalletRPC()
    }
  }

  const reset = React.useCallback(() => {
    const yes = window.confirm('Are you sure you want to reset configuation?')
    if (!yes) return

    refDaemonRPC.current.value = 'http://localhost:10102'
    refWalletRPC.current.value = 'http://localhost:10103'
    refUserRPC.current.value = ''
    refPasswordRPC.current.value = ''

    setDaemonRPC()
    setWalletRPC()
    setUserRPC()
    setPasswordRPC()
  })

  React.useEffect(() => {
    const load = async () => {
      const result = await browser.storage.local.get(['daemonRPC', 'walletRPC', 'userRPC', 'passwordRPC'])
      refDaemonRPC.current.value = result.daemonRPC || ''
      refWalletRPC.current.value = result.walletRPC || ''
      refUserRPC.current.value = result.userRPC || ''
      refPasswordRPC.current.value = result.passwordRPC || ''

      checkDaemonRPC()
      checkWalletRPC()
    }

    load()
  }, [])

  return (
    <div className="app-popup">
      <div className="app-title">
        <img src="icon16.png" />
        DERO RPC Bridge v{manifest.version}
      </div>
      <div className="content-pad">
        <div>
          <div className="input-title">Daemon RPC</div>
          <div className="input-wrap">
            <input ref={refDaemonRPC} className="input" type="text" onKeyDown={handleKeyDown} onBlur={handleBlur} />
            <button className="input-button" onClick={setDaemonRPC} disabled={daemonRPCStatus === 'loading'}>
              Set
            </button>
          </div>
          <div className="status-block">
            <span className={`${daemonRPCStatus}-dot`} />
            {daemonRPCText}
          </div>
          {nodeHeight && (
            <div>
              <div className="input-title">Node Height</div>
              <div>{nodeHeight}</div>
            </div>
          )}
        </div>
        <div className="separator" />
        <div>
          <div className="input-title">Wallet RPC</div>
          <div className="input-wrap">
            <input ref={refWalletRPC} className="input" type="text" onKeyDown={handleKeyDown} onBlur={handleBlur} />
            <button className="input-button" onClick={setWalletRPC} disabled={walletRPCStatus === 'loading'}>
              Set
            </button>
          </div>
          <div className="status-block">
            <span className={`${walletRPCStatus}-dot`} />
            {walletRPCText}
          </div>
          {balance && (
            <div>
              <div className="input-title">Balance</div>
              <div>
                <FormatAsset value={balance} />
              </div>
            </div>
          )}
        </div>
        <div className="separator" />
        <div className="input-title">RPC Login</div>
        <div>
          <div className="input-title2">User</div>
          <div className="input-wrap">
            <input ref={refUserRPC} type="text" className="input" onChange={setUserRPC} onKeyDown={handleKeyDown} onBlur={handleBlur} />
          </div>
        </div>
        <div>
          <div className="input-title2">Password</div>
          <div className="input-wrap">
            <input ref={refPasswordRPC} type="password" className="input" onChange={setPasswordRPC} onKeyDown={handleKeyDown} onBlur={handleBlur} />
          </div>
        </div>
        <a className="reset-link" onClick={reset}>
          reset
        </a>
      </div>
    </div>
  )
}
