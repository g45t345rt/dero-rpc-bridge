import browser from 'webextension-polyfill'

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
      return { result: res }
    } else {
      return { err: res.statusText }
    }
  } catch (err) {
    return { err: err.message }
  }
}

let tempTransferParams = null
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // listener needs to return true or it will fail - dont use async listener func
  // https://stackoverflow.com/questions/44056271/chrome-runtime-onmessage-response-with-async-await

  const run = async () => {
    const config = await browser.storage.local.get(['deamonRPC', 'walletRPC', 'userRPC', 'passwordRPC'])

    const { type, args } = message
    if (type === 'deamon-rpc') {
      const { method, params } = args

      if (!method) {
        sendResponse({ err: 'Method is missing.' })
        return
      }

      const options = {
        url: config.deamonRPC,
        method,
        params
      }

      const validMethods = ['Echo', 'GetGasEstimate', 'GetSC']
      if (validMethods.indexOf(method) === -1) {
        sendResponse({ err: 'Method not supported.' })
        return
      }

      const res = await rpcCall(options)
      sendResponse(res)
    } else if (type === 'wallet-rpc') {
      const { method, params } = args

      if (!method) {
        sendResponse({ err: 'Method is missing.' })
        return
      }

      const options = {
        url: config.walletRPC,
        user: config.userRPC,
        password: config.passwordRPC,
        method,
        params
      }

      const validMethods = ['Echo', 'GetAddress', 'GetBalance', 'Transfer']
      if (validMethods.indexOf(method) === -1) {
        sendResponse({ err: 'Method not supported.' })
        return
      }

      if (method === 'Transfer') {
        // show prompt
        const window = await browser.windows.getCurrent()
        const width = 200
        const height = 200

        tempTransferParams = params
        browser.windows.create({
          url: `chrome-extension://${browser.runtime.id}/popup.html#/confirm`,
          type: "popup",
          width: width,
          height: height,
        })

        sendResponse({ err: 'Prompt!' })
        return
      }

      const res = await rpcCall(options)
      sendResponse(res)
    } else if (type === 'temp-transfer-params') {
      sendResponse(tempTransferParams)
    } else {
      sendResponse({ err: 'Invalid type.' })
    }
  }

  run()
  return true
})

const main = async () => {
  // Default wallet and deamon rpc endpoints
  const config = await browser.storage.local.get(['deamonRPC', 'walletRPC'])
  const { deamonRPC, walletRPC } = config
  if (!deamonRPC) browser.storage.local.set({ deamonRPC: "http://localhost:20000" })
  if (!walletRPC) browser.storage.local.set({ walletRPC: "http://localhost:40403" })
}

main()
