/**
 * Activity Stats Component
 * Requirements: R3 - Activity stats calculation and display
 */

import type { ActivityStats } from '../../types/github-api'

interface ActivityStatsProps {
  stats: ActivityStats
  className?: string
}

export function ActivityStats({ stats, className = '' }: ActivityStatsProps) {
  const statItems = [
    {
      label: 'Total Commits',
      value: stats.totalCommits.toLocaleString(),
      icon: '📝',
      description: 'Contributions this year',
    },
    {
      label: 'Pull Requests',
      value: stats.totalPRs.toLocaleString(),
      icon: '🔄',
      description: 'PRs opened this year',
    },
    {
      label: 'Issues',
      value: stats.totalIssues.toLocaleString(),
      icon: '🐛',
      description: 'Issues created this year',
    },
    {
      label: 'Stars Earned',
      value: stats.totalStars.toLocaleString(),
      icon: '⭐',
      description: 'Total stars on repositories',
    },
    {
      label: 'Active Days',
      value: stats.activeDays.toLocaleString(),
      icon: '📅',
      description: 'Days with contributions',
    },
    {
      label: 'Active Months',
      value: stats.activeMonths.toString(),
      icon: '🗓️',
      description: 'Months with activity',
    },
    {
      label: 'Longest Streak',
      value: `${stats.longestStreak} days`,
      icon: '🔥',
      description: 'Longest contribution streak',
    },
    {
      label: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: '⚡',
      description: 'Current contribution streak',
    },
  ]

  const highlights = [
    {
      label: 'Most Active Day',
      value: stats.mostActiveDay,
      icon: '🌟',
    },
    {
      label: 'Most Active Month',
      value: stats.mostActiveMonth,
      icon: '🚀',
    },
  ]

  return (
    <div className={`activity-stats ${className}`}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your GitHub Year in Numbers</h2>
        <p className="text-gray-600">Here's what you accomplished this year</p>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {item.value}
              </div>
              <div className="text-sm font-medium text-gray-600 mb-1">
                {item.label}
              </div>
              <div className="text-xs text-gray-500">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Highlights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Highlights</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {highlights.map((highlight, index) => (
            <div key={index} className="flex items-center space-x-3">
              <span className="text-2xl">{highlight.icon}</span>
              <div>
                <div className="font-medium text-gray-800">{highlight.label}</div>
                <div className="text-lg font-bold text-blue-600">{highlight.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak info */}
      {stats.currentStreak > 0 && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full">
            <span>🔥</span>
            <span className="font-medium">
              You're on a {stats.currentStreak} day streak! Keep it going!
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityStats
