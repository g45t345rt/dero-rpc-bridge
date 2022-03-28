import { nanoid } from 'nanoid'

export default class DeroBridgeApi {
  constructor() {
    this.channel = new MessageChannel()
    this.initialized = false
    this.resolves = new Map()
  }

  call(cmd) {
    if (!this.initialized) throw `Not initialized.`
    const id = nanoid()
    const msg = { id, cmd }
    const promise = new Promise((resolve) => {
      this.channel.port1.addEventListener('message', (event) => {
        if (event.data.id === id) {
          resolve(event.data.data)
        }
      }, false)

      this.channel.port1.start()
    })

    this.channel.port1.postMessage(msg)
    return promise
  }

  deamonRPC(method, params) {
    return this.call({ type: 'deamon-rpc', args: { method, params } })
  }

  walletRPC(method, params) {
    return this.call({ type: 'wallet-rpc', args: { method, params } })
  }

  init() {
    if (this.initialized) throw `Already initialized.`

    return new Promise((resolve, reject) => {
      this.channel.port1.addEventListener('message', (event) => {
        if (event.data === 'initialized') {
          this.initialized = true
          resolve()
        }
      })

      this.channel.port1.start()

      setTimeout(() => {
        if (!this.initialized) reject(`Can't initialized.`)
      }, 1000)

      window.addEventListener('load', () => {
        window.postMessage('init-dero-bridge', '*', [this.channel.port2])
      })
    })
  }
}
