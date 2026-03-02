import * as fs from 'fs'
import * as path from 'path'
import { randomUUID } from 'crypto'
import type { Account, AccountCreateInput } from '../../src/types/account'
import { SettingsService } from './SettingsService'

interface AccountStore {
  accounts: Account[]
}

export class AccountService {
  private settingsService = new SettingsService()

  private getAccountsFilePath(): string {
    return path.join(this.settingsService.getBackupRoot(), 'accounts.json')
  }

  private ensureAccountsFile(): void {
    const accountsFile = this.getAccountsFilePath()
    const dir = path.dirname(accountsFile)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    if (!fs.existsSync(accountsFile)) {
      fs.writeFileSync(accountsFile, JSON.stringify({ accounts: [] }, null, 2), 'utf-8')
    }
  }

  private readStore(): AccountStore {
    this.ensureAccountsFile()
    const content = fs.readFileSync(this.getAccountsFilePath(), 'utf-8')
    return JSON.parse(content)
  }

  private writeStore(store: AccountStore): void {
    fs.writeFileSync(this.getAccountsFilePath(), JSON.stringify(store, null, 2), 'utf-8')
  }

  async createAccount(input: AccountCreateInput): Promise<Account> {
    const account: Account = {
      id: randomUUID(),
      email: input.email,
      type: input.type || 'imap',
      config: input.config,
      status: 'active',
      displayName: input.displayName
    }

    const store = this.readStore()
    store.accounts.push(account)
    this.writeStore(store)

    return account
  }

  async getAccounts(): Promise<Account[]> {
    const store = this.readStore()

    // Reset any accounts stuck in 'syncing' status to 'active' on app startup
    let needsUpdate = false
    const accounts = store.accounts.map(account => {
      if (account.status === 'syncing') {
        needsUpdate = true
        return { ...account, status: 'active' as const }
      }
      return account
    })

    if (needsUpdate) {
      this.writeStore({ accounts })
      console.log('[AccountService] Reset syncing accounts to active on startup')
    }

    return accounts
  }

  async getAccountById(id: string): Promise<Account | undefined> {
    const store = this.readStore()
    return store.accounts.find((acc) => acc.id === id)
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account | null> {
    const store = this.readStore()
    const index = store.accounts.findIndex((acc) => acc.id === id)

    if (index === -1) {
      return null
    }

    store.accounts[index] = { ...store.accounts[index], ...updates }
    this.writeStore(store)

    return store.accounts[index]
  }

  async deleteAccount(id: string): Promise<boolean> {
    const store = this.readStore()
    const filtered = store.accounts.filter((acc) => acc.id !== id)

    if (filtered.length === store.accounts.length) {
      return false
    }

    this.writeStore({ accounts: filtered })
    return true
  }

  async updateLastSync(id: string, date: Date): Promise<void> {
    await this.updateAccount(id, { lastSync: date })
  }

  async updateStatus(id: string, status: Account['status']): Promise<void> {
    await this.updateAccount(id, { status })
  }
}
