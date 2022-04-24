import browser from 'webextension-polyfill'
import to from 'await-to-js'

const onMessage = async (event) => {
  if (event.source != window) {
    return
  }

  if (event.data === 'init-dero-bridge' && event.ports[0]) {
    const port2 = event.ports[0]

    port2.onmessage = async (event) => {
      if (browser.runtime.id) {
        const { id, cmd } = event.data
        const [err, data] = await to(browser.runtime.sendMessage(cmd))
        port2.postMessage({ id, data, err })
      } else {
        port2.postMessage(`disconnected`)
      }
    }

    port2.postMessage('initialized')
  }
}

window.addEventListener('message', onMessage)
