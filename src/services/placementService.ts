/**
 * Placement Test Service
 * 
 * Handles submission, evaluation, and initial curriculum unlocking
 */

import { doc, writeBatch, serverTimestamp } from 'firebase/firestore'
import { db } from './firebaseService'
import { calculatePlacementResults } from '../data/placementTest'
import { getSubtopicById, getAllSubtopics } from '../data/curriculum'

export interface PlacementTestSubmission {
  answers: Record<string, string>
  completedAt: Date
}

/**
 * Submit placement test and unlock appropriate subtopics
 */
export async function submitPlacementTest(
  userId: string,
  answers: Record<string, string>
): Promise<{
  score: number
  level: 'beginner' | 'intermediate' | 'advanced'
  unlockedSubtopics: string[]
  recommendedStartingSubtopic: string
}> {
  console.log('📝 [PlacementService] Submitting placement test for user:', userId)
  
  // Calculate results
  const results = calculatePlacementResults(answers)
  console.log('📊 [PlacementService] Results:', results)

  // Determine which subtopics to unlock based on level
  const allSubtopics = getAllSubtopics()
  const subtopicsToUnlock: string[] = []

  // Unlock based on level (difficulty: 1=beginner, 2=intermediate, 3=advanced)
  if (results.level === 'advanced') {
    // Unlock all beginner and intermediate topics (difficulty 1 & 2), plus some advanced (3)
    allSubtopics.forEach((subtopic) => {
      if (subtopic.difficulty === 1 || subtopic.difficulty === 2) {
        subtopicsToUnlock.push(subtopic.id)
      }
    })
    // Also unlock advanced topics they got correct
    results.masteredSubtopics.forEach((id) => {
      const subtopic = getSubtopicById(id)
      if (subtopic && subtopic.difficulty === 3) {
        subtopicsToUnlock.push(id)
      }
    })
  } else if (results.level === 'intermediate') {
    // Unlock all beginner topics (difficulty 1)
    allSubtopics.forEach((subtopic) => {
      if (subtopic.difficulty === 1) {
        subtopicsToUnlock.push(subtopic.id)
      }
    })
    // Also unlock intermediate topics they got correct
    results.masteredSubtopics.forEach((id) => {
      const subtopic = getSubtopicById(id)
      if (subtopic && subtopic.difficulty === 2) {
        subtopicsToUnlock.push(id)
      }
    })
  } else {
    // Beginner: Just unlock the starting subtopic
    subtopicsToUnlock.push(results.recommendedStartingSubtopic)
  }

  // Remove duplicates
  const uniqueUnlocked = Array.from(new Set(subtopicsToUnlock))

  // Save to Firestore
  const batch = writeBatch(db)

  // Update student profile
  const profileRef = doc(db, 'students', userId)
  batch.set(
    profileRef,
    {
      placementTestCompleted: true,
      placementTestScore: results.score,
      estimatedLevel: results.level,
      recommendedStartingSubtopic: results.recommendedStartingSubtopic,
      lastActiveAt: serverTimestamp(),
    },
    { merge: true }
  )

  // Initialize progress for unlocked subtopics
  uniqueUnlocked.forEach((subtopicId) => {
    const progressRef = doc(db, 'students', userId, 'progress', subtopicId)
    batch.set(progressRef, {
      subtopicId,
      attemptCount: 0,
      correctCount: 0,
      masteryScore: 0,
      mastered: false,
      lastAttemptedAt: serverTimestamp(),
      firstAttemptDate: serverTimestamp(),
      unlockedAt: serverTimestamp(),
      unlockedByPlacement: true,
    })
  })

  await batch.commit()
  console.log('✅ [PlacementService] Placement test saved, unlocked', uniqueUnlocked.length, 'subtopics')

  return {
    score: results.score,
    level: results.level,
    unlockedSubtopics: uniqueUnlocked,
    recommendedStartingSubtopic: results.recommendedStartingSubtopic,
  }
}

/**
 * Check if user has completed placement test
 */
export async function hasCompletedPlacementTest(userId: string): Promise<boolean> {
  try {
    const { getDoc } = await import('firebase/firestore')
    const profileRef = doc(db, 'students', userId)
    const snapshot = await getDoc(profileRef)
    
    if (!snapshot.exists()) {
      return false
    }

    return snapshot.data()?.placementTestCompleted === true
  } catch (error) {
    console.error('[PlacementService] Error checking placement status:', error)
    return false
  }
}

