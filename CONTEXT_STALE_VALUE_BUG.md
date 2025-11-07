# React Context Stale Value Bug - XP Not Being Awarded

## Problem Statement

We have a practice session system where users solve math problems and earn XP. The session state is managed in a React Context Provider. When a user clicks "Start Practice", a session is created in the context, but when we try to submit the attempt to award XP, the context value still appears as `null`/`false` even though it was just set.

**Result:** XP is not being awarded because the attempt submission code thinks there's no active session.

---

## System Architecture

```
App.tsx (Consumer)
  ├─ Uses usePracticeSession() hook
  ├─ Calls practiceSession.startSession()
  └─ Checks practiceSession.isActive & practiceSession.currentSession

PracticeSessionContext.tsx (Provider)
  ├─ Manages currentSession state
  ├─ Exposes startSession() function
  ├─ Exposes isActive computed from (currentSession !== null)
  └─ Uses useMemo to memoize context value
```

---

## Current Code

### PracticeSessionContext.tsx

```typescript
import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react'
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

  useEffect(() => {
    console.log('🏗️ [PracticeSessionProvider] MOUNTED')
    return () => {
      console.log('💥 [PracticeSessionProvider] UNMOUNTED')
    }
  }, [])

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
    
    setCurrentSession(newSession)  // ⚠️ ASYNC setState
    setLastAttemptResult(null)
    
    console.log('✅ [PracticeSessionProvider] Session started:', newSession)
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
  }, [currentSession, user])

  const endSession = useCallback(() => {
    console.log('🛑 [PracticeSessionProvider] endSession CALLED')
    setCurrentSession(null)
  }, [])

  const clearLastResult = useCallback(() => {
    console.log('🧹 [PracticeSessionProvider] clearLastResult CALLED')
    setLastAttemptResult(null)
  }, [])

  const isActive = currentSession !== null

  // ✅ Memoized to prevent unnecessary re-renders
  const value = useMemo(() => ({
    currentSession,
    lastAttemptResult,
    startSession,
    useHint,
    submitAttempt,
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
```

### App.tsx (Relevant Parts)

