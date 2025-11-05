/**
 * Dashboard Service - Aggregate data for progress dashboard
 * 
 * Provides all the stats and summaries needed for the dashboard UI:
 * - Total/weekly/monthly XP
 * - Current streak
 * - Mastery percentage
 * - Recent activity
 * - Unit breakdown
 */

import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { db } from './firebaseService'
import { StudentProfile } from '../types/progress'
import { RecentActivity } from '../types/attempt'
import { CURRICULUM, getAllSubtopics } from '../data/curriculum'
import { getStudentProgress } from './progressService'
import { getRecentAttempts } from './attemptService'

/**
 * Dashboard summary data
 */
export interface DashboardSummary {
  // XP Stats
  totalXP: number
  weeklyXP: number
  monthlyXP: number
  dailyAverageXP: number
  
  // Engagement
  currentStreak: number
  longestStreak: number
  
  // Progress
  masteryPercentage: number
  topicsMastered: number
  totalTopics: number
  topicsInProgress: number
  topicsLocked: number
  
  // Activity
  recentActivity: RecentActivity[]
  totalAttempts: number
  totalCorrectAttempts: number
  overallAccuracy: number
}

/**
 * Unit progress breakdown
 */
export interface UnitProgress {
  unitId: string
  unitName: string
  totalSubtopics: number
  masteredSubtopics: number
  inProgressSubtopics: number
  completionPercentage: number
}

/**
 * Get complete dashboard summary
 */
export async function getDashboardSummary(
  userId: string
): Promise<DashboardSummary> {
  try {
    // Get student profile
    const studentRef = doc(db, 'students', userId)
    const studentSnap = await getDoc(studentRef)
    
    if (!studentSnap.exists()) {
      throw new Error('Student profile not found')
    }

    const profileData = studentSnap.data()

    // Get progress data
    const studentProgress = await getStudentProgress(userId)

    // Calculate XP stats
    const totalXP = profileData.totalXP || 0
    const { weeklyXP, monthlyXP } = await calculateXPStats(userId)
    const dailyAverageXP = Math.round(weeklyXP / 7)

    // Calculate mastery stats
    const allSubtopics = getAllSubtopics()
    const masteredSubtopics = Object.values(studentProgress.subtopics).filter(
      p => p.mastered
    )
    const inProgressSubtopics = Object.values(studentProgress.subtopics).filter(
      p => !p.mastered && p.attemptCount > 0
    )
    
    const topicsMastered = masteredSubtopics.length
    const totalTopics = allSubtopics.length
    const topicsInProgress = inProgressSubtopics.length
    const topicsLocked = totalTopics - topicsMastered - topicsInProgress
    const masteryPercentage = Math.round((topicsMastered / totalTopics) * 100)

    // Get recent activity
    const recentActivity = await getRecentAttempts(userId, 5)

    // Calculate overall accuracy
    const totalAttempts = profileData.totalAttempts || 0
    const totalCorrectAttempts = profileData.totalCorrectAttempts || 0
    const overallAccuracy = totalAttempts > 0 
      ? Math.round((totalCorrectAttempts / totalAttempts) * 100)
      : 0

    return {
      totalXP,
      weeklyXP,
      monthlyXP,
      dailyAverageXP,
      currentStreak: profileData.currentStreak || 0,
      longestStreak: profileData.longestStreak || 0,
      masteryPercentage,
      topicsMastered,
      totalTopics,
      topicsInProgress,
      topicsLocked,
      recentActivity,
      totalAttempts,
      totalCorrectAttempts,
      overallAccuracy,
    }
  } catch (error) {
    console.error('Error getting dashboard summary:', error)
    throw new Error('Failed to get dashboard summary')
  }
}

/**
 * Calculate XP earned in last 7 days and 30 days
 */
