import { z } from 'zod'

/**
 * Environment variable validation schema using Zod
 * Validates all required and optional environment variables at runtime
 */

const envSchema = z.object({
  // Supabase - Required for core functionality
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),

  // R2 - Required for image upload feature
  R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID is required').optional(),
  R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required').optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required').optional(),
  R2_BUCKET_NAME: z.string().min(1).optional(),
  R2_PUBLIC_BASE_URL: z.string().url().optional(),

  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validates environment variables and returns typed env object
 * Throws descriptive error if validation fails
 */
function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const formatted = result.error.format()
    const errorMessages = Object.entries(formatted)
      .filter(([key]) => key !== '_errors')
      .map(([key, value]) => {
        const errors = (value as { _errors?: string[] })?._errors
        if (errors && errors.length > 0) {
          return `  - ${key}: ${errors.join(', ')}`
        }
        return null
      })
      .filter(Boolean)
      .join('\n')

    console.error('Environment validation failed:\n' + errorMessages)
    throw new Error('Invalid environment configuration. Check console for details.')
  }

  return result.data
}

/**
 * Validated environment variables
 * Access env vars through this object for type safety
 */
export const env = validateEnv()

/**
 * Check if R2 storage is configured
 * All R2 variables must be present for image upload feature to work
 */
export function isR2Configured(): boolean {
  return Boolean(
    env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY
  )
}

/**
 * Get R2 configuration (throws if not configured)
 */
export function getR2Config() {
  if (!isR2Configured()) {
    throw new Error('R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.')
  }

  return {
    accountId: env.R2_ACCOUNT_ID!,
    accessKeyId: env.R2_ACCESS_KEY_ID!,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    bucketName: env.R2_BUCKET_NAME || 'nuvaclub-issues',
    publicBaseUrl: env.R2_PUBLIC_BASE_URL,
  }
}
