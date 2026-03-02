import { app, BrowserWindow } from 'electron'
import path from 'path'
import fs from 'fs'
import { registerIpcHandlers } from './ipc/handlers'
import { registerEmailHandlers } from './ipc/emailHandlers'

let mainWindow: BrowserWindow | null = null

const getAppIconPath = () => {
  const candidates = process.env.VITE_DEV_SERVER_URL
    ? [
        path.join(process.cwd(), 'build', 'icon.ico'),
        path.join(process.cwd(), 'public', 'logo.svg')
      ]
    : [
        path.join(process.resourcesPath, 'build', 'icon.ico'),
        path.join(__dirname, '../build/icon.ico'),
        path.join(__dirname, '../dist/logo.svg')
      ]

  const hit = candidates.find((candidate) => fs.existsSync(candidate))
  if (hit) {
    return hit
  }

  return ''
}

const getRendererEntryCandidates = () => {
  return [
    path.join(__dirname, '../dist/index.html'),
    path.join(__dirname, '../index.html'),
    path.join(app.getAppPath(), 'dist/index.html'),
    path.join(process.cwd(), 'dist/index.html')
  ]
}

const createWindow = () => {
  const iconPath = getAppIconPath()
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    ...(iconPath ? { icon: iconPath } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    const entry = getRendererEntryCandidates().find((candidate) => fs.existsSync(candidate))
    if (!entry) {
      throw new Error('Renderer entry not found. Expected dist/index.html')
    }
    mainWindow.loadFile(entry)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  registerIpcHandlers(mainWindow)
  registerEmailHandlers()
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
