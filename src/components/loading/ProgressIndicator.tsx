/**
 * Progress Indicator Component
 * Requirements: R10 - Loading state components with progress indicators
 */

interface ProgressIndicatorProps {
  progress?: number
  total?: number
  label?: string
  showPercentage?: boolean
  color?: string
  className?: string
}

export function ProgressIndicator({
  progress = 0,
  total = 100,
  label = '',
  showPercentage = true,
  color = '#0070f3',
  className = ''
}: ProgressIndicatorProps) {
  const percentage = Math.min(Math.max((progress / total) * 100, 0), 100)

  return (
    <div
      data-testid="progress-indicator"
      className={`w-full max-w-md ${className}`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={label || `${Math.round(percentage)}% complete`}
    >
      {label && (
        <div
          data-testid="progress-label"
          className="text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </div>
      )}

      <div
        data-testid="progress-bar"
        className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
      >
        <div
          data-testid="progress-fill"
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {showPercentage && (
        <div
          data-testid="progress-percentage"
          className="text-sm text-gray-600 mt-2 text-center"
        >
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  )
}

export default ProgressIndicator
