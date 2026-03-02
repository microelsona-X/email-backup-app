/**
 * 账户类型定义
 */

export type AccountType = 'imap' | 'microsoft365' | 'gmail'

export interface IMAPConfig {
  host: string
  port: number
  secure: boolean
  username: string
  password: string
}

export interface OAuth2Config {
  accessToken: string
  refreshToken: string
  expiresAt: number
  scope: string
}

export type AccountConfig = IMAPConfig | OAuth2Config

export interface Account {
  id: string
  email: string
  type: AccountType
  config: AccountConfig
  lastSync?: Date
  status: 'active' | 'error' | 'syncing'
  displayName?: string
}

export interface AccountCreateInput {
  email: string
  displayName?: string
  type?: AccountType
  config: AccountConfig
}
