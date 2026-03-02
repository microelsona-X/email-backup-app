import React, { useState } from 'react'
import { Button, Space, Typography, Empty, Card } from 'antd'
import { PlusOutlined, InboxOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useAccounts } from '../hooks/useAccounts'
import { useSync } from '../hooks/useSync'
import { AccountList } from '../components/AccountList'
import { AddAccountDialog } from '../components/AddAccountDialog'

const { Title, Paragraph } = Typography

export const Accounts: React.FC = () => {
  const { t } = useTranslation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const { accounts, deleteAccount, testConnection, addAccount } = useAccounts()
  const { startSync } = useSync()

  const handleSync = async (accountId: string) => {
    try {
      await startSync(accountId)
    } catch (error) {
      console.error('Failed to start sync:', error)
    }
  }

  const handleDelete = async (accountId: string) => {
    try {
      await deleteAccount(accountId)
    } catch (error) {
      console.error('Failed to delete account:', error)
    }
  }

  return (
    <div style={{ padding: '32px 48px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.5px' }}>
            {t('accounts.title')}
          </Title>
          <Paragraph style={{ margin: '8px 0 0 0', fontSize: 15, color: '#86868b' }}>{t('accounts.description')}</Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setDialogOpen(true)}
          size="large"
          style={{
            height: 44,
            padding: '0 24px',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 500,
            background: '#007aff',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)'
          }}
        >
          {t('accounts.addAccount')}
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card style={{ borderRadius: 16, border: '1px solid rgba(0, 0, 0, 0.06)', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)', background: '#ffffff' }}>
          <Empty
            image={<InboxOutlined style={{ fontSize: 64, color: '#d1d1d6' }} />}
            description={
              <Space direction="vertical" size={8}>
                <Paragraph style={{ fontSize: 16, color: '#1d1d1f', margin: 0 }}>{t('accounts.noAccounts')}</Paragraph>
                <Paragraph style={{ fontSize: 14, color: '#86868b', margin: 0 }}>{t('accounts.addAccountHint')}</Paragraph>
              </Space>
            }
          />
        </Card>
      ) : (
        <AccountList accounts={accounts} onSync={handleSync} onDelete={handleDelete} showActions={true} />
      )}

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
