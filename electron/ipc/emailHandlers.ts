import { ipcMain } from 'electron'
import type { EmailListQuery, EmailSearchQuery, EmailListResponse, EmailMetadata } from '../../src/types/email'
import * as fs from 'fs/promises'
import * as path from 'path'
import { simpleParser } from 'mailparser'
import { SettingsService } from '../services/SettingsService'

const settingsService = new SettingsService()
const getBackupRoot = () => settingsService.getBackupRoot()

const getIndexPath = (accountEmail: string): string => {
  return path.join(getBackupRoot(), accountEmail, 'metadata', 'index', `${accountEmail}_index.json`)
}

const toSafeNumber = (value: unknown): number => {
  if (typeof value === 'number') return value
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(parsed) ? parsed : 0
}

const convertToEmailMetadata = (mail: any): EmailMetadata => {
  return {
    uid: toSafeNumber(mail.uid ?? mail.mail_unique_id ?? mail.message_id),
    messageId: mail.message_id || mail.mail_unique_id,
    subject: mail.subject || '',
    senderEmail: mail.sender_email || '',
    senderName: mail.sender_name || '',
    receivedTimestamp: mail.received_timestamp,
    hasAttachments: Boolean(mail.has_attachments),
    attachments: mail.attachments || [],
    emlFilePath: mail.eml_file_path || mail.eml_path || mail.emlFilePath || '',
    folder: mail.folder || 'INBOX'
  }
}

export const registerEmailHandlers = () => {
  ipcMain.handle('email-list', async (_event, query: EmailListQuery): Promise<EmailListResponse> => {
    try {
      const { accountEmail, folder = 'INBOX', limit = 50, offset = 0 } = query

      const indexPath = getIndexPath(accountEmail)
      const indexContent = await fs.readFile(indexPath, 'utf-8')
      const indexData = JSON.parse(indexContent)

      const allEmails: EmailMetadata[] = (indexData.mails || []).map(convertToEmailMetadata)
      const folderEmails = folder ? allEmails.filter((email) => email.folder === folder) : allEmails

      folderEmails.sort((a, b) => new Date(b.receivedTimestamp).getTime() - new Date(a.receivedTimestamp).getTime())

      const paginatedEmails = folderEmails.slice(offset, offset + limit)

      return {
        emails: paginatedEmails,
        total: folderEmails.length,
        hasMore: offset + limit < folderEmails.length
      }
    } catch (error) {
      console.error('Failed to get email list:', error)
      return {
        emails: [],
        total: 0,
        hasMore: false
      }
    }
  })

  ipcMain.handle('email-get', async (_event, accountEmail: string, emlPath: string) => {
    try {
      if (!emlPath) {
        return { success: false, error: 'EML path is empty' }
      }

      const resolvedPath = path.isAbsolute(emlPath)
        ? emlPath
        : path.join(getBackupRoot(), accountEmail, emlPath)

      const raw = await fs.readFile(resolvedPath, 'utf-8')
      const parsed = await simpleParser(raw)

      const html = typeof parsed.html === 'string'
        ? parsed.html
        : Buffer.isBuffer(parsed.html)
          ? parsed.html.toString('utf-8')
          : undefined

      return {
        success: true,
        content: {
          html,
          text: parsed.text || undefined,
          raw
        }
      }
    } catch (error) {
      console.error('Failed to get email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('email-search', async (_event, query: EmailSearchQuery): Promise<EmailListResponse> => {
    try {
      const { accountEmail, keyword, from, dateFrom, dateTo, hasAttachments, folder, limit = 50, offset = 0 } = query

      const indexPath = getIndexPath(accountEmail)
      const indexContent = await fs.readFile(indexPath, 'utf-8')
      const indexData = JSON.parse(indexContent)

      let emails: EmailMetadata[] = (indexData.mails || []).map(convertToEmailMetadata)

      if (keyword) {
        const lowerKeyword = keyword.toLowerCase()
        emails = emails.filter(
          (email) =>
            email.subject.toLowerCase().includes(lowerKeyword) ||
            email.senderEmail.toLowerCase().includes(lowerKeyword) ||
            (email.senderName || '').toLowerCase().includes(lowerKeyword)
        )
      }

      if (from) {
        emails = emails.filter((email) => email.senderEmail.toLowerCase().includes(from.toLowerCase()))
      }

      if (dateFrom) {
        const fromDate = new Date(dateFrom).getTime()
        emails = emails.filter((email) => new Date(email.receivedTimestamp).getTime() >= fromDate)
      }

      if (dateTo) {
        const toDate = new Date(dateTo).getTime()
        emails = emails.filter((email) => new Date(email.receivedTimestamp).getTime() <= toDate)
      }

      if (hasAttachments !== undefined) {
        emails = emails.filter((email) => email.hasAttachments === hasAttachments)
      }

      if (folder) {
        emails = emails.filter((email) => email.folder === folder)
      }

      emails.sort((a, b) => new Date(b.receivedTimestamp).getTime() - new Date(a.receivedTimestamp).getTime())

      const paginatedEmails = emails.slice(offset, offset + limit)

      return {
        emails: paginatedEmails,
        total: emails.length,
        hasMore: offset + limit < emails.length
      }
    } catch (error) {
      console.error('Failed to search emails:', error)
      return {
        emails: [],
        total: 0,
        hasMore: false
      }
    }
  })
}
