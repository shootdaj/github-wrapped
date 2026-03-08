/**
 * API Error Display Component
 * Requirements: R9 - User-friendly error messages for API failures
 */

import { getErrorTitle, getErrorMessage, shouldRetry } from '../../lib/api-errors'
import type { GitHubAPIError } from '../../types/github-api'

interface APIErrorDisplayProps {
  error: GitHubAPIError
  retry?: () => void
  className?: string
}

export function APIErrorDisplay({ error, retry, className = '' }: APIErrorDisplayProps) {
  const title = getErrorTitle(error)
  const message = getErrorMessage(error)
  const canRetry = shouldRetry(error) && retry

  const getErrorIcon = () => {
    switch (error.type) {
      case 'not-found':
        return '🔍'
      case 'rate-limit':
        return '⏱️'
      case 'no-activity':
        return '📊'
      case 'network':
        return '🌐'
      case 'server':
        return '🔧'
      default:
        return '⚠️'
    }
  }

  const getErrorColor = () => {
    switch (error.type) {
      case 'not-found':
        return 'bg-yellow-50 border-yellow-200'
      case 'rate-limit':
        return 'bg-orange-50 border-orange-200'
      case 'no-activity':
        return 'bg-blue-50 border-blue-200'
      case 'network':
        return 'bg-red-50 border-red-200'
      case 'server':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div
      data-testid="api-error-display"
      className={`error-container p-6 rounded-lg border ${getErrorColor()} ${className}`}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div data-testid="error-icon" className="text-4xl">
          {getErrorIcon()}
        </div>

        <div className="space-y-2">
          <h3
            data-testid="error-title"
            className="text-lg font-semibold text-gray-800"
          >
            {title}
          </h3>

          <p
            data-testid="error-message"
            className="text-gray-600 max-w-md mx-auto"
          >
            {message}
          </p>
        </div>

        {canRetry && (
          <button
            onClick={retry}
            data-testid="retry-button"
            className="retry-btn px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Try Again
          </button>
        )}

        {error.type === 'not-found' && (
          <div className="text-sm text-gray-500 space-y-1">
            <p>Make sure the username is spelled correctly.</p>
            <p>The user must have at least one public repository.</p>
          </div>
        )}

        {error.type === 'rate-limit' && (
          <div className="text-sm text-gray-500">
            <p>GitHub limits the number of requests per hour.</p>
            <p>This helps keep their service running smoothly for everyone.</p>
          </div>
        )}

        {error.type === 'no-activity' && (
          <div className="text-sm text-gray-500 space-y-1">
            <p>This could mean the profile is private or</p>
            <p>the user hasn't made any public contributions.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default APIErrorDisplay
