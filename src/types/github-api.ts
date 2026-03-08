/**
 * TypeScript types for GitHub API responses
 * Requirements: R2 - GitHub API integration types
 */

export interface GitHubUser {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string | null
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
  name: string | null
  company: string | null
  blog: string | null
  location: string | null
  email: string | null
  hireable: boolean | null
  bio: string | null
  twitter_username: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  hasPublicActivity?: boolean
}

export interface GitHubRepository {
  id: number
  node_id: string
  name: string
  full_name: string
  private: boolean
  owner: {
    login: string
    id: number
    avatar_url: string
    html_url: string
  }
  html_url: string
  description: string | null
  fork: boolean
  url: string
  created_at: string
  updated_at: string
  pushed_at: string
  git_url: string
  ssh_url: string
  clone_url: string
  size: number
  stargazers_count: number
  watchers_count: number
  language: string | null
  has_issues: boolean
  has_projects: boolean
  has_wiki: boolean
  has_pages: boolean
  forks_count: number
  archived: boolean
  disabled: boolean
  open_issues_count: number
  license: {
    key: string
    name: string
    spdx_id: string
    url: string | null
  } | null
  allow_forking: boolean
  is_template: boolean
  topics: string[]
  visibility: string
  forks: number
  open_issues: number
  watchers: number
  default_branch: string
}

export interface GitHubLanguageStats {
  [language: string]: number
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  used: number
  resource?: string
}

export interface RateLimitResponse {
  resources: {
    core: RateLimitInfo
    search: RateLimitInfo
    graphql: RateLimitInfo
    integration_manifest: RateLimitInfo
    source_import: RateLimitInfo
    code_scanning_upload: RateLimitInfo
    actions_runner_registration: RateLimitInfo
    scim: RateLimitInfo
  }
  rate: RateLimitInfo
}

export interface ContributionDay {
  count: number
  date: string
  level: number // 0-4 based on GitHub's contribution levels
}

export interface ContributionWeek {
  week: number // Unix timestamp for start of week
  days: ContributionDay[]
  total: number
}

export interface GitHubAPIError extends Error {
  status?: number
  type: 'network' | 'rate-limit' | 'not-found' | 'server' | 'client' | 'no-activity'
  retryAfter?: number
}

export interface ActivityStats {
  totalCommits: number
  totalPRs: number
  totalIssues: number
  totalStars: number
  activeDays: number
  activeMonths: number
  longestStreak: number
  currentStreak: number
  mostActiveDay: string
  mostActiveMonth: string
}

export interface LanguageBreakdown {
  language: string
  bytes: number
  percentage: number
  color: string
}

export interface TopRepository {
  name: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  url: string
  isForked: boolean
}
