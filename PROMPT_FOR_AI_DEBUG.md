# Practice Session XP Tracking Bug - Help Needed

## Problem Statement

I'm building an AI math tutor application with React + TypeScript. Students click "Start Practice" on a topic, solve problems in a conversation, and should earn XP when they get correct answers. 

**The bug**: The practice session keeps getting set to `false`/`null` after the first message, preventing XP from being tracked and awarded.

**Expected behavior**: 
- User clicks "Start Practice" → Session starts → Session stays ACTIVE throughout entire conversation → User gives correct final answer → XP is awarded and saved to Firestore

**Actual behavior**: 
- User clicks "Start Practice" → Session starts (maybe) → Session becomes null/inactive after 1-2 messages → XP is never awarded

---

## Architecture Overview

### Tech Stack
- React 18 + TypeScript
- Firebase Firestore for data persistence
- Context API for conversation state
- Custom hooks for practice session management
- OpenAI API for AI tutor responses

### Key Components Flow

```
User clicks "Start Practice"
  ↓
handleStartPractice() called with subtopicId
  ↓
clearConversation() - resets messages to []
  ↓
generateProblemForSubtopic() - creates problem text
  ↓
handleSendMessage(problem, undefined, subtopicId) - sends first message
  ↓
Check: Should session start?
  ↓
practiceSession.startSession(subtopicId, problem, imageUrl) - initialize session
  ↓
Session should stay ACTIVE for entire conversation
  ↓
When user gives final answer:
  ↓
detectCorrectAnswer(aiResponse) - check for [CORRECT] marker
  ↓
practiceSession.submitAttempt() - record attempt
  ↓
recordAttempt() → calculateXP() → updateStudentXP() - award XP
```

---

## Current Code Snippets

### 1. handleStartPractice (App.tsx)

