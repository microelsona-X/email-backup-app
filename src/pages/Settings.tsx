import React, { useEffect, useState } from 'react'
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Switch,
  InputNumber,
  Space,
  message,
  Divider,
  Select,
  Alert
} from 'antd'
import { FolderOpenOutlined, SaveOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { AppSettings } from '../types/settings'

const { Title, Paragraph } = Typography

const DEFAULT_SETTINGS: AppSettings = {
  backupRoot: '',
  autoSyncEnabled: false,
  autoSyncIntervalMinutes: 60,
  language: 'zh-CN'
}

export const Settings: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [form] = Form.useForm<AppSettings>()
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  const normalizeError = (error: unknown) => {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    if (msg.includes('Invalid channel')) {
      return 'Settings IPC channel is unavailable. Please fully restart the Electron app and try again.'
    }
    return msg
  }

  const loadSettings = async () => {
    setLoading(true)
    setErrorText(null)
    try {
      const settings = (await window.electronAPI.invoke('settings-get')) as AppSettings
      form.setFieldsValue(settings)
    } catch (error) {
      const msg = normalizeError(error)
      setErrorText(msg)
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSettings()
  }, [])

  const handleBrowse = async () => {
    try {
      setErrorText(null)
      const selected = (await window.electronAPI.invoke('settings-select-directory')) as string | null
      if (selected) {
        form.setFieldValue('backupRoot', selected)
      }
    } catch (error) {
      const msg = normalizeError(error)
      setErrorText(msg)
      message.error(msg)
    }
  }

  const handleSave = async () => {
    setSaveLoading(true)
    try {
      setErrorText(null)
      const values = { ...DEFAULT_SETTINGS, ...(await form.validateFields()) }
      const updated = (await window.electronAPI.invoke('settings-update', values)) as AppSettings

      form.setFieldsValue(updated)
      if (i18n.language !== updated.language) {
        await i18n.changeLanguage(updated.language)
        localStorage.setItem('language', updated.language)
      }

      message.success(t('settings.saved'))
    } catch (error) {
      const msg = normalizeError(error)
      setErrorText(msg)
      message.error(msg)
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 32px) clamp(16px, 4vw, 48px)', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.5px' }}>
          {t('settings.title')}
        </Title>
        <Paragraph style={{ margin: '8px 0 0 0', fontSize: 15, color: '#86868b' }}>{t('settings.description')}</Paragraph>
      </div>

      <Card style={{ borderRadius: 16, border: '1px solid rgba(0, 0, 0, 0.06)', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)' }}>
        {errorText && <Alert type="error" showIcon message={errorText} style={{ marginBottom: 16 }} />}

        <Form form={form} layout="vertical">
          <Title level={4} style={{ marginTop: 0 }}>{t('settings.backupTitle')}</Title>
          <Form.Item
            label={t('settings.backupPath')}
            name="backupRoot"
            rules={[{ required: true, message: t('settings.backupPath') }]}
          >
            <Input
              addonAfter={
                <Button type="text" icon={<FolderOpenOutlined />} onClick={handleBrowse}>
                  {t('settings.browse')}
                </Button>
              }
            />
          </Form.Item>
          <Paragraph style={{ color: '#86868b', marginTop: -8 }}>{t('settings.backupHint')}</Paragraph>

          <Divider />

          <Title level={4}>{t('settings.syncTitle')}</Title>
          <Form.Item
            label={t('settings.autoSyncEnabled')}
            name="autoSyncEnabled"
            valuePropName="checked"
          >
            <Switch checkedChildren={t('common.confirm')} unCheckedChildren={t('common.cancel')} />
          </Form.Item>
          <Form.Item
            label={t('settings.autoSyncInterval')}
            name="autoSyncIntervalMinutes"
            rules={[{ required: true }, { type: 'number', min: 5, message: '>= 5' }]}
          >
            <InputNumber min={5} max={1440} style={{ width: 220 }} />
          </Form.Item>
          <Paragraph style={{ color: '#86868b', marginTop: -8 }}>{t('settings.autoSyncHint')}</Paragraph>

          <Divider />

          <Title level={4}>{t('settings.languageTitle')}</Title>
          <Form.Item label={t('settings.languageLabel')} name="language" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'zh-CN', label: '中文' },
                { value: 'en-US', label: 'English' }
              ]}
              style={{ width: 220 }}
            />
          </Form.Item>

          <Space style={{ marginTop: 8 }}>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saveLoading || loading}>
              {t('settings.save')}
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  )
}
