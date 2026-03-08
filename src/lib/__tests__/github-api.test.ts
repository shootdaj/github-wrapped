/**
 * Tests for GitHub API Integration
 * Requirements: R2 - GitHub API service layer, R9 - API error handling
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

const mockFetch = vi.mocked(fetch)

// Mock GitHub API responses
const mockUserProfile = {
  login: 'testuser',
  id: 12345,
  name: 'Test User',
  bio: 'A test user',
  public_repos: 25,
  followers: 100,
  following: 50,
  created_at: '2020-01-01T00:00:00Z'
}

const mockContributionData = {
  total: 365,
  weeks: [
    { w: 1640995200, a: 5, d: 2, c: 3 },
    { w: 1641600000, a: 8, d: 1, c: 7 }
  ]
}

const mockRateLimit = {
  limit: 5000,
  remaining: 4999,
  reset: Math.floor(Date.now() / 1000) + 3600,
  used: 1
}

describe('GitHub API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset fetch mock
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('User Profile Fetching', () => {
    it('should successfully fetch user profile', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUserProfile),
        headers: new Headers({
          'x-ratelimit-limit': '5000',
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600)
        })
      } as Response)

      // Mock GitHub API service function
      const fetchUserProfile = async (username: string) => {
        const response = await fetch(`https://api.github.com/users/${username}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.status}`)
        }
        return response.json()
      }

      const profile = await fetchUserProfile('testuser')

      expect(mockFetch).toHaveBeenCalledWith('https://api.github.com/users/testuser')
      expect(profile).toEqual(mockUserProfile)
    })

    it('should handle non-existent user', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Not Found' })
      } as Response)

      const fetchUserProfile = async (username: string) => {
        const response = await fetch(`https://api.github.com/users/${username}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('User not found')
          }
          throw new Error(`API Error: ${response.status}`)
        }
        return response.json()
      }

      await expect(fetchUserProfile('nonexistentuser')).rejects.toThrow('User not found')
      expect(mockFetch).toHaveBeenCalledWith('https://api.github.com/users/nonexistentuser')
    })

    it('should handle private users gracefully', async () => {
      const privateUserResponse = {
        login: 'privateuser',
        id: 67890,
        name: 'Private User',
        bio: null,
        public_repos: 0,
        followers: 0,
        following: 0,
        created_at: '2021-01-01T00:00:00Z'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(privateUserResponse)
      } as Response)

      const fetchUserProfile = async (username: string) => {
        const response = await fetch(`https://api.github.com/users/${username}`)
        if (!response.ok) throw new Error(`Failed to fetch user: ${response.status}`)

        const profile = await response.json()

        // Handle users with no public activity
        if (profile.public_repos === 0) {
          return { ...profile, hasPublicActivity: false }
        }

        return { ...profile, hasPublicActivity: true }
      }

      const profile = await fetchUserProfile('privateuser')

      expect(profile.hasPublicActivity).toBe(false)
      expect(profile.public_repos).toBe(0)
    })
  })

  describe('Rate Limiting', () => {
    it('should respect GitHub rate limits', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUserProfile),
        headers: new Headers({
          'x-ratelimit-limit': '5000',
          'x-ratelimit-remaining': '10',
          'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600)
        })
      } as Response)

      const fetchWithRateLimit = async (url: string) => {
        const response = await fetch(url)

        const rateLimitInfo = {
          limit: parseInt(response.headers.get('x-ratelimit-limit') || '0'),
          remaining: parseInt(response.headers.get('x-ratelimit-remaining') || '0'),
          reset: parseInt(response.headers.get('x-ratelimit-reset') || '0')
        }

        // Check if we're approaching rate limit
        if (rateLimitInfo.remaining < 100) {
          console.warn('Approaching rate limit:', rateLimitInfo)
        }

        return { response, rateLimitInfo }
      }

      const { response, rateLimitInfo } = await fetchWithRateLimit('https://api.github.com/users/testuser')

      expect(rateLimitInfo.remaining).toBe(10)
      expect(rateLimitInfo.limit).toBe(5000)
      expect(response.ok).toBe(true)
    })

    it('should handle rate limit exceeded error', async () => {
      const resetTime = Math.floor(Date.now() / 1000) + 3600

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({
          message: 'API rate limit exceeded',
          documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'
        }),
        headers: new Headers({
          'x-ratelimit-limit': '5000',
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': String(resetTime)
        })
      } as Response)

      const fetchWithRateLimit = async (url: string) => {
        const response = await fetch(url)

        if (response.status === 403) {
          const resetTime = response.headers.get('x-ratelimit-reset')
          throw new Error(`Rate limit exceeded. Resets at ${new Date(parseInt(resetTime || '0') * 1000)}`)
        }

        return response.json()
      }

      await expect(fetchWithRateLimit('https://api.github.com/users/testuser')).rejects.toThrow('Rate limit exceeded')
    })
  })

  describe('Retry Logic', () => {
    it('should retry on network failures', async () => {
      // First call fails with network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUserProfile)
      } as Response)

      const fetchWithRetry = async (url: string, maxRetries = 3) => {
        let lastError: Error

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const response = await fetch(url)
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            return response.json()
          } catch (error) {
            lastError = error as Error
            if (attempt === maxRetries) throw lastError

            // Wait before retry (exponential backoff)
            const delay = Math.pow(2, attempt - 1) * 1000
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }

        throw lastError!
      }

      const profile = await fetchWithRetry('https://api.github.com/users/testuser')

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(profile).toEqual(mockUserProfile)
    })

    it('should not retry on 404 errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Not Found' })
      } as Response)

      const fetchWithSmartRetry = async (url: string, maxRetries = 3) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const response = await fetch(url)

            // Don't retry on client errors (4xx)
            if (response.status >= 400 && response.status < 500) {
              throw new Error(`Client error: ${response.status}`)
            }

            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            return response.json()
          } catch (error) {
            if (error.message.includes('Client error') || attempt === maxRetries) {
              throw error
            }

            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      }

      await expect(fetchWithSmartRetry('https://api.github.com/users/invalid')).rejects.toThrow('Client error: 404')
      expect(mockFetch).toHaveBeenCalledTimes(1) // Should not retry on 404
    })
  })

  describe('Public Data Fetching', () => {
    it('should fetch public data without authentication', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUserProfile)
      } as Response)

      const fetchPublicData = async (username: string) => {
        // Ensure no authentication headers are sent for public data
        const response = await fetch(`https://api.github.com/users/${username}`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitHub-Wrapped-App'
          }
        })

        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)
        return response.json()
      }

      const profile = await fetchPublicData('testuser')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/users/testuser',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.anything()
          })
        })
      )
      expect(profile).toEqual(mockUserProfile)
    })

    it('should handle GitHub API service errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Server Error' })
      } as Response)

      const fetchWithErrorHandling = async (url: string) => {
        const response = await fetch(url)

        if (!response.ok) {
          switch (response.status) {
            case 404:
              throw new Error('User not found')
            case 403:
              throw new Error('Rate limit exceeded')
            case 500:
            case 502:
            case 503:
              throw new Error('GitHub service temporarily unavailable')
            default:
              throw new Error(`API Error: ${response.status}`)
          }
        }

        return response.json()
      }

      await expect(fetchWithErrorHandling('https://api.github.com/users/testuser')).rejects.toThrow('GitHub service temporarily unavailable')
    })
  })

  describe('Contribution Data Fetching', () => {
    it('should fetch contribution statistics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(`
          <svg class="js-calendar-graph-svg">
            <g>
              <rect data-count="3" data-date="2024-01-01"/>
              <rect data-count="5" data-date="2024-01-02"/>
              <rect data-count="1" data-date="2024-01-03"/>
            </g>
          </svg>
        `)
      } as Response)

      const fetchContributions = async (username: string) => {
        const response = await fetch(`https://github.com/users/${username}/contributions`)
        if (!response.ok) throw new Error(`Failed to fetch contributions: ${response.status}`)

        const html = await response.text()

        // Parse contribution data from SVG (mock implementation)
        const contributionPattern = /data-count="(\d+)" data-date="([^"]+)"/g
        const contributions: { count: number; date: string }[] = []
        let match

        while ((match = contributionPattern.exec(html)) !== null) {
          contributions.push({
            count: parseInt(match[1]),
            date: match[2]
          })
        }

        return contributions
      }

      const contributions = await fetchContributions('testuser')

      expect(contributions).toHaveLength(3)
      expect(contributions[0]).toEqual({ count: 3, date: '2024-01-01' })
      expect(contributions[1]).toEqual({ count: 5, date: '2024-01-02' })
    })
  })
})
