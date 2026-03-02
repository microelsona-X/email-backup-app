import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Switch, Button, Alert, Space, Typography, Divider, Segmented } from 'antd'
import { MailOutlined, LockOutlined, GlobalOutlined, InfoCircleOutlined, WindowsOutlined, GoogleOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { AccountCreateInput, Account, AccountType } from '../types/account'

const { Paragraph, Text } = Typography

interface AddAccountDialogProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  onTestConnection: (config: AccountCreateInput) => Promise<{ success: boolean; error?: string }>
  onAddAccount: (config: AccountCreateInput) => Promise<Account>
}

const IMAP_PROVIDERS: Record<string, { host: string; port: number; secure: boolean }> = {
  'gmail.com': { host: 'imap.gmail.com', port: 993, secure: true },
  'googlemail.com': { host: 'imap.gmail.com', port: 993, secure: true },
  'outlook.com': { host: 'outlook.office365.com', port: 993, secure: true },
  'hotmail.com': { host: 'outlook.office365.com', port: 993, secure: true },
  'live.com': { host: 'outlook.office365.com', port: 993, secure: true },
  'yahoo.com': { host: 'imap.mail.yahoo.com', port: 993, secure: true },
  'icloud.com': { host: 'imap.mail.me.com', port: 993, secure: true },
  'me.com': { host: 'imap.mail.me.com', port: 993, secure: true }
}

const detectProvider = (email: string) => {
  const domain = email.split('@')[1]?.toLowerCase()
  return domain ? IMAP_PROVIDERS[domain] : null
}

