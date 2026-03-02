import { useEffect, useCallback } from 'react'
import { useAccountStore } from '../stores/accountStore'
import { AccountCreateInput, Account } from '../types/account'
import { message } from 'antd'

export const useAccounts = () => {
  const { accounts, loading, error, setAccounts, setLoading, setError } = useAccountStore()

  const loadAccounts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const accountList = await window.electronAPI.invoke('account-list') as Account[]
      setAccounts(accountList)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load accounts'
      setError(errorMsg)
      message.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [setAccounts, setLoading, setError])

  const addAccount = useCallback(async (config: AccountCreateInput) => {
    setLoading(true)
    setError(null)
    try {
      const newAccount = await window.electronAPI.invoke('account-add', config) as Account
      await loadAccounts()
      message.success('Account added successfully')
      return newAccount
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add account'
      setError(errorMsg)
      message.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadAccounts, setLoading, setError])

  const deleteAccount = useCallback(async (accountId: string) => {
    setLoading(true)
    setError(null)
    try {
      await window.electronAPI.invoke('account-delete', accountId)
      await loadAccounts()
      message.success('Account deleted successfully')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete account'
      setError(errorMsg)
      message.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadAccounts, setLoading, setError])

  const testConnection = useCallback(async (config: AccountCreateInput) => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.invoke('account-test-connection', config) as { success: boolean; error?: string }
      if (result.success) {
        message.success('Connection test successful')
      } else {
        message.error(result.error || 'Connection test failed')
      }
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Connection test failed'
      setError(errorMsg)
      message.error(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  return {
    accounts,
    loading,
    error,
    loadAccounts,
    addAccount,
    deleteAccount,
    testConnection
  }
}
