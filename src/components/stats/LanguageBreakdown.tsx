/**
 * Language Breakdown Component
 * Requirements: R4 - Language breakdown with percentage calculations
 */

import type { LanguageBreakdown as LanguageBreakdownType } from '../../types/github-api'

interface LanguageBreakdownProps {
  languages: LanguageBreakdownType[]
  className?: string
}

export function LanguageBreakdown({ languages, className = '' }: LanguageBreakdownProps) {
  if (languages.length === 0) {
    return (
      <div className={`language-breakdown ${className}`}>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🤔</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Language Data</h3>
          <p className="text-gray-600">We couldn't find any language information for your repositories.</p>
        </div>
      </div>
    )
  }

  const topLanguage = languages[0]

  return (
    <div className={`language-breakdown ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Programming Languages</h2>
        <p className="text-gray-600">Languages you've used in your repositories this year</p>
      </div>

      {/* Top language highlight */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Your Top Language</h3>
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: topLanguage.color }}
              />
              <span className="text-2xl font-bold text-gray-800">{topLanguage.language}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600">
              {topLanguage.percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">of your code</div>
          </div>
        </div>
      </div>

      {/* Language list */}
      <div className="space-y-3">
        {languages.map((lang, index) => (
          <div
            key={lang.language}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="text-lg font-semibold text-gray-600">
                #{index + 1}
              </div>
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: lang.color }}
              />
              <span className="font-medium text-gray-800">{lang.language}</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-semibold text-gray-800">
                  {lang.percentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  {(lang.bytes / 1024).toFixed(1)} KB
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${lang.percentage}%`,
                    backgroundColor: lang.color,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual chart */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Language Distribution</h3>
        <div className="flex rounded-lg overflow-hidden h-8 bg-gray-200">
          {languages.map((lang) => (
            <div
              key={lang.language}
              className="flex items-center justify-center text-white text-xs font-medium transition-all duration-500 hover:opacity-80"
              style={{
                width: `${lang.percentage}%`,
                backgroundColor: lang.color,
                minWidth: lang.percentage > 5 ? 'auto' : '0',
              }}
              title={`${lang.language}: ${lang.percentage.toFixed(1)}%`}
            >
              {lang.percentage > 8 && (
                <span className="truncate px-1">
                  {lang.language}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fun facts */}
      <div className="mt-6 bg-yellow-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">💡 Language Insights</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• You've used <strong>{languages.length}</strong> different programming languages</p>
          <p>• Your most used language is <strong>{topLanguage.language}</strong></p>
          {languages.length > 1 && (
            <p>• You're a polyglot developer! 🌟</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LanguageBreakdown
