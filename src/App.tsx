import React, { useState, useEffect } from 'react'
import { Layout, Typography } from 'antd'
import { MailOutlined, UserOutlined, QuestionCircleOutlined, InboxOutlined, SettingOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { Dashboard } from './pages/Dashboard'
import { Accounts } from './pages/Accounts'
import { Emails } from './pages/Emails'
import { Settings } from './pages/Settings'
import { WelcomeGuide } from './components/WelcomeGuide'
import type { AppSettings } from './types/settings'
import './App.css'

const { Content, Sider } = Layout
const { Title } = Typography

const App: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenGuide')
    if (!hasSeenGuide) {
      setShowGuide(true)
      localStorage.setItem('hasSeenGuide', 'true')
    }
  }, [])

  useEffect(() => {
    const loadLanguageFromSettings = async () => {
      try {
        const settings = (await window.electronAPI.invoke('settings-get')) as AppSettings
        if (settings.language && settings.language !== i18n.language) {
          await i18n.changeLanguage(settings.language)
          localStorage.setItem('language', settings.language)
        }
      } catch (error) {
        console.error('Failed to load language from settings:', error)
      }
    }

    void loadLanguageFromSettings()
  }, [i18n])

  const menuItems = [
    { key: 'dashboard', icon: <MailOutlined style={{ fontSize: 20 }} />, label: t('nav.dashboard'), component: <Dashboard /> },
    { key: 'emails', icon: <InboxOutlined style={{ fontSize: 20 }} />, label: t('nav.emails'), component: <Emails /> },
    { key: 'accounts', icon: <UserOutlined style={{ fontSize: 20 }} />, label: t('nav.accounts'), component: <Accounts /> },
    { key: 'settings', icon: <SettingOutlined style={{ fontSize: 20 }} />, label: t('nav.settings'), component: <Settings /> }
  ]

  return (
    <Layout style={{ minHeight: '100vh', height: '100vh', background: '#f5f5f7', overflow: 'hidden' }}>
      <Sider
        width={220}
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.02)'
        }}
      >
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <img src="./logo.svg" alt="MailGuardian" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <div>
            <Title
              level={4}
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                color: '#1d1d1f',
                letterSpacing: '-0.5px'
              }}
            >
              {t('common.appName')}
            </Title>
            <div style={{ fontSize: 11, color: '#86868b', marginTop: 2 }}>{t('common.appSubtitle')}</div>
          </div>
        </div>

        <div style={{ padding: '16px 0' }}>
          {menuItems.map((item) => (
            <div
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              style={{
                padding: '12px 20px',
                margin: '4px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: activeTab === item.key ? '#007aff' : 'transparent',
                color: activeTab === item.key ? '#ffffff' : '#1d1d1f',
                fontWeight: activeTab === item.key ? 500 : 400,
                fontSize: 14,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: activeTab === item.key ? 'scale(1.02)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.key) e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)'
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.key) e.currentTarget.style.background = 'transparent'
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
          <div
            onClick={() => setShowGuide(true)}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'transparent',
              color: '#007aff',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 122, 255, 0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <QuestionCircleOutlined style={{ fontSize: 16 }} />
            <span>{t('nav.guide')}</span>
          </div>
        </div>
      </Sider>

      <Layout>
        <Content style={{ background: '#f5f5f7', height: '100vh', overflow: 'auto' }}>
          {menuItems.find((item) => item.key === activeTab)?.component}
        </Content>
      </Layout>

      <WelcomeGuide open={showGuide} onClose={() => setShowGuide(false)} />
    </Layout>
  )
}

export default App
