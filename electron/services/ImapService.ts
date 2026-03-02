import { ImapFlow } from 'imapflow'
import { simpleParser, AddressObject } from 'mailparser'
import type { IMAPConfig } from '../../src/types/account'
import type { Email } from '../../src/types/email'

// Helper function to extract email addresses from AddressObject
const extractAddresses = (addressObj: AddressObject | AddressObject[] | undefined): Array<{ name: string; email: string }> => {
  if (!addressObj) return []

  const addresses = Array.isArray(addressObj) ? addressObj : [addressObj]
  const result: Array<{ name: string; email: string }> = []

  addresses.forEach(addr => {
    if ('value' in addr && Array.isArray(addr.value)) {
      addr.value.forEach((item: any) => {
        result.push({
          name: item.name || '',
          email: item.address || ''
        })
      })
    }
  })

  return result
}

export class ImapService {
  private client: ImapFlow | null = null

  async connect(config: IMAPConfig): Promise<void> {
    console.log('[ImapService] Connecting to IMAP server:', config.host)

    this.client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password
      },
      logger: false
    })

    await this.client.connect()
    console.log('[ImapService] Successfully connected to IMAP server')
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.logout()
      this.client = null
    }
  }

  async testConnection(config: IMAPConfig): Promise<{ success: boolean; error?: string }> {
    try {
      await this.connect(config)
      await this.disconnect()
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('IMAP connection test failed:', errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  async listFolders(): Promise<string[]> {
    if (!this.client) {
      throw new Error('Not connected to IMAP server')
    }

    const folders = await this.client.list()
    return folders.map((folder) => folder.path)
  }

  async fetchEmails(folder: string, sinceUID: number = 1): Promise<Email[]> {
    console.log('[ImapService] fetchEmails called - folder:', folder, 'sinceUID:', sinceUID)

    if (!this.client) {
      console.error('[ImapService] No client available!')
      throw new Error('Not connected to IMAP server')
    }

    console.log('[ImapService] Getting mailbox lock for folder:', folder)
    const lock = await this.client.getMailboxLock(folder)
    const emails: Email[] = []

    try {
      const range = sinceUID > 1 ? `${sinceUID}:*` : '1:*'
      console.log('[ImapService] Fetching emails with range:', range)

      for await (const message of this.client.fetch(range, {
        uid: true,
        envelope: true,
        bodyStructure: true,
        source: true
      })) {
        if (!message.source) continue

        const parsed = await simpleParser(message.source)

        const email: Email = {
          uid: message.uid,
          messageId: parsed.messageId || '',
          subject: parsed.subject || '(No Subject)',
          from: {
            name: parsed.from?.value[0]?.name || '',
            email: parsed.from?.value[0]?.address || ''
          },
          to: extractAddresses(parsed.to),
          cc: extractAddresses(parsed.cc),
          date: parsed.date || new Date(),
          hasAttachments: (parsed.attachments?.length || 0) > 0,
          attachments: parsed.attachments?.map((att: any) => ({
            filename: att.filename || 'unnamed',
            size: att.size || 0,
            contentType: att.contentType || 'application/octet-stream'
          })) || [],
          bodyText: parsed.text || '',
          bodyHtml: parsed.html || '',
          folder,
          source: message.source.toString()
        }

        emails.push(email)
      }

      console.log('[ImapService] Successfully fetched', emails.length, 'emails')
    } catch (error) {
      console.error('[ImapService] Error during fetch:', error)
      throw error
    } finally {
      lock.release()
      console.log('[ImapService] Released mailbox lock')
    }

    return emails
  }

  async getEmailSource(folder: string, uid: number): Promise<string> {
    if (!this.client) {
      throw new Error('Not connected to IMAP server')
    }

    const lock = await this.client.getMailboxLock(folder)

    try {
      const message = await this.client.fetchOne(`${uid}`, { source: true, uid: true })
      if (!message || !message.source) {
        throw new Error('Failed to fetch email source')
      }
      return message.source.toString()
    } finally {
      lock.release()
    }
  }
}
