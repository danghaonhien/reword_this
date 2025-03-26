import React, { useState, useEffect } from 'react'
import { History, X, Copy, Clock, ChevronDown } from 'lucide-react'

// Type for history items
interface HistoryItem {
  id: string
  originalText: string
  rewrittenText: string
  tone: string
  timestamp: number
}

interface RewordHistoryProps {
  onSelectHistoryItem?: (text: string) => void
  hideLabel?: boolean
  fullPage?: boolean
  showLimited?: boolean
}

const RewordHistory: React.FC<RewordHistoryProps> = ({ 
  onSelectHistoryItem, 
  hideLabel = false,
  fullPage = false,
  showLimited = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  // Function to load history from localStorage
  const loadHistory = () => {
    const storedHistory = localStorage.getItem('reword-history')
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory) as HistoryItem[]
        setHistory(parsedHistory)
      } catch (error) {
        console.error('Error parsing history:', error)
      }
    }
  }

  // Load history on mount
  useEffect(() => {
    loadHistory()
  }, [])

  // Refresh history whenever the storage event is triggered
  useEffect(() => {
    // Function to handle storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'reword-history') {
        loadHistory()
      }
    }

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange)
    
    // Also add a custom event listener for local updates
    window.addEventListener('rewordHistoryUpdated', loadHistory)

    // Check every time popup is opened
    if (isOpen || fullPage) {
      loadHistory()
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('rewordHistoryUpdated', loadHistory)
    }
  }, [isOpen, fullPage])

  const toggleHistory = () => {
    if (!fullPage) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        // Refresh history when opening the panel
        loadHistory()
      }
    }
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(id)
        setTimeout(() => setCopied(null), 2000)
      })
      .catch(err => {
        console.error('Failed to copy text:', err)
      })
  }

  const selectHistoryItem = (text: string) => {
    if (onSelectHistoryItem) {
      onSelectHistoryItem(text)
      if (!fullPage) {
        setIsOpen(false)
      }
    }
  }

  // Get the items to display
  const getDisplayItems = () => {
    if (!showLimited || showAll) {
      return history;
    }
    return history.slice(0, 3);
  }

  const displayItems = getDisplayItems();
  const hasMoreItems = showLimited && !showAll && history.length > 3;

  // If hideLabel is true, just return the icon
  if (hideLabel) {
    return <History className="w-4 h-4" onClick={toggleHistory} />
  }

  // For fullPage view
  if (fullPage) {
    return (
      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-md">
            No history yet. Start rewriting to build history!
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayItems.map((item) => (
                <div key={item.id} className="border border-border rounded-md p-2 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="capitalize font-medium text-xs">{item.tone} tone</span>
                    <span className="text-xxs text-muted-foreground">{formatDate(item.timestamp)}</span>
                  </div>
                  
                  <div className="bg-muted/30 p-1.5 rounded-sm mb-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => selectHistoryItem(item.rewrittenText)}>
                    {item.rewrittenText.length > 80 
                      ? `${item.rewrittenText.substring(0, 80)}...` 
                      : item.rewrittenText
                    }
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xxs text-muted-foreground line-clamp-1">
                      {item.originalText.length > 40 
                        ? `${item.originalText.substring(0, 40)}...` 
                        : item.originalText
                      }
                    </span>
                    <button
                      onClick={() => handleCopy(item.rewrittenText, item.id)}
                      className="p-1 rounded-full hover:bg-secondary/10"
                    >
                      {copied === item.id ? (
                        <span className="text-xxs text-secondary">Copied!</span>
                      ) : (
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {hasMoreItems && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full py-2 text-xs flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                Show more
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={toggleHistory}
        className="p-1.5 rounded-full bg-secondary/10 hover:bg-secondary/20 transition-colors"
        aria-label="View reword history"
      >
        <History className="w-3.5 h-3.5 text-secondary" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-md shadow-lg z-20">
          <div className="flex items-center justify-between p-2 border-b border-border">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Recent Rewordings
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-muted/40 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto p-2 custom-scrollbar">
            {history.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                No history yet. Start rewriting to build history!
              </div>
            ) : (
              <div className="space-y-3">
                {displayItems.map((item) => (
                  <div key={item.id} className="border border-border rounded-md p-2 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="capitalize font-medium text-xs">{item.tone} tone</span>
                      <span className="text-xxs text-muted-foreground">{formatDate(item.timestamp)}</span>
                    </div>
                    
                    <div className="bg-muted/30 p-1.5 rounded-sm mb-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => selectHistoryItem(item.rewrittenText)}>
                      {item.rewrittenText.length > 80 
                        ? `${item.rewrittenText.substring(0, 80)}...` 
                        : item.rewrittenText
                      }
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xxs text-muted-foreground line-clamp-1">
                        {item.originalText.length > 40 
                          ? `${item.originalText.substring(0, 40)}...` 
                          : item.originalText
                        }
                      </span>
                      <button
                        onClick={() => handleCopy(item.rewrittenText, item.id)}
                        className="p-1 rounded-full hover:bg-secondary/10"
                      >
                        {copied === item.id ? (
                          <span className="text-xxs text-secondary">Copied!</span>
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {hasMoreItems && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="w-full py-2 text-xs flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    Show more
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RewordHistory 