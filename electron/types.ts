/**
 * Electron IPC 通道类型定义
 */
export type IPCSendChannel =
  | 'sync-start'
  | 'account-add'
  | 'account-delete'
  | 'account-list'
  | 'account-test-connection'
  | 'oauth-start-microsoft'
  | 'oauth-start-gmail'
  | 'oauth-cancel'
  | 'email-list'
  | 'email-get'
  | 'email-search'
  | 'settings-get'
  | 'settings-update'
  | 'settings-select-directory'

export type IPCReceiveChannel =
  | 'sync-progress'
  | 'sync-complete'
  | 'sync-error'
  | 'account-added'
  | 'account-deleted'
  | 'account-list-updated'
  | 'oauth-success'
  | 'oauth-error'

/**
 * Electron API 接口定义
 */
export interface ElectronAPI {
  send: (channel: IPCSendChannel, data: unknown) => void
  receive: (channel: IPCReceiveChannel, callback: (...args: unknown[]) => void) => void
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
}

/**
 * 扩展 Window 全局类型
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
