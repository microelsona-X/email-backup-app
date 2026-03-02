import { ConfidentialClientApplication } from '@azure/msal-node'
import { Client } from '@microsoft/microsoft-graph-client'
import { MICROSOFT_OAUTH_CONFIG } from '../config/oauth-config'
import { OAuthService } from './OAuthService'
import Store from 'electron-store'

interface TokenData {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

/**
 * Microsoft Graph API 服务
 */
export class GraphService {
  private oauthService: OAuthService
  private store: Store
  private msalClient: ConfidentialClientApplication

  constructor() {
    this.oauthService = new OAuthService()
    this.store = new Store()

    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: MICROSOFT_OAUTH_CONFIG.clientId,
        clientSecret: MICROSOFT_OAUTH_CONFIG.clientSecret,
        authority: 'https://login.microsoftonline.com/common'
      }
    })
  }

  /**
   * 启动 OAuth 授权流程
   */
  async authorize(accountId: string): Promise<TokenData> {
    const authUrl = await this.msalClient.getAuthCodeUrl({
      scopes: MICROSOFT_OAUTH_CONFIG.scopes,
      redirectUri: MICROSOFT_OAUTH_CONFIG.redirectUri
    })

    const code = await this.oauthService.startAuthFlow(
      authUrl,
      MICROSOFT_OAUTH_CONFIG.redirectUri
    )

    const tokenResponse = await this.msalClient.acquireTokenByCode({
      code,
      scopes: MICROSOFT_OAUTH_CONFIG.scopes,
      redirectUri: MICROSOFT_OAUTH_CONFIG.redirectUri
    })

    const tokenData: TokenData = {
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.account?.homeAccountId || '',
      expiresAt: tokenResponse.expiresOn?.getTime() || Date.now() + 3600000
    }

    this.store.set(`tokens.${accountId}`, tokenData)
    this.store.set(`account.${accountId}`, tokenResponse.account)
    return tokenData
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(accountId: string): Promise<TokenData> {
    const account = this.store.get(`account.${accountId}`) as any

    if (!account) {
      throw new Error('No account found')
    }

    const tokenResponse = await this.msalClient.acquireTokenSilent({
      account,
      scopes: MICROSOFT_OAUTH_CONFIG.scopes
    })

    if (!tokenResponse) {
      throw new Error('Failed to refresh token')
    }

    const newTokenData: TokenData = {
      accessToken: tokenResponse.accessToken,
      refreshToken: account.homeAccountId,
      expiresAt: tokenResponse.expiresOn?.getTime() || Date.now() + 3600000
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
   * 创建 Graph 客户端
   */
  private async createClient(accountId: string): Promise<Client> {
    const accessToken = await this.getAccessToken(accountId)
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken)
      }
    })
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(accountId: string): Promise<any> {
    const client = await this.createClient(accountId)
    return await client.api('/me').get()
  }

  /**
   * 获取邮件列表
   */
  async getMessages(accountId: string, folderId: string = 'inbox', top: number = 50): Promise<any[]> {
    const client = await this.createClient(accountId)
    const response = await client
      .api(`/me/mailFolders/${folderId}/messages`)
      .top(top)
      .select('id,subject,from,toRecipients,receivedDateTime,hasAttachments,isRead')
      .orderby('receivedDateTime DESC')
      .get()

    return response.value || []
  }

  /**
   * 获取邮件详情（包含正文）
   */
  async getMessage(accountId: string, messageId: string): Promise<any> {
    const client = await this.createClient(accountId)
    return await client.api(`/me/messages/${messageId}`).get()
  }

  /**
   * 获取邮件附件列表
   */
  async getAttachments(accountId: string, messageId: string): Promise<any[]> {
    const client = await this.createClient(accountId)
    const response = await client.api(`/me/messages/${messageId}/attachments`).get()
    return response.value || []
  }

  /**
   * 下载附件
   */
  async downloadAttachment(accountId: string, messageId: string, attachmentId: string): Promise<Buffer> {
    const client = await this.createClient(accountId)
    const attachment = await client.api(`/me/messages/${messageId}/attachments/${attachmentId}`).get()

    if (attachment.contentBytes) {
      return Buffer.from(attachment.contentBytes, 'base64')
    }

    throw new Error('Attachment has no content')
  }

  /**
   * 获取邮件文件夹列表
   */
  async getFolders(accountId: string): Promise<any[]> {
    const client = await this.createClient(accountId)
    const response = await client.api('/me/mailFolders').get()
    return response.value || []
  }
}