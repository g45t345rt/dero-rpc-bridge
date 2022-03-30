import browser from 'webextension-polyfill'
import { nanoid } from 'nanoid'

const rpcCall = async (options) => {
  try {
    const { url, user, password, method, params } = options

    const headers = {
      "Content-Type": "application/json",
    }

    if (user && password) {
      headers["Authorization"] = "Basic " + btoa(`${user}:${password}`)
    }

    const body = {
      "jsonrpc": "2.0",
      "id": "1",
      "method": method
    }

    if (params) {
      body["params"] = params
    }

    const res = await fetch(`${url}/json_rpc`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    })

    if (res.ok) {
      const result = await res.json()
      return { result }
    } else {
      return { err: res.statusText }
    }
  } catch (err) {
    return { err: err.message }
  }
}

let transferStateMap = new Map()
let popupOrigin = `chrome-extension://${browser.runtime.id}`

const listen = () => {
  browser.runtime.onMessage.addListener(async (message, sender) => {
    const config = await browser.storage.local.get(['deamonRPC', 'walletRPC', 'userRPC', 'passwordRPC'])

    const { entity } = message
    if (entity === 'deamon') {
      const { action, args } = message

      const options = { url: config.deamonRPC }
      if (action === 'echo') {
        const res = await rpcCall({ ...options, method: 'Echo' })
        return Promise.resolve(res)
      }

      if (action === 'get-gas-estimate') {
        const res = await rpcCall({ ...options, method: 'GetGasEstimate', params: args })
        return Promise.resolve(res)
      }

      if (action === 'get-sc') {
        const res = await rpcCall({ ...options, method: 'GetSC', params: args })
        return Promise.resolve(res)
      }

      return Promise.reject({ err: 'Invalid action.' })
    }

    if (entity === 'wallet') {
      const { action, args } = message
      const options = {
        url: config.walletRPC,
        user: config.userRPC,
        password: config.passwordRPC
      }

      if (action === 'echo') {
        const res = await rpcCall({ ...options, method: 'Echo', params: args })
        return Promise.resolve(res)
      }

      if (action === 'start-transfer') {
        const transferStateId = nanoid()
        const promise = new Promise((resolve) => {
          transferStateMap.set(transferStateId, {
            resolve,
            params: args
          })
        })

        // vars to center confirm popup
        const window = await browser.windows.getCurrent()
        const width = 200
        const height = 200
        const tab = (await browser.tabs.query({ active: true, currentWindow: true }))[0]
        const left = Math.round(((tab.width / 2) - (width / 2)) + window.left)
        const top = Math.round(((tab.height / 2) - (height / 2)) + window.top)

        browser.windows.create({
          url: `chrome-extension://${browser.runtime.id}/popup.html#/confirm?transferStateId=${transferStateId}`,
          type: "popup",
          left,
          top,
          width,
          height,
        })

        return promise
      }

      // Get transfer args for popup confirm
      if (action === 'get-transfer-state') {
        if (sender.origin !== popupOrigin) {
          return Promise.reject({ err: 'Invalid action.' })
        }

        const transferState = transferStateMap.get(args.id)
        return Promise.resolve(transferState)
      }

      // Execute the transaction from popup confirm - user validation
      if (action === 'confirm-transfer') {
        if (sender.origin !== popupOrigin) { // this is important to avoid the webpage calling this method and transfering funds without the user knowing
          return Promise.reject({ err: 'Invalid action.' })
        }

        const transferState = transferStateMap.get(args.id)
        if (!transferState) return Promise.reject({ err: 'Transfer state not found.' })

        const res = await rpcCall({ ...options, method: 'Transfer', params: transferState.params })
        transferState.resolve(res)
        transferStateMap.delete(args.id)
        return Promise.resolve(res)
      }

      return Promise.reject({ err: 'Invalid action.' })
    }

    return Promise.reject({ err: 'Invalid entity.' })
  })
}

const main = async () => {
  // Default wallet and deamon rpc endpoints
  const config = await browser.storage.local.get(['deamonRPC', 'walletRPC'])
  const { deamonRPC, walletRPC } = config
  if (!deamonRPC) browser.storage.local.set({ deamonRPC: "http://localhost:20000" })
  if (!walletRPC) browser.storage.local.set({ walletRPC: "http://localhost:40403" })

  listen()
}

main()
