import * as fs from 'fs'
import * as path from 'path'
import type { AppSettings } from '../../src/types/settings'

const APP_SETTINGS_DIR = path.join(process.env.APPDATA || process.env.USERPROFILE || '', 'MailGuardian')
const APP_SETTINGS_FILE = path.join(APP_SETTINGS_DIR, 'settings.json')

const getDefaultBackupRoot = (): string => {
  return path.join(process.env.USERPROFILE || '', 'Desktop', 'OutlookBackup')
}

const DEFAULT_SETTINGS: AppSettings = {
  backupRoot: getDefaultBackupRoot(),
  autoSyncEnabled: false,
  autoSyncIntervalMinutes: 60,
  language: 'zh-CN'
}

export class SettingsService {
  private ensureSettingsFile(): void {
    if (!fs.existsSync(APP_SETTINGS_DIR)) {
      fs.mkdirSync(APP_SETTINGS_DIR, { recursive: true })
    }

    if (!fs.existsSync(APP_SETTINGS_FILE)) {
      fs.writeFileSync(APP_SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8')
    }
  }

  getSettings(): AppSettings {
    this.ensureSettingsFile()

    try {
      const content = fs.readFileSync(APP_SETTINGS_FILE, 'utf-8')
      const parsed = JSON.parse(content) as Partial<AppSettings>
      return {
        backupRoot: parsed.backupRoot || DEFAULT_SETTINGS.backupRoot,
        autoSyncEnabled: parsed.autoSyncEnabled ?? DEFAULT_SETTINGS.autoSyncEnabled,
        autoSyncIntervalMinutes: Math.max(5, Number(parsed.autoSyncIntervalMinutes || DEFAULT_SETTINGS.autoSyncIntervalMinutes)),
        language: parsed.language === 'en-US' ? 'en-US' : 'zh-CN'
      }
    } catch {
      return { ...DEFAULT_SETTINGS }
    }
  }

  updateSettings(partial: Partial<AppSettings>): AppSettings {
    const current = this.getSettings()
    const updated: AppSettings = {
      backupRoot: partial.backupRoot || current.backupRoot,
      autoSyncEnabled: partial.autoSyncEnabled ?? current.autoSyncEnabled,
      autoSyncIntervalMinutes: Math.max(5, Number(partial.autoSyncIntervalMinutes ?? current.autoSyncIntervalMinutes)),
      language: partial.language === 'en-US' || partial.language === 'zh-CN' ? partial.language : current.language
    }

    if (!fs.existsSync(updated.backupRoot)) {
      fs.mkdirSync(updated.backupRoot, { recursive: true })
    }

    fs.writeFileSync(APP_SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8')
    return updated
  }

  getBackupRoot(): string {
    return this.getSettings().backupRoot
  }
}
