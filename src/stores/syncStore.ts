import { create } from 'zustand'
import type { SyncProgress, SyncResult } from '../types/sync'

interface SyncState {
  syncing: boolean
  isRunning: boolean
  progress: SyncProgress | null
  result: SyncResult | null
  error: string | null
  startSync: (accountId: string) => Promise<void>
  setProgress: (progress: SyncProgress) => void
  setResult: (result: SyncResult) => void
  setError: (error: string) => void
  reset: () => void
}

export const useSyncStore = create<SyncState>((set) => ({
  syncing: false,
  isRunning: false,
  progress: null,
  result: null,
  error: null,

  startSync: async (accountId: string) => {
    set({ syncing: true, isRunning: true, progress: null, result: null, error: null })
    try {
      const result = await window.electronAPI.invoke('sync-start', accountId) as SyncResult
      set({ syncing: false, isRunning: false, result })
    } catch (error) {
      set({
        syncing: false,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      })
    }
  },

  setProgress: (progress: SyncProgress) => {
    set({ progress })
  },

  setResult: (result: SyncResult) => {
    set({ result, syncing: false, isRunning: false })
  },

  setError: (error: string) => {
    set({ error, syncing: false, isRunning: false })
  },

  reset: () => {
    set({ syncing: false, isRunning: false, progress: null, result: null, error: null })
  }
}))
