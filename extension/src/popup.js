import { render, h, Fragment } from 'preact'
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

  return <div class="app-popup">
    <div class="app-title">
      <img src="icon16.png" />
      DERO Bridge
    </div>
    <div class="content-pad">
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

const dataToTable = (data) => {
  Object.keys(data).map((key) => {
    const value = data[key]
  })
}

const KeyValueRow = (props) => {
  const { key, value } = props
  return <Fragment>
    <tr>
      <td class="td-key">{key}</td>
    </tr>
    <tr>
      <td class="td-value">{value}</td>
    </tr>
  </Fragment>
}

const Table = (props) => {
  const { data } = props
  return <table class="table">
    <tbody>
      {Object.keys(data).map((key) => {
        const value = data[key]

        return <Fragment>
          <tr>
            <td class="td-key">{key}</td>
          </tr>
          <tr>
            <td class="td-value">{JSON.stringify(value)}</td>
          </tr>
        </Fragment>
      })}
    </tbody>
  </table>
}

const TransferItem = (props) => {
  const { title, render } = props
  let value = props.value
  if (!value) return null
  if (typeof render === 'function') value = render(value)
  return <div>
    <div class="td-key">{title}</div>
    <div class="break-all">{value}</div>
  </div>
}

const formatDero = (value) => {
  return `${value / 100000} DERO`
}

const Confirm = () => {
  const query = getQuery()

  const [state, setState] = useState({})
  const [res, setRes] = useState()

  useEffect(async () => {
    const { transferStateId } = query
    const res = await browser.runtime.sendMessage({ entity: 'wallet', action: 'get-transfer-state', args: { id: transferStateId } })
    setState(res)
    console.log(res)
  }, [])

  const confirmTransfer = useCallback(async () => {
    const { transferStateId } = query
    const res = await browser.runtime.sendMessage({ entity: 'wallet', action: 'confirm-transfer', args: { id: transferStateId } })
    setRes(res)
  }, [])

  if (res) {
    const txid = res.data.result.txid
    return <div class="confirm-popup">
      <div class="app-title">TXID</div>
      <div class="content-pad">
        <div class="break-all">{txid}</div>
        <div class="row-buttons">
          <button class="input-button" onClick={() => window.close()}>close</button>
        </div>
      </div>
    </div>
  }

  const { params = {}, sender = {} } = state

  return <div class="confirm-popup">
    <div class="app-title">Confirm transfer?</div>
    <div class="content-pad">
      <div class="row-grid">
        <TransferItem title="Initiated from" value={sender.url} />
        <TransferItem title="Destination" value={params.destination} />
        <TransferItem title="SC ID" value={params.scid} />
        <TransferItem title="Amount" value={params.amount} render={(v) => formatDero(v)} />
        <TransferItem title="Burn" value={params.burn} render={(v) => formatDero(v)} />
        <TransferItem title="Transfers" value={params.transfers} render={() => {
          return params.transfers.map((transfer) => {
            return <div class="transfer-item">
              <TransferItem title="Destination" value={transfer.destination} />
              <TransferItem title="Amount" value={transfer.amount} render={(v) => formatDero(v)} />
              <TransferItem title="Burn" value={transfer.burn} render={(v) => formatDero(v)} />
            </div>
          })
        }} />
        <TransferItem title="SC Invocation" value={params.sc_rpc} render={() => {
          const sc_args = []
          let scid = null
          for (let i = 0; i < params.sc_rpc.length; i++) {
            const item = params.sc_rpc[i]
            if (item.name === 'SC_ID') {
              scid = item.value
              continue
            }

            if (item.name === 'SC_ACTION') continue
            sc_args.push(item)
          }

          return <div>
            {scid && <div>{scid}</div>}
            <div class="sc-args">
              {sc_args.map((arg) => {
                return <span>{arg.value}&nbsp;</span>
              })}
            </div>
          </div>
        }} />
        <TransferItem title="Ring size" value={params.ringsize} />
        <TransferItem title="Fees" value={params.fees} render={(v) => formatDero(v)} />
        <div class="row-buttons">
          <button class="input-button" onClick={() => window.close()}>cancel</button>
          <button class="input-button" onClick={confirmTransfer}>confirm</button>
        </div>
      </div>
    </div>
  </div>
}

const App = () => {
  return <Router history={createHashHistory()}>
    <Popup path="/" />
    <Confirm path="/confirm" />
  </Router>
}

render(<App />, document.getElementById('app'))
