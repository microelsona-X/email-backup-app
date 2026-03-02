import { BrowserWindow } from 'electron'
import * as http from 'http'
import { URL } from 'url'

/**
 * OAuth 服务 - 处理 OAuth 2.0 授权流程
 */
export class OAuthService {
  private server: http.Server | null = null
  private authWindow: BrowserWindow | null = null

  /**
   * 启动 OAuth 授权流程
   * @param authUrl 授权 URL
   * @param redirectUri 重定向 URI
   * @returns 授权码
   */
  async startAuthFlow(authUrl: string, redirectUri: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // 创建临时 HTTP 服务器接收回调
      this.server = http.createServer((req, res) => {
        const url = new URL(req.url!, `http://localhost`)

        if (url.pathname === '/oauth/callback') {
          const code = url.searchParams.get('code')
          const error = url.searchParams.get('error')

          if (error) {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
            res.end(`
              <html>
                <body style="font-family: system-ui; text-align: center; padding: 50px;">
                  <h1>❌ 授权失败</h1>
                  <p>错误: ${error}</p>
                  <p>您可以关闭此窗口</p>
                </body>
              </html>
            `)
            this.cleanup()
            reject(new Error(`OAuth error: ${error}`))
          } else if (code) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
            res.end(`
              <html>
                <body style="font-family: system-ui; text-align: center; padding: 50px;">
                  <h1>✅ 授权成功</h1>
                  <p>您可以关闭此窗口</p>
                  <script>window.close()</script>
                </body>
              </html>
            `)
            this.cleanup()
            resolve(code)
          } else {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
            res.end(`
              <html>
                <body style="font-family: system-ui; text-align: center; padding: 50px;">
                  <h1>❌ 授权失败</h1>
                  <p>未收到授权码</p>
                  <p>您可以关闭此窗口</p>
                </body>
              </html>
            `)
            this.cleanup()
            reject(new Error('No authorization code received'))
          }
        }
      })

      // 启动服务器
      const port = new URL(redirectUri).port || '3000'
      this.server.listen(parseInt(port), () => {
        console.log(`OAuth callback server listening on port ${port}`)

        // 打开授权窗口
        this.authWindow = new BrowserWindow({
          width: 600,
          height: 800,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
          }
        })

        this.authWindow.loadURL(authUrl)

        // 监听窗口关闭
        this.authWindow.on('closed', () => {
          this.authWindow = null
          if (this.server) {
            this.cleanup()
            reject(new Error('Authorization window closed'))
          }
        })
      })

      // 设置超时
      setTimeout(() => {
        if (this.server) {
          this.cleanup()
          reject(new Error('Authorization timeout'))
        }
      }, 5 * 60 * 1000) // 5 分钟超时
    })
  }

  /**
   * 清理资源
   */
  private cleanup() {
    if (this.server) {
      this.server.close()
      this.server = null
    }
    if (this.authWindow && !this.authWindow.isDestroyed()) {
      this.authWindow.close()
      this.authWindow = null
    }
  }

  /**
   * 取消授权流程
   */
  cancel() {
    this.cleanup()
  }
}
