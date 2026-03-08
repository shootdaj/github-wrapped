/**
 * High-level API client for GitHub data fetching
 * Requirements: R2 - GitHub API client wrapper
 */

import { githubAPI } from './github-api'
import type {
  GitHubUser,
  GitHubRepository,
  ActivityStats,
  LanguageBreakdown,
  TopRepository,
  ContributionDay,
  GitHubAPIError,
} from '../types/github-api'

export class GitHubDataClient {
  async getUserData(username: string): Promise<{
    user: GitHubUser
    repositories: GitHubRepository[]
    activityStats: ActivityStats
    languageBreakdown: LanguageBreakdown[]
    topRepositories: TopRepository[]
    contributionData: ContributionDay[]
  }> {
    try {
      // Fetch user profile first
      const user = await githubAPI.fetchUserProfile(username)

      if (!user.hasPublicActivity) {
        const error = new Error('This user has no public GitHub activity to display.') as GitHubAPIError
        error.type = 'no-activity'
        throw error
      }

      // Fetch all repositories for the user
      const repositories = await this.fetchAllRepositories(username)

      // Calculate various statistics
      const activityStats = this.calculateActivityStats(user, repositories)
      const languageBreakdown = await this.calculateLanguageBreakdown(repositories)
      const topRepositories = this.getTopRepositories(repositories)
      const contributionData = await githubAPI.fetchContributionData(username)

      return {
        user,
        repositories,
        activityStats,
        languageBreakdown,
        topRepositories,
        contributionData,
      }
    } catch (error) {
      // Re-throw with proper error type
      if (error instanceof Error && 'type' in error) {
        throw error
      }

      const apiError = new Error('Failed to fetch GitHub data') as GitHubAPIError
      apiError.type = 'network'
      throw apiError
    }
  }

  private async fetchAllRepositories(username: string): Promise<GitHubRepository[]> {
    const allRepos: GitHubRepository[] = []
    let page = 1
    const perPage = 100

    while (true) {
      const repos = await githubAPI.fetchUserRepositories(username, page, perPage)

      if (repos.length === 0) break

      allRepos.push(...repos)

      if (repos.length < perPage) break

      page++
    }

    return allRepos
  }

  private calculateActivityStats(user: GitHubUser, repositories: GitHubRepository[]): ActivityStats {
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

    // Filter repositories from the last year for activity calculations
    const recentRepos = repositories.filter(repo => {
      const updatedAt = new Date(repo.updated_at)
      return updatedAt >= oneYearAgo
    })

    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)

    // Mock calculations - in a real implementation, these would come from commits API
    const totalCommits = Math.floor(Math.random() * 1000) + recentRepos.length * 10
    const totalPRs = Math.floor(Math.random() * 50) + recentRepos.length
    const totalIssues = Math.floor(Math.random() * 100) + recentRepos.length * 2

    // Calculate active days and months based on repository activity
    const activeDaysSet = new Set<string>()
    const activeMonthsSet = new Set<string>()

    repositories.forEach(repo => {
      const createdAt = new Date(repo.created_at)
      const updatedAt = new Date(repo.updated_at)

      if (createdAt >= oneYearAgo) {
        activeDaysSet.add(createdAt.toISOString().split('T')[0])
        activeMonthsSet.add(`${createdAt.getFullYear()}-${createdAt.getMonth() + 1}`)
      }

      if (updatedAt >= oneYearAgo) {
        activeDaysSet.add(updatedAt.toISOString().split('T')[0])
        activeMonthsSet.add(`${updatedAt.getFullYear()}-${updatedAt.getMonth() + 1}`)
      }
    })

    // Mock streak calculations
    const longestStreak = Math.floor(Math.random() * 100) + 1
    const currentStreak = Math.floor(Math.random() * 30)

    // Find most active periods
    const monthCounts: { [key: string]: number } = {}
    repositories.forEach(repo => {
      const month = new Date(repo.updated_at).toISOString().slice(0, 7)
      monthCounts[month] = (monthCounts[month] || 0) + 1
    })

    const mostActiveMonth = Object.entries(monthCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'

    return {
      totalCommits,
      totalPRs,
      totalIssues,
      totalStars,
      activeDays: activeDaysSet.size,
      activeMonths: activeMonthsSet.size,
      longestStreak,
      currentStreak,
      mostActiveDay: 'Monday', // Would be calculated from actual commit data
      mostActiveMonth,
    }
  }

  private async calculateLanguageBreakdown(repositories: GitHubRepository[]): Promise<LanguageBreakdown[]> {
    const languageBytes: { [language: string]: number } = {}

    // Calculate language distribution based on repository languages
    repositories.forEach(repo => {
      if (repo.language) {
        // Mock byte calculation based on repository size
        const bytes = repo.size * 1024 // Convert KB to bytes (rough estimate)
        languageBytes[repo.language] = (languageBytes[repo.language] || 0) + bytes
      }
    })

    const totalBytes = Object.values(languageBytes).reduce((sum, bytes) => sum + bytes, 0)

    if (totalBytes === 0) return []

    // Language colors (GitHub's color scheme)
    const languageColors: { [key: string]: string } = {
      JavaScript: '#f1e05a',
      TypeScript: '#2b7489',
      Python: '#3572A5',
      Java: '#b07219',
      'C++': '#f34b7d',
      C: '#555555',
      'C#': '#239120',
      PHP: '#4F5D95',
      Ruby: '#701516',
      Go: '#00ADD8',
      Rust: '#dea584',
      Swift: '#ffac45',
      Kotlin: '#F18E33',
      Scala: '#c22d40',
      Shell: '#89e051',
      HTML: '#e34c26',
      CSS: '#1572B6',
      SCSS: '#c6538c',
      Vue: '#2c3e50',
      React: '#61dafb',
    }

    const breakdown = Object.entries(languageBytes)
      .map(([language, bytes]) => ({
        language,
        bytes,
        percentage: (bytes / totalBytes) * 100,
        color: languageColors[language] || '#858585',
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 10) // Top 10 languages

    return breakdown
  }

  private getTopRepositories(repositories: GitHubRepository[]): TopRepository[] {
    return repositories
      .map(repo => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        url: repo.html_url,
        isForked: repo.fork,
      }))
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 6) // Top 6 repositories
  }
}

export const githubDataClient = new GitHubDataClient()
