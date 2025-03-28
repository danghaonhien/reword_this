/**
 * Generates appropriate prompts for different tones
 */
export const getPromptForTone = (tone: string, text: string): string => {
  switch (tone) {
    case 'clarity':
      return `Reword the following text to improve clarity and simplicity. Eliminate jargon, reduce sentence complexity, and make it more direct and readable.

Text:
"${text}"`;
    
    case 'friendly':
      return `Reword the following text to sound warm, friendly, and conversational — like a helpful colleague or friend. Use inclusive and positive language, and avoid formal or robotic phrasing.

Text:
"${text}"`;
    
    case 'formal':
      return `Reword the following text to sound professional, formal, and appropriate for corporate or academic settings. Avoid contractions and casual language. Use polished, respectful tone throughout.

Text:
"${text}"`;
    
    case 'gen_z':
      return `Reword the following text to sound like Gen Z language. Use modern internet slang, casual tone, abbreviations, and appropriate emojis. Include trendy expressions like "no cap", "slay", "based", "lowkey/highkey", "vibe check", "I'm dead", "main character energy", or "living rent free". Use the occasional all-lowercase style and add relevant hashtags if appropriate. Make it sound authentic to how Gen Z communicates online but still understandable.

Text:
"${text}"`;
    
    case 'executive':
      return `Reword the following text in a confident, executive-level tone. Be concise, strategic, and clear. Use assertive language appropriate for boardroom, leadership communication, or investor updates.

Text:
"${text}"`;
    
    case 'creative':
      return `Reword the following text with a creative, playful, or poetic touch. Use rich language, rhythm, metaphor, or wit to make it stand out. Keep the meaning, but let the style shine.

Text:
"${text}"`;
    
    case 'surprise':
      // For surprise, randomly select one of our 6 available tones
      const availableTones = ['clarity', 'friendly', 'formal', 'gen_z', 'executive', 'creative'];
      const randomTone = availableTones[Math.floor(Math.random() * availableTones.length)];
      return getPromptForTone(randomTone, text);
    
    default:
      // Generic prompt for any other tone
      return `Reword the following text to sound more ${tone}. Keep the original meaning, improve the flow, and make it natural for human readers.

Text:
"${text}"`;
  }
};

/**
 * Generates prompts for the "Battle of the Rewrites" feature
 */
export const getBattlePrompt = (text: string): string => {
  return `Generate two distinct rewrites of the following text with slightly different structure or tone. Keep core meaning the same. Return them as: Version A and Version B.

Text:
"${text}"`;
};

/**
 * Generates prompts for the custom tone builder feature
 */
export const getCustomTonePrompt = (referenceText: string, textToRewrite: string): string => {
  return `Use the writing style from the reference sample below as a tone guide. Reword the second text to match this style, keeping the meaning intact.

Reference Style:
"${referenceText}"

Text to Reword:
"${textToRewrite}"`;
}; 