import { OPENAI_API_KEY, API_ENDPOINT, DEFAULT_MODEL, MAX_TOKENS, isDev, isValidApiKey } from '@/utils/env';

/**
 * Service for making secure API calls to OpenAI
 */
export const callOpenAI = async (prompt: string): Promise<string> => {
  try {
    // Validate API key
    if (!isValidApiKey()) {
      throw new Error('OpenAI API key is not set or is invalid. Please check your API key in the settings.');
    }

    // Log the request in development for debugging
    if (isDev()) {
      console.log('Making API request with prompt (first 50 chars):', prompt.substring(0, 50) + '...');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error response:', errorData);
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(error instanceof Error ? error.message : 'Error calling OpenAI API');
  }
};

/**
 * Service for battle rewrites feature
 */
export const callOpenAIForBattle = async (prompt: string): Promise<{versionA: string, versionB: string}> => {
  try {
    const response = await callOpenAI(prompt);
    
    // Parse the response to extract Version A and Version B
    const versionAMatch = response.match(/Version A[:\s]*(.+?)(?=Version B|$)/is);
    const versionBMatch = response.match(/Version B[:\s]*(.+?)$/is);
    
    if (!versionAMatch || !versionBMatch) {
      console.warn('Battle response parsing issue:', response);
    }
    
    return {
      versionA: versionAMatch?.[1]?.trim() || 'Failed to generate Version A. Please try again.',
      versionB: versionBMatch?.[1]?.trim() || 'Failed to generate Version B. Please try again.'
    };
  } catch (error) {
    console.error('Battle rewrites API error:', error);
    throw new Error(error instanceof Error ? error.message : 'Error generating battle rewrites');
  }
}; 