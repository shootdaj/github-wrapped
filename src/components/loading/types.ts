/**
 * Loading Component Types
 * Requirements: R10 - Loading state component types
 */

export interface SkeletonLoaderProps {
  lines?: number
  animated?: boolean
  className?: string
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  message?: string
  className?: string
}

export interface ProgressIndicatorProps {
  progress?: number
  total?: number
  label?: string
  showPercentage?: boolean
  color?: string
  className?: string
}
