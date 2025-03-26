// Define interface for unlockable tones
export interface UnlockableTone {
  id: string
  name: string
  description: string
  unlockRequirement: {
    type: 'xp' | 'streak'
    value: number
  }
  unlocked: boolean
}

// Define interface for custom themes
export interface Theme {
  id: string
  name: string
  description: string
  unlockRequirement: {
    type: 'xp' | 'streak' | 'level'
    value: number
  }
  unlocked: boolean
  className: string
}

// Define interface for tone master badges
export interface ToneMasterBadge {
  id: string
  tone: string
  name: string
  description: string
  progress: number
  required: number
  unlocked: boolean
}

// Define interface for daily missions
export interface DailyMission {
  id: string
  title: string
  description: string
  type: 'use_tones' | 'rewrite_words' | 'rewrite_count' | 'battle' | 'custom_tone' | 'feedback' | 'checkin'
  goal: number
  progress: number
  completed: boolean
  reward: {
    type: 'xp' | 'streak_bonus'
    value: number
  }
}

export interface GameificationResult {
  // Basic stats
  xp: number
  level: number
  streak: number
  
  // Core functions
  addXP: (amount: number) => void
  checkAndUpdateStreak: () => void
  trackToneUsage: (tone: string, wordCount: number) => void
  trackBattle: (winner: string, loser: string) => void
  trackCustomTone: () => void
  trackFeedback: () => void
  trackWordWizard: (wordCount: number) => void
  
  // Feature-specific data and functions
  unlockableTones: UnlockableTone[]
  themes: Theme[]
  toneMasterBadges: ToneMasterBadge[]
  activeBadge: string | null
  setActiveBadge: (badgeId: string | null) => void
  dailyMissions: DailyMission[]
  tonesUsedToday: Record<string, number>
  activeTheme: Theme | null
  setActiveTheme: (theme: Theme | null) => void
  completeMission?: (missionId: string) => void
}
