import { useState, useEffect, useCallback } from 'react'
import { 
  UnlockableTone, 
  Theme, 
  ToneMasterBadge,
  DailyMission,
  GameificationResult 
} from './gameificationTypes'
import { gameificationService } from '../services/gameificationService'

// Define interface for the global state
export interface GlobalGameState {
  xp: number
  level: number
  streak: number
  unlockableTones: UnlockableTone[]
  themes: Theme[]
  toneMasterBadges: ToneMasterBadge[]
  dailyMissions: DailyMission[]
  activeBadge: string | null
  activeTheme: Theme | null
  update: (state: Partial<GlobalGameState>) => void
}

interface GameificationState {
  xp: number;
  level: number;
  streak: number;
  unlockableTones: UnlockableTone[];
  themes: Theme[];
  toneMasterBadges: ToneMasterBadge[];
  dailyMissions: DailyMission[];
  tonesUsedToday: Record<string, number>;
  activeBadge: string | null;
  activeTheme: Theme | null;
  update: (state: Partial<GlobalGameState>) => void;
}

// Populate initial gameification state with defaults
const gameificationState: GameificationState = {
  xp: 0,
  level: 1,
  streak: 0,
  unlockableTones: [],
  themes: [],
  toneMasterBadges: [],
  dailyMissions: [],
  tonesUsedToday: {},
  activeBadge: null,
  activeTheme: null,
  update: (state) => {
    Object.assign(gameificationState, state)
    window.dispatchEvent(new CustomEvent('gameStateUpdate', { detail: gameificationState }))
  }
}

// Define initial data for gameification features
const initialUnlockableTones: UnlockableTone[] = [
  {
    id: 'clarity',
    name: 'Clarity',
    description: 'Clear and concise communication',
    unlockRequirement: { type: 'xp', value: 0 }, // Available from start
    unlocked: true
  },
  {
    id: 'friendly',
    name: 'Friendly',
    description: 'Warm and approachable tone',
    unlockRequirement: { type: 'xp', value: 50 },
      unlocked: false
    },
    {
    id: 'formal',
    name: 'Formal',
    description: 'Professional and structured communication',
    unlockRequirement: { type: 'xp', value: 100 },
      unlocked: false
    },
    {
    id: 'gen_z',
    name: 'Gen Z',
    description: 'Modern, casual internet slang with emojis',
    unlockRequirement: { type: 'xp', value: 200 },
      unlocked: false
    },
    {
      id: 'executive',
      name: 'Executive',
    description: 'Authoritative and decisive communication',
    unlockRequirement: { type: 'xp', value: 300 },
    unlocked: false
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Imaginative and expressive writing',
    unlockRequirement: { type: 'streak', value: 5 },
      unlocked: false
    }
];

const initialThemes: Theme[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Default app theme',
    unlockRequirement: { type: 'level', value: 1 },
    unlocked: true,
    className: 'theme-standard'
  },
    {
      id: 'dark',
      name: 'Dark Mode',
    description: 'Low-light optimized theme',
    unlockRequirement: { type: 'level', value: 2 },
    unlocked: false,
      className: 'theme-dark'
    },
    {
    id: 'focus',
    name: 'Focus Mode',
    description: 'Minimalist, distraction-free interface',
    unlockRequirement: { type: 'xp', value: 200 },
    unlocked: false,
    className: 'theme-focus'
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Calming green and blue palette',
    unlockRequirement: { type: 'streak', value: 5 },
      unlocked: false,
    className: 'theme-nature'
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'High-contrast, energetic colors',
      unlockRequirement: { type: 'level', value: 5 },
      unlocked: false,
    className: 'theme-vibrant'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Subtle, business-oriented design',
    unlockRequirement: { type: 'xp', value: 600 },
    unlocked: false,
    className: 'theme-professional'
  },
  {
    id: 'writers_delight',
    name: 'Writer\'s Delight',
    description: 'Typography-focused design (Premium)',
    unlockRequirement: { type: 'xp', value: 9999 }, // Premium only
    unlocked: false,
    className: 'theme-writers-delight'
  },
  {
    id: 'custom_accent',
    name: 'Custom Accent Colors',
    description: 'Personalized color choices (Premium)',
    unlockRequirement: { type: 'xp', value: 9999 }, // Premium only
      unlocked: false,
    className: 'theme-custom-accent'
    }
];
  
