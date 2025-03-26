import { Theme, UnlockableTone, ToneMasterBadge } from '../hooks/gameificationTypes'

// Get the next unlockable tone based on the user's progress
export const getNextUnlockableTone = (tones: UnlockableTone[], xp: number, streak: number): UnlockableTone | null => {
  // Filter to only get locked tones
  const lockedTones = tones.filter(tone => !tone.unlocked);
  
  if (lockedTones.length === 0) return null;
  
  // Sort by unlock requirement value to find the closest one to unlock
  return lockedTones.sort((a, b) => {
    // For XP requirements
    if (a.unlockRequirement.type === 'xp' && b.unlockRequirement.type === 'xp') {
      return a.unlockRequirement.value - b.unlockRequirement.value;
    }
    
    // For streak requirements
    if (a.unlockRequirement.type === 'streak' && b.unlockRequirement.type === 'streak') {
      return a.unlockRequirement.value - b.unlockRequirement.value;
    }
    
    // Prioritize streak requirements over XP if current streak is close
    if (a.unlockRequirement.type === 'streak' && streak > 0) {
      return -1;
    }
    
    if (b.unlockRequirement.type === 'streak' && streak > 0) {
      return 1;
    }
    
    // Default sort
    return a.unlockRequirement.value - b.unlockRequirement.value;
  })[0];
};

// Get the next unlockable theme based on the user's progress
export const getNextUnlockableTheme = (themes: Theme[], xp: number, level: number, streak: number): Theme | null => {
  // Filter to only get locked themes
  const lockedThemes = themes.filter(theme => !theme.unlocked);
  
  if (lockedThemes.length === 0) return null;
  
  // Sort by unlock requirement value to find the closest one to unlock
  return lockedThemes.sort((a, b) => {
    // For level requirements
    if (a.unlockRequirement.type === 'level' && b.unlockRequirement.type === 'level') {
      return a.unlockRequirement.value - b.unlockRequirement.value;
    }
    
    // For XP requirements
    if (a.unlockRequirement.type === 'xp' && b.unlockRequirement.type === 'xp') {
      return a.unlockRequirement.value - b.unlockRequirement.value;
    }
    
    // For streak requirements
    if (a.unlockRequirement.type === 'streak' && b.unlockRequirement.type === 'streak') {
      return a.unlockRequirement.value - b.unlockRequirement.value;
    }
    
    // Prioritize streak requirements over others if current streak is close
    if (a.unlockRequirement.type === 'streak' && streak > 0) {
      return -1;
    }
    
    if (b.unlockRequirement.type === 'streak' && streak > 0) {
      return 1;
    }
    
    // Default sort
    return a.unlockRequirement.value - b.unlockRequirement.value;
  })[0];
};

// Get the closest badge to being unlocked
export const getNextUnlockableBadge = (badges: ToneMasterBadge[]): ToneMasterBadge | null => {
  // Filter to only get locked badges
  const lockedBadges = badges.filter(badge => !badge.unlocked);
  
  if (lockedBadges.length === 0) return null;
  
  // Sort by progress percentage to find the one closest to completion
  return lockedBadges.sort((a, b) => {
    const aPercentage = a.progress / a.required;
    const bPercentage = b.progress / b.required;
    return bPercentage - aPercentage;
  })[0];
};

// Calculate progress percentage for a given requirement
export const calculateProgress = (current: number, required: number): number => {
  return Math.min(100, Math.max(0, (current / required) * 100));
};

// Function to get level title based on level
export const getLevelTitle = (level: number): string => {
  const titles = [
    "Word Novice",             // Level 1
    "Phrase Apprentice",       // Level 2
    "Sentence Crafter",        // Level 3
    "Expression Artisan",      // Level 4
    "Tone Virtuoso",           // Level 5
    "Wordsmith Wizard",        // Level 6
    "Lexical Alchemist",       // Level 7
    "Prose Mastermind",        // Level 8
    "Language Luminary",       // Level 9
    "Reword Royalty"           // Level 10+
  ];
  
  return level <= titles.length ? titles[level - 1] : "Reword Legend";
}; 