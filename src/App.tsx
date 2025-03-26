import { useState, useEffect } from 'react'
import PopupView from '@/pages/PopupView'

function App() {
  const [selectedText, setSelectedText] = useState<string>('')

  useEffect(() => {
    // Check if we're in a Chrome extension context
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      // Listen for messages from the background script
      chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'TEXT_SELECTED') {
          setSelectedText(message.text)
        }
      })
    }

    // For development outside of extension context
    const urlParams = new URLSearchParams(window.location.search)
    const textParam = urlParams.get('text')
    if (textParam) {
      setSelectedText(decodeURIComponent(textParam))
    }
  }, [])

  return (
    <div className="w-[420px] min-h-[520px] p-0 bg-card text-foreground border-l fixed top-0 right-0 z-50 overflow-visible">
      <PopupView selectedText={selectedText} />
    </div>
  )
}

export default App 