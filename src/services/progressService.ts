/**
 * Progress Service - Track student progress and calculate mastery
 * 
 * Mastery Definition: 85%+ accuracy with minimum 3 attempts
 * Once mastery is achieved, it persists (can only increase, never decrease)
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebaseService'
import {
  SubtopicProgress,
  StudentProgress,
  MASTERY_THRESHOLD,
  MIN_ATTEMPTS_FOR_MASTERY,
} from '../types/progress'

// ============================================================================
// MASTERY CALCULATION
// ============================================================================

/**
 * Check if a subtopic has been mastered
 * Requires: 85%+ accuracy AND minimum 3 attempts
 */
export function isMastered(progress: SubtopicProgress): boolean {
  if (progress.attemptCount < MIN_ATTEMPTS_FOR_MASTERY) {
    return false
  }
  
  const accuracy = progress.correctCount / progress.attemptCount
  return accuracy >= MASTERY_THRESHOLD
}

/**
 * Calculate mastery score as percentage (0-100)
 */
export function calculateMasteryScore(
  correctCount: number,
  attemptCount: number
): number {
  if (attemptCount === 0) return 0
  return Math.round((correctCount / attemptCount) * 100)
}

// ============================================================================
// FIRESTORE OPERATIONS
// ============================================================================

/**
 * Update student progress after an attempt
 */
export async function updateProgress(
  userId: string,
  subtopicId: string,
  isCorrect: boolean,
  timeSpent: number
): Promise<SubtopicProgress> {
  try {
    const progressRef = doc(db, 'students', userId, 'progress', subtopicId)
    const progressSnap = await getDoc(progressRef)

    const now = new Date()
    
    if (!progressSnap.exists()) {
      // First attempt - create new progress document
      const newProgress: SubtopicProgress = {
        subtopicId,
        attemptCount: 1,
        correctCount: isCorrect ? 1 : 0,
        masteryScore: isCorrect ? 100 : 0,
        mastered: false, // Can't master on first attempt (need min 3)
        lastAttemptedAt: now,
        firstAttemptDate: now,
        averageResponseTime: timeSpent,
      }

      await setDoc(progressRef, {
        ...newProgress,
        lastAttemptedAt: Timestamp.fromDate(newProgress.lastAttemptedAt),
        firstAttemptDate: Timestamp.fromDate(newProgress.firstAttemptDate),
      })

      return newProgress
    }

    // Existing progress - update
    const data = progressSnap.data()
    const currentProgress: SubtopicProgress = {
      subtopicId: data.subtopicId,
      attemptCount: data.attemptCount,
      correctCount: data.correctCount,
      masteryScore: data.masteryScore,
      mastered: data.mastered,
      lastAttemptedAt: data.lastAttemptedAt.toDate(),
      firstAttemptDate: data.firstAttemptDate.toDate(),
      masteryDate: data.masteryDate?.toDate(),
      averageResponseTime: data.averageResponseTime,
    }

    // Update counts
    const newAttemptCount = currentProgress.attemptCount + 1
    const newCorrectCount = currentProgress.correctCount + (isCorrect ? 1 : 0)
    const newMasteryScore = calculateMasteryScore(newCorrectCount, newAttemptCount)

    // Calculate new average response time
    const newAverageResponseTime = currentProgress.averageResponseTime
      ? (currentProgress.averageResponseTime * currentProgress.attemptCount + timeSpent) / newAttemptCount
      : timeSpent

    // Check if mastery achieved (once mastered, stays mastered)
    const wasAlreadyMastered = currentProgress.mastered
    const newMastered = wasAlreadyMastered || (
      newAttemptCount >= MIN_ATTEMPTS_FOR_MASTERY &&
      newCorrectCount / newAttemptCount >= MASTERY_THRESHOLD
    )

    const updatedProgress: SubtopicProgress = {
      ...currentProgress,
      attemptCount: newAttemptCount,
      correctCount: newCorrectCount,
      masteryScore: newMasteryScore,
      mastered: newMastered,
      lastAttemptedAt: now,
      masteryDate: !wasAlreadyMastered && newMastered ? now : currentProgress.masteryDate,
      averageResponseTime: newAverageResponseTime,
    }

    // Update Firestore
    const updateData: any = {
      attemptCount: updatedProgress.attemptCount,
      correctCount: updatedProgress.correctCount,
      masteryScore: updatedProgress.masteryScore,
      mastered: updatedProgress.mastered,
      lastAttemptedAt: Timestamp.fromDate(updatedProgress.lastAttemptedAt),
      averageResponseTime: updatedProgress.averageResponseTime,
    }

    if (updatedProgress.masteryDate && !wasAlreadyMastered) {
      updateData.masteryDate = Timestamp.fromDate(updatedProgress.masteryDate)
    }

    await updateDoc(progressRef, updateData)

    return updatedProgress
  } catch (error) {
    console.error('Error updating progress:', error)
    throw new Error('Failed to update progress')
  }
}