```typescript
const handleStartPractice = async (subtopicId: string) => {
  console.log('🎯 [App] Start practice for subtopic:', subtopicId)
  setCurrentSubtopicId(subtopicId)      // React state update (async)
  setCurrentView('tutor')                // React state update (async)
  clearConversation()                    // React state update (async) - sets messages: []
  
  // Generate problem from curriculum data
  const problem = generateProblemForSubtopic(subtopicId)
  
  if (problem) {
    console.log('📝 [App] Auto-generated problem:', problem)
    // Wait for view/state to update, then send message
    setTimeout(() => {
      handleSendMessage(problem, undefined, subtopicId)  // Pass subtopicId directly
    }, 100)
  } else {
    // Fallback if no examples in curriculum
    console.error('❌ [App] No problem could be generated for subtopic:', subtopicId)
    const subtopic = getSubtopicById(subtopicId)
    const fallbackMessage = subtopic 
      ? `Let's practice ${subtopic.name}! What problem would you like to work on?`
      : `Let's start practicing! What problem would you like to work on?`
    
    setTimeout(() => {
      handleSendMessage(fallbackMessage, undefined, subtopicId)
    }, 100)
  }
}
```

### 2. handleSendMessage (App.tsx)

```typescript
const handleSendMessage = async (content: string, imageUrl?: string, explicitSubtopicId?: string) => {
  let messageContent = content
  
  // Use explicit subtopicId if provided, otherwise use state
  const activeSubtopicId = explicitSubtopicId || currentSubtopicId
  
  // 🔧 Session start logic
  console.log('🔍 [App] Check practice session:', {
    messagesLength: conversation.messages.length,
    currentSubtopicId,
    explicitSubtopicId,
    activeSubtopicId,
    isActive: practiceSession.isActive
  })
  
  // Start session if not active AND subtopic is selected
  if (!practiceSession.isActive && activeSubtopicId) {
    console.log('🎯 [App] Starting practice session for subtopic:', activeSubtopicId)
    console.log('📝 [App] Session will track XP from this point forward')
    
    practiceSession.startSession(activeSubtopicId, content, imageUrl)
    
    if (explicitSubtopicId && explicitSubtopicId !== currentSubtopicId) {
      console.log('📌 [App] Updating currentSubtopicId to:', explicitSubtopicId)
      setCurrentSubtopicId(explicitSubtopicId)
    }
    
    console.log('✅ [App] Practice session started successfully')
  } else if (!activeSubtopicId) {
    console.warn('⚠️ [App] No subtopic selected - XP will not be tracked!')
  } else {
    console.log('✅ [App] Practice session already active for subtopic:', activeSubtopicId)
  }
  
  // Add message to conversation
  if (imageUrl) {
    setStatus('thinking')
  }

  if (imageUrl) {
    try {
      const base64Data = imageUrl.split(',')[1]
      const extractedText = await extractTextFromImage(base64Data, false)
      messageContent = content ? `${content}\n\n${extractedText}` : `Problem from image: ${extractedText}`
      addMessage(messageContent, 'user', 'text', imageUrl)
    } catch (error: any) {
      addMessage(`I had trouble reading the image. ${error.message || 'Please try again.'}`, 'assistant')
      setStatus('idle')
      return
    }
  } else {
    addMessage(messageContent, 'user')
  }

  setStatus('thinking')

  try {
    // Build conversation context and get AI response
    const messages = buildConversationContext([...conversation.messages, {
      id: 'temp',
      sender: 'user',
      content: messageContent,
      timestamp: new Date(),
    }], conversation.stuckCount, false)

    const response = await sendMessage({ messages })

    // Detect answer validation BEFORE stripping markers
    const isCorrectAnswer = detectCorrectAnswer(response)
    const isIncorrectAnswer = detectIncorrectAnswer(response)

    // Strip [CORRECT]/[INCORRECT] markers for display
    const displayResponse = stripValidationMarkers(response)
    const isCelebration = detectCelebration(displayResponse)

    // Add AI response
    addMessage(displayResponse, 'assistant', isCelebration ? 'celebration' : undefined)

    // Track hints
    if (practiceSession.isActive && isAskingQuestion(displayResponse)) {
      practiceSession.useHint()
    }

    // 🔴 XP TRACKING LOGIC
    console.log('🔍 [App] Practice session active?', practiceSession.isActive)
    console.log('🔍 [App] Current session:', practiceSession.currentSession)
    
    if (practiceSession.isActive) {
      console.log('🔍 [App] Checking AI response for answer detection...')
      console.log('📝 [App] AI Response (with markers):', response.substring(0, 100))
      
      console.log(`🎯 [App] Detection results - Correct: ${isCorrectAnswer}, Incorrect: ${isIncorrectAnswer}`)
      
      if (isCorrectAnswer || isIncorrectAnswer) {
        console.log(`${isCorrectAnswer ? '✅' : '❌'} [App] Answer detected as ${isCorrectAnswer ? 'correct' : 'incorrect'}`)
        
        // Record the attempt
        const attemptResult = await practiceSession.submitAttempt(
          messageContent,
          isCorrectAnswer,
          conversation.messages
        )
        
        console.log('📊 [App] Attempt result:', attemptResult)
        
        if (attemptResult) {
          console.log('🎉 [App] Attempt recorded successfully, XP:', attemptResult.xpEarned)
          // Refresh Header XP
          if ((window as any).refreshHeaderXP) {
            setTimeout(() => (window as any).refreshHeaderXP(), 500)
          }
        } else {
          console.error('❌ [App] Attempt result was null!')
        }
      } else {
        console.log('⏳ [App] No final answer detected yet, continuing conversation')
      }
    } else {
      console.warn('⚠️ [App] Practice session is NOT active - XP will not be awarded')
      console.log('📊 [App] Current subtopicId:', currentSubtopicId)
    }

    setStatus('idle')
  } catch (error: any) {
    console.error('Error getting response:', error)
    addMessage(`I'm having trouble connecting right now. ${error.message || 'Please try again.'}`, 'assistant')
    setStatus('idle')
  }
}
```

### 3. usePracticeSession Hook

```typescript
// src/hooks/usePracticeSession.ts

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
  }, [currentSession, userId])

  /**
   * End session without recording
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
    isActive: currentSession !== null,  // ⚠️ This is what we check
  }
}
```

### 4. ConversationContext (manages message state)

```typescript
// src/contexts/ConversationContext.tsx

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Message, ConversationState } from '../types'

const initialState: ConversationState = {
  conversationId: crypto.randomUUID(),
  messages: [],
  problemText: '',
  status: 'idle',
  stuckCount: 0,
}

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [conversation, setConversation] = useState<ConversationState>(initialState)

  const addMessage = useCallback((content: string, sender: 'user' | 'assistant', type?: Message['type'], imageUrl?: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      sender,
      content,
      timestamp: new Date(),
      type,
      imageUrl,
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

  // ... other methods

  return (
    <ConversationContext.Provider value={{ conversation, addMessage, clearConversation, /* ... */ }}>
      {children}
    </ConversationContext.Provider>
  )
}
```

### 5. Answer Detection (checks for [CORRECT] marker)

```typescript
// src/utils/answerDetection.ts

