# Practice Session Context Bug - Still Resetting to Null

## Problem Statement

I have a React + TypeScript app with a practice session system. Even after refactoring to use a Context Provider at the root level, the practice session is STILL getting set to `null`/`false` after a few messages, preventing XP tracking.

**Critical Symptom from Console Logs**:
```
🔍 [App] Check practice session start: {
  messagesLength: 4,
  currentSubtopicId: 'sub-angles',
  explicitSubtopicId: undefined,
  activeSubtopicId: 'sub-angles',
  isActive: false                    // ❌ STILL FALSE!
}
⚠️ [App] Practice session is NOT active - XP will not be awarded
📊 [App] Current subtopicId: sub-angles
🔍 [App] Practice session active? false
🔍 [App] Current session: null      // ❌ STILL NULL!
```

---

## Architecture

### Provider Hierarchy (main.tsx)

```typescript
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider, ConversationProvider, PracticeSessionProvider } from './contexts'
import { ErrorBoundary } from './components/Layout'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <PracticeSessionProvider>      // 🆕 Added this
          <ConversationProvider>
            <App />
          </ConversationProvider>
        </PracticeSessionProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
```

---

## Current Implementation

### 1. PracticeSessionContext.tsx (Context Provider)

```typescript
// src/contexts/PracticeSessionContext.tsx

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

  const startSession = useCallback((subtopicId: string, problemText: string, imageUrl?: string) => {
    console.log('🎯 [Practice] Starting session for subtopic:', subtopicId)
    
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
  }, [])

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

    if (!currentSession || !userId) {
      console.warn('⚠️ [Practice] Cannot submit attempt')
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

      setLastAttemptResult(result)
      
      // Only clear session if answer was correct
      if (isCorrect) {
        console.log('✅ [Practice] Correct answer - ending session')
        setCurrentSession(null)
      } else {
        console.log('⏳ [Practice] Incorrect answer - keeping session active')
      }
      
      return result
    } catch (error) {
      console.error('❌ [Practice] Error recording attempt:', error)
      return null
    }
  }, [currentSession, user])

  const endSession = useCallback(() => {
    console.log('🛑 [Practice] Ending session')
    setCurrentSession(null)
  }, [])

  const clearLastResult = useCallback(() => {
    console.log('🧹 [Practice] Clearing last attempt result')
    setLastAttemptResult(null)
  }, [])

  const isActive = currentSession !== null

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
```

---

### 2. App.tsx (Consumer)

```typescript
// src/App.tsx (relevant parts)

import { useEffect, useState } from 'react'
import { useConversation, useAuth, usePracticeSession } from './contexts'
import { generateProblemForSubtopic } from './utils/problemGenerator'
import { getSubtopicById } from './data/curriculum'

function App() {
  const { user } = useAuth()
  const [currentSubtopicId, setCurrentSubtopicId] = useState<string | null>(null)
  const {
    conversation,
    addMessage,
    clearConversation,
    setStatus,
    // ...
  } = useConversation()
  
  const practiceSession = usePracticeSession()  // 🔴 Get from context

  // User clicks "Start Practice" button
  const handleStartPractice = async (subtopicId: string) => {
    console.log('🎯 [App] Start practice for subtopic:', subtopicId)
    setCurrentSubtopicId(subtopicId)
    setCurrentView('tutor')
    clearConversation()  // 🔴 Clear messages
    
    const problem = generateProblemForSubtopic(subtopicId)
    
    if (problem) {
      setTimeout(() => {
        handleSendMessage(problem, undefined, subtopicId)
      }, 100)
    }
  }

  // Handle sending messages
  const handleSendMessage = async (content: string, imageUrl?: string, explicitSubtopicId?: string) => {
    const activeSubtopicId = explicitSubtopicId || currentSubtopicId
    
    // Check and start session if needed
    console.log('🔍 [App] Check practice session:', {
      messagesLength: conversation.messages.length,
      currentSubtopicId,
      explicitSubtopicId,
      activeSubtopicId,
      isActive: practiceSession.isActive    // 🔴 This is FALSE when it should be TRUE
    })
    
    if (!practiceSession.isActive && activeSubtopicId) {
      console.log('🎯 [App] Starting practice session for subtopic:', activeSubtopicId)
      practiceSession.startSession(activeSubtopicId, content, imageUrl)
      console.log('✅ [App] Practice session started successfully')
    }
    
    // Add message
    addMessage(content, 'user')
    
    // ... send to AI, get response ...
    
    // Try to record attempt
    if (practiceSession.isActive) {
      // This block never runs because isActive is false!
      const attemptResult = await practiceSession.submitAttempt(...)
    } else {
      console.warn('⚠️ [App] Practice session is NOT active - XP will not be awarded')
    }
  }

  return (
    <div>
      {/* UI that uses practiceSession */}
      {practiceSession.lastAttemptResult && (
        <XPFeedback
          result={practiceSession.lastAttemptResult}
          onClose={() => {
            practiceSession.clearLastResult()
            setCurrentSubtopicId(null)
          }}
        />
      )}
    </div>
  )
}
```

