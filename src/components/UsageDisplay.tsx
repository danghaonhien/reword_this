import React from 'react';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { Battery, Sparkles, Swords } from 'lucide-react';

export default function UsageDisplay() {
  const { 
    rewritesRemaining, 
    surpriseMeRemaining, 
    battlesRemaining,
    isPremium
  } = useUsageLimits();

  // If premium, no need to show usage limits
  if (isPremium) {
    return (
      <div className="px-2 py-2 text-primary text-xs flex items-center justify-center">
        <Sparkles className="w-3 h-3 mr-1" />
        <span>Premium</span>
      </div>
    );
  }

  return (
    <div className="text-xs w-full">
      <div className="text-center text-muted-foreground mb-1 mt-1 text-[9px] font-medium">
        FREE TIER
      </div>
      
      <div className="space-y-1 px-1.5">
        {/* Rewrites remaining */}
        <div className="flex items-center justify-between gap-1 text-[10px]">
          <div className="flex items-center">
            <Battery className="w-2.5 h-2.5 mr-1" />
            <span className="truncate">Rewrites</span>
          </div>
          <span className={`font-medium ${rewritesRemaining <= 2 ? 'text-amber-500' : ''}`}>
            {rewritesRemaining}/10
          </span>
        </div>
        
        {/* Surprise Me remaining */}
        <div className="flex items-center justify-between gap-1 text-[10px]">
          <div className="flex items-center">
            <Sparkles className="w-2.5 h-2.5 mr-1" />
            <span className="truncate">Surprise Me</span>
          </div>
          <span className={`font-medium ${surpriseMeRemaining === 0 ? 'text-amber-500' : ''}`}>
            {surpriseMeRemaining}/1
          </span>
        </div>
        
        {/* Battles remaining */}
        <div className="flex items-center justify-between gap-1 text-[10px]">
          <div className="flex items-center">
            <Swords className="w-2.5 h-2.5 mr-1" />
            <span className="truncate">Battles</span>
          </div>
          <span className={`font-medium ${battlesRemaining === 0 ? 'text-amber-500' : ''}`}>
            {battlesRemaining}/1
          </span>
        </div>
      </div>
    </div>
  );
} 