/**
 * Detect if AI's response indicates a correct answer
 * ONLY looks for [CORRECT] marker - no fallback patterns
 */
export function detectCorrectAnswer(aiResponse: string): boolean {
  if (aiResponse.includes('[CORRECT]')) {
    console.log('✅ [Detection] Found [CORRECT] marker')
    return true
  }
  
  console.log('⏸️ [Detection] No [CORRECT] marker found - treating as intermediate step')
  return false
}

/**
 * Remove validation markers from AI response for display
 */
export function stripValidationMarkers(aiResponse: string): string {
  return aiResponse
    .replace(/\[CORRECT\]\s*/gi, '')
    .replace(/\[INCORRECT\]\s*/gi, '')
    .trim()
}
```

---

## Console Logs from Actual Run

This is what I see when I click "Start Practice" and try to solve a problem:

```
🎯 [App] Start practice for subtopic: sub-variables
🔍 [App] Check practice session: {
  messagesLength: 0,
  currentSubtopicId: null,          // ⚠️ Still null!
  explicitSubtopicId: 'sub-variables',
  activeSubtopicId: 'sub-variables',
  isActive: false
}
🎯 [App] Starting practice session for subtopic: sub-variables
✅ [App] Practice session started successfully
💾 Auto-saving conversation...
✅ Conversation saved successfully!
📊 [Header] XP updated: 0

// User types "55" (answer to "Find complement of 35°")

