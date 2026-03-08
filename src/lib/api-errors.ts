/**
 * API error handling utilities
 * Requirements: R9 - API error handling system
 */

import type { GitHubAPIError } from '../types/github-api'

export function createAPIError(
  type: GitHubAPIError['type'],
  message: string,
  status?: number,
  retryAfter?: number
): GitHubAPIError {
  const error = new Error(message) as GitHubAPIError
  error.type = type
  error.status = status
  error.retryAfter = retryAfter
  return error
}

export function getErrorMessage(error: GitHubAPIError): string {
  switch (error.type) {
    case 'not-found':
      return 'GitHub user not found. Please check the username and try again.'

    case 'rate-limit':
      const resetTime = error.retryAfter
        ? new Date(error.retryAfter * 1000).toLocaleTimeString()
        : 'in about an hour'
      return `GitHub API rate limit exceeded. Please try again ${resetTime}.`

    case 'no-activity':
      return 'This user has no public GitHub activity to display. The profile may be private or the user hasn\'t contributed to public repositories.'

    case 'network':
      return 'Unable to connect to GitHub. Please check your internet connection and try again.'

    case 'server':
      return 'GitHub servers are temporarily unavailable. Please try again in a few minutes.'

    case 'client':
      return 'Invalid request. Please check the username and try again.'

    default:
      return error.message || 'An unexpected error occurred. Please try again.'
  }
}

export function getErrorTitle(error: GitHubAPIError): string {
  switch (error.type) {
    case 'not-found':
      return 'User Not Found'

    case 'rate-limit':
      return 'Rate Limit Exceeded'

    case 'no-activity':
      return 'No Public Activity'

    case 'network':
      return 'Network Error'

    case 'server':
      return 'Server Error'

    case 'client':
      return 'Invalid Request'

    default:
      return 'Error'
  }
}

export function shouldRetry(error: GitHubAPIError): boolean {
  // Don't retry for client errors or no activity
  return !(['not-found', 'client', 'no-activity', 'rate-limit'].includes(error.type))
}

export function getRetryDelay(error: GitHubAPIError, attempt: number): number {
  if (error.type === 'rate-limit' && error.retryAfter) {
    return (error.retryAfter - Math.floor(Date.now() / 1000)) * 1000
  }

  // Exponential backoff for network and server errors
  if (error.type === 'network' || error.type === 'server') {
    return Math.min(Math.pow(2, attempt) * 1000, 30000) // Max 30 seconds
  }

  return 0
}
