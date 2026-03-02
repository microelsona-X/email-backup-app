import React from 'react'
import { Card, Button, Badge, Popconfirm, Space, Typography, Empty, Row, Col } from 'antd'
import { SyncOutlined, DeleteOutlined, MailOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { Account } from '../types/account'
import { SyncProgress } from './SyncProgress'
import { useSyncStore } from '../stores/syncStore'

const { Text, Paragraph } = Typography

interface AccountListProps {
  accounts: Account[]
  onSync?: (accountId: string) => void
  onDelete?: (accountId: string) => void
  showActions?: boolean
}

export const AccountList: React.FC<AccountListProps> = ({ accounts, onSync, onDelete, showActions = true }) => {
  const { t, i18n } = useTranslation()
  const { progress } = useSyncStore()

  const getStatusBadge = (account: Account) => {
    if (account.status === 'syncing') return <Badge status="processing" text={t('accounts.status.syncing')} style={{ fontSize: 13 }} />
    if (account.status === 'error') return <Badge status="error" text={t('accounts.status.error')} style={{ fontSize: 13 }} />
    return <Badge status="success" text={t('accounts.status.active')} style={{ fontSize: 13 }} />
  }

  const getLastSyncText = (lastSync?: Date) => {
    if (!lastSync) return t('accounts.neverSynced')
    return formatDistanceToNow(new Date(lastSync), {
      addSuffix: true,
      locale: i18n.language === 'zh-CN' ? zhCN : enUS
    })
  }

  if (accounts.length === 0) {
    return <Empty description={t('accounts.noAccounts')} style={{ marginTop: 40 }} />
  }

  return (
    <Row gutter={[16, 16]}>
      {accounts.map((account) => (
        <Col span={24} key={account.id}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            bodyStyle={{ padding: 20 }}
            hoverable
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <MailOutlined style={{ fontSize: 20, color: '#ffffff' }} />
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 16, color: '#1d1d1f' }}>{account.email}</Text>
                      <div style={{ marginTop: 4 }}>{getStatusBadge(account)}</div>
                    </div>
                  </div>

                  <Paragraph style={{ margin: 0, fontSize: 14, color: '#86868b' }}>{account.displayName}</Paragraph>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ClockCircleOutlined style={{ fontSize: 13, color: '#86868b' }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>{getLastSyncText(account.lastSync)}</Text>
                  </div>

                  {account.status === 'syncing' && progress?.accountId === account.id && (
                    <SyncProgress accountId={account.id} progress={progress} />
                  )}
                </Space>
              </div>

              {showActions && (
                <Space size={8}>
                  <Button
                    type="primary"
                    icon={<SyncOutlined />}
                    onClick={() => onSync?.(account.id)}
                    loading={account.status === 'syncing'}
                    disabled={account.status === 'syncing'}
                    style={{ height: 36, borderRadius: 8, background: '#007aff', border: 'none' }}
                  >
                    {t('accounts.sync')}
                  </Button>

                  <Popconfirm
                    title={t('accounts.deleteTitle')}
                    description={t('accounts.deleteConfirm')}
                    onConfirm={() => onDelete?.(account.id)}
                    okText={t('common.confirm')}
                    cancelText={t('common.cancel')}
                  >
                    <Button danger icon={<DeleteOutlined />} style={{ height: 36, borderRadius: 8 }}>
                      {t('common.delete')}
                    </Button>
                  </Popconfirm>
                </Space>
              )}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  )
}
