import { useState } from 'react'
import { getPromptForTone } from '@/utils/promptUtils'
import { callOpenAI } from '@/services/apiService'

type RewriteResult = {
  rewrite: (text: string, tone: string) => Promise<string>
  isLoading: boolean
  rewrittenText: string
  error: string | null
}

export const useRewrite = (): RewriteResult => {
  const [isLoading, setIsLoading] = useState(false)
  const [rewrittenText, setRewrittenText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const rewrite = async (text: string, tone: string): Promise<string> => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Get the appropriate prompt for the selected tone
      const prompt = getPromptForTone(tone, text)
      
      // Call OpenAI API
      const response = await callOpenAI(prompt)
      
      setRewrittenText(response)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return ''
    } finally {
      setIsLoading(false)
    }
  }

  return {
    rewrite,
    isLoading,
    rewrittenText,
    error
  }
} 