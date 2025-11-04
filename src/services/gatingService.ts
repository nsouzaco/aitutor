/**
 * Gating Service - Prerequisite checking and topic locking
 * 
 * Ensures students can only attempt topics when prerequisites are mastered
 * Provides clear messaging about why topics are locked
 */

import { Subtopic, PrerequisiteStatus, SubtopicStatus } from '../types/curriculum'
import { getAllSubtopics, getSubtopicById, getSubtopicName } from '../data/curriculum'
import { getStudentProgress, getMasteredSubtopics } from './progressService'

/**
 * Check if a subtopic is unlocked for a student
 */
export async function isSubtopicUnlocked(
  userId: string,
  subtopicId: string
): Promise<boolean> {
  try {
    const subtopic = getSubtopicById(subtopicId)
    if (!subtopic) {
      throw new Error('Subtopic not found')
    }

    // No prerequisites = always unlocked
    if (subtopic.prerequisites.length === 0) {
      return true
    }

    // Check if ALL prerequisites are mastered
    const masteredSubtopics = await getMasteredSubtopics(userId)
    return subtopic.prerequisites.every(prereqId => 
      masteredSubtopics.includes(prereqId)
    )
  } catch (error) {
    console.error('Error checking if subtopic is unlocked:', error)
    throw new Error('Failed to check subtopic lock status')
  }
}

/**
 * Get prerequisite status for a subtopic
 */
export async function getPrerequisiteStatus(
  userId: string,
  subtopicId: string
): Promise<PrerequisiteStatus> {
  try {
    const subtopic = getSubtopicById(subtopicId)
    if (!subtopic) {
      throw new Error('Subtopic not found')
    }

    // No prerequisites = always unlocked
    if (subtopic.prerequisites.length === 0) {
      return {
        subtopicId,
        isUnlocked: true,
        missingPrerequisites: [],
        prerequisiteNames: [],
      }
    }

    // Check which prerequisites are mastered
    const masteredSubtopics = await getMasteredSubtopics(userId)
    const missingPrerequisites = subtopic.prerequisites.filter(
      prereqId => !masteredSubtopics.includes(prereqId)
    )

    const prerequisiteNames = missingPrerequisites.map(prereqId =>
      getSubtopicName(prereqId)
    )

    return {
      subtopicId,
      isUnlocked: missingPrerequisites.length === 0,
      missingPrerequisites,
      prerequisiteNames,
    }
  } catch (error) {
    console.error('Error getting prerequisite status:', error)
    throw new Error('Failed to get prerequisite status')
  }
}

/**
 * Get locked reason message for UI display
 */
export async function getLockedReason(
  userId: string,
  subtopicId: string
): Promise<string> {
  try {
    const status = await getPrerequisiteStatus(userId, subtopicId)
    
    if (status.isUnlocked) {
      return ''
    }

    if (status.missingPrerequisites.length === 1) {
      return `Complete "${status.prerequisiteNames![0]}" first`
    }

    return `Complete these topics first: ${status.prerequisiteNames!.join(', ')}`
  } catch (error) {
    console.error('Error getting locked reason:', error)
    return 'Prerequisites not met'
  }
}

/**
 * Get all available (unlocked) subtopics for a student
 */
export async function getAvailableSubtopics(
  userId: string
): Promise<Subtopic[]> {
  try {
    const allSubtopics = getAllSubtopics()
    const masteredSubtopics = await getMasteredSubtopics(userId)
    
    const available: Subtopic[] = []

    for (const subtopic of allSubtopics) {
      // Check if all prerequisites are mastered
      const allPrereqsMet = subtopic.prerequisites.every(prereqId =>
        masteredSubtopics.includes(prereqId)
      )

      if (allPrereqsMet) {
        available.push(subtopic)
      }
    }

    return available
  } catch (error) {
    console.error('Error getting available subtopics:', error)
    throw new Error('Failed to get available subtopics')
  }
}

/**
 * Get subtopic status for a student (mastered, in-progress, locked, not-started)
 */
export async function getSubtopicStatus(
  userId: string,
  subtopicId: string
): Promise<SubtopicStatus> {
  try {
    const progress = await import('./progressService').then(m => 
      m.getSubtopicProgress(userId, subtopicId)
    )

    // Has progress
    if (progress) {
      return progress.mastered ? 'mastered' : 'in-progress'
    }

    // No progress - check if unlocked
    const isUnlocked = await isSubtopicUnlocked(userId, subtopicId)
    return isUnlocked ? 'not-started' : 'locked'
  } catch (error) {
    console.error('Error getting subtopic status:', error)
    throw new Error('Failed to get subtopic status')
  }
}

/**
 * Get all subtopics with their status for a student
 */
export async function getAllSubtopicsWithStatus(
  userId: string
): Promise<Array<{ subtopic: Subtopic; status: SubtopicStatus }>> {
  try {
    const allSubtopics = getAllSubtopics()
    const studentProgress = await getStudentProgress(userId)
    const masteredSubtopics = Object.keys(studentProgress.subtopics).filter(
      id => studentProgress.subtopics[id].mastered
    )

    const result = allSubtopics.map(subtopic => {
      const progress = studentProgress.subtopics[subtopic.id]

      let status: SubtopicStatus
      if (progress?.mastered) {
        status = 'mastered'
      } else if (progress) {
        status = 'in-progress'
      } else {
        // Check if unlocked
        const allPrereqsMet = subtopic.prerequisites.every(prereqId =>
          masteredSubtopics.includes(prereqId)
        )
        status = allPrereqsMet ? 'not-started' : 'locked'
      }

      return { subtopic, status }
    })

    return result
  } catch (error) {
    console.error('Error getting all subtopics with status:', error)
    throw new Error('Failed to get subtopics with status')
  }
}

/**
 * Check if attempting a subtopic would unlock new topics
 * Useful for showing "X topics will unlock" message
 */
export async function getTopicsUnlockedBy(
  userId: string,
  subtopicId: string
): Promise<Subtopic[]> {
  try {
    const allSubtopics = getAllSubtopics()
    const masteredSubtopics = await getMasteredSubtopics(userId)
    
    // Simulate mastering this subtopic
    const simulatedMastered = [...masteredSubtopics, subtopicId]
    
    const wouldUnlock: Subtopic[] = []

    for (const subtopic of allSubtopics) {
      // Skip if already unlocked
      const currentlyUnlocked = subtopic.prerequisites.every(prereqId =>
        masteredSubtopics.includes(prereqId)
      )
      if (currentlyUnlocked) continue

      // Check if would be unlocked after mastering subtopicId
      const wouldBeUnlocked = subtopic.prerequisites.every(prereqId =>
        simulatedMastered.includes(prereqId)
      )

      if (wouldBeUnlocked) {
        wouldUnlock.push(subtopic)
      }
    }

    return wouldUnlock
  } catch (error) {
    console.error('Error calculating topics unlocked by:', error)
    return []
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  isSubtopicUnlocked,
  getPrerequisiteStatus,
  getLockedReason,
  getAvailableSubtopics,
  getSubtopicStatus,
  getAllSubtopicsWithStatus,
  getTopicsUnlockedBy,
}