async function calculateXPStats(
  userId: string
): Promise<{ weeklyXP: number; monthlyXP: number }> {
  try {
    const attemptsRef = collection(db, 'students', userId, 'attempts')
    const attemptsSnap = await getDocs(attemptsRef)

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    let weeklyXP = 0
    let monthlyXP = 0

    attemptsSnap.forEach(doc => {
      const data = doc.data()
      const attemptDate = data.attemptedAt.toDate()
      const xp = data.xpEarned || 0

      if (attemptDate >= sevenDaysAgo) {
        weeklyXP += xp
      }
      if (attemptDate >= thirtyDaysAgo) {
        monthlyXP += xp
      }
    })

    return { weeklyXP, monthlyXP }
  } catch (error) {
    console.error('Error calculating XP stats:', error)
    return { weeklyXP: 0, monthlyXP: 0 }
  }
}

/**
 * Get progress breakdown by unit
 */
export async function getUnitProgressBreakdown(
  userId: string
): Promise<UnitProgress[]> {
  try {
    const studentProgress = await getStudentProgress(userId)
    const unitProgress: UnitProgress[] = []

    for (const unit of CURRICULUM.units) {
      // Collect all subtopics in this unit
      const unitSubtopics = unit.topics.flatMap(topic => topic.subtopics)
      const totalSubtopics = unitSubtopics.length

      // Count mastered and in-progress
      let masteredCount = 0
      let inProgressCount = 0

      unitSubtopics.forEach(subtopic => {
        const progress = studentProgress.subtopics[subtopic.id]
        if (progress?.mastered) {
          masteredCount++
        } else if (progress && progress.attemptCount > 0) {
          inProgressCount++
        }
      })

      const completionPercentage = Math.round((masteredCount / totalSubtopics) * 100)

      unitProgress.push({
        unitId: unit.id,
        unitName: unit.name,
        totalSubtopics,
        masteredSubtopics: masteredCount,
        inProgressSubtopics: inProgressCount,
        completionPercentage,
      })
    }

    return unitProgress
  } catch (error) {
    console.error('Error getting unit progress breakdown:', error)
    throw new Error('Failed to get unit progress breakdown')
  }
}

/**
 * Get student profile
 */
export async function getStudentProfile(userId: string): Promise<StudentProfile> {
  try {
    const studentRef = doc(db, 'students', userId)
    const studentSnap = await getDoc(studentRef)

    if (!studentSnap.exists()) {
      throw new Error('Student profile not found')
    }

    const data = studentSnap.data()

    return {
      userId: data.userId,
      email: data.email,
      createdAt: data.createdAt.toDate(),
      lastActiveAt: data.lastActiveAt.toDate(),
      totalXP: data.totalXP || 0,
      placementTestCompleted: data.placementTestCompleted || false,
      placementTestScore: data.placementTestScore,
      estimatedLevel: data.estimatedLevel,
      recommendedStartingSubtopic: data.recommendedStartingSubtopic,
      currentStreak: data.currentStreak || 0,
      longestStreak: data.longestStreak || 0,
      totalAttempts: data.totalAttempts || 0,
      totalCorrectAttempts: data.totalCorrectAttempts || 0,
    }
  } catch (error) {
    console.error('Error getting student profile:', error)
    throw new Error('Failed to get student profile')
  }
}

/**
 * Calculate pace rating based on weekly XP
 */
export function getPaceRating(weeklyXP: number): {
  rating: 'excellent' | 'good' | 'fair' | 'needs-improvement'
  label: string
  color: string
} {
  if (weeklyXP >= 200) {
    return {
      rating: 'excellent',
      label: 'Excellent pace! 🌟',
      color: 'green',
    }
  } else if (weeklyXP >= 100) {
    return {
      rating: 'good',
      label: 'Good pace! 👍',
      color: 'blue',
    }
  } else if (weeklyXP >= 40) {
    return {
      rating: 'fair',
      label: 'Keep going! 💪',
      color: 'yellow',
    }
  } else {
    return {
      rating: 'needs-improvement',
      label: 'Try to practice more',
      color: 'gray',
    }
  }
}

/**
 * Get time-based greeting
 */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getDashboardSummary,
  getUnitProgressBreakdown,
  getStudentProfile,
  getPaceRating,
  getGreeting,
}

