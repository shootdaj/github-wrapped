'use client'

import { useEffect, useState } from 'react'
import { getBrowserInfo, initBrowserCompatibility } from '@/lib/browser-compat'
import type { BrowserInfo } from '@/lib/browser-compat'

interface BrowserSupportProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface CompatibilityState {
  info: BrowserInfo | null
  warnings: string[]
  isFullyCompatible: boolean
  isLoading: boolean
}

export default function BrowserSupport({ children, fallback }: BrowserSupportProps) {
  const [compatibility, setCompatibility] = useState<CompatibilityState>({
    info: null,
    warnings: [],
    isFullyCompatible: false,
    isLoading: true
  })

  useEffect(() => {
    // Initialize browser compatibility check
    const result = initBrowserCompatibility()

    setCompatibility({
      info: result.info,
      warnings: result.warnings,
      isFullyCompatible: result.isFullyCompatible,
      isLoading: false
    })

    // Log browser info for debugging
    console.log('Browser compatibility check:', result)
  }, [])

  if (compatibility.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Checking browser compatibility...</p>
        </div>
      </div>
    )
  }

  if (!compatibility.info?.isSupported) {
    return (
      fallback || (
        <UnsupportedBrowserFallback
          browserInfo={compatibility.info}
        />
      )
    )
  }

  return (
    <>
      {compatibility.warnings.length > 0 && (
        <CompatibilityWarnings warnings={compatibility.warnings} />
      )}
      {children}
    </>
  )
}

interface UnsupportedBrowserFallbackProps {
  browserInfo: BrowserInfo | null
}

function UnsupportedBrowserFallback({ browserInfo }: UnsupportedBrowserFallbackProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="space-y-2">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-foreground">
            Browser Not Supported
          </h1>
        </div>

        <div className="space-y-4 text-muted-foreground">
          <p>
            GitHub Wrapped requires a modern browser with Canvas 2D support to function properly.
          </p>

          {browserInfo && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <p><strong>Detected:</strong> {browserInfo.name} {browserInfo.version}</p>
              <p><strong>OS:</strong> {browserInfo.os}</p>
              <p><strong>Engine:</strong> {browserInfo.engine}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="font-medium text-foreground">Supported Browsers:</p>
            <ul className="text-sm space-y-1">
              <li>• Chrome 90 or later</li>
              <li>• Firefox 88 or later</li>
              <li>• Safari 14 or later</li>
              <li>• Edge 90 or later</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary w-full"
          >
            Try Again
          </button>

          <a
            href="https://www.google.com/chrome/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full inline-block"
          >
            Download Chrome
          </a>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please{' '}
            <a
              href="https://github.com/anshul/github-wrapped/issues"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              report an issue
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

interface CompatibilityWarningsProps {
  warnings: string[]
}

function CompatibilityWarnings({ warnings }: CompatibilityWarningsProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || warnings.length === 0) return null

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Browser Compatibility Warnings
          </h3>
          <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
            The application will still work but some features may be limited.
          </p>
        </div>

        <div className="ml-auto pl-3">
          <button
            onClick={() => setDismissed(true)}
            className="inline-flex rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-1.5 text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
            aria-label="Dismiss warnings"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook for accessing browser compatibility info
export function useBrowserSupport() {
  const [compatibility, setCompatibility] = useState<CompatibilityState>({
    info: null,
    warnings: [],
    isFullyCompatible: false,
    isLoading: true
  })

  useEffect(() => {
    const result = initBrowserCompatibility()

    setCompatibility({
      info: result.info,
      warnings: result.warnings,
      isFullyCompatible: result.isFullyCompatible,
      isLoading: false
    })
  }, [])

  return compatibility
}