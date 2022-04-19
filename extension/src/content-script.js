import browser from 'webextension-polyfill'

const onMessage = async (event) => {
  if (event.source != window) {
    return
  }

  if (event.data === 'init-dero-bridge' && event.ports[0]) {
    const port2 = event.ports[0]

    port2.onmessage = async (event) => {
      if (browser.runtime.id) {
        const { id, cmd } = event.data
        const data = await browser.runtime.sendMessage(cmd)
        port2.postMessage({ id, data })
      } else {
        port2.postMessage(`disconnected`)
      }
    }

    port2.postMessage('initialized')
  }
}

window.addEventListener('message', onMessage)
