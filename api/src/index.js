import { nanoid } from 'nanoid'

export default class DeroBridgeApi {
  constructor() {
    this.channel = new MessageChannel()
    this.initialized = false
    this.resolves = new Map()
  }

  call(cmd) {
    if (!this.initialized) return Promise.reject(new Error(`Not initialized.`))
    const id = nanoid()
    const msg = { id, cmd }
    const promise = new Promise((resolve, reject) => {
      this.channel.port1.addEventListener('message', (event) => {
        if (event.data.id === id) {
          resolve(event.data.data)
        }

        if (event.data === 'disconnected') {
          this.initialized = false
          reject(event)
        }
      }, { once: true })

      this.channel.port1.start()
    })

    this.channel.port1.postMessage(msg)
    return promise
  }

  deamon(action, args) {
    return this.call({ entity: 'deamon', action, args })
  }

  wallet(action, args) {
    return this.call({ entity: 'wallet', action, args })
  }

  init() {
    if (this.initialized) return Promise.reject(new Error(`Already initialized.`))

    return new Promise((resolve, reject) => {
      let timeoutId = setTimeout(() => {
        if (!this.initialized) reject(`Can't initialized.`)
      }, 1000)

      this.channel.port1.addEventListener('message', (event) => {
        if (event.data === 'initialized') {
          this.initialized = true
          resolve()
        } else {
          clearTimeout(timeoutId)
          reject(`Can't initialized.`)
        }
      }, { once: true })

      this.channel.port1.start()
      window.postMessage('init-dero-bridge', '*', [this.channel.port2])
    })
  }
}
