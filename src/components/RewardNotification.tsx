import React, { useState, useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'

interface NotificationItem {
  id: string;
  type: 'tone' | 'theme' | 'badge';
  name: string;
  timestamp: number;
}

const RewardNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  
  useEffect(() => {
    const handleRewardUnlocked = (e: CustomEvent) => {
      // Handle unified reward event
      if (e.detail) {
        const unlockedDetails = e.detail.unlockedDetails || {}
        
        // Process tones
        if (unlockedDetails.tones && unlockedDetails.tones.length > 0) {
          unlockedDetails.tones.forEach((id: string) => {
            // Find the tone details from gameification state
            // For simplicity, just use the ID as name
            const newNotification: NotificationItem = {
              id: `tone-${id}-${Date.now()}`,
              type: 'tone',
              name: id, // Ideally we'd get the proper name
              timestamp: Date.now()
            }
            
            setNotifications(prev => [...prev, newNotification])
          })
        }
        
        // Process themes
        if (unlockedDetails.themes && unlockedDetails.themes.length > 0) {
          unlockedDetails.themes.forEach((id: string) => {
            const newNotification: NotificationItem = {
              id: `theme-${id}-${Date.now()}`,
              type: 'theme',
              name: id, // Ideally we'd get the proper name
              timestamp: Date.now()
            }
            
            setNotifications(prev => [...prev, newNotification])
          })
        }
        
        // Process badges
        if (unlockedDetails.badges && unlockedDetails.badges.length > 0) {
          unlockedDetails.badges.forEach((id: string) => {
            const newNotification: NotificationItem = {
              id: `badge-${id}-${Date.now()}`,
              type: 'badge',
              name: id, // Ideally we'd get the proper name
              timestamp: Date.now()
            }
            
            setNotifications(prev => [...prev, newNotification])
          })
        }
      }
    }

    // Listen for the unified reward event
    window.addEventListener('rewardUnlocked' as any, handleRewardUnlocked as any)
    
    // Auto-remove notifications after 5 seconds
    const timer = setInterval(() => {
      const now = Date.now()
      setNotifications(prev => 
        prev.filter(notification => now - notification.timestamp < 5000)
      )
    }, 1000)
    
    return () => {
      window.removeEventListener('rewardUnlocked' as any, handleRewardUnlocked as any)
      clearInterval(timer)
    }
  }, [])
  
  // If no notifications, don't render anything
  if (notifications.length === 0) return null
  
  return (
    <div className="fixed top-4 right-14 z-50 flex flex-col gap-2">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className="bg-card border border-border rounded-md shadow-md p-3 animate-slideInUp flex items-center max-w-xs"
        >
          <Sparkles className="w-5 h-5 text-accent mr-2 animate-pulse" />
          <div className="flex-grow">
            <div className="text-sm font-semibold">New {notification.type} Unlocked!</div>
            <div className="text-xs text-muted-foreground capitalize">{notification.name.replace(/_/g, ' ')}</div>
          </div>
          <button 
            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            className="p-1 hover:bg-muted rounded-sm"
          >
            {/* <X className="w-4 h-4 text-muted-foreground" /> */}
          </button>
        </div>
      ))}
    </div>
  )
}

export default RewardNotification 