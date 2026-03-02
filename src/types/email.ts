/**
 * 邮件类型定义
 */

export interface EmailAddress {
  name?: string
  email: string
}

export interface Attachment {
  filename: string
  size: number
  contentType?: string
  savedPath?: string
}

export interface Email {
  uid: number
  messageId?: string
  subject: string
  from: EmailAddress
  to: EmailAddress[]
  cc?: EmailAddress[]
  date: Date
  hasAttachments: boolean
  attachments: Attachment[]
  bodyText?: string
  bodyHtml?: string
  folder: string
  source?: string
}

export interface EmailMetadata {
  uid: number
  messageId?: string
  subject: string
  senderEmail: string
  senderName?: string
  receivedTimestamp: string
  hasAttachments: boolean
  attachments: Attachment[]
  emlFilePath: string
  folder: string
}

export interface EmailContent {
  html?: string
  text?: string
  raw?: string
}

/**
 * 邮件列表查询参数
 */
export interface EmailListQuery {
  accountEmail: string
  folder?: string
  limit?: number
  offset?: number
}

/**
 * 邮件搜索参数
 */
export interface EmailSearchQuery {
  accountEmail: string
  keyword?: string
  from?: string
  dateFrom?: string
  dateTo?: string
  hasAttachments?: boolean
  folder?: string
  limit?: number
  offset?: number
}

/**
 * 邮件列表响应
 */
export interface EmailListResponse {
  emails: EmailMetadata[]
  total: number
  hasMore: boolean
}