const initialToneMasterBadges: ToneMasterBadge[] = [
  // Tone Mastery Badges
    {
    id: 'clarity_champion',
      tone: 'clarity',
    name: 'Clarity Champion',
    description: 'Used Clarity tone 10 times',
      progress: 0,
    required: 10,
      unlocked: false
    },
    {
    id: 'friend_maker',
      tone: 'friendly',
    name: 'Friend Maker',
    description: 'Used Friendly tone 10 times',
      progress: 0,
    required: 10,
      unlocked: false
    },
    {
    id: 'professional_writer',
      tone: 'formal',
    name: 'Professional Writer',
    description: 'Used Formal tone 10 times',
    progress: 0,
    required: 10,
    unlocked: false
  },
  {
    id: 'casual_conversationalist',
    tone: 'casual',
    name: 'Casual Conversationalist',
    description: 'Used Casual tone 10 times',
    progress: 0,
    required: 10,
    unlocked: false
  },
  {
    id: 'enthusiasm_expert',
    tone: 'enthusiastic',
    name: 'Enthusiasm Expert',
    description: 'Used Enthusiastic tone 10 times',
    progress: 0,
    required: 10,
    unlocked: false
  },
  {
    id: 'diplomatic_delegate',
    tone: 'diplomatic',
    name: 'Diplomatic Delegate',
    description: 'Used Diplomatic tone 10 times',
    progress: 0,
    required: 10,
    unlocked: false
  },
  {
    id: 'persuasion_pro',
    tone: 'persuasive',
    name: 'Persuasion Pro',
    description: 'Used Persuasive tone 15 times',
    progress: 0,
    required: 15,
    unlocked: false
  },
  {
    id: 'tech_talker',
    tone: 'technical',
    name: 'Tech Talker',
    description: 'Used Technical tone 15 times',
    progress: 0,
    required: 15,
    unlocked: false
  },
  {
    id: 'creative_genius',
    tone: 'creative',
    name: 'Creative Genius',
    description: 'Used Creative tone 15 times',
      progress: 0,
    required: 15,
      unlocked: false
    },
    {
    id: 'executive_elite',
    tone: 'executive',
    name: 'Executive Elite',
    description: 'Used Executive tone 15 times',
      progress: 0,
      required: 15,
      unlocked: false
  },
  // Feature Usage Badges
  {
    id: 'rewrite_rookie',
    tone: '_feature',
    name: 'Rewrite Rookie',
    description: 'First rewrite',
    progress: 0,
    required: 1,
    unlocked: false
  },
  {
    id: 'dedication_daily',
    tone: '_feature',
    name: 'Dedication Daily',
    description: 'First 3-day streak',
    progress: 0,
    required: 3,
    unlocked: false
  },
  {
    id: 'word_wizard',
    tone: '_feature',
    name: 'Word Wizard',
    description: 'Rewrote 1,000 words total',
    progress: 0,
    required: 1000,
    unlocked: false
  },
  {
    id: 'battle_victor',
    tone: '_feature',
    name: 'Battle Victor',
    description: 'Won 5 rewrite battles',
    progress: 0,
    required: 5,
    unlocked: false
  },
  {
    id: 'style_savant',
    tone: '_feature',
    name: 'Style Savant',
    description: 'Used custom tone builder 3 times',
    progress: 0,
    required: 3,
    unlocked: false
  },
  {
    id: 'streak_master',
    tone: '_feature',
    name: 'Streak Master',
    description: 'Reached 7-day streak',
    progress: 0,
    required: 7,
    unlocked: false
  },
  {
    id: 'power_user',
    tone: '_feature',
    name: 'Power User',
    description: 'Used the app 30 times',
    progress: 0,
    required: 30,
    unlocked: false
  },
  {
    id: 'vocabulary_virtuoso',
    tone: '_premium',
    name: 'Vocabulary Virtuoso',
    description: 'Premium: Used advanced vocabulary features',
    progress: 0,
    required: 1,
      unlocked: false
    }
];
  
