/**
 * Skeleton Loader Component
 * Requirements: R10 - Loading state components with skeleton loaders
 */

interface SkeletonLoaderProps {
  lines?: number
  animated?: boolean
  className?: string
}

export function SkeletonLoader({
  lines = 3,
  animated = true,
  className = ''
}: SkeletonLoaderProps) {
  const animationClass = animated ? 'animate-pulse' : ''

  return (
    <div
      data-testid="skeleton-loader"
      className={`skeleton-loader ${animated ? 'animated' : ''} ${className}`}
      role="status"
      aria-label="Loading content"
    >
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          data-testid={`skeleton-line-${i}`}
          className={`skeleton-line bg-gray-200 rounded-md mb-2 ${animationClass}`}
          style={{
            width: i === lines - 1 ? '60%' : '100%',
            height: '16px',
          }}
        />
      ))}

      <style jsx>{`
        .animated .skeleton-line {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  )
}

export default SkeletonLoader
