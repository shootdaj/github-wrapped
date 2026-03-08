import { sanitizeForLogging } from './secrets'

export type AuthEventType =
  | 'sign_in_attempt'
  | 'sign_in_success'
  | 'sign_in_error'
  | 'sign_out'
  | 'user_created'
  | 'user_updated'
  | 'account_linked'
  | 'jwt_created'
  | 'jwt_error'
  | 'session_created'
  | 'session_error'
  | 'redirect'
  | 'auth_error'
  | 'rate_limit'
  | 'suspicious_activity'

export interface AuthLogEntry {
  timestamp: string
  event: AuthEventType
  userId?: string
  username?: string
  email?: string
  provider?: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  error?: string
  metadata?: Record<string, any>
}

// In-memory log storage for development (replace with proper logging service in production)
const authLogs: AuthLogEntry[] = []
const MAX_LOGS = 1000

// Get client IP address from request headers
function getClientIP(req?: Request): string | undefined {
  if (!req) return undefined

  const forwarded = req.headers.get('x-forwarded-for')
  const real = req.headers.get('x-real-ip')
  const cfConnecting = req.headers.get('cf-connecting-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (real) {
    return real
  }
  if (cfConnecting) {
    return cfConnecting
  }

  return undefined
}

// Get user agent from request headers
function getUserAgent(req?: Request): string | undefined {
  return req?.headers.get('user-agent') || undefined
}

// Create a sanitized log entry
function createLogEntry(
  event: AuthEventType,
  data: Partial<AuthLogEntry> = {},
  req?: Request
): AuthLogEntry {
  return {
    timestamp: new Date().toISOString(),
    event,
    ipAddress: getClientIP(req),
    userAgent: getUserAgent(req),
    ...sanitizeForLogging(data)
  }
}

// Log authentication events
export async function logAuthEvent(
  event: AuthEventType,
  data: Partial<AuthLogEntry> = {},
  req?: Request
): Promise<void> {
  try {
    const logEntry = createLogEntry(event, data, req)

    // Add to in-memory storage
    authLogs.push(logEntry)

    // Keep only the most recent logs
    if (authLogs.length > MAX_LOGS) {
      authLogs.splice(0, authLogs.length - MAX_LOGS)
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUTH] ${event}:`, logEntry)
    }

    // In production, you would send this to a proper logging service
    // Examples: DataDog, LogRocket, Sentry, CloudWatch, etc.
    if (process.env.NODE_ENV === 'production') {
      // await sendToLoggingService(logEntry)
    }

    // Log critical events to console even in production
    const criticalEvents: AuthEventType[] = [
      'sign_in_error',
      'jwt_error',
      'session_error',
      'auth_error',
      'rate_limit',
      'suspicious_activity'
    ]

    if (criticalEvents.includes(event)) {
      console.error(`[AUTH CRITICAL] ${event}:`, logEntry)
    }
  } catch (error) {
    // Never throw from logging - just log the error
    console.error('Failed to log auth event:', error)
  }
}

// Get recent authentication logs (for admin/debugging)
export function getRecentAuthLogs(limit: number = 50): AuthLogEntry[] {
  return authLogs
    .slice(-limit)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Get logs for a specific user
export function getUserAuthLogs(userId: string, limit: number = 20): AuthLogEntry[] {
  return authLogs
    .filter(log => log.userId === userId)
    .slice(-limit)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Get logs by event type
export function getAuthLogsByEvent(event: AuthEventType, limit: number = 50): AuthLogEntry[] {
  return authLogs
    .filter(log => log.event === event)
    .slice(-limit)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Check for suspicious activity patterns
export function detectSuspiciousActivity(userId?: string, ipAddress?: string): boolean {
  const timeWindow = 10 * 60 * 1000 // 10 minutes
  const maxAttempts = 5
  const now = Date.now()

  const recentLogs = authLogs.filter(log => {
    const logTime = new Date(log.timestamp).getTime()
    const isRecent = (now - logTime) <= timeWindow
    const matchesUser = userId && log.userId === userId
    const matchesIP = ipAddress && log.ipAddress === ipAddress
    const isFailedAttempt = log.event === 'sign_in_error' || log.event === 'auth_error'

    return isRecent && (matchesUser || matchesIP) && isFailedAttempt
  })

  if (recentLogs.length >= maxAttempts) {
    // Log suspicious activity
    logAuthEvent('suspicious_activity', {
      userId,
      ipAddress,
      failedAttempts: recentLogs.length,
      metadata: {
        timeWindow: timeWindow / 1000 / 60, // in minutes
        attempts: recentLogs.map(log => ({
          timestamp: log.timestamp,
          event: log.event,
          error: log.error
        }))
      }
    })

    return true
  }

  return false
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function isRateLimited(identifier: string, maxRequests: number = 10, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const existing = rateLimitMap.get(identifier)

  if (!existing || now > existing.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return false
  }

  if (existing.count >= maxRequests) {
    // Log rate limit event
    logAuthEvent('rate_limit', {
      metadata: {
        identifier,
        attempts: existing.count,
        windowMs: windowMs / 1000 / 60 // in minutes
      }
    })

    return true
  }

  // Increment counter
  existing.count++
  return false
}

// Clean up old rate limit entries
export function cleanupRateLimit(): void {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

// Security metrics
export interface SecurityMetrics {
  totalLogins: number
  failedLogins: number
  suspiciousActivity: number
  rateLimitHits: number
  uniqueUsers: number
  recentActivity: AuthLogEntry[]
}

export function getSecurityMetrics(hoursBack: number = 24): SecurityMetrics {
  const cutoff = Date.now() - (hoursBack * 60 * 60 * 1000)
  const recentLogs = authLogs.filter(log =>
    new Date(log.timestamp).getTime() > cutoff
  )

  const totalLogins = recentLogs.filter(log =>
    log.event === 'sign_in_success'
  ).length

  const failedLogins = recentLogs.filter(log =>
    log.event === 'sign_in_error' || log.event === 'auth_error'
  ).length

  const suspiciousActivity = recentLogs.filter(log =>
    log.event === 'suspicious_activity'
  ).length

  const rateLimitHits = recentLogs.filter(log =>
    log.event === 'rate_limit'
  ).length

  const uniqueUsers = new Set(
    recentLogs
      .filter(log => log.userId)
      .map(log => log.userId)
  ).size

  return {
    totalLogins,
    failedLogins,
    suspiciousActivity,
    rateLimitHits,
    uniqueUsers,
    recentActivity: recentLogs.slice(-10)
  }
}

// Cleanup function to prevent memory leaks
setInterval(() => {
  cleanupRateLimit()
}, 15 * 60 * 1000) // Clean up every 15 minutes