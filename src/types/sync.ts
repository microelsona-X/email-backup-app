/**
 * 同步类型定义
 */

export interface SyncProgress {
  accountId: string
  folder: string
  current: number
  total: number
  status: 'syncing' | 'completed' | 'error'
  message?: string
}

export interface SyncResult {
  accountId: string
  success: boolean
  emailsSynced: number
  newEmailsCount: number
  error?: string
}

export interface SyncOptions {
  folder?: string
  limit?: number
}
