/**
 * Shareable Card Component
 * Requirements: R7 - Shareable card with summary, download, and sharing
 */

'use client'

import { useState } from 'react'
import type { GitHubUser, ActivityStats, LanguageBreakdown } from '../../types/github-api'

interface ShareableCardProps {
  user: GitHubUser
  stats: ActivityStats
  topLanguages: LanguageBreakdown[]
  className?: string
}

export function ShareableCard({ user, stats, topLanguages, className = '' }: ShareableCardProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const topLanguage = topLanguages[0]?.language || 'Unknown'
  const currentYear = new Date().getFullYear()

  const generateShareableImage = async () => {
    setIsGenerating(true)
    try {
      // In a real implementation, this would generate an actual image
      // For now, we'll simulate the process and provide sharing options

      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create shareable text content
      const shareText = `🚀 My ${currentYear} GitHub Wrapped:

📊 ${stats.totalCommits.toLocaleString()} commits
⭐ ${stats.totalStars.toLocaleString()} stars earned
🔥 ${stats.longestStreak} day streak
💻 Top language: ${topLanguage}

#GitHubWrapped #CodingYear`

      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: `${user.login}'s GitHub Wrapped ${currentYear}`,
          text: shareText,
          url: window.location.href,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText)
        alert('Share text copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      alert('Error generating shareable content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadCard = async () => {
    setIsGenerating(true)
    try {
      // In a real implementation, this would generate and download an image
      // For now, we'll create a downloadable text file with the summary

      const content = `GitHub Wrapped ${currentYear} - ${user.login}
======================================

Profile:
- Username: ${user.login}
- Name: ${user.name || 'N/A'}
- Public Repositories: ${user.public_repos}
- Followers: ${user.followers}

${currentYear} Activity:
- Total Commits: ${stats.totalCommits.toLocaleString()}
- Pull Requests: ${stats.totalPRs.toLocaleString()}
- Issues: ${stats.totalIssues.toLocaleString()}
- Stars Earned: ${stats.totalStars.toLocaleString()}
- Active Days: ${stats.activeDays}
- Longest Streak: ${stats.longestStreak} days

Top Languages:
${topLanguages.slice(0, 5).map(lang =>
  `- ${lang.language}: ${lang.percentage.toFixed(1)}%`
).join('\n')}

Generated on: ${new Date().toLocaleDateString()}
`

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `github-wrapped-${currentYear}-${user.login}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error downloading:', error)
      alert('Error downloading card. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={`shareable-card ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Share Your GitHub Year</h2>
        <p className="text-gray-600">Show off your coding achievements!</p>
      </div>

      {/* Preview Card */}
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg p-8 text-white mb-6">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">GitHub Wrapped {currentYear}</h3>
            <div className="flex items-center justify-center space-x-3">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-16 h-16 rounded-full border-2 border-white/20"
              />
              <div className="text-left">
                <div className="text-xl font-semibold">@{user.login}</div>
                {user.name && <div className="text-blue-200">{user.name}</div>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.totalCommits.toLocaleString()}</div>
              <div className="text-sm text-blue-200">Commits</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.totalStars.toLocaleString()}</div>
              <div className="text-sm text-blue-200">Stars</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.longestStreak}</div>
              <div className="text-sm text-blue-200">Day Streak</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{topLanguage}</div>
              <div className="text-sm text-blue-200">Top Language</div>
            </div>
          </div>

          <div className="text-center text-blue-200 text-sm">
            🚀 Another year of coding excellence! 🚀
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={generateShareableImage}
          disabled={isGenerating}
          className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
            </div>
          ) : (
            <>
              <span className="mr-2">📤</span>
              Share Card
            </>
          )}
        </button>

        <button
          onClick={downloadCard}
          disabled={isGenerating}
          className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="mr-2">⬇️</span>
          Download Summary
        </button>
      </div>

      {/* Sharing Tips */}
      <div className="mt-6 bg-yellow-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">💡 Sharing Tips</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Share on social media with #GitHubWrapped</p>
          <p>• Tag your favorite programming communities</p>
          <p>• Inspire others with your coding journey!</p>
        </div>
      </div>
    </div>
  )
}

export default ShareableCard
