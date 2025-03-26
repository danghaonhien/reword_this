import { API_ENDPOINT, DEFAULT_MODEL, MAX_TOKENS, isDev } from '@/utils/env';

/**
 * Service for making secure API calls to our backend service
 * The backend will handle API key security and forward requests to OpenAI
 */
export const callOpenAI = async (prompt: string): Promise<string> => {
  try {
    // Log the request in development for debugging
    if (isDev()) {
      console.log('Making API request with prompt (first 50 chars):', prompt.substring(0, 50) + '...');
    }

    const response = await fetch(`${API_ENDPOINT}/api/rewrite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        model: DEFAULT_MODEL,
        maxTokens: MAX_TOKENS
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error response:', errorData);
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.result || '';
  } catch (error) {
    console.error('API error:', error);
    throw new Error(error instanceof Error ? error.message : 'Error calling API');
  }
};

/**
 * Service for battle rewrites feature
 */
export const callOpenAIForBattle = async (prompt: string): Promise<{versionA: string, versionB: string}> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/api/battle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        model: DEFAULT_MODEL,
        maxTokens: MAX_TOKENS
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      versionA: data.versionA || 'Failed to generate Version A. Please try again.',
      versionB: data.versionB || 'Failed to generate Version B. Please try again.'
    };
  } catch (error) {
    console.error('Battle rewrites API error:', error);
    throw new Error(error instanceof Error ? error.message : 'Error generating battle rewrites');
  }
}; 