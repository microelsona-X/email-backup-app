import React, { useState, useEffect } from 'react'
import { Drawer, Spin, Typography, Button, Space } from 'antd'
import { UserOutlined, ClockCircleOutlined, PaperClipOutlined, CloseOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useEmails } from '../hooks/useEmails'
import type { EmailMetadata, EmailContent } from '../types/email'

const { Title, Text } = Typography

interface EmailDetailProps {
  email: EmailMetadata | null
  accountEmail: string
  open: boolean
  onClose: () => void
}

export const EmailDetail: React.FC<EmailDetailProps> = ({ email, accountEmail, open, onClose }) => {
  const { t, i18n } = useTranslation()
  const { getEmailContent } = useEmails()
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState<EmailContent | null>(null)

  useEffect(() => {
    if (email && open) {
      loadEmailContent()
    }
  }, [email, open])

  const loadEmailContent = async () => {
    if (!email) return

    setLoading(true)
    setContent(null)
    try {
      const parsedContent = await getEmailContent(accountEmail, email.emlFilePath)
      setContent(parsedContent)
    } catch (error) {
      console.error('Failed to load email content:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString(i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Drawer
      title={null}
      placement="right"
      width={720}
      open={open}
      onClose={onClose}
      closeIcon={null}
      styles={{
        body: { padding: 0 }
      }}
    >
      {email && (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#1d1d1f', flex: 1 }}>
                {email.subject || t('emails.noSubject')}
              </Title>
              <Button type="text" icon={<CloseOutlined />} onClick={onClose} style={{ marginLeft: 16 }} />
            </div>

            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserOutlined style={{ color: '#86868b' }} />
                <Text strong style={{ fontSize: 14 }}>{email.senderName || email.senderEmail}</Text>
                <Text style={{ fontSize: 13, color: '#86868b' }}>&lt;{email.senderEmail}&gt;</Text>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#86868b' }} />
                <Text style={{ fontSize: 13, color: '#86868b' }}>{formatDate(email.receivedTimestamp)}</Text>
              </div>

              {email.hasAttachments && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PaperClipOutlined style={{ color: '#86868b' }} />
                  <Text style={{ fontSize: 13, color: '#86868b' }}>
                    {t('emails.attachments', { count: email.attachments.length })}
                  </Text>
                </div>
              )}
            </Space>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" />
              </div>
            ) : content ? (
              <div style={{ fontSize: 14, lineHeight: 1.8, color: '#1d1d1f' }}>
                {content.html ? (
                  <div dangerouslySetInnerHTML={{ __html: content.html }} />
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {content.text || content.raw || ''}
                  </div>
                )}
              </div>
            ) : (
              <Text style={{ color: '#86868b' }}>{t('emails.detail.cannotLoad')}</Text>
            )}
          </div>

          {email.hasAttachments && email.attachments.length > 0 && (
            <div style={{ padding: '24px', borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
              <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
                {t('emails.detail.attachments', { count: email.attachments.length })}
              </Text>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                {email.attachments.map((att, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px 16px',
                      background: '#f5f5f7',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <Text strong style={{ fontSize: 13 }}>{att.filename}</Text>
                      <Text style={{ fontSize: 12, color: '#86868b', marginLeft: 8 }}>
                        ({(att.size / 1024).toFixed(1)} KB)
                      </Text>
                    </div>
                  </div>
                ))}
              </Space>
            </div>
          )}
        </div>
      )}
    </Drawer>
  )
}
