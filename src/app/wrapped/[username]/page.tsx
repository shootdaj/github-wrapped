'use client'

import { useState, useEffect, use } from 'react'
import { githubDataClient } from '../../../lib/api-client'
import { useAPIError } from '../../../hooks/useAPIError'
import { LoadingSpinner, SkeletonLoader } from '../../../components/loading'
import { APIErrorDisplay } from '../../../components/error/APIErrorDisplay'
import ActivityStats from '../../../components/stats/ActivityStats'
import LanguageBreakdown from '../../../components/stats/LanguageBreakdown'
import TopRepositories from '../../../components/repositories/TopRepositories'
import ContributionHeatmap from '../../../components/visualization/ContributionHeatmap'
import ShareableCard from '../../../components/sharing/ShareableCard'
import type { GitHubUser, GitHubRepository, ActivityStats as ActivityStatsType, LanguageBreakdown as LanguageBreakdownType, TopRepository, ContributionDay } from '../../../types/github-api'

interface WrappedPageProps {
  params: Promise<{
    username: string
  }>
}

export default function WrappedPage({ params }: WrappedPageProps) {
  const { username: encodedUsername } = use(params)
  const username = decodeURIComponent(encodedUsername)

  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<{
    user: GitHubUser
    repositories: GitHubRepository[]
    activityStats: ActivityStatsType
    languageBreakdown: LanguageBreakdownType[]
    topRepositories: TopRepository[]
    contributionData: ContributionDay[]
  } | null>(null)

  const { error, setError, retry, clearError } = useAPIError()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      clearError()

      const result = await githubDataClient.getUserData(username)
      setData(result)
    } catch (err: any) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [username])

  const handleRetry = () => {
    retry(fetchData)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="text-center mb-8 md:mb-16">
            <h1 className="text-3xl md:text-6xl font-bold tracking-tight mb-4">
              {username}'s
              <span className="text-blue-600"> GitHub Wrapped</span>
            </h1>
            <LoadingSpinner size="large" message="Analyzing your GitHub journey..." />
          </div>

          {/* Loading skeletons */}
          <div className="space-y-8 md:space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonLoader key={i} lines={3} className="p-4" />
              ))}
            </div>
            <SkeletonLoader lines={6} />
            <SkeletonLoader lines={8} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <APIErrorDisplay error={error} retry={handleRetry} />
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-20">
          <h1 className="text-3xl md:text-6xl font-bold tracking-tight mb-4">
            {username}'s
            <span className="text-blue-600"> GitHub Wrapped</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6">
            Your {new Date().getFullYear()} coding journey in numbers
          </p>

          {/* Profile info */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <img
              src={data.user.avatar_url}
              alt={data.user.login}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white shadow-lg"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                {data.user.name || data.user.login}
              </h2>
              <p className="text-gray-600">
                {data.user.public_repos} repositories • {data.user.followers} followers
              </p>
              {data.user.bio && (
                <p className="text-sm text-gray-500 mt-1 max-w-md">{data.user.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-16 md:space-y-24">
          {/* Activity Stats */}
          <section className="w-full">
            <ActivityStats stats={data.activityStats} />
          </section>

          {/* Language Breakdown */}
          <section className="w-full">
            <LanguageBreakdown languages={data.languageBreakdown} />
          </section>

          {/* Top Repositories */}
          <section className="w-full">
            <TopRepositories repositories={data.topRepositories} />
          </section>

          {/* Contribution Heatmap */}
          <section className="w-full">
            <ContributionHeatmap contributionData={data.contributionData} />
          </section>

          {/* Shareable Card */}
          <section className="w-full">
            <ShareableCard
              user={data.user}
              stats={data.activityStats}
              topLanguages={data.languageBreakdown}
            />
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            Built with ❤️ for the GitHub community
          </p>
        </div>
      </div>
    </div>
  )
}
