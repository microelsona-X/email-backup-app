import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI, IPCSendChannel, IPCReceiveChannel } from './types'

const VALID_SEND_CHANNELS: IPCSendChannel[] = [
  'sync-start',
  'account-add',
  'account-delete',
  'account-list',
  'account-test-connection',
  'oauth-start-microsoft',
  'oauth-start-gmail',
  'email-list',
  'email-get',
  'email-search',
  'settings-get',
  'settings-update',
  'settings-select-directory'
]

const VALID_RECEIVE_CHANNELS: IPCReceiveChannel[] = [
  'sync-progress',
  'sync-complete',
  'sync-error',
  'account-added',
  'account-deleted',
  'account-list-updated',
  'oauth-success',
  'oauth-error'
]

const electronAPI: ElectronAPI = {
  send: (channel: IPCSendChannel, data: unknown) => {
    if (VALID_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  receive: (channel: IPCReceiveChannel, callback: (...args: unknown[]) => void) => {
    if (VALID_RECEIVE_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args))
    }
  },
  invoke: (channel: string, ...args: unknown[]) => {
    const validInvokeChannels = [
      'account-list',
      'account-add',
      'account-delete',
      'account-test-connection',
      'sync-start',
      'oauth-start-microsoft',
      'oauth-start-gmail',
      'email-list',
      'email-get',
      'email-search',
      'settings-get',
      'settings-update',
      'settings-select-directory'
    ]
    if (validInvokeChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args)
    }
    return Promise.reject(new Error(`Invalid channel: ${channel}`))
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
