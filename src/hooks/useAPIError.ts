/**
 * API Error handling hook
 * Requirements: R9 - API error handling system
 */

import { useState, useCallback } from 'react'
import type { GitHubAPIError } from '../types/github-api'
import { getRetryDelay, shouldRetry } from '../lib/api-errors'

interface UseAPIErrorReturn {
  error: GitHubAPIError | null
  isRetrying: boolean
  setError: (error: GitHubAPIError | null) => void
  retry: (operation: () => Promise<any>) => Promise<void>
  clearError: () => void
}

export function useAPIError(): UseAPIErrorReturn {
  const [error, setError] = useState<GitHubAPIError | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const retry = useCallback(async (operation: () => Promise<any>) => {
    if (!error || !shouldRetry(error)) return

    setIsRetrying(true)

    try {
      const delay = getRetryDelay(error, 1)
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      await operation()
      clearError()
    } catch (retryError) {
      if (retryError instanceof Error && 'type' in retryError) {
        setError(retryError as GitHubAPIError)
      }
    } finally {
      setIsRetrying(false)
    }
  }, [error, clearError])

  return {
    error,
    isRetrying,
    setError,
    retry,
    clearError,
  }
}
