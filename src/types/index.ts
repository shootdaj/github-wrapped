// Common type definitions

export interface User {
  id: string
  login: string
  name: string | null
  email: string | null
  avatar_url: string
  html_url: string
  type: string
  created_at: string
  updated_at: string
}

export interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  size: number
  created_at: string
  updated_at: string
  pushed_at: string
  private: boolean
}

export interface Commit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
    committer: {
      name: string
      email: string
      date: string
    }
  }
  author: User | null
  committer: User | null
  html_url: string
}

export interface APIError {
  message: string
  status: number
  code?: string
  documentation_url?: string
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
  data: any | null
}