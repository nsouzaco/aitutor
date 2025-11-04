/**
 * XP Calculation Type Definitions
 * 
 * Defines how XP is calculated with various multipliers
 * to calibrate learning pace and reward quality
 */

import { DifficultyLevel } from './curriculum'

/**
 * Input parameters for XP calculation
 */
export interface XPCalculationInput {
  subtopicDifficulty: DifficultyLevel
  isCorrect: boolean
  timeSpent: number // Seconds
  hintsUsed: number
  attemptNumber: number // 1 for first attempt, 2 for second, etc.
  isAlreadyMastered: boolean // If student already mastered this topic (review/maintenance)
}

/**
 * Detailed breakdown of XP calculation
 * Useful for transparency and debugging
 */
export interface XPCalculationResult {
  baseXP: number
  
  // Multipliers applied
  timeMultiplier: number
  hintMultiplier: number
  attemptMultiplier: number
  maintenanceMultiplier: number
  
  // Final result
  totalXP: number
  
  // Explanation for UI
  breakdown: {
    label: string
    value: number | string
  }[]
}

/**
 * XP calculation constants
 */
export const XP_CONSTANTS = {
  // Base XP by difficulty
  BASE_XP_PER_DIFFICULTY: 10, // Difficulty 1 = 10 XP, 2 = 20 XP, 3 = 30 XP
  
  // Incorrect answer penalty
  INCORRECT_MULTIPLIER: 0.3, // Only 30% of base XP for incorrect answers
  
  // Time multipliers
  TIME_TOO_FAST_THRESHOLD: 0.5, // Less than 50% of expected time
  TIME_TOO_FAST_MULTIPLIER: 0.7, // Penalty for rushing (likely guessing)
  TIME_OPTIMAL_MIN: 0.5,
  TIME_OPTIMAL_MAX: 2.0,
  TIME_OPTIMAL_MULTIPLIER: 1.1, // Bonus for reasonable pacing
  TIME_SLOW_MULTIPLIER: 0.9, // Small penalty for taking too long
  
  // Expected time calculation
  EXPECTED_SECONDS_PER_DIFFICULTY: 30, // difficulty × 30 seconds
  
  // Hint penalties
  HINT_MULTIPLIERS: {
    0: 1.0,    // No hints
    1: 0.85,   // One hint
    2: 0.70,   // Two hints
    3: 0.55,   // Three or more hints
  },
  
  // First attempt bonus
  FIRST_ATTEMPT_MULTIPLIER: 1.2, // 20% bonus for getting it right first try
  SUBSEQUENT_ATTEMPT_MULTIPLIER: 1.0,
  
  // Maintenance review penalty
  MAINTENANCE_MULTIPLIER: 0.5, // 50% XP for already-mastered topics (discourages farming)
} as const

