import React from 'react'
import { Modal, Steps, Typography, Button, Space } from 'antd'
import { MailOutlined, CloudSyncOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const { Title, Paragraph } = Typography

interface WelcomeGuideProps {
  open: boolean
  onClose: () => void
}

export const WelcomeGuide: React.FC<WelcomeGuideProps> = ({ open, onClose }) => {
  const { t } = useTranslation()

  const steps = [
    {
      title: t('guide.steps.addAccountTitle'),
      icon: <MailOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      description: t('guide.steps.addAccountDesc')
    },
    {
      title: t('guide.steps.testConnectionTitle'),
      icon: <CloudSyncOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      description: t('guide.steps.testConnectionDesc')
    },
    {
      title: t('guide.steps.startSyncTitle'),
      icon: <SafetyOutlined style={{ fontSize: 24, color: '#faad14' }} />,
      description: t('guide.steps.startSyncDesc')
    },
    {
      title: t('guide.steps.finishBackupTitle'),
      icon: <CheckCircleOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      description: t('guide.steps.finishBackupDesc')
    }
  ]

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} size="large">
          {t('guide.start')}
        </Button>
      ]}
      width="min(920px, 94vw)"
      centered
      styles={{
        body: {
          maxHeight: '78vh',
          overflowY: 'auto',
          padding: '16px 20px'
        }
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%', padding: '8px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: 8, fontSize: 'clamp(28px, 3.2vw, 40px)' }}>
            {t('guide.title')}
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>{t('guide.subtitle')}</Paragraph>
        </div>

        <Steps
          direction="vertical"
          current={-1}
          items={steps.map((step) => ({
            title: <span style={{ fontSize: 16, fontWeight: 500 }}>{step.title}</span>,
            description: <Paragraph style={{ marginTop: 8, fontSize: 14 }}>{step.description}</Paragraph>,
            icon: step.icon
          }))}
        />

        <div
          style={{
            background: '#f0f5ff',
            padding: 16,
            borderRadius: 8,
            border: '1px solid #d6e4ff'
          }}
        >
          <Title level={5} style={{ marginBottom: 8 }}>{t('guide.importantTips')}</Title>
          <Paragraph style={{ marginBottom: 4, fontSize: 13 }}>- {t('guide.tip1')}</Paragraph>
          <Paragraph style={{ marginBottom: 4, fontSize: 13 }}>- {t('guide.tip2')}</Paragraph>
          <Paragraph style={{ marginBottom: 0, fontSize: 13 }}>- {t('guide.tip3')}</Paragraph>
        </div>
      </Space>
    </Modal>
  )
}
