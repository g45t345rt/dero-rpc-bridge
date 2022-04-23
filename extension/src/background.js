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
      const data = await res.json()
      return { data }
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
        const res = await rpcCall({ ...options, method: 'echo', params: args })
        if (res.err) return Promise.reject(new Error(res.err))

        return Promise.resolve(res)
      }

      if (action === 'ping') {
        const res = await rpcCall({ ...options, method: 'ping' })
        if (res.err) return Promise.reject(new Error(res.err))

        return Promise.resolve(res)
      }

      if (action === 'get-random-address') {
        const res = await rpcCall({ ...options, method: 'getrandomaddress' })
        if (res.err) return Promise.reject(new Error(res.err))

        return Promise.resolve(res)
      }

      if (action === 'get-gas-estimate') {
        const getAddressRes = await rpcCall({ url: config.walletRPC, method: 'getaddress' })
        if (getAddressRes.err) return Promise.reject(new Error(getAddressRes.err))

        const signer = getAddressRes.data.result.address

        const gasEstimateRes = await rpcCall({
          ...options,
          method: 'getgasestimate', params: {
            ...args,
            signer
          }
        })
        if (gasEstimateRes.err) return Promise.reject(new Error(gasEstimateRes.err))

        return Promise.resolve(gasEstimateRes)
      }

      if (action === 'get-sc') {
        const res = await rpcCall({ ...options, method: 'getsc', params: args })
        if (res.err) return Promise.reject(new Error(res.err))

        return Promise.resolve(res)
      }

      return Promise.reject(new Error('Invalid action.'))
    }

    if (entity === 'wallet') {
      const { action, args } = message
      const options = {
        url: config.walletRPC,
        user: config.userRPC,
        password: config.passwordRPC
      }

      if (action === 'echo') {
        const res = await rpcCall({ ...options, method: 'echo', params: args })
        if (res.err) return Promise.reject(new Error(res.err))

        return Promise.resolve(res)
      }

      if (action === 'get-balance') {
        const res = await rpcCall({ ...options, method: `getbalance` })
        if (res.err) return Promise.reject(new Error(res.err))

        return Promise.resolve(res)
      }

      if (action === 'start-transfer') {
        const transferStateId = nanoid()
        const promise = new Promise((resolve) => {
          transferStateMap.set(transferStateId, {
            resolve,
            params: args,
            sender
          })
        })

        // vars to center confirm popup
        const window = await browser.windows.getCurrent()
        const width = 275
        const height = 350
        const tab = (await browser.tabs.query({ active: true, currentWindow: true }))[0]
        const left = Math.round(((tab.width / 2) - (width / 2)) + window.left)
        const top = Math.round(((tab.height / 2) - (height / 2)) + window.top)

        browser.windows.create({
          url: `chrome-extension://${browser.runtime.id}/popup.html#/confirm?transferStateId=${transferStateId}`,
          type: "panel",
          left,
          focused: true,
          top,
          width,
          height
        })

        return promise
      }

      // Get transfer args for popup confirm
      if (action === 'get-transfer-state') {
        if (sender.origin !== popupOrigin) {
          return Promise.reject(new Error('Invalid action.'))
        }

        const transferState = transferStateMap.get(args.id)
        return Promise.resolve(transferState)
      }

      // Execute the transaction from popup confirm - user validation
      if (action === 'confirm-transfer') {
        if (sender.origin !== popupOrigin) { // this is important to avoid the webpage calling this method and transfering funds without the user knowing
          return Promise.reject(new Error('Invalid action.'))
        }

        const transferState = transferStateMap.get(args.id)
        if (!transferState) return Promise.reject(new Error('Transfer state not found.'))

        const res = await rpcCall({ ...options, method: 'transfer', params: transferState.params })
        if (res.err) return Promise.reject(new Error(res.err))

        transferState.resolve(res)
        transferStateMap.delete(args.id)
        return Promise.resolve(res)
      }

      return Promise.reject(new Error('Invalid action.'))
    }

    return Promise.reject(new Error('Invalid entity.'))
  })
}

const storeDefault = async () => {
  // Default wallet and deamon rpc endpoints
  const config = await browser.storage.local.get(['deamonRPC', 'walletRPC'])
  const { deamonRPC, walletRPC } = config
  if (!deamonRPC) await browser.storage.local.set({ deamonRPC: "http://localhost:20000" })
  if (!walletRPC) await browser.storage.local.set({ walletRPC: "http://localhost:40403" })
}

const main = async () => {
  // Make sure you're not waiting for anything before adding browser.runtime.onMessage handler
  // or you might get Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist (sendMessage before listener is initiated)
  listen()
  storeDefault()
}

main()
