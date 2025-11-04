/**
 * Curriculum Type Definitions for Phase 2 - Mastery-Based Progression
 * 
 * Defines the hierarchical structure: Unit → Topic → Subtopic
 * Each subtopic has prerequisites, difficulty level, and example problems
 */

export type DifficultyLevel = 1 | 2 | 3

/**
 * Subtopic - The atomic unit of learning
 * Contains specific skills/concepts that students master
 */
export interface Subtopic {
  id: string
  name: string
  description: string
  difficulty: DifficultyLevel
  prerequisites: string[] // Array of subtopic IDs that must be mastered first
  examples: string[] // Example problems for this subtopic
  estimatedMinutes: number // Expected time to complete (for XP calculation)
}

/**
 * Topic - Groups related subtopics
 */
export interface Topic {
  id: string
  name: string
  description: string
  subtopics: Subtopic[]
}

/**
 * Unit - Top-level curriculum organization
 */
export interface Unit {
  id: string
  name: string
  description: string
  topics: Topic[]
}

/**
 * Full curriculum structure
 */
export interface Curriculum {
  units: Unit[]
}

/**
 * Subtopic status from student's perspective
 */
export type SubtopicStatus = 
  | 'not-started'   // No attempts yet
  | 'in-progress'   // Has attempts but not mastered
  | 'mastered'      // Achieved mastery (85%+ accuracy)
  | 'locked'        // Prerequisites not met

/**
 * Prerequisite check result
 */
export interface PrerequisiteStatus {
  subtopicId: string
  isUnlocked: boolean
  missingPrerequisites: string[] // IDs of prerequisites not yet mastered
  prerequisiteNames?: string[] // Human-readable names for UI
}

/**
 * Enriched subtopic with student progress
 */
export interface SubtopicWithProgress extends Subtopic {
  status: SubtopicStatus
  masteryScore: number // 0-100
  attemptCount: number
  correctCount: number
  lastAttemptedAt?: Date
}

