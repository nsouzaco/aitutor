/**
 * Spaced Repetition Review Type Definitions
 * 
 * Implements Leitner-inspired review scheduling to prevent forgetting
 */

/**
 * Priority levels for review items
 */
export type ReviewPriority = 'high' | 'medium' | 'low'

/**
 * Review item in the queue
 */
export interface ReviewItem {
  reviewId: string
  userId: string
  subtopicId: string
  subtopicName: string
  
  // Scheduling
  dueAt: Date
  priority: ReviewPriority
  lastReviewedAt?: Date
  nextDueAt: Date
  reviewCount: number
  
  // Status
  completed: boolean
  completedAt?: Date
}

/**
 * Review schedule intervals (in days)
 * Based on Leitner system adapted for 8th grade
 */
export const REVIEW_INTERVALS = {
  FIRST_REVIEW: 1,      // Day 1 (same day or next day)
  SECOND_REVIEW: 3,     // Day 3
  THIRD_REVIEW: 7,      // Week 1
  FOURTH_REVIEW: 14,    // Week 2
  MONTHLY_REVIEW: 30,   // Then monthly
} as const

/**
 * Priority thresholds (in days)
 */
export const PRIORITY_THRESHOLDS = {
  HIGH_MAX_DAYS: 3,     // 0-3 days past due or due today = high priority
  MEDIUM_MAX_DAYS: 7,   // 3-7 days until due = medium priority
  // Everything else = low priority
} as const

/**
 * Review queue summary for dashboard
 */
export interface ReviewQueueSummary {
  totalDue: number
  highPriority: number
  mediumPriority: number
  lowPriority: number
  nextDueDate?: Date
}