---

### 3. ConversationContext (Message Management)

```typescript
// src/contexts/ConversationContext.tsx

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

const initialState = {
  conversationId: crypto.randomUUID(),
  messages: [],
  problemText: '',
  status: 'idle',
  stuckCount: 0,
}

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [conversation, setConversation] = useState(initialState)

  const addMessage = useCallback((content: string, sender: 'user' | 'assistant', ...) => {
    const newMessage = {
      id: crypto.randomUUID(),
      sender,
      content,
      timestamp: new Date(),
    }

    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      problemText: prev.problemText || (sender === 'user' ? content : ''),
    }))
  }, [])

  const clearConversation = useCallback(() => {
    setConversation({
      ...initialState,
      conversationId: crypto.randomUUID(),
    })
  }, [])

  return (
    <ConversationContext.Provider value={{ conversation, addMessage, clearConversation, ... }}>
      {children}
    </ConversationContext.Provider>
  )
}
```

---

## Console Logs from Actual Run

**Timeline of what happens:**

```
1. User clicks "Start Practice"
   └─ 🎯 [App] Start practice for subtopic: sub-angles

2. clearConversation() is called
   └─ Messages reset to []

3. setTimeout fires, handleSendMessage() called
   └─ 🔍 [App] Check practice session: { messagesLength: 0, isActive: false }
   └─ 🎯 [App] Starting practice session for subtopic: sub-angles
   └─ ✅ [App] Practice session started successfully

4. Message is added to conversation
   └─ addMessage() called
   └─ messages.length = 1

5. AI responds, second message added
   └─ messages.length = 2

6. ✅ Conversation saved successfully!

7. User types second message "115"
   └─ 🔍 [App] Check practice session: { messagesLength: 4, isActive: false }  // ❌ NOW IT'S FALSE
   └─ ⚠️ [App] Practice session is NOT active - XP will not be awarded
   └─ 🔍 [App] Current session: null                                           // ❌ SESSION IS NULL
```

---

## Critical Questions

1. **Why is `practiceSession.isActive` false on the second user message?**
   - Session was started successfully
   - `setCurrentSession(newSession)` was called in the Context Provider
   - But by the time the next message comes, it's `null` again

2. **Is the Context Provider re-mounting?**
   - It shouldn't be - it's at the root level
   - But something is causing the state to reset

3. **Could `clearConversation()` be affecting PracticeSessionContext?**
   - They're separate contexts
   - But is there some interaction?

4. **Is React.StrictMode causing double-renders that reset state?**
   - StrictMode in dev mode calls effects twice
   - Could this be resetting the Context state?

5. **Are there any hidden calls to `endSession()` or `setCurrentSession(null)`?**
   - Need to find where session is being cleared
   - Only places that call `setCurrentSession(null)`:
     - `submitAttempt()` when `isCorrect === true`
     - `endSession()` 

6. **Is the PracticeSessionProvider being unmounted/remounted?**
   - If provider unmounts, all state is lost
   - But why would it unmount if it's at root level?

---

## What We've Tried

