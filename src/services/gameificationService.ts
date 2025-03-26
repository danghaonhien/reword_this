import { 
  UnlockableTone, 
  Theme, 
  ToneMasterBadge, 
  DailyMission,
  GameificationResult 
} from '../hooks/gameificationTypes';

export interface GameificationState {
  xp: number;
  level: number;
  streak: number;
  lastRewriteDate: string | null;
  lastStreakUpdateDay: string | null;
  unlockableTones: UnlockableTone[];
  themes: Theme[];
  toneMasterBadges: ToneMasterBadge[];
  dailyMissions: DailyMission[];
  tonesUsedToday: string[];
  activeBadge: string | null;
  activeTheme: Theme | null;
}

export type GameificationEventType = 
  | 'xp_update'
  | 'level_update'
  | 'streak_update'
  | 'tone_unlock'
  | 'theme_unlock'
  | 'badge_unlock'
  | 'mission_update'
  | 'active_badge_update'
  | 'active_theme_update';

export class GameificationService {
  private state: GameificationState;

  constructor() {
    this.state = {
      xp: 0,
      level: 1,
      streak: 0,
      lastRewriteDate: null,
      lastStreakUpdateDay: null,
      unlockableTones: [],
      themes: [],
      toneMasterBadges: [],
      dailyMissions: [],
      tonesUsedToday: [],
      activeBadge: null,
      activeTheme: null
    };
    this.loadState();
  }