export const AddAccountDialog: React.FC<AddAccountDialogProps> = ({
  open,
  onClose,
  onSuccess,
  onTestConnection,
  onAddAccount
}) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [accountType, setAccountType] = useState<AccountType>('imap')
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null)

  useEffect(() => {
    if (open) {
      form.resetFields()
      setAccountType('imap')
      setTestResult(null)
    }
  }, [open, form])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    const provider = detectProvider(email)

    if (provider) {
      form.setFieldsValue({
        host: provider.host,
        port: provider.port,
        secure: provider.secure
      })
    }
  }

  const handleTestConnection = async () => {
    try {
      const values = await form.validateFields()
      setTesting(true)
      setTestResult(null)

      const config: AccountCreateInput = {
        email: values.email,
        displayName: values.displayName || values.email,
        config: {
          host: values.host,
          port: values.port,
          username: values.username || values.email,
          password: values.password,
          secure: values.secure
        }
      }

      const result = await onTestConnection(config)
      setTestResult(result)
    } catch (error) {
      console.error('Validation failed:', error)
    } finally {
      setTesting(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const config: AccountCreateInput = {
        email: values.email,
        displayName: values.displayName || values.email,
        type: accountType,
        config:
          accountType === 'imap'
            ? {
                host: values.host,
                port: values.port,
                username: values.username || values.email,
                password: values.password,
                secure: values.secure
              }
            : {
                accessToken: '',
                refreshToken: '',
                expiresAt: 0,
                scope: ''
              }
      }

      await onAddAccount(config)
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to add account:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleOAuthAuthorize = async (type: 'microsoft365' | 'gmail') => {
    try {
      setSaving(true)
      const accountId = `temp-${Date.now()}`

      const channel = type === 'microsoft365' ? 'oauth-start-microsoft' : 'oauth-start-gmail'
      const result = (await window.electronAPI.invoke(channel, accountId)) as { success: boolean; email: string }

      if (result.success) {
        onSuccess?.()
        onClose()
      }
    } catch (error) {
      console.error('OAuth authorization failed:', error)
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : t('addAccount.oauth.authFailed')
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={<span style={{ fontSize: 20, fontWeight: 600, color: '#1d1d1f' }}>{t('addAccount.title')}</span>}
      open={open}
      onCancel={onClose}
      footer={
        accountType === 'imap'
          ? [
              <Button key="cancel" onClick={onClose} size="large" style={{ height: 40, borderRadius: 8 }}>
                {t('common.cancel')}
              </Button>,
              <Button key="test" onClick={handleTestConnection} loading={testing} size="large" style={{ height: 40, borderRadius: 8 }}>
                {t('accounts.testConnection')}
              </Button>,
              <Button
                key="submit"
                type="primary"
                onClick={handleSubmit}
                loading={saving}
                disabled={!testResult?.success}
                size="large"
                style={{ height: 40, borderRadius: 8, background: '#007aff', border: 'none' }}
              >
                {t('accounts.addAccount')}
              </Button>
            ]
          : [
              <Button key="cancel" onClick={onClose} size="large" style={{ height: 40, borderRadius: 8 }}>
                {t('common.cancel')}
              </Button>
            ]
      }
      width={650}
      centered
    >
      <div style={{ marginBottom: 24 }}>
        <Text strong style={{ fontSize: 14, color: '#1d1d1f', display: 'block', marginBottom: 12 }}>
          {t('addAccount.selectType')}
        </Text>
        <Segmented
          value={accountType}
          onChange={(value) => {
            setAccountType(value as AccountType)
            setTestResult(null)
          }}
          options={[
            { label: t('addAccount.types.imap'), value: 'imap', icon: <MailOutlined /> },
            { label: t('addAccount.types.microsoft365'), value: 'microsoft365', icon: <WindowsOutlined /> },
            { label: t('addAccount.types.gmail'), value: 'gmail', icon: <GoogleOutlined /> }
          ]}
          block
          size="large"
          style={{ borderRadius: 8 }}
        />
      </div>

      {accountType === 'imap' && (
        <>
          <div style={{ background: '#f0f5ff', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid #d6e4ff' }}>
            <Space direction="vertical" size={4}>
              <Text strong style={{ fontSize: 14, color: '#1d1d1f' }}>
                <InfoCircleOutlined /> {t('guide.steps.addAccountTitle')}
              </Text>
              <Paragraph style={{ margin: 0, fontSize: 13, color: '#86868b' }}>{t('addAccount.steps.step1')}</Paragraph>
              <Paragraph style={{ margin: 0, fontSize: 13, color: '#86868b' }}>{t('addAccount.steps.step2')}</Paragraph>
              <Paragraph style={{ margin: 0, fontSize: 13, color: '#86868b' }}>{t('addAccount.steps.step3')}</Paragraph>
              <Paragraph style={{ margin: 0, fontSize: 13, color: '#86868b' }}>{t('addAccount.steps.step4')}</Paragraph>
            </Space>
          </div>

          <Form form={form} layout="vertical" initialValues={{ port: 993, secure: true }}>
            <Form.Item
              label={<span style={{ fontSize: 14, fontWeight: 500 }}>{t('addAccount.fields.email')}</span>}
              name="email"
              rules={[
                { required: true, message: t('addAccount.validation.emailRequired') },
                { type: 'email', message: t('addAccount.validation.emailInvalid') }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#86868b' }} />}
                placeholder={t('addAccount.fields.emailPlaceholder')}
                onChange={handleEmailChange}
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item label={<span style={{ fontSize: 14, fontWeight: 500 }}>{t('addAccount.fields.displayName')}</span>} name="displayName">
              <Input placeholder={t('addAccount.fields.displayNamePlaceholder')} size="large" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Divider style={{ margin: '16px 0' }} />

            <Form.Item
              label={<span style={{ fontSize: 14, fontWeight: 500 }}>{t('addAccount.fields.imapServer')}</span>}
              name="host"
              rules={[{ required: true, message: t('addAccount.validation.hostRequired') }]}
            >
              <Input
                prefix={<GlobalOutlined style={{ color: '#86868b' }} />}
                placeholder={t('addAccount.fields.imapServerPlaceholder')}
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Space style={{ width: '100%' }} size="large">
              <Form.Item
                label={<span style={{ fontSize: 14, fontWeight: 500 }}>{t('addAccount.fields.port')}</span>}
                name="port"
                rules={[
                  { required: true, message: t('addAccount.validation.portRequired') },
                  { type: 'number', min: 1, max: 65535, message: t('addAccount.validation.portInvalid') }
                ]}
              >
                <InputNumber style={{ width: '120px', borderRadius: 8 }} size="large" />
              </Form.Item>

              <Form.Item label={<span style={{ fontSize: 14, fontWeight: 500 }}>{t('addAccount.fields.useSSL')}</span>} name="secure" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Space>

            <Form.Item
              label={<span style={{ fontSize: 14, fontWeight: 500 }}>{t('addAccount.fields.username')}</span>}
              name="username"
              tooltip={t('addAccount.fields.usernameTooltip')}
            >
              <Input placeholder={t('addAccount.fields.usernamePlaceholder')} size="large" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontSize: 14, fontWeight: 500 }}>{t('addAccount.fields.password')}</span>}
              name="password"
              rules={[{ required: true, message: t('addAccount.validation.passwordRequired') }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#86868b' }} />}
                placeholder={t('addAccount.fields.passwordPlaceholder')}
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            {testResult && (
              <Alert
                message={testResult.success ? t('addAccount.connectionSuccess') : t('addAccount.connectionFailed')}
                description={testResult.error}
                type={testResult.success ? 'success' : 'error'}
                showIcon
                style={{ marginTop: '16px', borderRadius: 8 }}
              />
            )}
          </Form>
        </>
      )}

      {accountType === 'microsoft365' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <WindowsOutlined style={{ fontSize: 64, color: '#0078d4', marginBottom: 24 }} />
          <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>{t('addAccount.oauth.microsoftTitle')}</Text>
          <Paragraph style={{ color: '#86868b', marginBottom: 32 }}>{t('addAccount.oauth.microsoftDesc')}</Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<WindowsOutlined />}
            onClick={() => handleOAuthAuthorize('microsoft365')}
            loading={saving}
            style={{ height: 48, borderRadius: 8, background: '#0078d4', border: 'none', fontSize: 16 }}
          >
            {t('addAccount.oauth.microsoftButton')}
          </Button>
          {testResult && !testResult.success && (
            <Alert message={t('addAccount.oauth.authFailed')} description={testResult.error} type="error" showIcon style={{ marginTop: 24, borderRadius: 8 }} />
          )}
        </div>
      )}

      {accountType === 'gmail' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <GoogleOutlined style={{ fontSize: 64, color: '#4285f4', marginBottom: 24 }} />
          <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>{t('addAccount.oauth.gmailTitle')}</Text>
          <Paragraph style={{ color: '#86868b', marginBottom: 32 }}>{t('addAccount.oauth.gmailDesc')}</Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<GoogleOutlined />}
            onClick={() => handleOAuthAuthorize('gmail')}
            loading={saving}
            style={{ height: 48, borderRadius: 8, background: '#4285f4', border: 'none', fontSize: 16 }}
          >
            {t('addAccount.oauth.gmailButton')}
          </Button>
          {testResult && !testResult.success && (
            <Alert message={t('addAccount.oauth.authFailed')} description={testResult.error} type="error" showIcon style={{ marginTop: 24, borderRadius: 8 }} />
          )}
        </div>
      )}
    </Modal>
  )
}
