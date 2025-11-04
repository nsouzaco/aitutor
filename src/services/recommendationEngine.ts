/**
 * Recommendation Engine - Suggest optimal next topic for learning
 * 
 * Algorithm:
 * 1. Prefer unattempted subtopics (new learning over review)
 * 2. Sort by difficulty (easier first for new topics)
 * 3. If all available topics attempted, suggest closest to mastery
 * 4. Filter out locked topics (prerequisites not met)
 */

import { Subtopic, SubtopicWithProgress } from '../types/curriculum'
import { getAllSubtopics } from '../data/curriculum'
import { getStudentProgress } from './progressService'
import { getAvailableSubtopics } from './gatingService'

/**
 * Get the next recommended subtopic for a student
 */
export async function getNextRecommendedSubtopic(
  userId: string
): Promise<SubtopicWithProgress | null> {
  try {
    // Get available (unlocked) subtopics
    const availableSubtopics = await getAvailableSubtopics(userId)
    
    if (availableSubtopics.length === 0) {
      return null // No topics available
    }

    // Get student progress
    const studentProgress = await getStudentProgress(userId)

    // Enrich subtopics with progress data
    const enrichedSubtopics: SubtopicWithProgress[] = availableSubtopics.map(sub => {
      const progress = studentProgress.subtopics[sub.id]
      
      if (!progress) {
        // Not attempted yet
        return {
          ...sub,
          status: 'not-started' as const,
          masteryScore: 0,
          attemptCount: 0,
          correctCount: 0,
        }
      }

      return {
        ...sub,
        status: progress.mastered ? 'mastered' as const : 'in-progress' as const,
        masteryScore: progress.masteryScore,
        attemptCount: progress.attemptCount,
        correctCount: progress.correctCount,
        lastAttemptedAt: progress.lastAttemptedAt,
      }
    })

    // Filter out mastered topics (we want to recommend new learning)
    const nonMastered = enrichedSubtopics.filter(sub => !sub.status || sub.status !== 'mastered')

    if (nonMastered.length === 0) {
      // All available topics are mastered - suggest review of weakest mastered topic
      const masteredTopics = enrichedSubtopics
        .filter(sub => sub.status === 'mastered')
        .sort((a, b) => a.masteryScore - b.masteryScore) // Lowest mastery score first

      return masteredTopics[0] || null
    }

    // Separate not-started and in-progress
    const notStarted = nonMastered.filter(sub => sub.status === 'not-started')
    const inProgress = nonMastered.filter(sub => sub.status === 'in-progress')

    // Prefer not-started (new learning)
    if (notStarted.length > 0) {
      // Sort by difficulty (easiest first)
      const sorted = notStarted.sort((a, b) => {
        if (a.difficulty !== b.difficulty) {
          return a.difficulty - b.difficulty
        }
        // Same difficulty - sort alphabetically
        return a.name.localeCompare(b.name)
      })
      return sorted[0]
    }

    // All available are in-progress - suggest closest to mastery
    if (inProgress.length > 0) {
      const sorted = inProgress.sort((a, b) => {
        // Highest mastery score first (closest to completion)
        return b.masteryScore - a.masteryScore
      })
      return sorted[0]
    }

    return null
  } catch (error) {
    console.error('Error getting next recommended subtopic:', error)
    throw new Error('Failed to get recommendation')
  }
}

/**
 * Get knowledge frontier - top 3-5 recommended topics
 * Useful for showing multiple options
 */
export async function getKnowledgeFrontier(
  userId: string,
  count: number = 5
): Promise<SubtopicWithProgress[]> {
  try {
    const availableSubtopics = await getAvailableSubtopics(userId)
    
    if (availableSubtopics.length === 0) {
      return []
    }

    const studentProgress = await getStudentProgress(userId)

    // Enrich with progress
    const enrichedSubtopics: SubtopicWithProgress[] = availableSubtopics.map(sub => {
      const progress = studentProgress.subtopics[sub.id]
      
      if (!progress) {
        return {
          ...sub,
          status: 'not-started' as const,
          masteryScore: 0,
          attemptCount: 0,
          correctCount: 0,
        }
      }

      return {
        ...sub,
        status: progress.mastered ? 'mastered' as const : 'in-progress' as const,
        masteryScore: progress.masteryScore,
        attemptCount: progress.attemptCount,
        correctCount: progress.correctCount,
        lastAttemptedAt: progress.lastAttemptedAt,
      }
    })

    // Filter out mastered
    const nonMastered = enrichedSubtopics.filter(sub => sub.status !== 'mastered')

    // Sort by priority: not-started (by difficulty) then in-progress (by mastery score)
    const sorted = nonMastered.sort((a, b) => {
      // Not-started comes before in-progress
      if (a.status === 'not-started' && b.status === 'in-progress') return -1
      if (a.status === 'in-progress' && b.status === 'not-started') return 1

      // Both not-started - sort by difficulty
      if (a.status === 'not-started' && b.status === 'not-started') {
        if (a.difficulty !== b.difficulty) {
          return a.difficulty - b.difficulty
        }
        return a.name.localeCompare(b.name)
      }

      // Both in-progress - sort by mastery score (highest first)
      if (a.status === 'in-progress' && b.status === 'in-progress') {
        return b.masteryScore - a.masteryScore
      }

      return 0
    })

    return sorted.slice(0, count)
  } catch (error) {
    console.error('Error getting knowledge frontier:', error)
    throw new Error('Failed to get knowledge frontier')
  }
}

/**
 * Get personalized learning path (ordered list of recommended topics)
 * Shows the full sequence of what to learn next
 */
export async function getLearningPath(
  userId: string,
  lookAhead: number = 10
): Promise<SubtopicWithProgress[]> {
  try {
    const availableSubtopics = await getAvailableSubtopics(userId)
    const studentProgress = await getStudentProgress(userId)

    // Enrich with progress
    const enrichedSubtopics: SubtopicWithProgress[] = availableSubtopics.map(sub => {
      const progress = studentProgress.subtopics[sub.id]
      
      if (!progress) {
        return {
          ...sub,
          status: 'not-started' as const,
          masteryScore: 0,
          attemptCount: 0,
          correctCount: 0,
        }
      }

      return {
        ...sub,
        status: progress.mastered ? 'mastered' as const : 'in-progress' as const,
        masteryScore: progress.masteryScore,
        attemptCount: progress.attemptCount,
        correctCount: progress.correctCount,
        lastAttemptedAt: progress.lastAttemptedAt,
      }
    })

    // Filter non-mastered and sort by difficulty then name
    const path = enrichedSubtopics
      .filter(sub => sub.status !== 'mastered')
      .sort((a, b) => {
        if (a.difficulty !== b.difficulty) {
          return a.difficulty - b.difficulty
        }
        return a.name.localeCompare(b.name)
      })

    return path.slice(0, lookAhead)
  } catch (error) {
    console.error('Error getting learning path:', error)
    throw new Error('Failed to get learning path')
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getNextRecommendedSubtopic,
  getKnowledgeFrontier,
  getLearningPath,
}

