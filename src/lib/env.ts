import { z } from 'zod'

// Environment validation schema
const envSchema = z.object({
  // GitHub OAuth
  GITHUB_ID: z.string().min(1, 'GITHUB_ID is required'),
  GITHUB_SECRET: z.string().min(1, 'GITHUB_SECRET is required'),

  // NextAuth
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),

  // Application
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),

  // Optional GitHub token for enhanced rate limits
  GITHUB_TOKEN: z.string().optional(),

  // Optional Vercel URL
  VERCEL_URL: z.string().optional()
})

// Parse and validate environment variables
function validateEnv() {
  try {
    const env = envSchema.parse({
      GITHUB_ID: process.env.GITHUB_ID,
      GITHUB_SECRET: process.env.GITHUB_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      GITHUB_TOKEN: process.env.GITHUB_TOKEN,
      VERCEL_URL: process.env.VERCEL_URL
    })

    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
      throw new Error(`Environment validation failed:\n${missingVars}`)
    }
    throw error
  }
}

// Export validated environment variables
export const env = validateEnv()

// Type for the validated environment
export type Env = z.infer<typeof envSchema>

// Helper function to check if we're in production
export const isProduction = env.NODE_ENV === 'production'

// Helper function to check if we're in development
export const isDevelopment = env.NODE_ENV === 'development'

// Helper function to check if we're in test environment
export const isTest = env.NODE_ENV === 'test'

// Get the app URL (prioritize VERCEL_URL in production)
export function getAppUrl(): string {
  if (env.VERCEL_URL && isProduction) {
    return `https://${env.VERCEL_URL}`
  }
  return env.NEXT_PUBLIC_APP_URL
}

// Validate specific environment variables at runtime
export function requireEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`)
  }
  return value
}

// Safe environment variable getter with defaults
export function getEnvVar(name: string, defaultValue?: string): string | undefined {
  return process.env[name] || defaultValue
}