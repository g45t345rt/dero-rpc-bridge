import browser from 'webextension-polyfill'

window.addEventListener("message", async (event) => {
  if (event.source != window) {
    return
  }

  if (event.data === 'init-dero-bridge' && event.ports[0]) {
    const port2 = event.ports[0]
    port2.onmessage = async (event) => {
      const { id, cmd } = event.data
      const data = await browser.runtime.sendMessage(cmd)
      port2.postMessage({ id, data })
    }

    port2.postMessage('initialized')
  }
}, false)
