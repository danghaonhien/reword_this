import React, { useState } from 'react'
import { Settings, X } from 'lucide-react'
import ThemeSwitcher from './ThemeSwitcher'


const SettingsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-muted/40 transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-border sticky top-0 bg-card">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-muted/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              <ThemeSwitcher />
              <div className="border-t border-border pt-6">
                {/* <BadgeSelector /> */}
              </div>
              
              {/* Add other settings sections here */}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SettingsPanel 