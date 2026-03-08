import crypto from 'crypto'
import { env } from './env'

// Encryption configuration
const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const SALT_LENGTH = 32
const TAG_LENGTH = 16

// Derive encryption key from NextAuth secret
function deriveKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(env.NEXTAUTH_SECRET, salt, 100000, KEY_LENGTH, 'sha256')
}

// Encrypt sensitive data
export function encrypt(text: string): string {
  try {
    const salt = crypto.randomBytes(SALT_LENGTH)
    const iv = crypto.randomBytes(IV_LENGTH)
    const key = deriveKey(salt)

    const cipher = crypto.createCipher('aes-256-gcm', key)
    cipher.setAAD(iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    // Combine salt, iv, authTag, and encrypted data
    const combined = Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ])

    return combined.toString('base64')
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Decrypt sensitive data
export function decrypt(encryptedData: string): string {
  try {
    const combined = Buffer.from(encryptedData, 'base64')

    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH)
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH)

    const key = deriveKey(salt)

    const decipher = crypto.createDecipher('aes-256-gcm', key)
    decipher.setAAD(iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, undefined, 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Generate a secure random string
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

// Generate a cryptographically secure random secret
export function generateSecret(length: number = 64): string {
  return crypto.randomBytes(length).toString('base64').replace(/[+/=]/g, '').substring(0, length)
}

// Hash a value using SHA-256
export function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

// Verify a hash
export function verifyHash(value: string, hash: string): boolean {
  return hashValue(value) === hash
}

// Time-safe string comparison to prevent timing attacks
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

// Secure session token generation
export function generateSessionToken(): string {
  const timestamp = Date.now().toString(36)
  const randomBytes = crypto.randomBytes(24).toString('hex')
  return `${timestamp}.${randomBytes}`
}

// Validate session token format
export function validateSessionToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false

  const parts = token.split('.')
  if (parts.length !== 2) return false

  const [timestamp, random] = parts

  // Validate timestamp format (base36)
  if (!/^[0-9a-z]+$/i.test(timestamp)) return false

  // Validate random part (hex)
  if (!/^[0-9a-f]{48}$/i.test(random)) return false

  // Check if token is not too old (24 hours)
  const tokenTime = parseInt(timestamp, 36)
  const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  return (Date.now() - tokenTime) < maxAge
}

// Sanitize sensitive data from logs
export function sanitizeForLogging(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  const sensitiveKeys = [
    'password', 'secret', 'token', 'key', 'auth',
    'GITHUB_SECRET', 'NEXTAUTH_SECRET', 'access_token',
    'refresh_token', 'client_secret'
  ]

  const sanitized = { ...data }

  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForLogging(sanitized[key])
    }
  }

  return sanitized
}