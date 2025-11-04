/**
 * XP Calculation Engine
 * 
 * Calculates XP earned per attempt with multipliers for:
 * - Time spent (penalize rushing, reward optimal pace)
 * - Hints used (penalize excessive hints)
 * - Attempt number (bonus for first-try success)
 * - Maintenance review (reduced XP for already-mastered topics)
 * 
 * Goal: Calibrate learning pace and discourage rushing/guessing
 */

import { XPCalculationInput, XPCalculationResult, XP_CONSTANTS } from '../types/xp'

/**
 * Calculate XP earned for an attempt
 * Returns detailed breakdown for transparency
 */
export function calculateXP(input: XPCalculationInput): XPCalculationResult {
  const {
    subtopicDifficulty,
    isCorrect,
    timeSpent,
    hintsUsed,
    attemptNumber,
    isAlreadyMastered,
  } = input

  // Base XP scales with difficulty
  const baseXP = subtopicDifficulty * XP_CONSTANTS.BASE_XP_PER_DIFFICULTY

  // If incorrect, only award 30% of base XP
  if (!isCorrect) {
    const totalXP = Math.round(baseXP * XP_CONSTANTS.INCORRECT_MULTIPLIER)
    return {
      baseXP,
      timeMultiplier: 1.0,
      hintMultiplier: 1.0,
      attemptMultiplier: 1.0,
      maintenanceMultiplier: 1.0,
      totalXP,
      breakdown: [
        { label: 'Base XP', value: baseXP },
        { label: 'Incorrect Answer Penalty', value: '×0.3' },
        { label: 'Total XP', value: totalXP },
      ],
    }
  }

  // ========== CORRECT ANSWER - Apply multipliers ==========

  // 1. Time Multiplier
  const expectedTime = subtopicDifficulty * XP_CONSTANTS.EXPECTED_SECONDS_PER_DIFFICULTY
  const timeRatio = timeSpent / expectedTime
  
  let timeMultiplier: number
  let timeExplanation: string

  if (timeRatio < XP_CONSTANTS.TIME_TOO_FAST_THRESHOLD) {
    // Too fast - likely rushing/guessing
    timeMultiplier = XP_CONSTANTS.TIME_TOO_FAST_MULTIPLIER
    timeExplanation = `Too fast (×${timeMultiplier})`
  } else if (timeRatio >= XP_CONSTANTS.TIME_OPTIMAL_MIN && timeRatio <= XP_CONSTANTS.TIME_OPTIMAL_MAX) {
    // Optimal pace - bonus!
    timeMultiplier = XP_CONSTANTS.TIME_OPTIMAL_MULTIPLIER
    timeExplanation = `Good pace (×${timeMultiplier})`
  } else {
    // Too slow - small penalty
    timeMultiplier = XP_CONSTANTS.TIME_SLOW_MULTIPLIER
    timeExplanation = `Took longer (×${timeMultiplier})`
  }

  // 2. Hint Multiplier
  const hintCount = Math.min(hintsUsed, 3) // Cap at 3 for lookup
  const hintMultiplier = XP_CONSTANTS.HINT_MULTIPLIERS[hintCount as keyof typeof XP_CONSTANTS.HINT_MULTIPLIERS]
  const hintExplanation = hintsUsed === 0 
    ? 'No hints (×1.0)' 
    : `${hintsUsed} hint${hintsUsed > 1 ? 's' : ''} (×${hintMultiplier})`

  // 3. First Attempt Bonus
  const attemptMultiplier = attemptNumber === 1 
    ? XP_CONSTANTS.FIRST_ATTEMPT_MULTIPLIER 
    : XP_CONSTANTS.SUBSEQUENT_ATTEMPT_MULTIPLIER
  const attemptExplanation = attemptNumber === 1 
    ? 'First try bonus (×1.2)' 
    : 'Subsequent attempt (×1.0)'

  // 4. Maintenance Review Penalty
  const maintenanceMultiplier = isAlreadyMastered 
    ? XP_CONSTANTS.MAINTENANCE_MULTIPLIER 
    : 1.0
  const maintenanceExplanation = isAlreadyMastered 
    ? 'Review mode (×0.5)' 
    : 'New learning (×1.0)'

  // Calculate final XP
  const totalXP = Math.round(
    baseXP * 
    timeMultiplier * 
    hintMultiplier * 
    attemptMultiplier * 
    maintenanceMultiplier
  )

  return {
    baseXP,
    timeMultiplier,
    hintMultiplier,
    attemptMultiplier,
    maintenanceMultiplier,
    totalXP,
    breakdown: [
      { label: 'Base XP', value: baseXP },
      { label: 'Time', value: timeExplanation },
      { label: 'Hints', value: hintExplanation },
      { label: 'Attempt', value: attemptExplanation },
      { label: 'Mode', value: maintenanceExplanation },
      { label: 'Total XP', value: `🌟 ${totalXP} XP` },
    ],
  }
}

/**
 * Get expected time for a subtopic (for UI display)
 */
export function getExpectedTime(difficulty: 1 | 2 | 3): number {
  return difficulty * XP_CONSTANTS.EXPECTED_SECONDS_PER_DIFFICULTY
}

/**
 * Get base XP for a difficulty level (for UI display)
 */
export function getBaseXP(difficulty: 1 | 2 | 3): number {
  return difficulty * XP_CONSTANTS.BASE_XP_PER_DIFFICULTY
}

/**
 * Format XP breakdown for display
 */
export function formatXPBreakdown(result: XPCalculationResult): string {
  return result.breakdown
    .map(item => `${item.label}: ${item.value}`)
    .join('\n')
}

/**
 * Estimate XP range for a subtopic (min-max based on performance)
 */
export function estimateXPRange(difficulty: 1 | 2 | 3): { min: number; max: number } {
  const baseXP = getBaseXP(difficulty)
  
  // Min: Incorrect answer
  const min = Math.round(baseXP * XP_CONSTANTS.INCORRECT_MULTIPLIER)
  
  // Max: Perfect first attempt with optimal pace and no hints
  const max = Math.round(
    baseXP * 
    XP_CONSTANTS.TIME_OPTIMAL_MULTIPLIER * 
    XP_CONSTANTS.FIRST_ATTEMPT_MULTIPLIER
  )
  
  return { min, max }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  calculateXP,
  getExpectedTime,
  getBaseXP,
  formatXPBreakdown,
  estimateXPRange,
}

