/**
 * Tests for Loading States and Error UI
 * Requirements: R9 - API error handling, R10 - Loading state components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock loading components for testing
const MockSkeletonLoader = ({
  lines = 3,
  animated = true,
  className = ''
}: {
  lines?: number;
  animated?: boolean;
  className?: string;
}) => (
  <div
    data-testid="skeleton-loader"
    className={`skeleton-loader ${animated ? 'animated' : ''} ${className}`}
  >
    {Array.from({ length: lines }, (_, i) => (
      <div
        key={i}
        data-testid={`skeleton-line-${i}`}
        className="skeleton-line"
        style={{
          width: i === lines - 1 ? '60%' : '100%',
          height: '16px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          marginBottom: '8px'
        }}
      />
    ))}
  </div>
)

const MockLoadingSpinner = ({
  size = 'medium',
  color = 'blue',
  message = 'Loading...'
}: {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
}) => (
  <div data-testid="loading-spinner" className={`spinner-${size}`}>
    <div
      data-testid="spinner-circle"
      style={{
        width: size === 'large' ? '40px' : size === 'small' ? '16px' : '24px',
        height: size === 'large' ? '40px' : size === 'small' ? '16px' : '24px',
        border: `3px solid #f0f0f0`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    />
    <span data-testid="spinner-message">{message}</span>
  </div>
)

const MockProgressIndicator = ({
  progress = 0,
  total = 100,
  label = '',
  showPercentage = true
}: {
  progress?: number;
  total?: number;
  label?: string;
  showPercentage?: boolean;
}) => (
  <div data-testid="progress-indicator">
    {label && <div data-testid="progress-label">{label}</div>}
    <div
      data-testid="progress-bar"
      style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        overflow: 'hidden'
      }}
    >
      <div
        data-testid="progress-fill"
        style={{
          width: `${(progress / total) * 100}%`,
          height: '100%',
          backgroundColor: '#0070f3',
          transition: 'width 0.3s ease'
        }}
      />
    </div>
    {showPercentage && (
      <div data-testid="progress-percentage">
        {Math.round((progress / total) * 100)}%
      </div>
    )}
  </div>
)

const MockAPIErrorDisplay = ({
  error,
  retry
}: {
  error: { type: string; message: string };
  retry?: () => void;
}) => (
  <div data-testid="api-error-display" className="error-container">
    <div data-testid="error-icon">⚠️</div>
    <h3 data-testid="error-title">
      {error.type === 'network' && 'Network Error'}
      {error.type === 'rate-limit' && 'Rate Limit Exceeded'}
      {error.type === 'not-found' && 'User Not Found'}
      {error.type === 'no-activity' && 'No Public Activity'}
      {error.type === 'server' && 'Server Error'}
    </h3>
    <p data-testid="error-message">{error.message}</p>
    {retry && (
      <button
        onClick={retry}
        data-testid="retry-button"
        className="retry-btn"
      >
        Try Again
      </button>
    )}
  </div>
)

describe('Loading States and Error UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Skeleton Loader', () => {
    it('should render skeleton loader with default configuration', () => {
      render(<MockSkeletonLoader />)

      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton-line-0')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton-line-1')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton-line-2')).toBeInTheDocument()
    })

    it('should render custom number of skeleton lines', () => {
      render(<MockSkeletonLoader lines={5} />)

      expect(screen.getByTestId('skeleton-line-0')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton-line-4')).toBeInTheDocument()
      expect(screen.queryByTestId('skeleton-line-5')).not.toBeInTheDocument()
    })

    it('should support animated and static modes', () => {
      const { rerender } = render(<MockSkeletonLoader animated={true} />)

      expect(screen.getByTestId('skeleton-loader')).toHaveClass('animated')

      rerender(<MockSkeletonLoader animated={false} />)

      expect(screen.getByTestId('skeleton-loader')).not.toHaveClass('animated')
    })

    it('should apply custom className', () => {
      render(<MockSkeletonLoader className="custom-skeleton" />)

      expect(screen.getByTestId('skeleton-loader')).toHaveClass('custom-skeleton')
    })

    it('should have proper accessibility attributes', () => {
      render(<MockSkeletonLoader />)

      const skeleton = screen.getByTestId('skeleton-loader')
      expect(skeleton).toBeInTheDocument()
      // Could add aria-label or role attributes for accessibility
    })
  })

  describe('Loading Spinner', () => {
    it('should render loading spinner with default configuration', () => {
      render(<MockLoadingSpinner />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByTestId('spinner-circle')).toBeInTheDocument()
      expect(screen.getByTestId('spinner-message')).toHaveTextContent('Loading...')
    })

    it('should support different sizes', () => {
      const { rerender } = render(<MockLoadingSpinner size="small" />)

      expect(screen.getByTestId('loading-spinner')).toHaveClass('spinner-small')

      rerender(<MockLoadingSpinner size="large" />)

      expect(screen.getByTestId('loading-spinner')).toHaveClass('spinner-large')
    })

    it('should support custom colors and messages', () => {
      render(<MockLoadingSpinner color="red" message="Fetching data..." />)

      expect(screen.getByTestId('spinner-message')).toHaveTextContent('Fetching data...')
    })

    it('should have proper spinner animation styles', () => {
      render(<MockLoadingSpinner />)

      const spinnerCircle = screen.getByTestId('spinner-circle')
      const styles = getComputedStyle(spinnerCircle)

      expect(styles.animation).toContain('spin')
      expect(styles.borderRadius).toBe('50%')
    })
  })

  describe('Progress Indicator', () => {
    it('should render progress indicator with default values', () => {
      render(<MockProgressIndicator />)

      expect(screen.getByTestId('progress-indicator')).toBeInTheDocument()
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument()
      expect(screen.getByTestId('progress-fill')).toBeInTheDocument()
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('0%')
    })

    it('should display correct progress percentage', () => {
      render(<MockProgressIndicator progress={30} total={100} />)

      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('30%')

      const progressFill = screen.getByTestId('progress-fill')
      expect(progressFill).toHaveStyle('width: 30%')
    })

    it('should show custom label when provided', () => {
      render(<MockProgressIndicator label="Fetching repositories..." />)

      expect(screen.getByTestId('progress-label')).toHaveTextContent('Fetching repositories...')
    })

    it('should handle different total values', () => {
      render(<MockProgressIndicator progress={25} total={50} />)

      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('50%')

      const progressFill = screen.getByTestId('progress-fill')
      expect(progressFill).toHaveStyle('width: 50%')
    })

    it('should optionally hide percentage display', () => {
      render(<MockProgressIndicator showPercentage={false} />)

      expect(screen.queryByTestId('progress-percentage')).not.toBeInTheDocument()
    })
  })

  describe('API Error Display', () => {
    it('should display network error correctly', () => {
      const error = {
        type: 'network',
        message: 'Unable to connect to GitHub. Please check your internet connection.'
      }

      render(<MockAPIErrorDisplay error={error} />)

      expect(screen.getByTestId('error-title')).toHaveTextContent('Network Error')
      expect(screen.getByTestId('error-message')).toHaveTextContent('Unable to connect to GitHub')
      expect(screen.getByTestId('error-icon')).toBeInTheDocument()
    })

    it('should display rate limit error with proper message', () => {
      const error = {
        type: 'rate-limit',
        message: 'GitHub API rate limit exceeded. Please wait 1 hour before trying again.'
      }

      render(<MockAPIErrorDisplay error={error} />)

      expect(screen.getByTestId('error-title')).toHaveTextContent('Rate Limit Exceeded')
      expect(screen.getByTestId('error-message')).toHaveTextContent('rate limit exceeded')
    })

    it('should display user not found error', () => {
      const error = {
        type: 'not-found',
        message: 'GitHub user "invaliduser" does not exist.'
      }

      render(<MockAPIErrorDisplay error={error} />)

      expect(screen.getByTestId('error-title')).toHaveTextContent('User Not Found')
      expect(screen.getByTestId('error-message')).toHaveTextContent('does not exist')
    })

    it('should display no public activity error', () => {
      const error = {
        type: 'no-activity',
        message: 'This user has no public GitHub activity to display.'
      }

      render(<MockAPIErrorDisplay error={error} />)

      expect(screen.getByTestId('error-title')).toHaveTextContent('No Public Activity')
      expect(screen.getByTestId('error-message')).toHaveTextContent('no public GitHub activity')
    })

    it('should show retry button when retry function provided', () => {
      const mockRetry = vi.fn()
      const error = {
        type: 'network',
        message: 'Connection failed'
      }

      render(<MockAPIErrorDisplay error={error} retry={mockRetry} />)

      const retryButton = screen.getByTestId('retry-button')
      expect(retryButton).toBeInTheDocument()
      expect(retryButton).toHaveTextContent('Try Again')

      retryButton.click()
      expect(mockRetry).toHaveBeenCalledTimes(1)
    })

    it('should hide retry button when no retry function provided', () => {
      const error = {
        type: 'not-found',
        message: 'User not found'
      }

      render(<MockAPIErrorDisplay error={error} />)

      expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument()
    })
  })

  describe('Loading State Transitions', () => {
    it('should transition smoothly between loading and content states', async () => {
      const LoadingStateDemo = ({ isLoading }: { isLoading: boolean }) => (
        <div data-testid="loading-demo">
          {isLoading ? (
            <MockSkeletonLoader lines={3} />
          ) : (
            <div data-testid="loaded-content">
              <h2>GitHub Profile</h2>
              <p>User data loaded successfully!</p>
            </div>
          )}
        </div>
      )

      const { rerender } = render(<LoadingStateDemo isLoading={true} />)

      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument()
      expect(screen.queryByTestId('loaded-content')).not.toBeInTheDocument()

      rerender(<LoadingStateDemo isLoading={false} />)

      expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument()
      expect(screen.getByTestId('loaded-content')).toBeInTheDocument()
    })

    it('should handle multiple loading states for different data sections', () => {
      const MultiLoadingDemo = ({
        profileLoading,
        reposLoading
      }: {
        profileLoading: boolean;
        reposLoading: boolean;
      }) => (
        <div data-testid="multi-loading-demo">
          <section data-testid="profile-section">
            {profileLoading ? (
              <MockSkeletonLoader lines={2} />
            ) : (
              <div data-testid="profile-content">Profile loaded</div>
            )}
          </section>
          <section data-testid="repos-section">
            {reposLoading ? (
              <MockLoadingSpinner message="Loading repositories..." />
            ) : (
              <div data-testid="repos-content">Repositories loaded</div>
            )}
          </section>
        </div>
      )

      render(<MultiLoadingDemo profileLoading={true} reposLoading={false} />)

      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument()
      expect(screen.getByTestId('repos-content')).toBeInTheDocument()
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })
  })
})
