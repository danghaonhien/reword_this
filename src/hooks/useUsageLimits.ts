import { useState, useEffect } from 'react';
import { isPremium } from '@/utils/env';

// Free tier limits from pricing docs
const FREE_TIER_LIMITS = {
  DAILY_REWRITES: 10,
  DAILY_SURPRISE_ME: 3,
  DAILY_BATTLES: 3
};

// Create storage keys to avoid duplication
const STORAGE_KEYS = {
  USAGE_LIMITS: 'reword-usage-limits',
  LAST_RESET_DATE: 'reword-last-reset-date',
  SESSION_USAGE: 'reword-session-usage',
  USER_DEVICE_ID: 'reword-device-id'
};

// Generate a device ID to track the user across sessions
const generateDeviceId = (): string => {
  const existingId = localStorage.getItem(STORAGE_KEYS.USER_DEVICE_ID);
  if (existingId) return existingId;
  
  // Create a unique ID
  const newId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_DEVICE_ID, newId);
    sessionStorage.setItem(STORAGE_KEYS.USER_DEVICE_ID, newId);
    
    // You could also set a cookie here for more persistence
  } catch (e) {
    console.error('Failed to save device ID:', e);
  }
  
  return newId;
};

export interface UsageLimits {
  rewritesUsed: number;
  surpriseMeUsed: number;
  battlesUsed: number;
  rewritesRemaining: number;
  surpriseMeRemaining: number;
  battlesRemaining: number;
  isPremium: boolean;
  trackRewrite: () => void;
  trackSurpriseMe: () => void;
  trackBattle: () => void;
  resetDailyCounters: () => void;
}