```typescript
import { usePracticeSession } from './contexts/PracticeSessionContext'

function App() {
  const practiceSession = usePracticeSession()
  const sessionStartedRef = useRef(false)
  const currentSubtopicRef = useRef<string | null>(null)
  
  // ... other code ...

  const handleStartPractice = async (subtopicId: string) => {
    console.log('🎯 [App] Start practice for subtopic:', subtopicId)
    
    sessionStartedRef.current = false
    currentSubtopicRef.current = subtopicId  // Store in ref
    
    setCurrentView('tutor')
    clearConversation()
    
    const problem = generateProblemForSubtopic(subtopicId)
    
    if (problem) {
      setTimeout(() => {
        handleSendMessage(problem)  // Triggers session start
      }, 100)
    }
  }

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    let messageContent = content
    
    const activeSubtopicId = currentSubtopicRef.current  // Get from ref
    
    console.log('📨 [App] handleSendMessage called:', {
      messagesLength: conversation.messages.length,
      activeSubtopicId,
      currentSubtopicIdState: currentSubtopicId,
      sessionActive: practiceSession.isActive,
      sessionStartedRef: sessionStartedRef.current,
    })
    
    // START SESSION if not started yet
    if (!sessionStartedRef.current && activeSubtopicId) {
      console.log('🎯 [App] Starting practice session for subtopic:', activeSubtopicId)
      
      sessionStartedRef.current = true
      
      // ⚠️ THIS CALLS setCurrentSession in the Provider (async)
      practiceSession.startSession(activeSubtopicId, content, imageUrl)
      
      setCurrentSubtopicId(activeSubtopicId)
      
      // ❌ BUG: This check happens IMMEDIATELY after startSession
      // but the context hasn't re-rendered yet, so values are stale
      console.log('🔍 [App] Immediately after startSession:', {
        isActive: practiceSession.isActive,  // ❌ Still FALSE
        subtopicId: practiceSession.currentSession?.subtopicId || 'null',  // ❌ Still 'null'
      })
      
      console.log('✅ [App] Practice session started successfully (ref now true)')
    } else if (!activeSubtopicId) {
      console.warn('⚠️ [App] No subtopic in ref - XP will not be tracked!')
    } else {
      console.log('✅ [App] Session already started (ref=true), continuing')
    }
    
    // ... code to send message to AI ...
    
    // Process AI response
    const response = await getAIResponse(messageContent, conversationHistory, imageUrl)
    
    // Detect if answer is correct
    const isCorrectAnswer = detectCorrectAnswer(response)
    const isIncorrectAnswer = detectIncorrectAnswer(response)
    
    // ... add messages to conversation ...
    
    // TRY TO SUBMIT ATTEMPT (this is where XP should be awarded)
    console.log('🔍 [App] Practice session status:', {
      isActive: practiceSession.isActive,  // ❌ STILL FALSE (stale value!)
      hasSession: !!practiceSession.currentSession,  // ❌ STILL FALSE
      subtopicId: practiceSession.currentSession?.subtopicId || 'none',
    })
    
    // ❌ THIS CONDITION FAILS because practiceSession values are stale
    if (practiceSession.isActive && practiceSession.currentSession) {
      console.log('🔍 [App] Checking AI response for answer detection...')
      
      if (isCorrectAnswer) {
        console.log('✅ [App] Correct answer detected - submitting attempt')
        
        const result = await practiceSession.submitAttempt(
          messageContent,
          true,
          conversationHistory
        )
        
        if (result) {
          console.log('🎉 [App] XP awarded:', result.xpEarned)
        }
      } else if (isIncorrectAnswer) {
        console.log('❌ [App] Incorrect answer detected - submitting attempt')
        
        await practiceSession.submitAttempt(
          messageContent,
          false,
          conversationHistory
        )
      }
    } else {
      // ❌ THIS BRANCH EXECUTES INSTEAD
      console.warn('⚠️ [App] Practice session is NOT valid - XP will not be awarded')
      console.warn('📊 [App] Session details:', {
        isActive: practiceSession.isActive,
        hasSession: !!practiceSession.currentSession,
        currentSubtopicId,
      })
    }
  }
}
```

---

## Actual Console Logs

Here's what we see in the browser console:

```javascript
🎯 [App] Start practice for subtopic: sub-angles

📨 [App] handleSendMessage called: {
  messagesLength: 0,
  activeSubtopicId: "sub-angles",
  currentSubtopicIdState: null,
  sessionActive: false,
  sessionStartedRef: false
}

🎯 [App] Starting practice session for subtopic: sub-angles

🎯 [PracticeSessionProvider] startSession CALLED
📝 [PracticeSessionProvider] Current state BEFORE: null
✅ [PracticeSessionProvider] Session started: {
  subtopicId: 'sub-angles',
  problemText: "Let's practice Angles & Lines!...",
  startTime: Fri Nov 07 2025 10:24:22 GMT-0800,
  hintsUsed: 0
}

📊 [PracticeSessionProvider] Session state changed: {
  isActive: true,
  subtopicId: 'sub-angles',
  timestamp: '2025-11-07T18:24:22.583Z'
}

📌 [App] Updating currentSubtopicId state to match session: sub-angles

🔍 [App] Immediately after startSession: {
  isActive: false,        // ❌ Should be true!
  subtopicId: 'null'      // ❌ Should be 'sub-angles'!
}

✅ [App] Practice session started successfully (ref now true)

// ... AI responds ...

🔍 [App] Practice session status: {
  isActive: false,        // ❌ Still false!
  hasSession: false,      // ❌ Still false!
  subtopicId: 'none'
}

⚠️ [App] Practice session is NOT valid - XP will not be awarded
📊 [App] Session details: {
  isActive: false,
  hasSession: false,
  currentSubtopicId: null
}
```

---

## The Bug Explained

### Timeline of Events

