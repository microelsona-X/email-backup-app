import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { GMAIL_OAUTH_CONFIG } from '../config/oauth-config'
import { OAuthService } from './OAuthService'
import Store from 'electron-store'

interface TokenData {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

/**
 * Gmail API 服务
 */
export class GmailService {
  private oauthService: OAuthService
  private store: Store
  private oauth2Client: OAuth2Client

  constructor() {
    this.oauthService = new OAuthService()
    this.store = new Store()

    this.oauth2Client = new google.auth.OAuth2(
      GMAIL_OAUTH_CONFIG.clientId,
      GMAIL_OAUTH_CONFIG.clientSecret,
      GMAIL_OAUTH_CONFIG.redirectUri
    )
  }

  /**
   * 启动 OAuth 授权流程
   */
  async authorize(accountId: string): Promise<TokenData> {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: GMAIL_OAUTH_CONFIG.scopes,
      prompt: 'consent'
    })

    const code = await this.oauthService.startAuthFlow(
      authUrl,
      GMAIL_OAUTH_CONFIG.redirectUri
    )

    const { tokens } = await this.oauth2Client.getToken(code)

    const tokenData: TokenData = {
      accessToken: tokens.access_token || '',
      refreshToken: tokens.refresh_token || '',
      expiresAt: tokens.expiry_date || Date.now() + 3600000
    }

    this.oauth2Client.setCredentials(tokens)
    this.store.set(`tokens.${accountId}`, tokenData)
    return tokenData
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(accountId: string): Promise<TokenData> {
    const tokenData = this.store.get(`tokens.${accountId}`) as TokenData
    if (!tokenData || !tokenData.refreshToken) {
      throw new Error('No refresh token found')
    }

    this.oauth2Client.setCredentials({
      refresh_token: tokenData.refreshToken
    })

    const { credentials } = await this.oauth2Client.refreshAccessToken()

    const newTokenData: TokenData = {
      accessToken: credentials.access_token || tokenData.accessToken,
      refreshToken: credentials.refresh_token || tokenData.refreshToken,
      expiresAt: credentials.expiry_date || Date.now() + 3600000
    }

    this.store.set(`tokens.${accountId}`, newTokenData)
    return newTokenData
  }

  /**
   * 获取有效的访问令牌（自动刷新）
   */
  async getAccessToken(accountId: string): Promise<string> {
    const tokenData = this.store.get(`tokens.${accountId}`) as TokenData
    if (!tokenData) {
      throw new Error('No token found')
    }

    // 如果令牌即将过期（5分钟内），刷新它
    if (tokenData.expiresAt - Date.now() < 5 * 60 * 1000) {
      const newTokenData = await this.refreshToken(accountId)
      return newTokenData.accessToken
    }

    return tokenData.accessToken
  }

  /**
   * 创建 Gmail 客户端
   */
  private async createClient(accountId: string) {
    const accessToken = await this.getAccessToken(accountId)
    this.oauth2Client.setCredentials({
      access_token: accessToken
    })
    return google.gmail({ version: 'v1', auth: this.oauth2Client })
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(accountId: string): Promise<any> {
    const gmail = await this.createClient(accountId)
    const response = await gmail.users.getProfile({ userId: 'me' })
    return response.data
  }

  /**
   * 获取邮件列表
   */
  async getMessages(accountId: string, labelIds: string[] = ['INBOX'], maxResults: number = 50): Promise<any[]> {
    const gmail = await this.createClient(accountId)
    const response = await gmail.users.messages.list({
      userId: 'me',
      labelIds,
      maxResults
    })

    return response.data.messages || []
  }

  /**
   * 获取邮件详情
   */
  async getMessage(accountId: string, messageId: string): Promise<any> {
    const gmail = await this.createClient(accountId)
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    })

    return response.data
  }

  /**
   * 获取邮件附件
   */
  async getAttachment(accountId: string, messageId: string, attachmentId: string): Promise<Buffer> {
    const gmail = await this.createClient(accountId)
    const response = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId,
      id: attachmentId
    })

    if (response.data.data) {
      return Buffer.from(response.data.data, 'base64')
    }

    throw new Error('Attachment has no content')
  }

  /**
   * 获取标签列表
   */
  async getLabels(accountId: string): Promise<any[]> {
    const gmail = await this.createClient(accountId)
    const response = await gmail.users.labels.list({
      userId: 'me'
    })

    return response.data.labels || []
  }
}
