import { useState, useCallback } from 'react'
import type { EmailListQuery, EmailSearchQuery, EmailListResponse, EmailMetadata, EmailContent } from '../types/email'

export const useEmails = () => {
  const [emails, setEmails] = useState<EmailMetadata[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEmails = useCallback(async (query: EmailListQuery) => {
    try {
      setLoading(true)
      setError(null)

      const result = (await window.electronAPI.invoke('email-list', query)) as EmailListResponse

      setEmails(result.emails)
      setTotal(result.total)
      setHasMore(result.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emails')
      console.error('Failed to fetch emails:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async (query: EmailListQuery | EmailSearchQuery) => {
    try {
      setLoading(true)
      setError(null)

      const isSearchQuery =
        'keyword' in query ||
        'from' in query ||
        'dateFrom' in query ||
        'dateTo' in query ||
        'hasAttachments' in query
      const channel = isSearchQuery ? 'email-search' : 'email-list'

      const result = (await window.electronAPI.invoke(channel, query)) as EmailListResponse

      setEmails((prev) => [...prev, ...result.emails])
      setHasMore(result.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more emails')
      console.error('Failed to load more emails:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const searchEmails = useCallback(async (query: EmailSearchQuery) => {
    try {
      setLoading(true)
      setError(null)

      const result = (await window.electronAPI.invoke('email-search', query)) as EmailListResponse

      setEmails(result.emails)
      setTotal(result.total)
      setHasMore(result.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search emails')
      console.error('Failed to search emails:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const getEmailContent = useCallback(async (accountEmail: string, emlPath: string): Promise<EmailContent | null> => {
    try {
      const result = (await window.electronAPI.invoke('email-get', accountEmail, emlPath)) as {
        success: boolean
        content?: EmailContent
        error?: string
      }

      if (result.success && result.content) {
        return result.content
      }

      console.error('Failed to get email content:', result.error)
      return null
    } catch (err) {
      console.error('Failed to get email content:', err)
      return null
    }
  }, [])

  return {
    emails,
    total,
    hasMore,
    loading,
    error,
    fetchEmails,
    loadMore,
    searchEmails,
    getEmailContent
  }
}
