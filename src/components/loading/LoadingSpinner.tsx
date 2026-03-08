/**
 * Loading Spinner Component
 * Requirements: R10 - Loading state components with animated spinners
 */

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  message?: string
  className?: string
}

export function LoadingSpinner({
  size = 'medium',
  color = '#0070f3',
  message = 'Loading...',
  className = ''
}: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4'
      case 'large':
        return 'w-10 h-10'
      default:
        return 'w-6 h-6'
    }
  }

  const getBorderWidth = () => {
    switch (size) {
      case 'small':
        return '2px'
      case 'large':
        return '4px'
      default:
        return '3px'
    }
  }

  return (
    <div
      data-testid="loading-spinner"
      className={`spinner-${size} flex flex-col items-center justify-center space-y-3 ${className}`}
      role="status"
      aria-label={message}
    >
      <div
        data-testid="spinner-circle"
        className={`${getSizeClasses()} rounded-full border-gray-200 border-t-current animate-spin`}
        style={{
          borderWidth: getBorderWidth(),
          borderTopColor: color,
        }}
      />

      {message && (
        <span
          data-testid="spinner-message"
          className={`text-gray-600 ${
            size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm'
          }`}
        >
          {message}
        </span>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default LoadingSpinner
