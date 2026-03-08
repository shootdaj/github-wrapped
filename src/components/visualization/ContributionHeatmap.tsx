/**
 * Contribution Heatmap Component
 * Requirements: R6 - GitHub-style contribution calendar visualization
 */

import type { ContributionDay } from '../../types/github-api'

interface ContributionHeatmapProps {
  contributionData: ContributionDay[]
  className?: string
}

export function ContributionHeatmap({ contributionData, className = '' }: ContributionHeatmapProps) {
  // Generate a full year of dates
  const generateYearData = () => {
    const weeks: ContributionDay[][] = []
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

    // Create contribution map for quick lookup
    const contributionMap = new Map<string, ContributionDay>()
    contributionData.forEach(day => {
      contributionMap.set(day.date, day)
    })

    let currentDate = new Date(oneYearAgo)
    let currentWeek: ContributionDay[] = []

    // Fill initial week to start on Sunday
    const startDay = currentDate.getDay()
    for (let i = 0; i < startDay; i++) {
      currentWeek.push({ count: 0, date: '', level: 0 })
    }

    while (currentDate <= now) {
      const dateString = currentDate.toISOString().split('T')[0]
      const contribution = contributionMap.get(dateString) || {
        count: 0,
        date: dateString,
        level: 0
      }

      currentWeek.push(contribution)

      if (currentDate.getDay() === 6) { // Saturday
        weeks.push([...currentWeek])
        currentWeek = []
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Fill remaining days of the last week
    while (currentWeek.length < 7) {
      currentWeek.push({ count: 0, date: '', level: 0 })
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    return weeks
  }

  const weeks = generateYearData()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return '#ebedf0'
      case 1: return '#9be9a8'
      case 2: return '#40c463'
      case 3: return '#30a14e'
      case 4: return '#216e39'
      default: return '#ebedf0'
    }
  }

  const totalContributions = contributionData.reduce((sum, day) => sum + day.count, 0)
  const activeDays = contributionData.filter(day => day.count > 0).length

  return (
    <div className={`contribution-heatmap ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Contribution Graph</h2>
        <p className="text-gray-600">
          {totalContributions.toLocaleString()} contributions in the last year
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
        {/* Month labels */}
        <div className="flex mb-2 text-xs text-gray-600">
          <div className="w-8"></div>
          {months.map((month, index) => (
            <div key={month} className="flex-1 text-center min-w-0">
              {index % 2 === 0 ? month : ''}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col justify-between text-xs text-gray-600 pr-2">
            {days.map((day, index) => (
              <div key={day} className="h-3 leading-3">
                {index % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>

          {/* Contribution squares */}
          <div className="grid grid-flow-col gap-1" style={{ gridTemplateRows: 'repeat(7, 1fr)' }}>
            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className="w-3 h-3 rounded-sm border border-gray-300 hover:border-gray-400 transition-all duration-150"
                  style={{ backgroundColor: getLevelColor(day.level) }}
                  title={
                    day.date
                      ? `${day.count} contributions on ${day.date}`
                      : 'No data'
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <span>Less</span>
            <div className="flex space-x-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className="w-3 h-3 rounded-sm border border-gray-300"
                  style={{ backgroundColor: getLevelColor(level) }}
                />
              ))}
            </div>
            <span>More</span>
          </div>

          <div className="text-right">
            <div>{activeDays} active days</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {totalContributions.toLocaleString()}
          </div>
          <div className="text-sm text-green-800">Total Contributions</div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {activeDays}
          </div>
          <div className="text-sm text-blue-800">Active Days</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round((activeDays / 365) * 100)}%
          </div>
          <div className="text-sm text-purple-800">Year Activity</div>
        </div>
      </div>
    </div>
  )
}

export default ContributionHeatmap
