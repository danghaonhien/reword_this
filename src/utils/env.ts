/**
 * Environment variable utilities
 * 
 * Provides type-safe access to environment variables with fallbacks
 */

// Application environment
export const APP_ENV = import.meta.env.VITE_APP_ENV as 'development' | 'production' | 'test' || 'development'

// Feature flags
export const ENABLE_PREMIUM_FEATURES = import.meta.env.VITE_ENABLE_PREMIUM_FEATURES === 'true'
export const ENABLE_DEBUG_MODE = import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true'

// App configuration
export const MAX_TOKENS = Number(import.meta.env.VITE_MAX_TOKENS || 1000)
export const DEFAULT_MODEL = import.meta.env.VITE_DEFAULT_MODEL as string || 'gpt-3.5-turbo'
export const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT as string || 'http://localhost:3000'

// Utility function to check if we're in development mode
export const isDev = () => APP_ENV === 'development'

// Utility function to check if we're in production mode
export const isProd = () => APP_ENV === 'production'

/**
 * Check if user has premium access
 * This uses the ENABLE_PREMIUM_FEATURES flag and can be extended
 * with subscription checks in the future
 */
export const isPremium = (): boolean => {
  return ENABLE_PREMIUM_FEATURES;
} 