### Attempt 1: Fixed message length condition
- Changed from `messages.length === 0` to `!practiceSession.isActive`
- **Result**: Session still becomes null

### Attempt 2: Moved to Context Provider
- Created `PracticeSessionProvider` at root level
- Moved all state out of App component
- **Result**: Session STILL becomes null (current issue)

### Attempt 3: Explicit subtopic passing
- Pass `subtopicId` directly to avoid state timing
- **Result**: First message works, session still lost after

---

## Debugging Clues Needed

1. **Add logging to PracticeSessionProvider to track ALL state changes**
   - When does `currentSession` get set to `null`?
   - Is `startSession` actually being called?
   - Is something calling `endSession` unexpectedly?

2. **Add logging to detect Provider re-mounts**
   - Add `useEffect(() => { console.log('Provider mounted') })` in PracticeSessionProvider
   - Does it log more than once?

3. **Check if Context value is stale**
   - Is the Context value getting recreated on every render?
   - Should we memoize the Context value?

4. **Investigate React.StrictMode**
   - Could double-rendering in dev mode be causing issues?
   - Try removing StrictMode temporarily to test

5. **Check for hidden side effects**
   - Is anything else calling `setCurrentSession(null)`?
   - Search entire codebase for `endSession` calls

---

## Expected vs Actual Behavior

### Expected:
```
1. Click "Start Practice"
2. practiceSession.startSession() called
3. currentSession = { subtopicId: 'sub-angles', ... }
4. isActive = true ✅
5. Send message 1
6. isActive still true ✅
7. Send message 2
8. isActive still true ✅
9. Send message 3 (correct answer)
10. Submit attempt, award XP ✅
11. isActive becomes false (session ends) ✅
```

### Actual:
```
1. Click "Start Practice"
2. practiceSession.startSession() called
3. currentSession = { subtopicId: 'sub-angles', ... }
4. isActive = true ✅
5. Send message 1
6. isActive = true ✅
7. Send message 2
8. isActive = FALSE ❌ (WHY?!)
9. currentSession = null ❌ (WHY?!)
10. XP tracking skipped ❌
```

---

## Code to Add for Debugging

### In PracticeSessionContext.tsx:

```typescript
export function PracticeSessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null)
  
  // 🔍 DEBUG: Track when provider mounts/unmounts
  useEffect(() => {
    console.log('🏗️ [PracticeSessionProvider] MOUNTED')
    return () => {
      console.log('💥 [PracticeSessionProvider] UNMOUNTED')
    }
  }, [])
  
  // 🔍 DEBUG: Track all state changes
  useEffect(() => {
    console.log('📊 [PracticeSessionProvider] State changed:', {
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
    console.log('✅ [PracticeSessionProvider] Session set to:', newSession)
  }, [currentSession])  // 🔴 QUESTION: Should currentSession be in deps?
  
  // ... rest of provider
}
```

---

## Questions for AI Assistant

1. **Why would `currentSession` become `null` between messages?**
   - It's in a Context Provider at root level
   - Should persist across renders
   - What could be resetting it?

2. **Is there a flaw in how the Context Provider is structured?**
   - Dependencies in `useCallback`?
   - Missing memoization?
   - Stale closures?

3. **Could `clearConversation()` be affecting the practice session somehow?**
   - They're in separate contexts
   - But called at the same time in `handleStartPractice`

4. **Should the Context value be memoized?**
   ```typescript
   const value = useMemo(() => ({
     currentSession,
     lastAttemptResult,
     startSession,
     // ...
   }), [currentSession, lastAttemptResult, startSession, ...])
   ```

5. **Is React.StrictMode causing the issue?**
   - Double-rendering in dev mode
   - Could this be resetting state?

---

## What I Need

Please help me:
1. Identify why `currentSession` is becoming `null`
2. Find any hidden calls to `setCurrentSession(null)` or `endSession()`
3. Fix the Context Provider so state persists reliably
4. Ensure `practiceSession.isActive` stays `true` throughout the conversation

The session MUST stay active from when "Start Practice" is clicked until the student gives a correct final answer.

Thank you!

