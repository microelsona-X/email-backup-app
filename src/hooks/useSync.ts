import { useEffect, useCallback } from 'react'
import { useSyncStore } from '../stores/syncStore'
import { useAccountStore } from '../stores/accountStore'
import { SyncProgress, SyncResult } from '../types/sync'
import { message } from 'antd'

export const useSync = () => {
  const { progress, result, error, isRunning, setProgress, setResult, setError, reset } = useSyncStore()
  const { loadAccounts } = useAccountStore()

  const startSync = useCallback(async (accountId: string) => {
    reset()
    try {
      await window.electronAPI.invoke('sync-start', accountId)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start sync'
      setError(errorMsg)
      message.error(errorMsg)
      throw err
    }
  }, [reset, setError])

  useEffect(() => {
    window.electronAPI.receive('sync-progress', (progressData: unknown) => {
      setProgress(progressData as SyncProgress)
    })

    window.electronAPI.receive('sync-complete', (resultData: unknown) => {
      const result = resultData as SyncResult
      setResult(result)
      message.success(`Sync completed: ${result.emailsSynced} emails synced`)
      loadAccounts()
    })

    window.electronAPI.receive('sync-error', (errorData: unknown) => {
      const error = errorData as { accountId: string; error: string }
      setError(error.error)
      message.error(`Sync failed: ${error.error}`)
      loadAccounts()
    })
  }, [setProgress, setResult, setError, loadAccounts])

  return {
    progress,
    result,
    error,
    isRunning,
    startSync,
    reset
  }
}
