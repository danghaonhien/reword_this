import React from 'react'
import { Flame, Trophy, Info } from 'lucide-react'
import { getLevelTitle } from '@/utils/gameificationUtils'

interface XPDisplayProps {
  xp: number
  streak: number
}

// XP goals data
const xpGoals = [
  { id: 'tones', label: 'Try all tones', max: 4, current: 1, xp: 10 },
  { id: 'streak', label: 'Daily streak', max: 7, current: 1, xp: 5 },
  { id: 'rewrites', label: 'Total rewrites', max: 10, current: 3, xp: 20 },
  { id: 'surprise', label: 'Use Surprise Me', max: 5, current: 1, xp: 15 }
]

const XPDisplay: React.FC<XPDisplayProps> = ({ xp, streak }) => {
  // Calculate level based on XP
  const level = Math.floor(xp / 100) + 1
  
  // Calculate progress to next level
  const progressPercent = (xp % 100)
  
  // Get the fun level title
  const levelTitle = getLevelTitle(level)
  
  return (
    <div className="mb-4 bg-card border border-border rounded-md p-3 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-primary" />
          <div>
            <span className="text-sm font-medium">{levelTitle}</span>
            <span className="text-xs text-muted-foreground ml-1.5">Lvl {level}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">{streak} day streak</span>
          <div className="tooltip">
            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help ml-0.5" />
            <div className="tooltip-content">
              <div className="font-medium mb-1 text-xs">XP Goals:</div>
              <div className="space-y-2">
                {xpGoals.map(goal => (
                  <div key={goal.id} className="flex flex-col">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span>{goal.label}</span>
                      <span className="text-muted-foreground">
                        {goal.current}/{goal.max} · {goal.xp} XP
                      </span>
                    </div>
                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="bg-accent h-full rounded-full" 
                        style={{ width: `${(goal.current/goal.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-full rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
        <span>{xp} XP</span>
        <span>{100 - (xp % 100)} XP to next level</span>
      </div>
    </div>
  )
}

export default XPDisplay 