/**
 * Answer Detection Utilities
 * 
 * Detect when AI confirms a correct answer or identifies an incorrect one
 * Uses explicit markers from the system prompt for reliability
 */

/**
 * Detect if AI's response indicates a correct answer
 * Looks for [CORRECT] marker first, then falls back to pattern matching
 */
export function detectCorrectAnswer(aiResponse: string): boolean {
  // Primary detection: Look for [CORRECT] marker
  if (aiResponse.includes('[CORRECT]')) {
    console.log('✅ [Detection] Found [CORRECT] marker')
    return true
  }
  
  // Fallback: Pattern matching for cases where marker isn't used
  const correctPatterns = [
    /that'?s?\s+(absolutely\s+)?correct/i,
    /you'?re\s+(absolutely\s+)?right/i,
    /exactly!?\s+right/i,
    /perfect!?/i,
    /well\s+done/i,
    /great\s+(job|work)/i,
    /excellent!?/i,
    /yes!?\s+(that'?s\s+)?right/i,
    /spot\s+on/i,
    /you\s+got\s+it/i,
    /you'?ve\s+solved\s+it/i,
    /that'?s\s+the\s+answer/i,
    /nicely\s+done/i,
    /exactly\s+right/i,
    /great\s+job/i,
    /you\s+did\s+it/i,
    /you\s+solved\s+it/i,
    /congratulations/i,
  ]

  const matches = correctPatterns.some(pattern => {
    const isMatch = pattern.test(aiResponse)
    if (isMatch) {
      console.log('✅ [Detection] Matched fallback pattern:', pattern)
    }
    return isMatch
  })
  
  if (!matches) {
    console.log('❌ [Detection] No correct answer indicator found in:', aiResponse.substring(0, 100))
  }
  
  return matches
}

/**
 * Detect if AI's response indicates an incorrect answer
 * Looks for [INCORRECT] marker first, then falls back to pattern matching
 */
export function detectIncorrectAnswer(aiResponse: string): boolean {
  // Primary detection: Look for [INCORRECT] marker
  if (aiResponse.includes('[INCORRECT]')) {
    console.log('❌ [Detection] Found [INCORRECT] marker')
    return true
  }
  
  // Fallback: Pattern matching
  const incorrectPatterns = [
    /not\s+(quite|exactly)/i,
    /that'?s\s+not\s+(correct|right)/i,
    /incorrect/i,
    /let'?s\s+try\s+(again|differently)/i,
    /think\s+about\s+it\s+differently/i,
    /close,?\s+but/i,
    /almost,?\s+but/i,
    /hmm,?\s+not\s+quite/i,
  ]

  const matches = incorrectPatterns.some(pattern => pattern.test(aiResponse))
  
  if (matches) {
    console.log('❌ [Detection] Matched fallback incorrect pattern')
  }
  
  return matches
}

/**
 * Detect if AI is asking a question (Socratic method)
 */
export function isAskingQuestion(aiResponse: string): boolean {
  // If response ends with ? or contains question words
  return (
    aiResponse.trim().endsWith('?') ||
    /^(what|where|when|why|how|can\s+you|could\s+you|would\s+you)/i.test(aiResponse.trim())
  )
}

/**
 * Extract the hint or question from AI response
 */
export function extractHint(aiResponse: string): string | null {
  // If it's asking a question, treat it as a hint
  if (isAskingQuestion(aiResponse)) {
    return aiResponse
  }
  return null
}

/**
 * Remove validation markers from AI response for display
 * Strips [CORRECT] and [INCORRECT] markers
 */
export function stripValidationMarkers(aiResponse: string): string {
  return aiResponse
    .replace(/\[CORRECT\]\s*/gi, '')
    .replace(/\[INCORRECT\]\s*/gi, '')
    .trim()
}

