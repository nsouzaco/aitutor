/**
 * Progress Tracking Type Definitions
 * 
 * Tracks student progress per subtopic and overall learning journey
 */

/**
 * Progress for a single subtopic
 */
export interface SubtopicProgress {
  subtopicId: string
  attemptCount: number
  correctCount: number
  masteryScore: number // Calculated as (correctCount / attemptCount) * 100
  mastered: boolean // True when masteryScore >= 85 AND attemptCount >= 3
  lastAttemptedAt: Date
  firstAttemptDate: Date
  masteryDate?: Date // When mastery was first achieved
  averageResponseTime?: number // Average seconds per attempt (for analytics)
}

/**
 * Overall student progress across all subtopics
 */
export interface StudentProgress {
  userId: string
  subtopics: Record<string, SubtopicProgress> // Map of subtopicId → progress
  totalXP: number
  currentStreak: number // Consecutive days with activity
  lastActiveDate: Date
}

/**
 * Student profile with placement and level info
 */
export interface StudentProfile {
  userId: string
  email: string
  createdAt: Date
  lastActiveAt: Date
  totalXP: number
  
  // Placement test results
  placementTestCompleted: boolean
  placementTestScore?: number // 0-100
  estimatedLevel?: 'beginner' | 'intermediate' | 'advanced'
  recommendedStartingSubtopic?: string // Subtopic ID
  
  // Engagement metrics
  currentStreak: number
  longestStreak: number
  totalAttempts: number
  totalCorrectAttempts: number
}

/**
 * Mastery constants
 */
export const MASTERY_THRESHOLD = 0.85 // 85% accuracy required
export const MIN_ATTEMPTS_FOR_MASTERY = 3 // Minimum attempts before mastery can be achieved

