/**
 * Attempt Service - Track and save problem-solving attempts
 * 
 * Records each attempt with all context (problem, response, time, hints, XP)
 * Integrates with progress and XP services
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebaseService'
import { Attempt, AttemptResult, RecentActivity } from '../types/attempt'
import { updateProgress, getSubtopicProgress } from './progressService'
import { calculateXP } from './xpEngine'
import { updateStudentXP } from './progressService'
import { getTopicsUnlockedBy } from './gatingService'
import { getSubtopicById, getSubtopicName } from '../data/curriculum'
import { v4 as uuidv4 } from 'uuid'

/**
 * Record a new attempt and calculate results
 */
export async function recordAttempt(
  userId: string,
  subtopicId: string,
  problemText: string,
  studentResponse: string,
  isCorrect: boolean,
  timeSpent: number,
  hintsUsed: number,
  problemImageUrl?: string,
  conversationHistory?: any[]
): Promise<AttemptResult> {
  try {
    const attemptId = uuidv4()
    const subtopic = getSubtopicById(subtopicId)
    
    if (!subtopic) {
      throw new Error('Subtopic not found')
    }

    // Get current progress to determine if already mastered
    const currentProgress = await getSubtopicProgress(userId, subtopicId)
    const isAlreadyMastered = currentProgress?.mastered || false
    const attemptNumber = (currentProgress?.attemptCount || 0) + 1

    // Calculate XP earned
    const xpResult = calculateXP({
      subtopicDifficulty: subtopic.difficulty,
      isCorrect,
      timeSpent,
      hintsUsed,
      attemptNumber,
      isAlreadyMastered,
    })

    // Update progress in Firestore
    const updatedProgress = await updateProgress(
      userId,
      subtopicId,
      isCorrect,
      timeSpent
    )

    // Update student's total XP
    await updateStudentXP(userId, xpResult.totalXP)

    // Check if mastery was just achieved
    const masteryAchieved = !isAlreadyMastered && updatedProgress.mastered

    // Check what topics were unlocked
    let newTopicsUnlocked: string[] = []
    if (masteryAchieved) {
      const unlockedTopics = await getTopicsUnlockedBy(userId, subtopicId)
      newTopicsUnlocked = unlockedTopics.map(t => t.id)
    }

    // Save attempt to Firestore
    const attemptRef = doc(db, 'students', userId, 'attempts', attemptId)
    
    const attemptData = {
      attemptId,
      userId,
      subtopicId,
      problemText,
      studentResponse,
      isCorrect,
      timeSpent,
      hintsUsed,
      xpEarned: xpResult.totalXP,
      attemptedAt: Timestamp.now(),
      ...(problemImageUrl && { problemImageUrl }),
      ...(conversationHistory && { conversationHistory }),
    }

    await setDoc(attemptRef, attemptData)

    // Prepare result
    const result: AttemptResult = {
      attemptId,
      isCorrect,
      xpEarned: xpResult.totalXP,
      feedback: isCorrect 
        ? `Great work! You earned ${xpResult.totalXP} XP.`
        : `Not quite right, but you earned ${xpResult.totalXP} XP for trying. Let's work through this together.`,
      masteryAchieved,
      newTopicsUnlocked: newTopicsUnlocked.length > 0 ? newTopicsUnlocked : undefined,
    }

    return result
  } catch (error) {
    console.error('Error recording attempt:', error)
    throw new Error('Failed to record attempt')
  }
}

/**
 * Get recent attempts for a student (for dashboard)
 */
export async function getRecentAttempts(
  userId: string,
  limitCount: number = 5
): Promise<RecentActivity[]> {
  try {
    const attemptsRef = collection(db, 'students', userId, 'attempts')
    const q = query(
      attemptsRef,
      orderBy('attemptedAt', 'desc'),
      limit(limitCount)
    )

    const attemptsSnap = await getDocs(q)
    const activities: RecentActivity[] = []

    attemptsSnap.forEach(doc => {
      const data = doc.data()
      activities.push({
        attemptId: data.attemptId,
        subtopicName: getSubtopicName(data.subtopicId),
        isCorrect: data.isCorrect,
        xpEarned: data.xpEarned,
        attemptedAt: data.attemptedAt.toDate(),
      })
    })

    return activities
  } catch (error) {
    console.error('Error fetching recent attempts:', error)
    throw new Error('Failed to fetch recent attempts')
  }
}

/**
 * Get all attempts for a specific subtopic
 */
export async function getSubtopicAttempts(
  userId: string,
  subtopicId: string
): Promise<Attempt[]> {
  try {
    const attemptsRef = collection(db, 'students', userId, 'attempts')
    const q = query(
      attemptsRef,
      where('subtopicId', '==', subtopicId),
      orderBy('attemptedAt', 'desc')
    )

    const attemptsSnap = await getDocs(q)
    const attempts: Attempt[] = []

    attemptsSnap.forEach(doc => {
      const data = doc.data()
      attempts.push({
        attemptId: data.attemptId,
        userId: data.userId,
        subtopicId: data.subtopicId,
        problemText: data.problemText,
        problemImageUrl: data.problemImageUrl,
        studentResponse: data.studentResponse,
        isCorrect: data.isCorrect,
        timeSpent: data.timeSpent,
        hintsUsed: data.hintsUsed,
        xpEarned: data.xpEarned,
        attemptedAt: data.attemptedAt.toDate(),
        conversationHistory: data.conversationHistory,
      })
    })

    return attempts
  } catch (error) {
    console.error('Error fetching subtopic attempts:', error)
    throw new Error('Failed to fetch subtopic attempts')
  }
}

/**
 * Get total attempts count for a student
 */
export async function getTotalAttemptsCount(userId: string): Promise<number> {
  try {
    const attemptsRef = collection(db, 'students', userId, 'attempts')
    const attemptsSnap = await getDocs(attemptsRef)
    return attemptsSnap.size
  } catch (error) {
    console.error('Error counting attempts:', error)
    return 0
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  recordAttempt,
  getRecentAttempts,
  getSubtopicAttempts,
  getTotalAttemptsCount,
}

