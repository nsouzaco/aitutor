/**
 * usePracticeSession - Hook to manage practice sessions with progress tracking
 * 
 * Tracks:
 * - Current subtopic being practiced
 * - Start time for each attempt
 * - Hints used
 * - Problem context
 */

import { useState, useCallback } from 'react'
import { recordAttempt } from '../services/attemptService'
import { AttemptResult } from '../types/attempt'

interface PracticeSession {
  subtopicId: string | null
  problemText: string
  startTime: Date
  hintsUsed: number
  problemImageUrl?: string
}

export function usePracticeSession(userId: string | null) {
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null)
  const [lastAttemptResult, setLastAttemptResult] = useState<AttemptResult | null>(null)

  /**
   * Start a new practice session for a specific subtopic
   */
  const startSession = useCallback((subtopicId: string, problemText: string, imageUrl?: string) => {
    console.log('🎯 [Practice] Starting session for subtopic:', subtopicId)
    setCurrentSession({
      subtopicId,
      problemText,
      startTime: new Date(),
      hintsUsed: 0,
      problemImageUrl: imageUrl,
    })
    setLastAttemptResult(null)
  }, [])

  /**
   * Increment hint count
   */
  const useHint = useCallback(() => {
    if (!currentSession) return
    
    setCurrentSession(prev => {
      if (!prev) return prev
      return {
        ...prev,
        hintsUsed: prev.hintsUsed + 1,
      }
    })
    console.log('💡 [Practice] Hint used, total:', (currentSession.hintsUsed || 0) + 1)
  }, [currentSession])

  /**
   * Record the attempt when student submits answer
   */
  const submitAttempt = useCallback(async (
    studentResponse: string,
    isCorrect: boolean,
    conversationHistory?: any[]
  ): Promise<AttemptResult | null> => {
    if (!currentSession || !userId) {
      console.warn('⚠️ [Practice] Cannot submit attempt: no active session or user')
      return null
    }

    const timeSpent = Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000)
    
    console.log('📝 [Practice] Submitting attempt:', {
      subtopicId: currentSession.subtopicId,
      isCorrect,
      timeSpent,
      hintsUsed: currentSession.hintsUsed,
    })

    try {
      const result = await recordAttempt(
        userId,
        currentSession.subtopicId!,
        currentSession.problemText,
        studentResponse,
        isCorrect,
        timeSpent,
        currentSession.hintsUsed,
        currentSession.problemImageUrl,
        conversationHistory
      )

      console.log('✅ [Practice] Attempt recorded:', result)
      setLastAttemptResult(result)
      
      // Clear session after recording
      setCurrentSession(null)
      
      return result
    } catch (error) {
      console.error('❌ [Practice] Error recording attempt:', error)
      return null
    }
  }, [currentSession, userId])

  /**
   * End session without recording (e.g., user navigates away)
   */
  const endSession = useCallback(() => {
    console.log('🛑 [Practice] Ending session')
    setCurrentSession(null)
  }, [])

  /**
   * Clear last attempt result
   */
  const clearLastResult = useCallback(() => {
    setLastAttemptResult(null)
  }, [])

  return {
    currentSession,
    lastAttemptResult,
    startSession,
    useHint,
    submitAttempt,
    endSession,
    clearLastResult,
    isActive: currentSession !== null,
  }
}