const initialDailyMissions: DailyMission[] = [
    {
    id: 'tone_explorer',
      title: 'Tone Explorer',
      description: 'Use 3 different tones today',
      type: 'use_tones',
      goal: 3,
      progress: 0,
      completed: false,
    reward: { type: 'xp', value: 40 }
  },
  {
    id: 'word_count',
    title: 'Word Count',
    description: 'Rewrite at least 200 words today',
      type: 'rewrite_words',
    goal: 200,
      progress: 0,
      completed: false,
      reward: { type: 'xp', value: 30 }
    },
    {
    id: 'multi_tasker',
    title: 'Multi-tasker',
    description: 'Complete 3 different rewrites today',
    type: 'rewrite_count',
      goal: 3,
      progress: 0,
      completed: false,
    reward: { type: 'xp', value: 50 }
  },
  {
    id: 'battle_ready',
    title: 'Battle Ready',
    description: 'Use the Rewrite Battle feature once today',
    type: 'battle',
    goal: 1,
    progress: 0,
    completed: false,
    reward: { type: 'xp', value: 60 }
  },
  {
    id: 'style_specialist',
    title: 'Style Specialist',
    description: 'Use the Custom Tone Builder feature once today',
    type: 'custom_tone',
    goal: 1,
    progress: 0,
    completed: false,
    reward: { type: 'xp', value: 70 }
  },
  {
    id: 'feedback_friend',
    title: 'Feedback Friend',
    description: 'Select your favorite from multiple rewrites',
    type: 'feedback',
    goal: 1,
    progress: 0,
    completed: false,
    reward: { type: 'xp', value: 25 }
  },
  {
    id: 'daily_checkin',
    title: 'Daily Check-in',
    description: 'Simple login mission',
    type: 'checkin',
    goal: 1,
    progress: 0,
    completed: false,
    reward: { type: 'xp', value: 15 }
  }
];

// Initialize the service with predefined data (this is only done once)
let serviceInitialized = false;

