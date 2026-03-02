import { ipcMain, BrowserWindow, dialog } from 'electron'
import { AccountService } from '../services/AccountService'
import { ImapService } from '../services/ImapService'
import { StorageService } from '../services/StorageService'
import { GraphService } from '../services/GraphService'
import { GmailService } from '../services/GmailService'
import { SettingsService } from '../services/SettingsService'
import type { AccountCreateInput } from '../../src/types/account'
import type { SyncProgress } from '../../src/types/sync'
import type { AppSettings } from '../../src/types/settings'

const accountService = new AccountService()
const storageService = new StorageService()
const graphService = new GraphService()
const gmailService = new GmailService()
const settingsService = new SettingsService()

let autoSyncTimer: NodeJS.Timeout | null = null
let autoSyncRunning = false

export const registerIpcHandlers = (mainWindow: BrowserWindow) => {
  const syncAccountById = async (accountId: string) => {
    const account = await accountService.getAccountById(accountId)
    if (!account) {
      throw new Error('Account not found')
    }

    if (account.type !== 'imap') {
      throw new Error('Only IMAP accounts support sync currently')
    }

    if (account.status === 'syncing') {
      return { success: true, newEmailsCount: 0, emailsSynced: 0 }
    }

    await accountService.updateStatus(accountId, 'syncing')

    const imapService = new ImapService()

    try {
      await imapService.connect(account.config as any)

      const lastUID = await storageService.getLastSyncUID(account.email)
      const emails = await imapService.fetchEmails('INBOX', lastUID + 1)

      let processed = 0
      for (const email of emails) {
        const emlSource = email.source || (await imapService.getEmailSource('INBOX', email.uid))
        const emlPath = await storageService.saveEmail(account.email, email, emlSource)

        if (email.hasAttachments && email.attachments.length > 0) {
          // Attachment save logic can be improved later.
        }

        await storageService.saveMetadata(account.email, email, emlPath)
        await storageService.updateIndex(account.email, email, emlPath)

        processed++
        const progress: SyncProgress = {
          accountId,
          folder: 'INBOX',
          current: processed,
          total: emails.length,
          status: 'syncing'
        }
        mainWindow.webContents.send('sync-progress', progress)
      }

      await imapService.disconnect()
      await accountService.updateStatus(accountId, 'active')
      await accountService.updateLastSync(accountId, new Date())

      const result = {
        accountId,
        success: true,
        emailsSynced: emails.length,
        newEmailsCount: emails.length
      }

      mainWindow.webContents.send('sync-complete', result)
      return result
    } catch (error) {
      await accountService.updateStatus(accountId, 'error')
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      mainWindow.webContents.send('sync-error', { accountId, error: errorMessage })
      throw error
    }
  }

  const syncAllAccounts = async () => {
    if (autoSyncRunning) {
      return
    }

    autoSyncRunning = true
    try {
      const accounts = await accountService.getAccounts()
      const imapAccounts = accounts.filter((account) => account.type === 'imap')

      for (const account of imapAccounts) {
        try {
          await syncAccountById(account.id)
        } catch (error) {
          console.error(`[AutoSync] Failed for ${account.email}:`, error)
        }
      }
    } finally {
      autoSyncRunning = false
    }
  }

  const applyAutoSyncSchedule = (settings: AppSettings) => {
    if (autoSyncTimer) {
      clearInterval(autoSyncTimer)
      autoSyncTimer = null
    }

    if (!settings.autoSyncEnabled) {
      return
    }

    const intervalMs = Math.max(5, settings.autoSyncIntervalMinutes) * 60 * 1000
    autoSyncTimer = setInterval(() => {
      void syncAllAccounts()
    }, intervalMs)
  }

  // Account management
  ipcMain.handle('account-list', async () => {
    return await accountService.getAccounts()
  })

  ipcMain.handle('account-add', async (_event, input: AccountCreateInput) => {
    const account = await accountService.createAccount(input)
    mainWindow.webContents.send('account-added', account)
    return account
  })

  ipcMain.handle('account-delete', async (_event, id: string) => {
    const success = await accountService.deleteAccount(id)
    if (success) {
      mainWindow.webContents.send('account-deleted', id)
    }
    return success
  })

  ipcMain.handle('account-test-connection', async (_event, input: AccountCreateInput) => {
    if (input.type !== 'imap') {
      throw new Error('Only IMAP accounts can test connection')
    }
    const imapService = new ImapService()
    return await imapService.testConnection(input.config as any)
  })

  // Sync
  ipcMain.handle('sync-start', async (_event, accountId: string) => {
    return await syncAccountById(accountId)
  })

  // Settings
  ipcMain.handle('settings-get', async () => {
    return settingsService.getSettings()
  })

  ipcMain.handle('settings-update', async (_event, partial: Partial<AppSettings>) => {
    const updated = settingsService.updateSettings(partial)
    applyAutoSyncSchedule(updated)
    return updated
  })

  ipcMain.handle('settings-select-directory', async () => {
    const current = settingsService.getSettings()
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory'],
      defaultPath: current.backupRoot
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0]
  })

  // OAuth authorization
  ipcMain.handle('oauth-start-microsoft', async (_event, accountId: string) => {
    try {
      await graphService.authorize(accountId)
      const userInfo = await graphService.getUserInfo(accountId)

      mainWindow.webContents.send('oauth-success', {
        accountId,
        type: 'microsoft365',
        email: userInfo.mail || userInfo.userPrincipalName,
        displayName: userInfo.displayName
      })

      return { success: true, email: userInfo.mail || userInfo.userPrincipalName }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      mainWindow.webContents.send('oauth-error', { accountId, error: errorMessage })
      throw error
    }
  })

  ipcMain.handle('oauth-start-gmail', async (_event, accountId: string) => {
    try {
      await gmailService.authorize(accountId)
      const userInfo = await gmailService.getUserInfo(accountId)

      mainWindow.webContents.send('oauth-success', {
        accountId,
        type: 'gmail',
        email: userInfo.emailAddress,
        displayName: userInfo.emailAddress
      })

      return { success: true, email: userInfo.emailAddress }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      mainWindow.webContents.send('oauth-error', { accountId, error: errorMessage })
      throw error
    }
  })

  applyAutoSyncSchedule(settingsService.getSettings())
}
