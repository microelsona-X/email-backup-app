import React, { useState, useEffect } from 'react'
import { Card, List, Input, Select, Button, Empty, Spin, Tag, Typography, Space } from 'antd'
import { SearchOutlined, MailOutlined, PaperClipOutlined, ReloadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useEmails } from '../hooks/useEmails'
import { useAccounts } from '../hooks/useAccounts'
import { EmailDetail } from '../components/EmailDetail'
import type { EmailMetadata } from '../types/email'

const { Title, Text } = Typography
const { Search } = Input

export const Emails: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { accounts } = useAccounts()
  const { emails, total, hasMore, loading, fetchEmails, loadMore, searchEmails } = useEmails()

  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [selectedEmail, setSelectedEmail] = useState<EmailMetadata | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 50

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].email)
    }
  }, [accounts, selectedAccount])

  useEffect(() => {
    if (selectedAccount) {
      fetchEmails({
        accountEmail: selectedAccount,
        limit: pageSize,
        offset: 0
      })
      setCurrentPage(0)
    }
  }, [selectedAccount, fetchEmails])

  const handleSearch = () => {
    if (!selectedAccount) return

    if (searchKeyword.trim()) {
      searchEmails({
        accountEmail: selectedAccount,
        keyword: searchKeyword,
        limit: pageSize,
        offset: 0
      })
    } else {
      fetchEmails({
        accountEmail: selectedAccount,
        limit: pageSize,
        offset: 0
      })
    }
    setCurrentPage(0)
  }

  const handleLoadMore = () => {
    if (!selectedAccount || !hasMore) return

    const nextPage = currentPage + 1
    const offset = nextPage * pageSize

    if (searchKeyword.trim()) {
      loadMore({
        accountEmail: selectedAccount,
        keyword: searchKeyword,
        limit: pageSize,
        offset
      })
    } else {
      loadMore({
        accountEmail: selectedAccount,
        limit: pageSize,
        offset
      })
    }
    setCurrentPage(nextPage)
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString(i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    if (days === 1) {
      return t('emails.yesterday')
    }

    if (days < 7) {
      return t('emails.daysAgo', { count: days })
    }

    return date.toLocaleDateString(i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const renderEmailItem = (email: EmailMetadata) => (
    <List.Item
      key={email.uid}
      style={{
        padding: '16px 24px',
        cursor: 'pointer',
        borderRadius: 8,
        marginBottom: 8,
        background: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s'
      }}
      onClick={() => {
        setSelectedEmail(email)
        setDetailOpen(true)
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#f5f5f5'
        e.currentTarget.style.borderColor = '#d9d9d9'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#ffffff'
        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)'
      }}
    >
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong style={{ fontSize: 14, color: '#1d1d1f' }}>
            {email.senderName || email.senderEmail}
          </Text>
          <Text style={{ fontSize: 12, color: '#86868b' }}>{formatDate(email.receivedTimestamp)}</Text>
        </div>

        <div style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 13, color: '#1d1d1f' }}>{email.subject || t('emails.noSubject')}</Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {email.hasAttachments && (
            <Tag icon={<PaperClipOutlined />} color="blue" style={{ fontSize: 11 }}>
              {t('emails.attachments', { count: email.attachments.length })}
            </Tag>
          )}
          <Text style={{ fontSize: 11, color: '#86868b' }}>{email.folder}</Text>
        </div>
      </div>
    </List.Item>
  )

  return (
    <div style={{ padding: 'clamp(12px, 2vw, 24px)', minHeight: '100%', overflow: 'auto', background: '#f5f5f7' }}>
      <Card
        style={{
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#1d1d1f' }}>
            <MailOutlined /> {t('emails.title')}
          </Title>
        </div>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Select
              value={selectedAccount}
              onChange={setSelectedAccount}
              style={{ width: 300, maxWidth: '100%' }}
              size="large"
              placeholder={t('emails.selectAccount')}
            >
              {accounts.map((account) => (
                <Select.Option key={account.id} value={account.email}>
                  {account.displayName || account.email}
                </Select.Option>
              ))}
            </Select>

            <Search
              placeholder={t('emails.searchPlaceholder')}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              size="large"
              style={{ flex: 1, minWidth: 240 }}
            />

            <Button
              icon={<ReloadOutlined />}
              size="large"
              onClick={() => {
                setSearchKeyword('')
                if (selectedAccount) {
                  fetchEmails({
                    accountEmail: selectedAccount,
                    limit: pageSize,
                    offset: 0
                  })
                  setCurrentPage(0)
                }
              }}
            >
              {t('emails.refresh')}
            </Button>
          </div>

          <div>
            <Text style={{ fontSize: 13, color: '#86868b' }}>{t('emails.totalEmails', { count: total })}</Text>
          </div>

          {loading && emails.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" />
            </div>
          ) : emails.length === 0 ? (
            <Empty description={t('emails.noEmails')} image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '60px 0' }} />
          ) : (
            <>
              <List dataSource={emails} renderItem={renderEmailItem} style={{ background: 'transparent' }} />

              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Button onClick={handleLoadMore} loading={loading} size="large" style={{ borderRadius: 8 }}>
                    {t('emails.loadMore')}
                  </Button>
                </div>
              )}
            </>
          )}
        </Space>
      </Card>

      <EmailDetail email={selectedEmail} accountEmail={selectedAccount} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </div>
  )
}
