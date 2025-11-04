/**
 * Attempt Tracking Type Definitions
 * 
 * Records each problem-solving attempt with all relevant context
 */

/**
 * Single attempt at solving a problem
 */
export interface Attempt {
  attemptId: string
  userId: string
  subtopicId: string
  
  // Problem context
  problemText: string
  problemImageUrl?: string
  
  // Attempt details
  studentResponse: string
  isCorrect: boolean
  timeSpent: number // Seconds from problem start to answer
  hintsUsed: number
  
  // Results
  xpEarned: number
  attemptedAt: Date
  
  // Conversation history (for review/analytics)
  conversationHistory?: {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }[]
}

/**
 * Attempt result returned after evaluation
 */
export interface AttemptResult {
  attemptId: string
  isCorrect: boolean
  xpEarned: number
  feedback: string
  masteryAchieved?: boolean // True if this attempt resulted in achieving mastery
  newTopicsUnlocked?: string[] // Subtopic IDs that became available
}

/**
 * Recent activity for dashboard
 */
export interface RecentActivity {
  attemptId: string
  subtopicName: string
  isCorrect: boolean
  xpEarned: number
  attemptedAt: Date
}

