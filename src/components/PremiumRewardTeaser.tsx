import React from 'react'
import { Lock } from 'lucide-react'

interface PremiumRewardTeaserProps {
  name: string,
  description: string,
  type: 'tone' | 'theme' | 'badge'
}

const PremiumRewardTeaser: React.FC<PremiumRewardTeaserProps> = ({
  name,
  description,
  type
}) => {
  return (
    <div className="border border-dashed border-primary/40 bg-primary/5 rounded-md p-3 relative">
      <div className="flex items-center gap-2 mb-2">
        <Lock className="w-4 h-4 text-primary" />
        <div className="font-medium flex items-center">
          {name} 
          <span className="ml-2 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
            Premium
          </span>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
      
      <div className="text-center">
        <button 
          className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          onClick={() => {
            // TODO: Implement premium upgrade flow
            alert('Premium upgrade coming soon!');
          }}
        >
          Upgrade to Premium
        </button>
      </div>
      
      {/* Badge indicating the reward type */}
      <div className="absolute top-2 right-2 text-[10px] text-muted-foreground capitalize">
        {type}
      </div>
    </div>
  )
}

export default PremiumRewardTeaser 