import React from 'react'
import querystring from 'query-string'

import formatDero from '../components/formatDero'

const getQuery = () => {
  const href = window.location.href
  const search = href.substring(href.indexOf('?'), href.length)
  return querystring.parse(search)
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

export default () => {
  const query = getQuery()

  const [state, setState] = React.useState({})
  const [err, setErr] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [res, setRes] = React.useState()

  React.useEffect(async () => {
    const { transferStateId } = query
    const [err, res] = await to(browser.runtime.sendMessage({ entity: 'wallet', action: 'get-transfer-state', args: { id: transferStateId } }))
    setState(res)
    console.log(res)
  }, [])

  const confirmTransfer = React.useCallback(async () => {
    const { transferStateId } = query
    setLoading(true)
    const [err, res] = await to(browser.runtime.sendMessage({ entity: 'wallet', action: 'confirm-transfer', args: { id: transferStateId } }))
    setLoading(false)
    if (err) return setErr(err.message)
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
          <button class="input-button" onClick={() => window.close()} disabled={loading}>cancel</button>
          <button class="input-button" onClick={confirmTransfer} disabled={loading}>confirm</button>
        </div>
        <div>
          {loading && `loading...`}
          {err && <div class="status-block">
            <span class="error-dot" />{err}
          </div>}
        </div>
      </div>
    </div>
  </div>
}