```
T=0ms: User sends message
  └─ handleSendMessage() starts executing

T=5ms: Check if session started
  └─ sessionStartedRef.current === false
  └─ Condition passes, enter session start block

T=10ms: Call practiceSession.startSession()
  └─ Provider's startSession function executes
  └─ Calls: setCurrentSession(newSession)
  └─ ⚠️ React QUEUES this state update (doesn't apply immediately)
  └─ Console log: "✅ [PracticeSessionProvider] Session started"

T=11ms: Continue executing in App.tsx (SAME render cycle)
  └─ Check: practiceSession.isActive
  └─ ❌ Context hasn't re-rendered yet, so we get OLD value (false)
  └─ Check: practiceSession.currentSession
  └─ ❌ Still OLD value (null)
  └─ Console log: "Immediately after startSession: {isActive: false, ...}"

T=12ms: Continue executing handleSendMessage
  └─ Send message to AI
  └─ Wait for response...

T=500ms: AI response received
  └─ Check: practiceSession.isActive
  └─ ❌ STILL in the same function execution, STILL has old context value
  └─ Condition fails: practiceSession.isActive && practiceSession.currentSession
  └─ XP is not awarded ❌

T=505ms: handleSendMessage completes, returns

T=510ms: React processes state update queue
  └─ Provider re-renders with new currentSession
  └─ Context value updates: isActive = true, currentSession = {...}
  └─ ⏰ Too late! handleSendMessage already finished
```

### Why This Happens

1. **`setCurrentSession(newSession)` is asynchronous** - React batches state updates
2. **`handleSendMessage` is synchronous** - it executes from top to bottom without stopping
3. **Context values are captured at render time** - they don't update mid-function
4. **The function finishes before React re-renders** - so it never sees the new values

### Visual Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  handleSendMessage() - Single Synchronous Execution         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. practiceSession.startSession(...)                       │
│     ├─ Provider: setCurrentSession(newSession) ⏳ Queued    │
│     └─ Provider logs: "Session started" ✅                  │
│                                                              │
│  2. console.log(practiceSession.isActive)                   │
│     └─ ❌ Returns FALSE (old value from current render)    │
│                                                              │
│  3. Call AI API...                                          │
│                                                              │
│  4. Get response                                            │
│                                                              │
│  5. if (practiceSession.isActive)                           │
│     └─ ❌ STILL FALSE (same function execution context)    │
│                                                              │
│  6. XP not awarded ❌                                       │
│                                                              │
│  7. Function ends                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  React re-renders (AFTER handleSendMessage completes)       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  - Provider state updated: currentSession = {...}           │
│  - Context value updated: isActive = true                   │
│  - Consumers re-render with new values                      │
│                                                              │
│  ⏰ But it's too late - XP logic already executed           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Why This Is Tricky

### The Closure Problem

```typescript
const handleSendMessage = async (content: string, imageUrl?: string) => {
  // practiceSession is captured from THIS render
  const practiceSession = usePracticeSession()
  
  // This triggers a state update that will cause NEXT render
  practiceSession.startSession(...)
  
  // But THIS function is still executing with OLD practiceSession value
  if (practiceSession.isActive) {  // ❌ Old value
    // ...
  }
  
  // Even though we await here, the practiceSession variable
  // doesn't magically update - it's from the original render
  const response = await getAIResponse(...)
  
  if (practiceSession.isActive) {  // ❌ STILL old value
    // ...
  }
}
```

### useMemo Doesn't Help

The Provider has `useMemo` to optimize re-renders:

```typescript
const value = useMemo(() => ({
  currentSession,
  isActive: currentSession !== null,
  // ...
}), [currentSession, ...])
```

This creates a new context value when `currentSession` changes, but that new value only propagates to consumers **on the next render**.

---

## Attempted Fixes and Why They Didn't Work

### Attempt 1: Using refs
```typescript
const currentSubtopicRef = useRef<string | null>(null)
```

**Status:** Helps with tracking subtopic, but doesn't solve the stale context value issue.

### Attempt 2: Moving to Context Provider
```typescript
// Moved session state from hook to Context
```

**Status:** State persists correctly, but consumers still read stale values within the same function execution.

### Attempt 3: Using sessionStartedRef
```typescript
const sessionStartedRef = useRef(false)
```

**Status:** Helps track IF session should be active, but doesn't help with accessing session data.

---

## What We Need

We need ONE of these solutions:

### Solution A: Trust the Ref Instead of Context

Use `sessionStartedRef.current` instead of `practiceSession.isActive` for the submission check:

```typescript
// Instead of:
if (practiceSession.isActive && practiceSession.currentSession) {
  await practiceSession.submitAttempt(...)
}

// Do this:
if (sessionStartedRef.current && currentSubtopicRef.current) {
  await practiceSession.submitAttempt(...)  // submitAttempt has its own guards
}
```

**Pros:**
- Simple change
- Refs are always current
- No timing issues

**Cons:**
- Relies on ref flag instead of actual session state
- submitAttempt might still see null session (needs internal guards)

### Solution B: Move Submission Logic to useEffect

Run submission logic AFTER context updates:

```typescript
const [pendingAttempt, setPendingAttempt] = useState(null)

// In handleSendMessage:
if (isCorrectAnswer || isIncorrectAnswer) {
  setPendingAttempt({ response: messageContent, isCorrect: isCorrectAnswer })
}

// In useEffect:
useEffect(() => {
  if (pendingAttempt && practiceSession.isActive && practiceSession.currentSession) {
    practiceSession.submitAttempt(pendingAttempt.response, pendingAttempt.isCorrect, ...)
    setPendingAttempt(null)
  }
}, [pendingAttempt, practiceSession.isActive, practiceSession.currentSession])
```

**Pros:**
- Waits for context to update
- Uses actual session state
- React-idiomatic

**Cons:**
- More complex
- Requires additional state management

### Solution C: Return Promise from startSession

Make `startSession` return a promise that resolves with the session:

```typescript
// In Provider:
const startSession = useCallback((subtopicId: string, problemText: string, imageUrl?: string) => {
  return new Promise((resolve) => {
    const newSession = {
      subtopicId,
      problemText,
      startTime: new Date(),
      hintsUsed: 0,
      problemImageUrl: imageUrl,
    }
    
    setCurrentSession(newSession)
    
    // Resolve on next tick after state is set
    setTimeout(() => resolve(newSession), 0)
  })
}, [])

// In App.tsx:
await practiceSession.startSession(activeSubtopicId, content, imageUrl)
// Now we can be more confident the session is set
```

**Pros:**
- More explicit about async nature
- Can await before checking

**Cons:**
- setTimeout(0) is a hack
- Doesn't guarantee React has re-rendered
- Still might have stale context value

### Solution D: Pass Session Data Directly to submitAttempt

Don't rely on context at all for submission:

```typescript
// In App.tsx:
if (sessionStartedRef.current && currentSubtopicRef.current) {
  await practiceSession.submitAttempt(
    messageContent,
    isCorrectAnswer,
    conversationHistory,
    currentSubtopicRef.current  // ← Pass subtopic directly
  )
}

// In Provider:
const submitAttempt = useCallback(async (
  studentResponse: string,
  isCorrect: boolean,
  conversationHistory: any[],
  subtopicId: string  // ← Accept as parameter
) => {
  // Use passed subtopicId instead of relying on currentSession
  // ...
}, [user])
```

**Pros:**
- No dependency on context state timing
- Explicit data passing
- Works reliably

**Cons:**
- Changes API signature
- Duplicates data (stored in context AND passed as param)

---

## Recommended Solution

**I recommend Solution A + D combined:**

1. Use `sessionStartedRef.current` for the guard condition
2. Pass `currentSubtopicRef.current` to `submitAttempt`
3. Update `submitAttempt` to accept optional `subtopicId` parameter (fallback to `currentSession.subtopicId`)

This gives us:
- ✅ No timing issues (refs are always current)
- ✅ Simple implementation
- ✅ Backwards compatible (optional parameter)
- ✅ Reliable XP awarding

---

## Question for AI Assistant

**Given this analysis, what is the best way to fix this React Context stale value bug?**

The core issue is:
1. We call `startSession()` which does `setCurrentSession(newSession)`
2. We immediately check `practiceSession.isActive` in the same function
3. The context hasn't re-rendered yet, so we get stale values
4. XP is not awarded because the guard condition fails

Should we:
- A) Use refs instead of context values for guard conditions?
- B) Move submission logic to useEffect?
- C) Restructure the flow entirely?
- D) Something else?

Please provide code examples showing the fix.

