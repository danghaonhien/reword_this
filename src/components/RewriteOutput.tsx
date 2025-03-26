import React, { useState, useEffect } from 'react'
import { Copy, ArrowLeft, RefreshCw, Check } from 'lucide-react'

interface RewriteOutputProps {
  originalText: string
  rewrittenText: string
  tone: string
  onRewriteAgain: () => void
}

const RewriteOutput: React.FC<RewriteOutputProps> = ({
  originalText,
  rewrittenText,
  tone,
  onRewriteAgain,
}) => {
  const [copied, setCopied] = useState(false);

  // Save to history when a new rewrite is shown
  useEffect(() => {
    if (rewrittenText && originalText) {
      const historyItem = {
        id: Date.now().toString(),
        originalText,
        rewrittenText,
        tone,
        timestamp: Date.now()
      };

      // Get existing history
      const existingHistory = localStorage.getItem('reword-history');
      let history = [];
      
      if (existingHistory) {
        try {
          history = JSON.parse(existingHistory);
        } catch (error) {
          console.error('Error parsing history:', error);
        }
      }
      
      // Add new item to the beginning of the array
      history.unshift(historyItem);
      
      // Keep only the last 10 items
      if (history.length > 10) {
        history = history.slice(0, 10);
      }
      
      // Save back to localStorage
      localStorage.setItem('reword-history', JSON.stringify(history));
      
      // Dispatch a custom event to notify components that history has been updated
      window.dispatchEvent(new Event('rewordHistoryUpdated'));
    }
  }, [rewrittenText, originalText, tone]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rewrittenText)
      .then(() => {
        setCopied(true);
        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium capitalize flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-accent"></span>
          {tone === 'surprise' ? 'Surprise tone' : `${tone} tone`}
        </h3>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors"
        >
          {copied ? 
            <><Check className="w-3 h-3" /> Copied</> : 
            <><Copy className="w-3 h-3" /> Copy</>
          }
        </button>
      </div>

      <div className="bg-card border border-border rounded-md p-3 mb-4 text-sm overflow-auto max-h-[200px] shadow-sm">
        {rewrittenText}
      </div>

      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-secondary/60"></span>
        Original text:
      </div>
      
      <div className="bg-muted/30 rounded-md p-3 mb-4 text-xs overflow-auto max-h-[100px] text-muted-foreground border border-border/50">
        {originalText}
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={onRewriteAgain}
          className="flex items-center justify-center gap-1 py-2 px-3 
                   bg-secondary/20 text-secondary hover:bg-secondary/30 
                   transition-colors border border-border/60 rounded-md flex-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Try Different Tone
        </button>
        <button
          onClick={onRewriteAgain}
          className="flex items-center justify-center gap-1 py-2 px-3 
                   bg-accent text-accent-foreground rounded-md hover:bg-accent/90 
                   transition-colors flex-1"
        >
          <RefreshCw className="w-4 h-4" />
          Rewrite Again
        </button>
      </div>
    </div>
  )
}

export default RewriteOutput 