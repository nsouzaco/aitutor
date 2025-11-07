/**
 * Answer Detection Utilities
 * 
 * Detect when AI confirms a correct answer or identifies an incorrect one
 * Uses explicit markers from the system prompt for reliability
 */

/**
 * Detect if AI's response indicates a correct answer
 * ONLY looks for [CORRECT] marker - no fallback patterns
 * This prevents false positives from intermediate step encouragement
 */
export function detectCorrectAnswer(aiResponse: string): boolean {
  // Only trust the explicit [CORRECT] marker
  if (aiResponse.includes('[CORRECT]')) {
    console.log('✅ [Detection] Found [CORRECT] marker')
    return true
  }
  
  console.log('⏸️ [Detection] No [CORRECT] marker found - treating as intermediate step')
  return false
}

/**
 * Detect if AI's response indicates an incorrect answer
 * ONLY looks for [INCORRECT] marker - no fallback patterns
 * This prevents false positives from Socratic questioning
 */
export function detectIncorrectAnswer(aiResponse: string): boolean {
  // Only trust the explicit [INCORRECT] marker
  if (aiResponse.includes('[INCORRECT]')) {
    console.log('❌ [Detection] Found [INCORRECT] marker')
    return true
  }
  
  console.log('⏸️ [Detection] No [INCORRECT] marker found - treating as intermediate step')
  return false
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

