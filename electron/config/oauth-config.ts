/**
 * OAuth 配置
 *
 * 注意：这些是示例配置，实际使用时需要：
 * 1. 在 Microsoft Azure Portal 注册应用获取真实的 Client ID 和 Secret
 * 2. 在 Google Cloud Console 创建项目获取真实的 Client ID 和 Secret
 * 3. 将敏感信息存储在环境变量或安全的配置文件中
 */

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

export const MICROSOFT_OAUTH_CONFIG: OAuthConfig = {
  clientId: process.env.MICROSOFT_CLIENT_ID || 'YOUR_MICROSOFT_CLIENT_ID',
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'YOUR_MICROSOFT_CLIENT_SECRET',
  redirectUri: 'http://localhost:3000/oauth/callback',
  scopes: [
    'https://graph.microsoft.com/Mail.Read',
    'https://graph.microsoft.com/Mail.ReadWrite',
    'offline_access'
  ]
}

export const GMAIL_OAUTH_CONFIG: OAuthConfig = {
  clientId: process.env.GMAIL_CLIENT_ID || 'YOUR_GMAIL_CLIENT_ID',
  clientSecret: process.env.GMAIL_CLIENT_SECRET || 'YOUR_GMAIL_CLIENT_SECRET',
  redirectUri: 'http://localhost:3000/oauth/callback',
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
  ]
}

export const OAUTH_SERVER_PORT = 3000