🔍 [App] Check practice session: {
  messagesLength: 2,
  currentSubtopicId: 'sub-variables',
  explicitSubtopicId: undefined,
  activeSubtopicId: 'sub-variables',
  isActive: false                    // ⚠️ NOW IT'S FALSE!
}
⚠️ [App] Practice session is NOT active - XP will not be awarded
📊 [App] Current subtopicId: sub-variables
```

**Key observation**: Session shows as active on first message, but by the second message `practiceSession.isActive` is `false`.

---

## What We've Tried So Far

### Attempt 1: Fixed message length condition
- **Before**: `if (messages.length === 0 && subtopicId && !isActive)`
- **After**: `if (!isActive && subtopicId)`
- **Result**: Session still becomes inactive

### Attempt 2: Only clear session on correct answer
- Modified `submitAttempt()` to only call `setCurrentSession(null)` when `isCorrect === true`
- Keep session active for incorrect answers
- **Result**: Session still becomes inactive (before even detecting an answer)

### Attempt 3: Explicit subtopic passing
- Pass `subtopicId` directly to `handleSendMessage()` to avoid state timing issues
- **Result**: First message works, but session still lost on subsequent messages

### Attempt 4: Removed regex fallback patterns
- Only use `[CORRECT]`/`[INCORRECT]` markers for answer detection
- Prevent false positives from intermediate encouragement
- **Result**: Detection works correctly, but session is already inactive by then

---

## Debugging Questions

1. **Why is `practiceSession.isActive` false on the second message?**
   - `isActive` is computed as `currentSession !== null`
   - So `currentSession` must be getting set to `null` somehow
   - But we only call `setCurrentSession(null)` when answer is correct
   - Is there something else clearing it?

2. **Could `clearConversation()` be called somewhere unexpected?**
   - We call it in `handleStartPractice()` and `handleNewProblem()`
   - Could auto-save or message addition trigger it?

3. **Is `currentSession` state being reset by React?**
   - Could component remounting cause state loss?
   - Is `usePracticeSession` hook being recreated?

4. **Race condition between state updates?**
   - `setCurrentSession()` in `startSession()`
   - `addMessage()` adding user message
   - `addMessage()` adding AI response
   - Could these be interfering?

5. **Is `useCallback` dependency array causing issues?**
   - `startSession` has empty deps `[]`
   - `submitAttempt` depends on `[currentSession, userId]`
   - Could stale closures be the problem?

---

## Expected vs Actual Behavior

### Expected Flow:
```
1. Click "Start Practice"
2. handleStartPractice() → clearConversation() → handleSendMessage(problem, undefined, subtopicId)
3. Check: !practiceSession.isActive && activeSubtopicId → TRUE
4. practiceSession.startSession(subtopicId, problem, imageUrl)
5. currentSession = { subtopicId: 'sub-variables', problemText: '...', startTime: Date, hintsUsed: 0 }
6. isActive = true ✅
7. User types answer
8. handleSendMessage("55")
9. Check: practiceSession.isActive → Should be TRUE ✅
10. Detect answer → Award XP
```

### Actual Flow:
```
1. Click "Start Practice" ✅
2. handleStartPractice() → clearConversation() → handleSendMessage() ✅
3. Check: !practiceSession.isActive && activeSubtopicId → TRUE ✅
4. practiceSession.startSession() → setCurrentSession({...}) ✅
5. currentSession seems to be set ✅
6. isActive = true (initially) ✅
7. User types answer ✅
8. handleSendMessage("55") ✅
9. Check: practiceSession.isActive → FALSE ❌ (WHY?!)
10. XP tracking skipped ❌
```

---

## File Structure

```
src/
├── App.tsx                          // Main app, handleStartPractice, handleSendMessage
├── hooks/
│   └── usePracticeSession.ts        // Practice session state management
├── contexts/
│   └── ConversationContext.tsx      // Message history state
├── services/
│   ├── attemptService.ts            // recordAttempt, calculateXP
│   └── progressService.ts           // updateStudentXP, Firestore updates
├── utils/
│   ├── answerDetection.ts           // detectCorrectAnswer, stripValidationMarkers
│   └── problemGenerator.ts          // generateProblemForSubtopic
└── data/
    └── curriculum.ts                // Subtopic definitions with example problems
```

---

## What I Need Help With

**Primary Question**: Why is `practiceSession.isActive` becoming `false` after the first message, even though we're not calling `setCurrentSession(null)`?

**Secondary Questions**:
1. Could there be a React state issue causing `currentSession` to reset?
2. Is there a better way to manage practice session state that survives message exchanges?
3. Should session state be in Context instead of a custom hook?
4. Are there any obvious bugs in the state management flow I'm missing?

**Ideal Solution**: Session should start when "Start Practice" is clicked and remain active throughout the entire conversation until the user gives a correct final answer.

---

## Additional Context

- Using React 18.3.1
- TypeScript 5.x
- All state updates are asynchronous
- Multiple contexts (AuthContext, ConversationContext) in play
- Practice session state is isolated in `usePracticeSession` hook
- Hook is called at top level of App component: `const practiceSession = usePracticeSession(user?.uid || null)`

---

## Test Case to Reproduce

1. Start the app
2. Login as a user
3. Go to Dashboard or Topics view
4. Click "Start Practice" on any subtopic (e.g., "Variables & Expressions")
5. See auto-generated problem message
6. Open browser console
7. Type any answer (e.g., "55")
8. Check console logs
9. Observe: `practiceSession.isActive` is `false` even though session should be active

---

Please help me identify:
1. **Why is the session becoming inactive?**
2. **Where is `currentSession` getting set to `null`?**
3. **How can I make the session persist throughout the conversation?**

Thank you!