/**
 * Get progress for a specific subtopic
 */
export async function getSubtopicProgress(
  userId: string,
  subtopicId: string
): Promise<SubtopicProgress | null> {
  try {
    const progressRef = doc(db, 'students', userId, 'progress', subtopicId)
    const progressSnap = await getDoc(progressRef)

    if (!progressSnap.exists()) {
      return null
    }

    const data = progressSnap.data()
    return {
      subtopicId: data.subtopicId,
      attemptCount: data.attemptCount,
      correctCount: data.correctCount,
      masteryScore: data.masteryScore,
      mastered: data.mastered,
      lastAttemptedAt: data.lastAttemptedAt.toDate(),
      firstAttemptDate: data.firstAttemptDate.toDate(),
      masteryDate: data.masteryDate?.toDate(),
      averageResponseTime: data.averageResponseTime,
    }
  } catch (error) {
    console.error('Error fetching subtopic progress:', error)
    throw new Error('Failed to fetch subtopic progress')
  }
}

/**
 * Get all progress for a student
 */
export async function getStudentProgress(
  userId: string
): Promise<StudentProgress> {
  try {
    const progressRef = collection(db, 'students', userId, 'progress')
    const progressSnap = await getDocs(progressRef)

    const subtopics: Record<string, SubtopicProgress> = {}
    
    progressSnap.forEach(doc => {
      const data = doc.data()
      subtopics[data.subtopicId] = {
        subtopicId: data.subtopicId,
        attemptCount: data.attemptCount,
        correctCount: data.correctCount,
        masteryScore: data.masteryScore,
        mastered: data.mastered,
        lastAttemptedAt: data.lastAttemptedAt.toDate(),
        firstAttemptDate: data.firstAttemptDate.toDate(),
        masteryDate: data.masteryDate?.toDate(),
        averageResponseTime: data.averageResponseTime,
      }
    })

    // Get student profile for additional data
    const studentRef = doc(db, 'students', userId)
    const studentSnap = await getDoc(studentRef)
    
    const studentData = studentSnap.exists() ? studentSnap.data() : {}

    return {
      userId,
      subtopics,
      totalXP: studentData.totalXP || 0,
      currentStreak: studentData.currentStreak || 0,
      lastActiveDate: studentData.lastActiveAt?.toDate() || new Date(),
    }
  } catch (error) {
    console.error('Error fetching student progress:', error)
    throw new Error('Failed to fetch student progress')
  }
}

/**
 * Get all mastered subtopics for a student
 */
export async function getMasteredSubtopics(
  userId: string
): Promise<string[]> {
  try {
    const progressRef = collection(db, 'students', userId, 'progress')
    const q = query(progressRef, where('mastered', '==', true))
    const progressSnap = await getDocs(q)

    const masteredIds: string[] = []
    progressSnap.forEach(doc => {
      masteredIds.push(doc.data().subtopicId)
    })

    return masteredIds
  } catch (error) {
    console.error('Error fetching mastered subtopics:', error)
    throw new Error('Failed to fetch mastered subtopics')
  }
}

/**
 * Initialize or update student profile
 */
export async function initializeStudentProfile(
  userId: string,
  email: string
): Promise<void> {
  try {
    const studentRef = doc(db, 'students', userId)
    const studentSnap = await getDoc(studentRef)

    if (!studentSnap.exists()) {
      // Create new student profile
      await setDoc(studentRef, {
        userId,
        email,
        createdAt: Timestamp.now(),
        lastActiveAt: Timestamp.now(),
        totalXP: 0,
        placementTestCompleted: false,
        currentStreak: 0,
        longestStreak: 0,
        totalAttempts: 0,
        totalCorrectAttempts: 0,
      })
    } else {
      // Update last active
      await updateDoc(studentRef, {
        lastActiveAt: Timestamp.now(),
      })
    }
  } catch (error) {
    console.error('Error initializing student profile:', error)
    throw new Error('Failed to initialize student profile')
  }
}

/**
 * Update student's total XP
 */
export async function updateStudentXP(
  userId: string,
  xpToAdd: number
): Promise<void> {
  try {
    const studentRef = doc(db, 'students', userId)
    const studentSnap = await getDoc(studentRef)

    if (!studentSnap.exists()) {
      throw new Error('Student profile not found')
    }

    const currentXP = studentSnap.data().totalXP || 0
    await updateDoc(studentRef, {
      totalXP: currentXP + xpToAdd,
      lastActiveAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating student XP:', error)
    throw new Error('Failed to update student XP')
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  isMastered,
  calculateMasteryScore,
  updateProgress,
  getSubtopicProgress,
  getStudentProgress,
  getMasteredSubtopics,
  initializeStudentProfile,
  updateStudentXP,
}

