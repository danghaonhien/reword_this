import React, { useState, useEffect } from 'react'
import { CopyIcon, CheckIcon, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { useGameification } from '../hooks/useGameification'
import { getBattlePrompt } from '@/utils/promptUtils'
import { callOpenAIForBattle } from '@/services/apiService'
import { useUsageLimits } from '@/hooks/useUsageLimits'

// Define available tone pairs for battling
const TONE_PAIRS = [
  { a: { name: 'Friendly', description: 'Warm and approachable language' }, 
    b: { name: 'Gen Z', description: 'Modern, casual internet slang with emojis' } },
  { a: { name: 'Formal', description: 'Professional and structured communication' }, 
    b: { name: 'Creative', description: 'Imaginative and expressive writing' } },
  { a: { name: 'Clarity', description: 'Clear and concise communication' }, 
    b: { name: 'Executive', description: 'Authoritative and decisive communication' } },
  { a: { name: 'Friendly', description: 'Warm and approachable language' }, 
    b: { name: 'Formal', description: 'Professional and structured communication' } },
  { a: { name: 'Gen Z', description: 'Modern, casual internet slang with emojis' }, 
    b: { name: 'Executive', description: 'Authoritative and decisive communication' } }
]

interface RewriteBattleProps {
  originalText: string
  onRewriteAgain: () => void
}

const RewriteBattle: React.FC<RewriteBattleProps> = ({ originalText, onRewriteAgain }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [versionA, setVersionA] = useState('')
  const [versionB, setVersionB] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<'A' | 'B' | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const [tonePair, setTonePair] = useState(TONE_PAIRS[0])
  const [hasBattled, setHasBattled] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  
  // Use the gameification hooks to track battles and add XP
  const { trackBattle, addXP } = useGameification()
  // Use usage limits to track battle usage
  const usageLimits = useUsageLimits()
  
  // Check usage limits when the component mounts
  useEffect(() => {
    // When the battle component mounts, check if user has already used their daily limit
    if (!usageLimits.isPremium && usageLimits.battlesRemaining <= 0 && !hasBattled) {
      onRewriteAgain(); // This navigates back to home
    }
  }, [usageLimits.battlesRemaining, usageLimits.isPremium, hasBattled, onRewriteAgain]);
  
  // Listen for battle mission completion
  useEffect(() => {
    const handleBattleMissionCompleted = () => {
      console.log("Battle mission completed event received!");
      setShowSuccessToast(true);
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
    };
    
    window.addEventListener('battle_mission_completed', handleBattleMissionCompleted);
    
    return () => {
      window.removeEventListener('battle_mission_completed', handleBattleMissionCompleted);
    };
  }, []);

  const generateBattle = async () => {
    // Check if we're at the free tier limit for battles
    if (!usageLimits.isPremium && usageLimits.battlesRemaining <= 0) {
      return;
    }
    
    setIsLoading(true)
    
    try {
      // Select a random tone pair
      const randomPairIndex = Math.floor(Math.random() * TONE_PAIRS.length)
      const selectedTonePair = TONE_PAIRS[randomPairIndex]
      setTonePair(selectedTonePair)
      
      // Get the battle prompt
      const prompt = getBattlePrompt(originalText)
      
      // Call the OpenAI API
      const { versionA: responseA, versionB: responseB } = await callOpenAIForBattle(prompt)
      
      // Set the responses
      setVersionA(`${selectedTonePair.a.name} version: ${responseA}`)
      setVersionB(`${selectedTonePair.b.name} version: ${responseB}`)
      
      // Only after successful generation, track the battle usage
      usageLimits.trackBattle()
      setHasBattled(true)
      
      // Add XP just for generating a battle (encourages exploration)
      addXP(3)
    } catch (error) {
      console.error("Error generating battle:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, version: string) => {
    navigator.clipboard.writeText(text)
    setCopied(version)
    setTimeout(() => setCopied(null), 2000)
  }

  const selectVersion = (version: 'A' | 'B') => {
    setSelectedVersion(version)
    
    // Track battle in gameification system with explicit tone IDs
    if (version === 'A') {
      // Convert tone name to lowercase ID format for tracking
      const winnerTone = tonePair.a.name.toLowerCase().replace(/\s+/g, '_');
      const loserTone = tonePair.b.name.toLowerCase().replace(/\s+/g, '_');
      trackBattle(winnerTone, loserTone);
      
      // Add extra feedback to confirm the battle is tracked
      console.log(`Battle tracked: ${winnerTone} wins over ${loserTone}`);
    } else {
      const winnerTone = tonePair.b.name.toLowerCase().replace(/\s+/g, '_');
      const loserTone = tonePair.a.name.toLowerCase().replace(/\s+/g, '_');
      trackBattle(winnerTone, loserTone);
      
      // Add extra feedback to confirm the battle is tracked
      console.log(`Battle tracked: ${winnerTone} wins over ${loserTone}`);
    }
    
    // Add a small delay to show the selection before returning to input view
    setTimeout(() => {
      setSelectedVersion(null)
      // After selecting, return to input view
      onRewriteAgain()
    }, 1500) // Increased from 1000ms to 1500ms to give user more time to see selection
  }

  const toggleOriginalText = () => {
    setShowOriginal(!showOriginal)
  }

  return (
    <div className="mt-4 relative">
      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="absolute top-0 left-0 right-0 mx-auto w-max bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-4 py-2 rounded-md shadow-md z-50 animate-fade-in-down">
          🎉 Battle mission progress updated! Keep going!
        </div>
      )}
    
      {!versionA && !versionB && !isLoading ? (
        <div className="flex flex-col items-center">
          <div className="max-w-full w-full">
            <div className="flex flex-col gap-3 mb-6 text-center">
              <p className="text-sm text-foreground font-medium">Rewrite Battle</p>
              <p className="text-xs text-muted-foreground">
                The same text rewritten in two different tones.<br/>
                Choose the version you prefer to use it.
              </p>
              <div className="flex justify-center relative group">
                <button
                  onClick={generateBattle}
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                    !usageLimits.isPremium && usageLimits.battlesRemaining <= 0 
                      ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                      : 'bg-accent text-accent-foreground hover:bg-accent/90'
                  }`}
                  disabled={!usageLimits.isPremium && usageLimits.battlesRemaining <= 0}
                >
                  {!usageLimits.isPremium && usageLimits.battlesRemaining <= 0 ? 'Free Limit Reached' : (!usageLimits.isPremium ? `Start Rewrite Battle (${usageLimits.battlesRemaining}/3)` : 'Start Rewrite Battle')}
                </button>
                
                {/* Tooltip explaining battle limit */}
                <div className="absolute bottom-[calc(100%+10px)] left-1/2 transform -translate-x-1/2 w-64
                             bg-popover text-popover-foreground text-xs p-2 rounded shadow-md
                             opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-left z-[100]
                             before:content-[''] before:absolute before:bottom-[-4px] before:left-1/2 before:transform before:-translate-x-1/2
                             before:w-0 before:h-0 before:border-l-[6px] before:border-l-transparent
                             before:border-r-[6px] before:border-r-transparent before:border-t-[6px] before:border-t-popover">
                  <div className="text-xs font-medium">Rewrite Battle</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {!usageLimits.isPremium && usageLimits.battlesRemaining <= 0 
                      ? "You've reached your daily battle limit for the free tier. Come back tomorrow for another free battle, or upgrade to premium for unlimited access!"
                      : "Compare two different tones and choose your favorite. A fun way to explore different writing styles!"}
                  </div>
                  {!usageLimits.isPremium && usageLimits.battlesRemaining > 0 && (
                    <div className="text-xs mt-1.5 font-medium text-accent">
                      Free Tier: 3 battles per day
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="w-full mt-6">
              <button 
                onClick={toggleOriginalText}
                className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground py-2 px-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors"
              >
                <span>Original Text</span>
                {showOriginal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showOriginal && (
                <div className="p-3 mt-1 bg-muted/20 rounded-md border border-border max-h-48 overflow-y-auto custom-scrollbar">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{originalText}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3 sticky top-0 bg-background pt-1 pb-2 ">
            <h3 className="text-sm font-medium">Choose Your Favorite Version</h3>
            {/* <button 
              onClick={onRewriteAgain}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Try Again
            </button> */}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 pb-16">
              {/* Version A */}
              <div className={`p-3 border rounded-md ${selectedVersion === 'A' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-medium px-2 py-0.5 bg-secondary/20 rounded-full">{tonePair.a.name} Tone</span>
                    <p className="text-xs text-muted-foreground mt-1 ml-1">{tonePair.a.description}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(versionA, 'A')}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-sm"
                  >
                    {copied === 'A' ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-sm mt-2">{versionA}</p>
                <button
                  onClick={() => selectVersion('A')}
                  className="mt-3 w-full py-1 px-2 text-xs bg-secondary text-secondary-foreground rounded-md 
                            hover:bg-secondary/90 focus:outline-none focus:ring-1 focus:ring-secondary/50"
                >
                  {selectedVersion === 'A' ? 'Selected!' : `Select ${tonePair.a.name} Version`}
                </button>
              </div>

              {/* Version B */}
              <div className={`p-3 border rounded-md ${selectedVersion === 'B' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-medium px-2 py-0.5 bg-accent/20 rounded-full">{tonePair.b.name} Tone</span>
                    <p className="text-xs text-muted-foreground mt-1 ml-1">{tonePair.b.description}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(versionB, 'B')}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-sm"
                  >
                    {copied === 'B' ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-sm mt-2">{versionB}</p>
                <button
                  onClick={() => selectVersion('B')}
                  className="mt-3 w-full py-1 px-2 text-xs bg-accent text-accent-foreground rounded-md 
                            hover:bg-accent/90 focus:outline-none focus:ring-1 focus:ring-accent/50"
                >
                  {selectedVersion === 'B' ? 'Selected!' : `Select ${tonePair.b.name} Version`}
                </button>
              </div>

              {/* Collapsible Original Text */}
              <div className="mt-2">
                <button 
                  onClick={toggleOriginalText}
                  className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground py-2 px-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <span>Original Text</span>
                  {showOriginal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {showOriginal && (
                  <div className="p-3 mt-1 bg-muted/20 rounded-md border border-border max-h-48 overflow-y-auto custom-scrollbar">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{originalText}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default RewriteBattle 