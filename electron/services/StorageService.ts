import * as fs from 'fs'
import * as path from 'path'
import { format } from 'date-fns'
import type { Email, EmailMetadata } from '../../src/types/email'
import { SettingsService } from './SettingsService'

export class StorageService {
  private settingsService = new SettingsService()

  private getBackupRoot(): string {
    return this.settingsService.getBackupRoot()
  }

  private getAccountPath(accountEmail: string): string {
    return path.join(this.getBackupRoot(), accountEmail)
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  async saveEmail(accountEmail: string, email: Email, emlSource: string): Promise<string> {
    const accountPath = this.getAccountPath(accountEmail)
    const dataPath = path.join(accountPath, 'data')
    this.ensureDirectoryExists(dataPath)

    const timestamp = format(email.date, 'yyyyMMddHHmmss')
    const filename = `${timestamp}_${email.uid}.eml`
    const emlPath = path.join(dataPath, filename)

    fs.writeFileSync(emlPath, emlSource, 'utf-8')

    return emlPath
  }

  async saveAttachments(
    accountEmail: string,
    email: Email,
    attachmentsData: Array<{ filename: string; content: Buffer }>
  ): Promise<string[]> {
    if (attachmentsData.length === 0) {
      return []
    }

    const accountPath = this.getAccountPath(accountEmail)
    const timestamp = format(email.date, 'yyyyMMddHHmmss')
    const attachmentFolderName = `${timestamp}_${email.uid}_attachments`
    const attachmentPath = path.join(accountPath, 'attachments', attachmentFolderName)
    
    this.ensureDirectoryExists(attachmentPath)

    const savedPaths: string[] = []

    for (const att of attachmentsData) {
      const safeName = att.filename.replace(/[<>:"/\|?*]/g, '_')
      const attPath = path.join(attachmentPath, safeName)
      fs.writeFileSync(attPath, att.content)
      savedPaths.push(attPath)
    }

    return savedPaths
  }

  async saveMetadata(accountEmail: string, email: Email, emlPath: string): Promise<void> {
    const accountPath = this.getAccountPath(accountEmail)
    const metadataPath = path.join(accountPath, 'metadata', 'single')
    this.ensureDirectoryExists(metadataPath)

    const timestamp = format(email.date, 'yyyyMMddHHmmss')
    const filename = `${timestamp}_${email.uid}_meta.json`
    const metaPath = path.join(metadataPath, filename)

    const metadata: EmailMetadata = {
      uid: email.uid,
      messageId: email.messageId,
      subject: email.subject,
      senderEmail: email.from.email,
      senderName: email.from.name,
      receivedTimestamp: format(email.date, 'yyyy-MM-dd HH:mm:ss'),
      hasAttachments: email.hasAttachments,
      attachments: email.attachments,
      emlFilePath: emlPath,
      folder: email.folder
    }

    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8')
  }

  async updateIndex(accountEmail: string, email: Email, emlPath: string): Promise<void> {
    const accountPath = this.getAccountPath(accountEmail)
    const indexPath = path.join(accountPath, 'metadata', 'index')
    this.ensureDirectoryExists(indexPath)

    const indexFile = path.join(indexPath, `${accountEmail}_index.json`)

    let indexData: any = {
      last_update: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      total_count: 0,
      last_uid: 0,
      mails: []
    }

    if (fs.existsSync(indexFile)) {
      const content = fs.readFileSync(indexFile, 'utf-8')
      indexData = JSON.parse(content)
    }

    indexData.mails.push({
      uid: email.uid,
      received_timestamp: format(email.date, 'yyyy-MM-dd HH:mm:ss'),
      subject: email.subject,
      sender_email: email.from.email,
      eml_file_path: emlPath
    })

    indexData.total_count = indexData.mails.length
    indexData.last_uid = Math.max(indexData.last_uid, email.uid)
    indexData.last_update = format(new Date(), 'yyyy-MM-dd HH:mm:ss')

    fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2), 'utf-8')
  }

  async getLastSyncUID(accountEmail: string): Promise<number> {
    const accountPath = this.getAccountPath(accountEmail)
    const indexFile = path.join(accountPath, 'metadata', 'index', `${accountEmail}_index.json`)

    if (!fs.existsSync(indexFile)) {
      return 0
    }

    const content = fs.readFileSync(indexFile, 'utf-8')
    const indexData = JSON.parse(content)
    return indexData.last_uid || 0
  }
}
