import browser from 'webextension-polyfill'
import { nanoid } from 'nanoid'

const rpcCall = async (options) => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const { url, user, password, method, params } = options

    const headers = {
      'Content-Type': 'application/json',
    }

    if (user && password) {
      headers['Authorization'] = `Basic ${btoa(`${user}:${password}`)}`
    }

    const body = {
      'jsonrpc': '2.0',
      'id': '1',
      'method': method
    }

    if (params) {
      body['params'] = params
    }

    const fetchUrl = new URL('json_rpc', url)
    const res = await fetch(fetchUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      return { data }
    } else {
      return { err: new Error(`HTTP Error ${res.statusText}` || 'HTTP Error') }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return { err: new Error(`Timeout`) }
    }

    return { err }
  }
}

const ERROR_ACTION_NOT_ALLOWED = new Error(`Action not allowed.`)
const ERROR_INVALID_DAEMON_ACTION = new Error(`Invalid [daemon] action.`)
const ERROR_INVALID_WALLET_ACTION = new Error(`Invalid [wallet] action.`)
const ERROR_INVALID_ENTITY = new Error(`Invalid entity [daemon, wallet].`)
const ERROR_TRANSFER_STATE_NOT_FOUND = new Error(`Transfer state not found.`)
const ERROR_TRANSFER_CANCELLED = new Error(`Transfer cancelled.`)

let transferStateMap = new Map()
let popupOrigin = browser.runtime.getURL(``).slice(0, -1) // slice to remove last slash

const listen = () => {
  browser.runtime.onMessage.addListener(async (message, sender) => {
    const config = await browser.storage.local.get(['daemonRPC', 'walletRPC', 'userRPC', 'passwordRPC'])
    const senderUrl = new URL(sender.url)

    let err = null
    let res = null
    const { entity, action, args } = message
    const daemonOptions = { url: config.daemonRPC }
    const walletOptions = {
      url: config.walletRPC,
      user: config.userRPC,
      password: config.passwordRPC
    }

    // For security, I'm hardcoding the method names instead of passing the action directly
    switch (entity) {
      case 'daemon':
        switch (action) {
          case 'ping':
            res = await rpcCall({ ...daemonOptions, method: 'DERO.Ping' })
            break
          case 'get-info':
            res = await rpcCall({ ...daemonOptions, method: 'DERO.GetInfo' })
            break
          case 'get-random-address':
            res = await rpcCall({ ...daemonOptions, method: 'DERO.GetRandomAddress' })
            break
          case 'get-height':
            res = await rpcCall({ ...daemonOptions, method: 'DERO.GetHeight' })
            break
          case 'get-gas-estimate':
            res = await rpcCall({ ...daemonOptions, method: 'DERO.GetGasEstimate', params: args })
            break
          case 'get-sc':
            res = await rpcCall({ ...daemonOptions, method: 'DERO.GetSC', params: args })
            break
          case 'get-transaction':
            res = await rpcCall({ ...daemonOptions, method: 'DERO.GetTransaction', params: args })
            break
          case 'get-block':
            res = await rpcCall({ ...daemonOptions, method: 'DERO.GetBlock', params: args })
            break
          case 'name-to-address':
            res = await rpcCall({ ...daemonOptions, method: 'DERO.NameToAddress', params: args })
            break
          case 'get-last-block-header':
            res = await rpcCall({ ...daemonOptions, method: 'DERO.GetLastBlockHeader' })
            break
          case 'get-encrypted-balance':
            res = await rpcCall({ ...daemonOptions, method: 'DERO.GetEncryptedBalance', params: args })
            break
          case 'get-tx-pool':
            res = await rpcCall({ ...daemonOptions, method: 'DERO.GetTxPool' })
            break
          default:
            err = ERROR_INVALID_DAEMON_ACTION
            break
        }
        break
      case 'wallet':
        switch (action) {
          case 'make-integrated-address':
            res = await rpcCall({ ...walletOptions, method: `MakeIntegratedAddress`, params: args })
            break
          case 'split-integrated-address':
            res = await rpcCall({ ...walletOptions, method: `SplitIntegratedAddress`, params: args })
            break
          case 'get-balance':
            res = await rpcCall({ ...walletOptions, method: `GetBalance`, params: args })
            break
          case 'get-height':
            res = await rpcCall({ ...walletOptions, method: `GetHeight` })
            break
          case 'get-address':
            res = await rpcCall({ ...walletOptions, method: 'GetAddress' })
            break
          case 'start-transfer':
            const transferStateId = nanoid()
            const promise = new Promise((resolve, reject) => {
              transferStateMap.set(transferStateId, {
                resolve,
                reject,
                params: args,
                sender
              })
            })

            // vars to center confirm popup
            const window = await browser.windows.getCurrent()
            const width = 275
            const height = 350
            let left = 0
            let top = 0
            const tabs = await browser.tabs.query({ currentWindow: true })
            const tab = tabs[0]
            if (tab) {
              left = Math.round(((tab.width / 2) - (width / 2)) + window.left)
              top = Math.round(((tab.height / 2) - (height / 2)) + window.top)
            }

            await browser.windows.create({
              url: `${popupOrigin}/popup.html#/confirm?transferStateId=${transferStateId}`,
              type: 'panel',
              left,
              focused: true,
              top,
              width,
              height
            })
            return promise
          case 'get-transfer-state':
            if (senderUrl.origin !== popupOrigin) {
              err = ERROR_ACTION_NOT_ALLOWED
            } else {
              res = transferStateMap.get(args.id)
            }
            break
          case 'cancel-transfer':
            if (senderUrl.origin !== popupOrigin) {
              err = ERROR_ACTION_NOT_ALLOWED
            } else {
              const transferState = transferStateMap.get(args.id)
              if (!transferState) {
                err = ERROR_TRANSFER_STATE_NOT_FOUND
              } else {
                transferState.reject(ERROR_TRANSFER_CANCELLED)
              }
            }
            break
          case 'confirm-transfer':
            // Execute the transaction from popup confirm - user validation
            if (senderUrl.origin !== popupOrigin) { // this is important to avoid the webpage calling this method and transfering funds without the user knowing
              err = ERROR_ACTION_NOT_ALLOWED
            } else {
              const transferState = transferStateMap.get(args.id)
              if (!transferState) {
                err = ERROR_TRANSFER_STATE_NOT_FOUND
              } else {
                res = await rpcCall({ ...walletOptions, method: 'Transfer', params: transferState.params })
                if (res.err) {
                  transferState.reject(res.err)
                } else {
                  transferStateMap.delete(args.id)
                  transferState.resolve(res)
                }
              }
            }
            break
          default:
            err = ERROR_INVALID_WALLET_ACTION
            break
        }
        break
      default:
        err = ERROR_INVALID_ENTITY
        break
    }

    if (err) return Promise.reject(err)
    if (res && res.err) return Promise.reject(res.err)
    return Promise.resolve(res)
  })
}

const storeDefault = async () => {
  // Default wallet and daemon rpc endpoints
  const config = await browser.storage.local.get(['daemonRPC', 'walletRPC'])
  const { daemonRPC, walletRPC } = config
  if (!daemonRPC) await browser.storage.local.set({ daemonRPC: 'http://localhost:10102' })
  if (!walletRPC) await browser.storage.local.set({ walletRPC: 'http://localhost:10103' })
}

const main = async () => {
  // Make sure you're not waiting for anything before adding browser.runtime.onMessage handler
  // or you might get Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist (sendMessage before listener is initiated)
  listen()
  storeDefault()
}

main()
