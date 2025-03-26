/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_APP_ENV: 'development' | 'production' | 'test'
  readonly VITE_ENABLE_PREMIUM_FEATURES: string
  readonly VITE_ENABLE_DEBUG_MODE: string
  readonly VITE_MAX_TOKENS: string
  readonly VITE_DEFAULT_MODEL: string
  readonly VITE_API_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 