  private loadState() {
    const savedState = localStorage.getItem('gameification_state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        this.state = { ...this.state, ...parsedState };
        console.log('State loaded from localStorage:', this.state);
      } catch (error) {
        console.error('Failed to parse gameification state:', error);
        // If parsing fails, use the default state and reset localStorage
        localStorage.removeItem('gameification_state');
      }
    } else {
      console.log('No saved state found in localStorage');
    }
    this.checkDailyReset();
  }

  private saveState() {
    try {
      localStorage.setItem('gameification_state', JSON.stringify(this.state));
      console.log('State saved to localStorage');
    } catch (error) {
      console.error('Failed to save gameification state:', error);
    }
  }

  private dispatchEvent(type: GameificationEventType, detail: any) {
    const event = new CustomEvent(type, { detail });
    window.dispatchEvent(event);
  }

  private dispatchRewardUnlocked(type: 'tones' | 'themes' | 'badges', items: string[]) {
    // Dispatch unified event for RewardsPanel to show notifications
    const event = new CustomEvent('rewardUnlocked', { 
      detail: {
        unlockedDetails: {
          tones: type === 'tones' ? items : [],
          themes: type === 'themes' ? items : [],
          badges: type === 'badges' ? items : []
        }
      }
    });
    window.dispatchEvent(event);
    console.log(`Dispatched rewardUnlocked event for ${type}:`, items);
  }

  private checkDailyReset() {
    const today = new Date().toISOString().split('T')[0];
    const lastUpdate = this.state.lastStreakUpdateDay;
    
    console.log(`Checking daily reset - Today: ${today}, Last update: ${lastUpdate}`);
    
    if (lastUpdate !== today) {
      console.log('Daily reset triggered - resetting missions and tones used');
      this.resetDailyMissions();
      this.state.tonesUsedToday = [];
      this.state.lastStreakUpdateDay = today;
      this.saveState();
    } else {
      console.log('No daily reset needed');
    }
  }

  private resetDailyMissions() {
    console.log('Resetting daily missions', this.state.dailyMissions);
    this.state.dailyMissions = this.state.dailyMissions.map(mission => ({
      ...mission,
      completed: false,
      progress: 0
    }));
    console.log('Reset completed, missions:', this.state.dailyMissions);
  }

  private checkLevelUp() {
    const xpForNextLevel = this.state.level * 100;
    if (this.state.xp >= xpForNextLevel) {
      this.state.level++;
      this.state.xp -= xpForNextLevel;
      this.dispatchEvent('level_update', this.state.level);
      return true;
    }
    return false;
  }

  private checkUnlocks() {
    const unlockedTones: string[] = [];
    const unlockedThemes: string[] = [];
    const unlockedBadges: string[] = [];
    
    // Check tone unlocks (both XP and streak-based)
    this.state.unlockableTones.forEach(tone => {
      if (!tone.unlocked) {
        let shouldUnlock = false;
        
        if (tone.unlockRequirement.type === 'xp' && 
            this.state.xp >= tone.unlockRequirement.value) {
          shouldUnlock = true;
        } else if (tone.unlockRequirement.type === 'streak' && 
                  this.state.streak >= tone.unlockRequirement.value) {
          shouldUnlock = true;
        }
        
        if (shouldUnlock) {
          tone.unlocked = true;
          unlockedTones.push(tone.id);
          this.dispatchEvent('tone_unlock', tone);
        }
      }
    });
    
    // Check theme unlocks (XP, level, and streak-based)
    this.state.themes.forEach(theme => {
      if (!theme.unlocked) {
        let shouldUnlock = false;
        
        if (theme.unlockRequirement.type === 'xp' && 
            this.state.xp >= theme.unlockRequirement.value) {
          shouldUnlock = true;
        } else if (theme.unlockRequirement.type === 'level' && 
                  this.state.level >= theme.unlockRequirement.value) {
          shouldUnlock = true;
        } else if (theme.unlockRequirement.type === 'streak' && 
                  this.state.streak >= theme.unlockRequirement.value) {
          shouldUnlock = true;
        }
        
        if (shouldUnlock) {
          theme.unlocked = true;
          unlockedThemes.push(theme.id);
          this.dispatchEvent('theme_unlock', theme);
        }
      }
    });
    
    // If anything was unlocked, dispatch the unified event
    if (unlockedTones.length > 0) {
      this.dispatchRewardUnlocked('tones', unlockedTones);
    }
    
    if (unlockedThemes.length > 0) {
      this.dispatchRewardUnlocked('themes', unlockedThemes);
    }
    
    if (unlockedBadges.length > 0) {
      this.dispatchRewardUnlocked('badges', unlockedBadges);
    }
  }

  public getState(): GameificationState {
    return { ...this.state };
  }

  public addXP(amount: number) {
    this.state.xp += amount;
    this.dispatchEvent('xp_update', this.state.xp);
    
    // Check level up
    const prevLevel = this.state.level;
    const didLevelUp = this.checkLevelUp();
    
    // Always check for unlocks when XP changes
    this.checkUnlocks();
    
    this.saveState();
  }

  public updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Updating streak - current: ${this.state.streak}, lastRewriteDate: ${this.state.lastRewriteDate}, today: ${today}`);
    
    if (this.state.lastRewriteDate !== today) {
      this.state.streak++;
      this.state.lastRewriteDate = today;
      console.log(`Streak updated to ${this.state.streak}`);
      this.dispatchEvent('streak_update', this.state.streak);
      
      // Check for streak-based unlocks
      this.checkUnlocks();
      
      // Check for streak-based badges
      this.checkStreakBadges();
      
      this.saveState();
    } else {
      console.log(`Streak already updated today, not incrementing`);
    }
  }
  
  // New method to check streak-related badges
  private checkStreakBadges() {
    console.log(`Checking streak badges with current streak: ${this.state.streak}`);
    
    // Check "Dedication Daily" badge (3-day streak)
    const dedicationBadge = this.state.toneMasterBadges.find(b => b.id === 'dedication_daily');
    if (dedicationBadge && !dedicationBadge.unlocked && this.state.streak >= dedicationBadge.required) {
      dedicationBadge.unlocked = true;
      dedicationBadge.progress = dedicationBadge.required;
      console.log(`Unlocked Dedication Daily badge for ${this.state.streak}-day streak`);
      this.dispatchEvent('badge_unlock', dedicationBadge);
      this.dispatchRewardUnlocked('badges', [dedicationBadge.id]);
    }
    
    // Check "Streak Master" badge (7-day streak)
    const streakMasterBadge = this.state.toneMasterBadges.find(b => b.id === 'streak_master');
    if (streakMasterBadge && !streakMasterBadge.unlocked && this.state.streak >= streakMasterBadge.required) {
      streakMasterBadge.unlocked = true;
      streakMasterBadge.progress = streakMasterBadge.required;
      console.log(`Unlocked Streak Master badge for ${this.state.streak}-day streak`);
      this.dispatchEvent('badge_unlock', streakMasterBadge);
      this.dispatchRewardUnlocked('badges', [streakMasterBadge.id]);
    }
  }

  public trackToneUsage(toneId: string, wordCount: number) {
    if (!toneId) {
      console.error('trackToneUsage called with invalid toneId:', toneId);
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`Tracking tone usage: ${toneId}, wordCount: ${wordCount}, tonesUsedToday:`, this.state.tonesUsedToday);
    console.log(`Current badge state:`, this.state.toneMasterBadges);
    
    // Update streak
    if (this.state.lastRewriteDate !== today) {
      console.log(`Updating streak - Last rewrite: ${this.state.lastRewriteDate}, Today: ${today}`);
      this.updateStreak();
    }
    
    // Check if we need to update the "Word Wizard" badge
    if (wordCount > 0) {
      this.updateWordWizardBadge(wordCount);
      
      // Also update the word count mission
      this.updateWordCountMission(wordCount);
    }
    
    if (!this.state.tonesUsedToday.includes(toneId)) {
      this.state.tonesUsedToday.push(toneId);
      console.log(`Added ${toneId} to tones used today:`, this.state.tonesUsedToday);
      
      // Update badges
      const unlockedBadges: string[] = [];
      
      this.state.toneMasterBadges.forEach(badge => {
        console.log(`Checking badge: ${badge.id}, Tone: ${badge.tone}, Progress: ${badge.progress}/${badge.required}, Unlocked: ${badge.unlocked}`);
        
        if (!badge.unlocked && badge.tone === toneId) {
          badge.progress++;
          console.log(`Updated badge ${badge.id} progress: ${badge.progress}/${badge.required}`);
          
          if (badge.progress >= badge.required) {
            badge.unlocked = true;
            unlockedBadges.push(badge.id);
            console.log(`Badge unlocked: ${badge.id}`);
            this.dispatchEvent('badge_unlock', badge);
          }
        }
      });
      
      if (unlockedBadges.length > 0) {
        console.log(`Dispatching rewards for badges:`, unlockedBadges);
        this.dispatchRewardUnlocked('badges', unlockedBadges);
      }
      
      // Update missions
      const toneMission = this.state.dailyMissions.find(m => m.type === 'use_tones');
      console.log(`Tone mission:`, toneMission);
      
      if (toneMission && !toneMission.completed) {
        toneMission.progress = Math.min(toneMission.progress + 1, toneMission.goal);
        console.log(`Updated tone mission progress: ${toneMission.progress}/${toneMission.goal}`);
        
        if (toneMission.progress >= toneMission.goal) {
          toneMission.completed = true;
          console.log(`Tone mission completed, rewarding XP: ${toneMission.reward.value}`);
          
          if (toneMission.reward.type === 'xp') {
            this.addXP(toneMission.reward.value);
          }
        }
        this.dispatchEvent('mission_update', toneMission);
      }
      
      // Also update rewrite count mission
      this.updateMissions('rewrite_count', 0);
      
      this.saveState();
    } else {
      console.log(`Tone ${toneId} already used today, skipping updates`);
    }
  }
  
  // New method to update Word Wizard badge
  private updateWordWizardBadge(wordCount: number) {
    const wordWizardBadge = this.state.toneMasterBadges.find(b => b.id === 'word_wizard');
    if (wordWizardBadge && !wordWizardBadge.unlocked) {
      const oldProgress = wordWizardBadge.progress;
      wordWizardBadge.progress += wordCount;
      console.log(`Updated Word Wizard badge progress: ${oldProgress} -> ${wordWizardBadge.progress}/${wordWizardBadge.required}`);
      
      if (wordWizardBadge.progress >= wordWizardBadge.required) {
        wordWizardBadge.unlocked = true;
        console.log(`Word Wizard badge unlocked`);
        this.dispatchEvent('badge_unlock', wordWizardBadge);
        this.dispatchRewardUnlocked('badges', [wordWizardBadge.id]);
      }
    }
  }
  
  // New method to update word count mission
  private updateWordCountMission(wordCount: number) {
    const wordCountMission = this.state.dailyMissions.find(m => m.type === 'rewrite_words');
    if (wordCountMission && !wordCountMission.completed) {
      const oldProgress = wordCountMission.progress;
      wordCountMission.progress = Math.min(wordCountMission.progress + wordCount, wordCountMission.goal);
      console.log(`Updated word count mission progress: ${oldProgress} -> ${wordCountMission.progress}/${wordCountMission.goal}`);
      
      if (wordCountMission.progress >= wordCountMission.goal) {
        wordCountMission.completed = true;
        console.log(`Word count mission completed, rewarding XP: ${wordCountMission.reward.value}`);
        
        if (wordCountMission.reward.type === 'xp') {
          this.addXP(wordCountMission.reward.value);
        }
      }
      this.dispatchEvent('mission_update', wordCountMission);
    }
  }

  public updateMissions(type: 'use_tones' | 'rewrite_words' | 'rewrite_count' | 'battle' | 'custom_tone' | 'feedback' | 'checkin', progress: number) {
    console.log(`Updating mission type: ${type}, progress: ${progress}`);
    console.log(`Current missions:`, this.state.dailyMissions);
    
    const mission = this.state.dailyMissions.find(m => m.type === type);
    console.log(`Found mission:`, mission);

    if (mission && !mission.completed) {
      const oldProgress = mission.progress;
      mission.progress = Math.min(mission.progress + 1, mission.goal);
      console.log(`Updated mission progress: ${oldProgress} -> ${mission.progress}/${mission.goal}`);
      
      if (mission.progress >= mission.goal) {
        mission.completed = true;
        console.log(`Mission completed: ${mission.id}`);
        
        if (mission.reward.type === 'xp') {
          console.log(`Rewarding XP: ${mission.reward.value}`);
          this.addXP(mission.reward.value);
        }
      }
      this.dispatchEvent('mission_update', mission);
      this.saveState();
    } else if (!mission) {
      console.warn(`Mission not found for type: ${type}`);
    } else if (mission.completed) {
      console.log(`Mission ${mission.id} already completed, skipping update`);
    }
  }

  public trackFeedback() {
    console.log('Tracking feedback mission');
    this.updateMissions('feedback', 0);
  }

  public trackCheckIn() {
    console.log('Tracking check-in mission');
    this.updateMissions('checkin', 0);
  }

  public setActiveBadge(badgeId: string | null) {
    this.state.activeBadge = badgeId;
    this.dispatchEvent('active_badge_update', badgeId);
    this.saveState();
  }
  
  public setActiveTheme(theme: Theme | null) {
    console.log('GameificationService: Setting active theme:', theme?.id);
    this.state.activeTheme = theme;
    
    // Dispatch an event for active theme changes
    window.dispatchEvent(new CustomEvent('active_theme_update', { detail: theme }));
    
    // Save to localStorage
    if (theme) {
      localStorage.setItem('active-theme', theme.id);
      console.log('GameificationService: Saved theme to localStorage:', theme.id);
    } else {
      localStorage.removeItem('active-theme');
      console.log('GameificationService: Removed theme from localStorage');
    }
    
    this.saveState();
    console.log('GameificationService: Theme update complete');
  }
  
  public getTonesUsedToday(): Record<string, number> {
    // Convert the string array to a Record with counts
    const toneMap: Record<string, number> = {};
    this.state.tonesUsedToday.forEach(tone => {
      if (toneMap[tone]) {
        toneMap[tone]++;
      } else {
        toneMap[tone] = 1;
      }
    });
    return toneMap;
  }
  
  // Method to initialize the state with predefined values (used for initial setup)
  public initializeState(initialState: Partial<GameificationState>) {
    this.state = { ...this.state, ...initialState };
    this.saveState();
    console.log('Initialized gameification state:', this.state);
  }

  // Debug method to log the current state
  public debugState() {
    console.group('Gameification State Debug');
    console.log('XP:', this.state.xp);
    console.log('Level:', this.state.level);
    console.log('Streak:', this.state.streak);
    console.log('Last Rewrite Date:', this.state.lastRewriteDate);
    console.log('Last Streak Update Day:', this.state.lastStreakUpdateDay);
    console.log('Tones Used Today:', this.state.tonesUsedToday);
    console.log('Active Badge:', this.state.activeBadge);
    
    console.group('Unlockable Tones');
    this.state.unlockableTones.forEach(tone => {
      console.log(`${tone.name} (${tone.id}): ${tone.unlocked ? 'Unlocked' : 'Locked'} - Requirement: ${tone.unlockRequirement.type} ${tone.unlockRequirement.value}`);
    });
    console.groupEnd();
    
    console.group('Themes');
    this.state.themes.forEach(theme => {
      console.log(`${theme.name} (${theme.id}): ${theme.unlocked ? 'Unlocked' : 'Locked'} - Requirement: ${theme.unlockRequirement.type} ${theme.unlockRequirement.value}`);
    });
    console.groupEnd();
    
    console.group('Badges');
    this.state.toneMasterBadges.forEach(badge => {
      console.log(`${badge.name} (${badge.id}): ${badge.unlocked ? 'Unlocked' : 'Locked'} - Progress: ${badge.progress}/${badge.required} - Tone: ${badge.tone}`);
    });
    console.groupEnd();
    
    console.group('Daily Missions');
    this.state.dailyMissions.forEach(mission => {
      console.log(`${mission.title} (${mission.id}): ${mission.completed ? 'Completed' : 'In Progress'} - Progress: ${mission.progress}/${mission.goal} - Type: ${mission.type}`);
    });
    console.groupEnd();
    
    console.groupEnd();
    
    return {
      xp: this.state.xp,
      level: this.state.level,
      streak: this.state.streak,
      unlockableTones: this.state.unlockableTones.length,
      themes: this.state.themes.length,
      badges: this.state.toneMasterBadges.length,
      missions: this.state.dailyMissions.length
    };
  }
  
  // Method to fix potential mission issues
  public fixMissions() {
    console.log('Attempting to fix missions');
    
    // Check for missing mission types
    const missionTypes = ['use_tones', 'rewrite_words', 'rewrite_count', 'battle', 'custom_tone', 'feedback', 'checkin'];
    
    missionTypes.forEach(type => {
      const hasMission = this.state.dailyMissions.some(m => m.type === type);
      if (!hasMission) {
        console.warn(`Missing mission type: ${type}, adding default`);
        
        let newMission: DailyMission = {
          id: `${type}_mission`,
          title: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
          description: `Complete the ${type} mission`,
          type: type as any,
          goal: 1,
          progress: 0,
          completed: false,
          reward: { type: 'xp', value: 20 }
        };
        
        this.state.dailyMissions.push(newMission);
      }
    });
    
    // Reset any corrupted progress values
    this.state.dailyMissions.forEach(mission => {
      if (mission.progress < 0 || mission.progress > mission.goal) {
        console.warn(`Invalid mission progress for ${mission.id}: ${mission.progress}, resetting to 0`);
        mission.progress = 0;
        mission.completed = false;
      }
    });
    
    // Reset any corrupted badge progress values
    this.state.toneMasterBadges.forEach(badge => {
      if (badge.progress < 0 || badge.progress > badge.required) {
        console.warn(`Invalid badge progress for ${badge.id}: ${badge.progress}, resetting to 0`);
        badge.progress = 0;
        badge.unlocked = false;
      }
    });
    
    this.saveState();
    console.log('Mission fix completed');
  }
}

export const gameificationService = new GameificationService(); 