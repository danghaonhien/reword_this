import React, { useState, useEffect } from 'react'
import { useGameification } from '../hooks/useGameification'
import { Palette } from 'lucide-react'
import { Theme } from '../hooks/gameificationTypes'

// Updated component for more compact display in sidebar
const ThemeSwitcher: React.FC = () => {
  const { themes, activeTheme, setActiveTheme } = useGameification()
  const [isOpen, setIsOpen] = useState(false)
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<string[]>([])

  // Listen for reward unlock events to highlight newly unlocked themes
  useEffect(() => {
    const handleRewardUnlocked = (e: CustomEvent) => {
      if (e.detail?.type === 'theme') {
        setRecentlyUnlocked(prev => [...prev, e.detail.id])
        
        // Clear the "new" indicator after 5 seconds
        setTimeout(() => {
          setRecentlyUnlocked(prev => prev.filter(id => id !== e.detail.id))
        }, 5000)
      }
    }

    window.addEventListener('rewardUnlocked' as any, handleRewardUnlocked as any)
    return () => {
      window.removeEventListener('rewardUnlocked' as any, handleRewardUnlocked as any)
    }
  }, [])

  // Apply the selected theme to the document
  useEffect(() => {
    if (!activeTheme) {
      console.log('No active theme to apply');
      return;
    }
    
    console.log('Applying theme from effect:', activeTheme.id, activeTheme);
    
    // First remove any existing theme classes and dark class
    document.documentElement.classList.forEach(cls => {
      if (cls.startsWith('theme-') || cls === 'dark') {
        console.log('Removing class:', cls);
        document.documentElement.classList.remove(cls);
      }
    });
    
    // Then add the new theme class using the className property from the theme object
    const themeClass = activeTheme.className || `theme-${activeTheme.id}`;
    console.log('Adding theme class:', themeClass);
    document.documentElement.classList.add(themeClass);
    
    // Save the current theme to localStorage
    localStorage.setItem('activeTheme', activeTheme.id);
    console.log('Theme saved to localStorage:', activeTheme.id);
    
    // For debugging: log all current classes
    console.log('Current document classes after theme change:', 
      Array.from(document.documentElement.classList));
  }, [activeTheme]);

  // Load saved theme on component mount
  useEffect(() => {
    const savedThemeId = localStorage.getItem('activeTheme');
    console.log('Loading saved theme from localStorage:', savedThemeId);
    
    if (savedThemeId) {
      const savedTheme = themes.find(t => t.id === savedThemeId && t.unlocked);
      if (savedTheme) {
        console.log('Found saved theme, setting as active:', savedTheme);
        setActiveTheme(savedTheme);
      } else {
        console.log('Saved theme not found or not unlocked, using default');
        // If saved theme not found or not unlocked, use standard theme
        const standardTheme = themes.find(t => t.id === 'standard');
        if (standardTheme) setActiveTheme(standardTheme);
      }
    } else if (!activeTheme) {
      // If no saved theme and no active theme, use standard theme
      console.log('No saved theme, setting standard theme');
      const standardTheme = themes.find(t => t.id === 'standard');
      if (standardTheme) setActiveTheme(standardTheme);
    }
  }, [themes, setActiveTheme]);

  const handleThemeChange = (theme: Theme) => {
    console.log('Changing theme to:', theme.id, theme);
    
    // Update state through the hook - let the useEffect handle the DOM changes
    setActiveTheme(theme);
    
    // Close the dropdown
    setIsOpen(false);
  };

  // Get the available themes that are unlocked
  const unlockedThemes = themes.filter(theme => theme.unlocked)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-0 rounded-full w-full h-full justify-center items-center" 
       
      >
        <Palette className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-[calc(100%+2px)] top-0 w-48 rounded-md shadow-lg bg-popover border border-border z-50">
          <div className="py-1 px-2">
            <div className="text-xs font-medium text-muted-foreground mb-2 px-2 pt-2">
              Theme
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {unlockedThemes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme)}
                  className={`w-full text-left px-3 py-1.5 rounded-sm text-sm flex items-center justify-between
                    ${activeTheme?.id === theme.id ? 'bg-primary text-accent-foreground' : 'hover:bg-muted'}
                  `}
                >
                  <span className="capitalize">{theme.name}</span>
                  {recentlyUnlocked.includes(theme.id) && (
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-accent/20 text-accent animate-pulse">
                      New!
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Locked themes with requirements */}
            {themes.filter(theme => !theme.unlocked).length > 0 && (
              <>
                <div className="text-xs font-medium text-muted-foreground mt-3 mb-2 px-2 pt-1 border-t border-border">
                  Locked
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {themes.filter(theme => !theme.unlocked).map(theme => (
                    <div
                      key={theme.id}
                      className="w-full text-left px-3 py-1.5 rounded-sm text-xs flex items-center justify-between text-muted-foreground"
                    >
                      <span className="capitalize flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        {theme.name}
                      </span>
                      <span className="text-xxs whitespace-nowrap">
                        {theme.unlockRequirement.type === 'level' && `Lvl ${theme.unlockRequirement.value}`}
                        {theme.unlockRequirement.type === 'xp' && `${theme.unlockRequirement.value} XP`}
                        {theme.unlockRequirement.type === 'streak' && `${theme.unlockRequirement.value}d`}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default ThemeSwitcher 