import { create } from 'zustand'
import type { Account, AccountCreateInput } from '../types/account'

interface AccountState {
  accounts: Account[]
  loading: boolean
  error: string | null
  setAccounts: (accounts: Account[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  loadAccounts: () => Promise<void>
  addAccount: (input: AccountCreateInput) => Promise<Account>
  deleteAccount: (id: string) => Promise<void>
  testConnection: (input: AccountCreateInput) => Promise<{ success: boolean; error?: string }>
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  loading: false,
  error: null,

  setAccounts: (accounts) => set({ accounts }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  loadAccounts: async () => {
    set({ loading: true, error: null })
    try {
      const accounts = await window.electronAPI.invoke('account-list') as Account[]
      set({ accounts, loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load accounts', loading: false })
    }
  },

  addAccount: async (input: AccountCreateInput) => {
    set({ loading: true, error: null })
    try {
      const account = await window.electronAPI.invoke('account-add', input) as Account
      set((state) => ({ accounts: [...state.accounts, account], loading: false }))
      return account
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add account', loading: false })
      throw error
    }
  },

  deleteAccount: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await window.electronAPI.invoke('account-delete', id)
      set((state) => ({ accounts: state.accounts.filter((acc) => acc.id !== id), loading: false }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete account', loading: false })
      throw error
    }
  },

  testConnection: async (input: AccountCreateInput) => {
    set({ loading: true, error: null })
    try {
      const result = await window.electronAPI.invoke('account-test', input) as { success: boolean; error?: string }
      set({ loading: false })
      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Connection test failed'
      set({ error: errorMsg, loading: false })
      return { success: false, error: errorMsg }
    }
  }
}))
