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

import { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react'
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

  // 🔍 DEBUG: Track provider lifecycle
  useEffect(() => {
    console.log('🏗️ [PracticeSessionProvider] MOUNTED')
    return () => {
      console.log('💥 [PracticeSessionProvider] UNMOUNTED')
    }
  }, [])

  // 🔍 DEBUG: Track all state changes
  useEffect(() => {
    console.log('📊 [PracticeSessionProvider] Session state changed:', {
      isActive: currentSession !== null,
      subtopicId: currentSession?.subtopicId || null,
      timestamp: new Date().toISOString(),
    })
  }, [currentSession])

  const startSession = useCallback((subtopicId: string, problemText: string, imageUrl?: string) => {
    console.log('🎯 [PracticeSessionProvider] startSession CALLED')
    console.log('📝 [PracticeSessionProvider] Current state BEFORE:', currentSession)
    
    const newSession: PracticeSession = {
      subtopicId,
      problemText,
      startTime: new Date(),
      hintsUsed: 0,
      problemImageUrl: imageUrl,
    }
    
    setCurrentSession(newSession)
    setLastAttemptResult(null)
    
    console.log('✅ [PracticeSessionProvider] Session started:', newSession)
  }, [])  // ✅ FIXED: Empty deps - startSession is stable

  const useHint = useCallback(() => {
    setCurrentSession(prev => {
      if (!prev) return prev
      return {
        ...prev,
        hintsUsed: prev.hintsUsed + 1,
      }
    })
  }, [])

  const submitAttempt = useCallback(async (
    studentResponse: string,
    isCorrect: boolean,
    conversationHistory?: any[]
  ): Promise<AttemptResult | null> => {
    const userId = user?.uid

    console.log('📤 [PracticeSessionProvider] submitAttempt CALLED', {
      hasSession: currentSession !== null,
      hasUser: !!userId,
      isCorrect,
    })

    if (!currentSession || !userId) {
      console.warn('⚠️ [PracticeSessionProvider] Cannot submit attempt - missing session or user')
      return null
    }

    const timeSpent = Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000)

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

      console.log('✅ [PracticeSessionProvider] Attempt recorded:', result)
      setLastAttemptResult(result)
      
      // Only clear session if answer was correct
      if (isCorrect) {
        console.log('✅ [PracticeSessionProvider] Correct answer - ending session')
        setCurrentSession(null)
      } else {
        console.log('⏳ [PracticeSessionProvider] Incorrect answer - keeping session active')
      }
      
      return result
    } catch (error) {
      console.error('❌ [PracticeSessionProvider] Error recording attempt:', error)
      return null
    }
  }, [currentSession, user])  // ✅ KEEP deps - needs current session & user

  const endSession = useCallback(() => {
    console.log('🛑 [PracticeSessionProvider] endSession CALLED')
    setCurrentSession(null)
  }, [])

  const clearLastResult = useCallback(() => {
    console.log('🧹 [PracticeSessionProvider] clearLastResult CALLED')
    setLastAttemptResult(null)
  }, [])

  const isActive = currentSession !== null

  // ✅ CRITICAL FIX: Memoize context value to prevent unnecessary re-renders
  // Without this, the value object is recreated on every render, causing
  // all consumers to re-render, which can trigger unintended logic
  const value = useMemo(() => ({
    currentSession,
    lastAttemptResult,
    startSession,
    useHint,
    submitAttempt,  // This changes when currentSession changes (has [currentSession, user] deps)
    endSession,
    clearLastResult,
    isActive,
  }), [currentSession, lastAttemptResult, startSession, useHint, submitAttempt, endSession, clearLastResult, isActive])

  return (
    <PracticeSessionContext.Provider value={value}>
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
