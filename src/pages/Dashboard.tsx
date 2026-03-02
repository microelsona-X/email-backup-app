import React, { useState } from 'react'
import { Card, Statistic, Row, Col, Button, Typography } from 'antd'
import { PlusOutlined, MailOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useAccounts } from '../hooks/useAccounts'
import { useSync } from '../hooks/useSync'
import { AccountList } from '../components/AccountList'
import { AddAccountDialog } from '../components/AddAccountDialog'

const { Title, Paragraph } = Typography

export const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const { accounts, testConnection, addAccount } = useAccounts()
  const { startSync } = useSync()

  const handleSync = async (accountId: string) => {
    try {
      await startSync(accountId)
    } catch (error) {
      console.error('Failed to start sync:', error)
    }
  }

  const activeAccounts = accounts.filter((acc) => acc.status === 'active').length
  const lastSyncTime = accounts.reduce((latest, acc) => {
    if (!acc.lastSync) return latest
    const accTime = new Date(acc.lastSync).getTime()
    return accTime > latest ? accTime : latest
  }, 0)

  const lastSyncText =
    lastSyncTime > 0
      ? new Date(lastSyncTime).toLocaleString(i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : t('dashboard.neverSynced')

  return (
    <div style={{ padding: '32px 48px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.5px' }}>
          {t('dashboard.title')}
        </Title>
        <Paragraph style={{ margin: '8px 0 0 0', fontSize: 15, color: '#86868b' }}>{t('dashboard.description')}</Paragraph>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col span={8}>
          <Card
            style={{
              borderRadius: 16,
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              height: 140
            }}
            bodyStyle={{ height: '100%', display: 'flex', alignItems: 'center', padding: '24px' }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 13, fontWeight: 500 }}>{t('dashboard.totalAccounts')}</span>}
              value={accounts.length}
              prefix={<MailOutlined style={{ fontSize: 20 }} />}
              valueStyle={{ color: '#ffffff', fontSize: 40, fontWeight: 600 }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card
            style={{
              borderRadius: 16,
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              height: 140
            }}
            bodyStyle={{ height: '100%', display: 'flex', alignItems: 'center', padding: '24px' }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 13, fontWeight: 500 }}>{t('dashboard.activeAccounts')}</span>}
              value={activeAccounts}
              prefix={<CheckCircleOutlined style={{ fontSize: 20 }} />}
              valueStyle={{ color: '#ffffff', fontSize: 40, fontWeight: 600 }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card
            style={{
              borderRadius: 16,
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              height: 140
            }}
            bodyStyle={{ height: '100%', display: 'flex', alignItems: 'center', padding: '24px' }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 13, fontWeight: 500 }}>{t('dashboard.lastSync')}</span>}
              value={lastSyncText}
              prefix={<ClockCircleOutlined style={{ fontSize: 20 }} />}
              valueStyle={{ color: '#ffffff', fontSize: 20, fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 16, border: '1px solid rgba(0, 0, 0, 0.06)', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)', background: '#ffffff' }}
        title={<span style={{ fontSize: 18, fontWeight: 600, color: '#1d1d1f' }}>{t('dashboard.mailboxAccounts')}</span>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setDialogOpen(true)}
            style={{ height: 36, borderRadius: 8, fontSize: 14, fontWeight: 500, background: '#007aff', border: 'none' }}
          >
            {t('dashboard.addAccount')}
          </Button>
        }
      >
        <AccountList accounts={accounts} onSync={handleSync} showActions={true} />
      </Card>

      <AddAccountDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => setDialogOpen(false)}
        onTestConnection={testConnection}
        onAddAccount={addAccount}
      />
    </div>
  )
}
