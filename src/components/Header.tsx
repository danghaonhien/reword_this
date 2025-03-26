import React from 'react'
import { Wand2 } from 'lucide-react'
import RewordHistory from './RewordHistory'
import ThemeSwitcher from './ThemeSwitcher'

interface HeaderProps {
  onSelectHistoryItem?: (text: string) => void
}

const Header: React.FC<HeaderProps> = ({ onSelectHistoryItem }) => {
  return (
    <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
      <div className="flex items-center gap-2">
        <div className="bg-accent/10 p-1.5 rounded-md">
          <Wand2 className="w-5 h-5 text-accent" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
          Reword This
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs bg-primary/10 px-2 py-1 rounded-full text-primary">
          v1.0.0
        </div>
        <RewordHistory onSelectHistoryItem={onSelectHistoryItem} />
        <ThemeSwitcher />
      </div>
    </div>
  )
}

export default Header 