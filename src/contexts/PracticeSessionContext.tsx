/**
 * PracticeSessionContext - Persistent practice session state management
 * 
 * This context provider ensures practice session state persists across
 * component re-renders and re-mounts. The state lives at the app root level.
 * 
 * Tracks:
 * - Current subtopic being practiced
 * - Start time for each attempt
 * - Hints used
 * - Problem context
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { recordAttempt } from '../services/attemptService'
import { AttemptResult } from '../types/attempt'
import { useAuth } from './AuthContext'

interface PracticeSession {
  subtopicId: string | null
  problemText: string
  startTime: Date
  hintsUsed: number
  problemImageUrl?: string
}

interface PracticeSessionContextType {
  currentSession: PracticeSession | null
  lastAttemptResult: AttemptResult | null
  startSession: (subtopicId: string, problemText: string, imageUrl?: string) => void
  useHint: () => void
  submitAttempt: (studentResponse: string, isCorrect: boolean, conversationHistory?: any[]) => Promise<AttemptResult | null>
  endSession: () => void
  clearLastResult: () => void
  isActive: boolean
}

const PracticeSessionContext = createContext<PracticeSessionContextType | undefined>(undefined)

export function PracticeSessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null)
  const [lastAttemptResult, setLastAttemptResult] = useState<AttemptResult | null>(null)

  /**
   * Start a new practice session for a specific subtopic
   */
  const startSession = useCallback((subtopicId: string, problemText: string, imageUrl?: string) => {
    console.log('🎯 [Practice] Starting session for subtopic:', subtopicId)
    console.log('📝 [Practice] Problem text:', problemText.substring(0, 100))
    console.log('🖼️ [Practice] Has image:', !!imageUrl)
    
    const newSession: PracticeSession = {
      subtopicId,
      problemText,
      startTime: new Date(),
      hintsUsed: 0,
      problemImageUrl: imageUrl,
    }
    
    setCurrentSession(newSession)
    setLastAttemptResult(null)
    
    console.log('✅ [Practice] Session started successfully')
    console.log('📊 [Practice] Session details:', {
      subtopicId: newSession.subtopicId,
      startTime: newSession.startTime.toISOString(),
      hintsUsed: newSession.hintsUsed,
    })
  }, [])

  /**
   * Increment hint count
   */
  const useHint = useCallback(() => {
    setCurrentSession(prev => {
      if (!prev) {
        console.warn('⚠️ [Practice] Cannot use hint: no active session')
        return prev
      }
      
      const updatedSession = {
        ...prev,
        hintsUsed: prev.hintsUsed + 1,
      }
      
      console.log('💡 [Practice] Hint used, total:', updatedSession.hintsUsed)
      return updatedSession
    })
  }, [])

  /**
   * Record the attempt when student submits answer
   */
  const submitAttempt = useCallback(async (
    studentResponse: string,
    isCorrect: boolean,
    conversationHistory?: any[]
  ): Promise<AttemptResult | null> => {
    const userId = user?.uid

    if (!currentSession || !userId) {
      console.warn('⚠️ [Practice] Cannot submit attempt:', {
        hasSession: !!currentSession,
        hasUserId: !!userId,
      })
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
      
      // Only clear session if answer was correct (problem solved)
      // Keep session active for incorrect attempts so student can keep trying
      if (isCorrect) {
        console.log('✅ [Practice] Correct answer - ending session')
        setCurrentSession(null)
      } else {
        console.log('⏳ [Practice] Incorrect answer - keeping session active for retry')
      }
      
      return result
    } catch (error) {
      console.error('❌ [Practice] Error recording attempt:', error)
      return null
    }
  }, [currentSession, user])

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
    console.log('🧹 [Practice] Clearing last attempt result')
    setLastAttemptResult(null)
  }, [])

  // Computed property for whether session is active
  const isActive = currentSession !== null

  // Log state changes for debugging
  console.log('🔄 [PracticeSessionContext] State update:', {
    isActive,
    subtopicId: currentSession?.subtopicId || null,
    hasLastResult: !!lastAttemptResult,
  })

  return (
    <PracticeSessionContext.Provider
      value={{
        currentSession,
        lastAttemptResult,
        startSession,
        useHint,
        submitAttempt,
        endSession,
        clearLastResult,
        isActive,
      }}
    >
      {children}
    </PracticeSessionContext.Provider>
  )
}

export function usePracticeSession() {
  const context = useContext(PracticeSessionContext)
  if (!context) {
    throw new Error('usePracticeSession must be used within PracticeSessionProvider')
  }
  return context
}

