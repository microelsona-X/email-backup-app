import React from 'react'
import { Progress, Space, Typography } from 'antd'
import { SyncProgress as SyncProgressType } from '../types/sync'

const { Text } = Typography

interface SyncProgressProps {
  accountId: string
  progress: SyncProgressType | null
}

export const SyncProgress: React.FC<SyncProgressProps> = ({ progress }) => {
  if (!progress) {
    return null
  }

  const percentage = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0

  return (
    <Space direction='vertical' style={{ width: '100%' }}>
      <Progress
        percent={percentage}
        status='active'
        format={() => `${progress.current}/${progress.total}`}
      />
      <Text type='secondary' style={{ fontSize: '12px' }}>
        Syncing folder: {progress.folder}
      </Text>
    </Space>
  )
}