export function useUsageLimits(): UsageLimits {
  const [rewritesUsed, setRewritesUsed] = useState(0);
  const [surpriseMeUsed, setSurpriseMeUsed] = useState(0);
  const [battlesUsed, setBattlesUsed] = useState(0);
  const [lastResetDate, setLastResetDate] = useState<string>('');
  const [deviceId] = useState<string>(generateDeviceId);
  
  // Check if usage data was unexpectedly cleared but can be restored from session storage
  const checkUsageIntegrity = () => {
    const storedLastResetDate = localStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE);
    const today = new Date().toISOString().split('T')[0];
    
    // First try session storage
    const sessionUsage = sessionStorage.getItem(STORAGE_KEYS.SESSION_USAGE);
    
    if (!storedLastResetDate && sessionUsage) {
      // Restore from session storage if possible
      try {
        const { rewritesUsed, surpriseMeUsed, battlesUsed } = JSON.parse(sessionUsage);
        setRewritesUsed(rewritesUsed || 0);
        setSurpriseMeUsed(surpriseMeUsed || 0);
        setBattlesUsed(battlesUsed || 0);
        localStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, today);
        saveUsage(rewritesUsed, surpriseMeUsed, battlesUsed);
        return true;
      } catch (e) {
        console.error('Failed to restore from session storage:', e);
      }
    }
    
    return false;
  };
  
  // Handler for when the page is about to unload (user closes/refreshes)
  const handleBeforeUnload = () => {
    // Save current state to session storage to preserve during refresh
    const usageData = JSON.stringify({
      rewritesUsed,
      surpriseMeUsed,
      battlesUsed
    });
    
    try {
      sessionStorage.setItem(STORAGE_KEYS.SESSION_USAGE, usageData);
    } catch (e) {
      console.error('Failed to save session data on unload:', e);
    }
  };
  
  // Add event listeners to detect page visibility and unload events
  useEffect(() => {
    // When page becomes visible again, check for changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Re-check our usage data when the user returns to the tab
        const storedUsage = localStorage.getItem(STORAGE_KEYS.USAGE_LIMITS);
        if (storedUsage) {
          try {
            const { rewritesUsed: storedRewrites, surpriseMeUsed: storedSurprise, battlesUsed: storedBattles } = JSON.parse(storedUsage);
            
            // Only update if stored values are higher (can't decrease usage by switching tabs)
            if (storedRewrites > rewritesUsed) setRewritesUsed(storedRewrites);
            if (storedSurprise > surpriseMeUsed) setSurpriseMeUsed(storedSurprise);
            if (storedBattles > battlesUsed) setBattlesUsed(storedBattles);
          } catch (e) {
            console.error('Failed to parse usage data on visibility change:', e);
          }
        }
      }
    };
    
    // Register event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Load usage data on mount
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const storedUsage = localStorage.getItem(STORAGE_KEYS.USAGE_LIMITS);
    const storedLastResetDate = localStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE);
    
    // First check if data was unexpectedly cleared
    if (!storedUsage && !checkUsageIntegrity()) {
      // If we can't restore, proceed with normal logic
      if (storedLastResetDate !== today) {
        resetDailyCounters();
        return;
      }
    }
    
    // If it's a new day, reset counters
    if (storedLastResetDate !== today) {
      resetDailyCounters();
      return;
    }
    
    // Otherwise load existing values
    if (storedUsage) {
      try {
        const { rewritesUsed, surpriseMeUsed, battlesUsed } = JSON.parse(storedUsage);
        setRewritesUsed(rewritesUsed || 0);
        setSurpriseMeUsed(surpriseMeUsed || 0);
        setBattlesUsed(battlesUsed || 0);
        setLastResetDate(storedLastResetDate || today);
      } catch (error) {
        console.error('Error parsing usage limits:', error);
        resetDailyCounters();
      }
    }
    
    // Cleanup event listeners on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  // Save updated usage to localStorage and sessionStorage
  const saveUsage = (rewrites: number, surpriseMe: number, battles: number) => {
    try {
      const usageData = JSON.stringify({
        rewritesUsed: rewrites,
        surpriseMeUsed: surpriseMe,
        battlesUsed: battles
      });
      
      localStorage.setItem(STORAGE_KEYS.USAGE_LIMITS, usageData);
      sessionStorage.setItem(STORAGE_KEYS.SESSION_USAGE, usageData);
    } catch (error) {
      console.error('Error saving usage limits:', error);
    }
  };
  
  // Reset all daily counters
  const resetDailyCounters = () => {
    const today = new Date().toISOString().split('T')[0];
    setRewritesUsed(0);
    setSurpriseMeUsed(0);
    setBattlesUsed(0);
    setLastResetDate(today);
    
    saveUsage(0, 0, 0);
    localStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, today);
  };
  
  // Track a standard rewrite
  const trackRewrite = () => {
    const newCount = rewritesUsed + 1;
    setRewritesUsed(newCount);
    saveUsage(newCount, surpriseMeUsed, battlesUsed);
  };
  
  // Track a surprise me rewrite
  const trackSurpriseMe = () => {
    // Track both as a regular rewrite and as a surprise me
    const newRewriteCount = rewritesUsed + 1;
    const newSurpriseCount = surpriseMeUsed + 1;
    setRewritesUsed(newRewriteCount);
    setSurpriseMeUsed(newSurpriseCount);
    saveUsage(newRewriteCount, newSurpriseCount, battlesUsed);
  };
  
  // Track a battle
  const trackBattle = () => {
    const newCount = battlesUsed + 1;
    setBattlesUsed(newCount);
    saveUsage(rewritesUsed, surpriseMeUsed, newCount);
  };
  
  // Calculate remaining usage
  const rewritesRemaining = FREE_TIER_LIMITS.DAILY_REWRITES - rewritesUsed;
  const surpriseMeRemaining = FREE_TIER_LIMITS.DAILY_SURPRISE_ME - surpriseMeUsed;
  const battlesRemaining = FREE_TIER_LIMITS.DAILY_BATTLES - battlesUsed;
  
  return {
    rewritesUsed,
    surpriseMeUsed,
    battlesUsed,
    rewritesRemaining: Math.max(0, rewritesRemaining),
    surpriseMeRemaining: Math.max(0, surpriseMeRemaining),
    battlesRemaining: Math.max(0, battlesRemaining),
    isPremium: isPremium(),
    trackRewrite,
    trackSurpriseMe,
    trackBattle,
    resetDailyCounters
  };
} 