export function useGameification(): GameificationResult {
  // State variables
  const [xp, setXP] = useState(0)
  const [level, setLevel] = useState(1)
  const [streak, setStreak] = useState(0)
  const [unlockableTones, setUnlockableTones] = useState<UnlockableTone[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [toneMasterBadges, setToneMasterBadges] = useState<ToneMasterBadge[]>([])
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([])
  const [activeBadge, setActiveBadgeState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('active-badge')
    }
    return null
  })
  
  // Add state for active theme
  const [activeTheme, setActiveThemeState] = useState<Theme | null>(null);

  // Initialize state from gameificationService
  useEffect(() => {
    // Initialize the service with predefined data if not already done
    if (!serviceInitialized) {
      const state = gameificationService.getState();
      
      // Only initialize if the service is empty
      if (state.unlockableTones.length === 0 && state.themes.length === 0) {
        console.log('Initializing gameification service with predefined data');
        gameificationService.initializeState({
          unlockableTones: initialUnlockableTones,
          themes: initialThemes,
          toneMasterBadges: initialToneMasterBadges,
          dailyMissions: initialDailyMissions
        });
        serviceInitialized = true;
      }
      
      // Track daily check-in when component mounts
      gameificationService.trackCheckIn();
      
      // Debug the current state on initialization
      console.log('Initial gameification state:', gameificationService.debugState());
    }
    
    // Get the latest state
    const state = gameificationService.getState()
    setXP(state.xp)
    setLevel(state.level)
    setStreak(state.streak)
    setUnlockableTones(state.unlockableTones)
    setThemes(state.themes)
    setToneMasterBadges(state.toneMasterBadges)
    setDailyMissions(state.dailyMissions)
    setActiveBadgeState(state.activeBadge)
    
    // Handle activeTheme separately to ensure themes are loaded first
    if (themes.length === 0 && state.themes.length > 0) {
      // First time loading themes
      const savedThemeId = localStorage.getItem('active-theme') || 'standard';
      const theme = state.themes.find(t => t.id === savedThemeId && t.unlocked) || 
                    state.themes.find(t => t.id === 'standard') || null;
      
      if (theme) {
        console.log('Setting initial theme:', theme.id);
        setActiveThemeState(theme);
        
        // Apply theme directly during initialization
        document.documentElement.classList.forEach(cls => {
          if (cls.startsWith('theme-')) {
            document.documentElement.classList.remove(cls);
          }
        });
        document.documentElement.classList.add(`theme-${theme.id}`);
      }
    } else if (state.activeTheme) {
      // Service already has an active theme
      setActiveThemeState(state.activeTheme);
    }

    // Update global state for backward compatibility
    gameificationState.update({
      xp: state.xp,
      level: state.level,
      streak: state.streak,
      unlockableTones: state.unlockableTones,
      themes: state.themes,
      toneMasterBadges: state.toneMasterBadges,
      dailyMissions: state.dailyMissions,
      activeBadge: state.activeBadge,
      activeTheme: state.activeTheme
    })

    // Listen for state updates
    const handleXPUpdate = (e: CustomEvent) => {
      setXP(e.detail)
      gameificationState.update({ xp: e.detail })
    }

    const handleLevelUpdate = (e: CustomEvent) => {
      setLevel(e.detail)
      gameificationState.update({ level: e.detail })
    }

    const handleStreakUpdate = (e: CustomEvent) => {
      setStreak(e.detail)
      gameificationState.update({ streak: e.detail })
    }

    const handleToneUnlock = (e: CustomEvent) => {
      const updatedTones = [...unlockableTones]
      const toneIndex = updatedTones.findIndex(t => t.id === e.detail.id)
      if (toneIndex >= 0) {
        updatedTones[toneIndex] = e.detail
        setUnlockableTones(updatedTones)
        gameificationState.update({ unlockableTones: updatedTones })
      }
    }

    const handleThemeUnlock = (e: CustomEvent) => {
      const updatedThemes = [...themes]
      const themeIndex = updatedThemes.findIndex(t => t.id === e.detail.id)
      if (themeIndex >= 0) {
        updatedThemes[themeIndex] = e.detail
        setThemes(updatedThemes)
        gameificationState.update({ themes: updatedThemes })
      }
    }

    const handleBadgeUnlock = (e: CustomEvent) => {
      const updatedBadges = [...toneMasterBadges]
      const badgeIndex = updatedBadges.findIndex(b => b.id === e.detail.id)
      if (badgeIndex >= 0) {
        updatedBadges[badgeIndex] = e.detail
        setToneMasterBadges(updatedBadges)
        gameificationState.update({ toneMasterBadges: updatedBadges })
      }
    }

    const handleMissionUpdate = (e: CustomEvent) => {
      const updatedMissions = [...dailyMissions]
      const missionIndex = updatedMissions.findIndex(m => m.id === e.detail.id)
      if (missionIndex >= 0) {
        updatedMissions[missionIndex] = e.detail
        setDailyMissions(updatedMissions)
        gameificationState.update({ dailyMissions: updatedMissions })
      }
    }

    const handleActiveBadgeUpdate = (e: CustomEvent) => {
      setActiveBadgeState(e.detail)
      gameificationState.update({ activeBadge: e.detail })
    }

    const handleActiveThemeUpdate = (e: CustomEvent) => {
      console.log('Received active_theme_update event with theme:', e.detail?.id);
      setActiveThemeState(e.detail);
      gameificationState.update({ activeTheme: e.detail });
    }

    // Handle full state refresh
    const handleGameificationUpdate = (e: CustomEvent) => {
      const newState = e.detail;
      if (newState) {
        console.log('Received full gameification update:', newState);
        setXP(newState.xp);
        setLevel(newState.level);
        setStreak(newState.streak);
        if (newState.unlockableTones) setUnlockableTones(newState.unlockableTones);
        if (newState.themes) setThemes(newState.themes);
        if (newState.toneMasterBadges) setToneMasterBadges(newState.toneMasterBadges);
        if (newState.dailyMissions) setDailyMissions(newState.dailyMissions);
        if (newState.activeBadge !== undefined) setActiveBadge(newState.activeBadge);
        if (newState.activeTheme !== undefined) setActiveTheme(newState.activeTheme);
      }
    };

    window.addEventListener('xp_update', handleXPUpdate as EventListener)
    window.addEventListener('level_update', handleLevelUpdate as EventListener)
    window.addEventListener('streak_update', handleStreakUpdate as EventListener)
    window.addEventListener('tone_unlock', handleToneUnlock as EventListener)
    window.addEventListener('theme_unlock', handleThemeUnlock as EventListener)
    window.addEventListener('badge_unlock', handleBadgeUnlock as EventListener)
    window.addEventListener('mission_update', handleMissionUpdate as EventListener)
    window.addEventListener('active_badge_update', handleActiveBadgeUpdate as EventListener)
    window.addEventListener('active_theme_update', handleActiveThemeUpdate as EventListener)
    window.addEventListener('gameification_update', handleGameificationUpdate as EventListener)

    return () => {
      window.removeEventListener('xp_update', handleXPUpdate as EventListener)
      window.removeEventListener('level_update', handleLevelUpdate as EventListener)
      window.removeEventListener('streak_update', handleStreakUpdate as EventListener)
      window.removeEventListener('tone_unlock', handleToneUnlock as EventListener)
      window.removeEventListener('theme_unlock', handleThemeUnlock as EventListener)
      window.removeEventListener('badge_unlock', handleBadgeUnlock as EventListener)
      window.removeEventListener('mission_update', handleMissionUpdate as EventListener)
      window.removeEventListener('active_badge_update', handleActiveBadgeUpdate as EventListener)
      window.removeEventListener('active_theme_update', handleActiveThemeUpdate as EventListener)
      window.removeEventListener('gameification_update', handleGameificationUpdate as EventListener)
    }
  }, [])

  // Additional effect to handle theme initialization after themes are loaded
  useEffect(() => {
    if (themes.length > 0 && !activeTheme) {
      const savedThemeId = localStorage.getItem('active-theme') || 'standard';
      const theme = themes.find(t => t.id === savedThemeId && t.unlocked) || 
                  themes.find(t => t.id === 'standard') || null;
      
      if (theme) {
        console.log('Setting theme after themes loaded:', theme.id);
        setActiveThemeState(theme);
      }
    }
  }, [themes, activeTheme]);

  // Core functions
  const addXP = (amount: number) => {
    gameificationService.addXP(amount)
  }
  
  const trackToneUsage = (tone: string, wordCount: number) => {
    gameificationService.trackToneUsage(tone, wordCount)
  }

  const trackBattle = (winner: string, loser: string) => {
    addXP(10); // Add XP for battles
    gameificationService.updateMissions('battle', 1); 
  }

  const trackCustomTone = () => {
    addXP(15); // Add XP for custom tone creation
    gameificationService.updateMissions('custom_tone', 1); 
  }
  
  const trackFeedback = () => {
    addXP(5); // Add XP for providing feedback
    gameificationService.trackFeedback()
  }
  
  const trackWordWizard = (wordCount: number) => {
    // Find the word wizard badge and update its progress
    const badge = toneMasterBadges.find(b => b.id === 'word_wizard');
    if (badge && !badge.unlocked) {
      // Update progress through the service by simulating tone usage
      // This is a temporary solution until we implement a proper method for tracking word count
      const updatedBadge = { ...badge, progress: badge.progress + wordCount };
      if (updatedBadge.progress >= updatedBadge.required) {
        updatedBadge.unlocked = true;
        
        // Dispatch a badge unlock event
        window.dispatchEvent(new CustomEvent('badge_unlock', { 
          detail: updatedBadge 
        }));
        
        // Also dispatch the unified reward event
        window.dispatchEvent(new CustomEvent('rewardUnlocked', { 
          detail: {
            unlockedDetails: {
              tones: [],
              themes: [],
              badges: [updatedBadge.id]
            }
          }
        }));
      }
    }
  }

  // Set active badge with localStorage persistence
  const setActiveBadge = useCallback((badgeId: string | null) => {
    setActiveBadgeState(badgeId)
    if (badgeId) {
      localStorage.setItem('active-badge', badgeId)
    } else {
      localStorage.removeItem('active-badge')
    }
    
    // Update global state
    gameificationState.activeBadge = badgeId
    gameificationState.update({activeBadge: badgeId})
  }, [])
  
  // Set active theme with localStorage persistence
  const setActiveTheme = useCallback((theme: Theme | null) => {
    console.log('useGameification: Setting active theme:', theme?.id);
    setActiveThemeState(theme);
    
    // Use the service method to update the theme
    gameificationService.setActiveTheme(theme);
    
    // No need to manually set localStorage as the service does it
  }, []);

  // Additional debugging helper functions
  const debugRewards = () => {
    return gameificationService.debugState();
  }
  
  const fixMissionIssues = () => {
    gameificationService.fixMissions();
    return 'Mission issues fixed';
  }
  
  const simulateUnlock = (type: 'tone' | 'theme' | 'badge', id: string) => {
    console.log(`Simulating unlock for ${type} with id ${id}`);
    
    if (type === 'tone') {
      const tone = gameificationService.getState().unlockableTones.find(t => t.id === id);
      if (tone) {
        window.dispatchEvent(new CustomEvent('tone_unlock', { detail: {...tone, unlocked: true} }));
        window.dispatchEvent(new CustomEvent('rewardUnlocked', { 
          detail: {
            unlockedDetails: {
              tones: [id],
              themes: [],
              badges: []
            }
          }
        }));
        return `Simulated unlock for tone: ${tone.name}`;
      }
    } else if (type === 'theme') {
      const theme = gameificationService.getState().themes.find(t => t.id === id);
      if (theme) {
        window.dispatchEvent(new CustomEvent('theme_unlock', { detail: {...theme, unlocked: true} }));
        window.dispatchEvent(new CustomEvent('rewardUnlocked', { 
          detail: {
            unlockedDetails: {
              tones: [],
              themes: [id],
              badges: []
            }
          }
        }));
        return `Simulated unlock for theme: ${theme.name}`;
      }
    } else if (type === 'badge') {
      const badge = gameificationService.getState().toneMasterBadges.find(b => b.id === id);
      if (badge) {
        window.dispatchEvent(new CustomEvent('badge_unlock', { detail: {...badge, unlocked: true, progress: badge.required} }));
        window.dispatchEvent(new CustomEvent('rewardUnlocked', { 
          detail: {
            unlockedDetails: {
              tones: [],
              themes: [],
              badges: [id]
            }
          }
        }));
        return `Simulated unlock for badge: ${badge.name}`;
      }
    }
    
    return `Could not find ${type} with id ${id}`;
  }
  
  const simulateMissionComplete = (missionId: string) => {
    const mission = gameificationService.getState().dailyMissions.find(m => m.id === missionId);
    if (mission) {
      const updatedMission = {...mission, completed: true, progress: mission.goal};
      window.dispatchEvent(new CustomEvent('mission_update', { detail: updatedMission }));
      return `Simulated completion for mission: ${mission.title}`;
    }
    return `Could not find mission with id ${missionId}`;
  }
  
  const resetGameification = () => {
    localStorage.removeItem('gameification_state');
    window.location.reload();
    return 'Gameification state reset';
  }
  
  // Add a method to complete a daily mission
  const completeMission = (missionId: string) => {
    const mission = dailyMissions.find(m => m.id === missionId);
    if (mission && !mission.completed) {
      mission.completed = true;
      mission.progress = mission.goal;
      
      // Award XP for completing the mission
      if (mission.reward.type === 'xp') {
        addXP(mission.reward.value);
      }
      
      // Dispatch mission update event
      window.dispatchEvent(new CustomEvent('mission_update', { detail: mission }));
      
      // Update state
      setDailyMissions([...dailyMissions]);
      
      return true;
    }
    return false;
  };

  // Return the gameification result with all needed properties and methods
  const result: GameificationResult = {
    xp,
    level,
    streak,
    unlockableTones,
    themes,
    toneMasterBadges,
    dailyMissions,
    tonesUsedToday: gameificationService.getTonesUsedToday(),
    activeBadge,
    activeTheme,
    addXP,
    checkAndUpdateStreak: () => gameificationService.updateStreak(),
    trackToneUsage,
    trackBattle,
    trackCustomTone,
    trackFeedback,
    trackWordWizard,
    setActiveBadge,
    setActiveTheme,
    completeMission
  };

  return result;
} 