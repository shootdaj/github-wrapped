/**
 * GitHub API service layer with rate limiting, retry logic, and public data fetching
 * Requirements: R2 - GitHub API integration
 */

interface GitHubUser {
  login: string
  id: number
  name: string | null
  bio: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
  avatar_url: string
  html_url: string
  hasPublicActivity?: boolean
}

interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  stargazers_count: number
  watchers_count: number
  language: string | null
  forks_count: number
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
}

interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  used: number
}

interface ContributionDay {
  count: number
  date: string
  level: number
}

interface GitHubAPIError extends Error {
  status?: number
  type: 'network' | 'rate-limit' | 'not-found' | 'server' | 'client'
}

class GitHubAPIService {
  private readonly baseURL = 'https://api.github.com'
  private readonly userAgent = 'GitHub-Wrapped-App'

  private async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    maxRetries = 3
  ): Promise<Response> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': this.userAgent,
            ...options.headers,
          },
        })

        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          return response
        }

        if (!response.ok && response.status >= 500) {
          throw new Error(`Server error: ${response.status}`)
        }

        return response
      } catch (error) {
        lastError = error as Error

        if (attempt === maxRetries) {
          throw lastError
        }

        // Wait before retry with exponential backoff
        const delay = Math.pow(2, attempt - 1) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }

  private extractRateLimit(response: Response): RateLimitInfo {
    return {
      limit: parseInt(response.headers.get('x-ratelimit-limit') || '5000'),
      remaining: parseInt(response.headers.get('x-ratelimit-remaining') || '0'),
      reset: parseInt(response.headers.get('x-ratelimit-reset') || '0'),
      used: parseInt(response.headers.get('x-ratelimit-used') || '0'),
    }
  }

  private createAPIError(response: Response, message?: string): GitHubAPIError {
    const error = new Error(message || `API Error: ${response.status}`) as GitHubAPIError
    error.status = response.status

    switch (response.status) {
      case 404:
        error.type = 'not-found'
        break
      case 403:
        error.type = 'rate-limit'
        break
      case 500:
      case 502:
      case 503:
      case 504:
        error.type = 'server'
        break
      default:
        if (response.status >= 400 && response.status < 500) {
          error.type = 'client'
        } else {
          error.type = 'network'
        }
    }

    return error
  }

  async fetchUserProfile(username: string): Promise<GitHubUser> {
    try {
      const response = await this.fetchWithRetry(`${this.baseURL}/users/${username}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw this.createAPIError(response, 'User not found')
        }
        if (response.status === 403) {
          const rateLimitInfo = this.extractRateLimit(response)
          const resetTime = new Date(rateLimitInfo.reset * 1000)
          throw this.createAPIError(
            response,
            `Rate limit exceeded. Resets at ${resetTime.toLocaleTimeString()}`
          )
        }
        throw this.createAPIError(response)
      }

      const rateLimitInfo = this.extractRateLimit(response)
      if (rateLimitInfo.remaining < 100) {
        console.warn('Approaching GitHub API rate limit:', rateLimitInfo)
      }

      const user: GitHubUser = await response.json()

      // Check if user has public activity
      user.hasPublicActivity = user.public_repos > 0

      return user
    } catch (error) {
      if (error instanceof Error && 'type' in error) {
        throw error
      }
      const apiError = new Error('Network error') as GitHubAPIError
      apiError.type = 'network'
      throw apiError
    }
  }

  async fetchUserRepositories(username: string, page = 1, perPage = 100): Promise<GitHubRepository[]> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseURL}/users/${username}/repos?page=${page}&per_page=${perPage}&sort=updated&type=owner`
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw this.createAPIError(response, 'User not found')
        }
        if (response.status === 403) {
          throw this.createAPIError(response, 'Rate limit exceeded')
        }
        throw this.createAPIError(response)
      }

      const repositories: GitHubRepository[] = await response.json()
      return repositories.filter(repo => !repo.private) // Only public repositories
    } catch (error) {
      if (error instanceof Error && 'type' in error) {
        throw error
      }
      const apiError = new Error('Failed to fetch repositories') as GitHubAPIError
      apiError.type = 'network'
      throw apiError
    }
  }

  async fetchContributionData(username: string): Promise<ContributionDay[]> {
    try {
      // GitHub's contribution graph is not available through the public API
      // We would need to scrape it from the profile page or use GraphQL API
      // For now, return mock data structure that matches the expected format
      const response = await this.fetchWithRetry(`https://github.com/users/${username}/contributions`)

      if (!response.ok) {
        throw this.createAPIError(response, 'Failed to fetch contributions')
      }

      const html = await response.text()

      // Parse contribution data from SVG
      const contributionPattern = /data-count="(\d+)" data-date="([^"]+)"/g
      const contributions: ContributionDay[] = []
      let match

      while ((match = contributionPattern.exec(html)) !== null) {
        const count = parseInt(match[1])
        contributions.push({
          count,
          date: match[2],
          level: count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 9 ? 3 : 4,
        })
      }

      return contributions
    } catch (error) {
      // If scraping fails, return empty array for now
      console.warn('Could not fetch contribution data:', error)
      return []
    }
  }

  async getRateLimit(): Promise<RateLimitInfo> {
    try {
      const response = await fetch(`${this.baseURL}/rate_limit`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': this.userAgent,
        },
      })

      if (!response.ok) {
        throw this.createAPIError(response, 'Failed to check rate limit')
      }

      const data = await response.json()
      return data.rate as RateLimitInfo
    } catch (error) {
      // Return default rate limit info if check fails
      return {
        limit: 60,
        remaining: 60,
        reset: Math.floor(Date.now() / 1000) + 3600,
        used: 0,
      }
    }
  }
}

// Export singleton instance
export const githubAPI = new GitHubAPIService()

// Export types
export type {
  GitHubUser,
  GitHubRepository,
  RateLimitInfo,
  ContributionDay,
  GitHubAPIError,
}
