# State Timing Bug - Session Using Previous Subtopic

## Problem Description

**Pattern Observed**:
1. Click "Start Practice" on Subtopic A → Session is `null`, `currentSubtopicId` shows wrong value
2. Click "Start Practice" on Subtopic B → Session is `null`, `currentSubtopicId` shows Subtopic A (the PREVIOUS one)

**From Console Logs**:

### First Click (sub-angles):
```
[App] Start practice for subtopic: sub-angles
[App] Check practice session start: {
  messagesLength: 2,
  currentSubtopicId: 'sub-range-outliers',  // ❌ Wrong! Shows previous topic
  isActive: false
}
⚠️ [App] Practice session is NOT active - XP will not be awarded
```

### Second Click (sub-range-outliers):
```
[App] Start practice for subtopic: sub-range-outliers
[App] Check practice session start: {
  messagesLength: 2,
  currentSubtopicId: 'sub-angles',  // ❌ Shows the previous topic!
  isActive: false
}
⚠️ [App] Practice session is NOT active - XP will not be awarded
```

---

## Root Cause Analysis

### The Issue: Multiple Async State Updates Creating Race Condition

When you click "Start Practice", here's what happens:

```typescript
// In App.tsx - handleStartPractice
const handleStartPractice = async (subtopicId: string) => {
  console.log('🎯 [App] Start practice for subtopic:', subtopicId)
  
  // ✅ Reset ref synchronously
  sessionStartedRef.current = false
  
  // ❌ PROBLEM: All these are async state updates
  setCurrentSubtopicId(subtopicId)        // Async setState #1
  setCurrentView('tutor')                  // Async setState #2
  clearConversation()                      // Async setState #3 (updates conversation context)
  
  const problem = generateProblemForSubtopic(subtopicId)
  
  if (problem) {
    // ❌ PROBLEM: Runs after 100ms, but state might not be updated yet!
    setTimeout(() => {
      handleSendMessage(problem, undefined, subtopicId)  // ✅ subtopicId passed explicitly
    }, 100)
  }
}
```

### Why State Shows Previous Value

**React State Update Timing**:
```
T=0ms:    Click "Start Practice" (sub-angles)
          └─ sessionStartedRef.current = false        [Immediate ✅]
          └─ setCurrentSubtopicId('sub-angles')      [Queued, not immediate]
          └─ clearConversation()                      [Queued, not immediate]

T=50ms:   React batches and processes state updates
          └─ currentSubtopicId becomes 'sub-angles'
          └─ conversation.messages becomes []

T=100ms:  setTimeout fires
          └─ handleSendMessage('problem...', undefined, 'sub-angles')
          └─ activeSubtopicId = 'sub-angles' ✅ (from explicitSubtopicId)
          
T=105ms:  Inside handleSendMessage
          └─ Logs currentSubtopicId → Still shows OLD value! ❌
          └─ Because component hasn't re-rendered with new state yet
```

### The Real Problem: Session Not Starting At All

Looking at the logs, the session isn't starting even though:
- `sessionStartedRef.current` is `false` ✅
- `activeSubtopicId` is provided ✅
- The condition `!sessionStartedRef.current && activeSubtopicId` should be `true` ✅

**But the session isn't starting!** Why?

---

## Investigation: Why Session Doesn't Start

### Hypothesis 1: clearConversation() Interferes

```typescript
// In ConversationContext
const clearConversation = useCallback(() => {
  setConversation({
    ...initialState,
    conversationId: crypto.randomUUID(),
  })
}, [])
```

When `clearConversation()` is called:
1. It resets `conversation` state
2. This causes `ConversationProvider` to re-render
3. All consumers (including App) re-render
4. **This might cause `handleSendMessage` to run with stale state**

### Hypothesis 2: Messages Already Exist When Check Happens

From the logs:
```
[App] Check practice session start: {messagesLength: 2, ...}
```

**Wait!** `messagesLength: 2` means there are already 2 messages in the conversation!

This means:
1. The first message (problem) was added
2. The AI response was added
3. Now we're on the 3rd message
4. But `sessionStartedRef` might have been reset somehow

### Hypothesis 3: Session Starts But Gets Cleared Immediately

Possible flow:
```
1. sessionStartedRef.current = false (in handleStartPractice)
2. setTimeout fires after 100ms
3. handleSendMessage called with explicitSubtopicId
4. Check: !sessionStartedRef.current && activeSubtopicId → TRUE
5. Set sessionStartedRef.current = true
6. Call practiceSession.startSession()
7. ✅ Session starts in Context
8. State update queued in PracticeSessionProvider
9. BUT... something clears it before next render?
```

### Hypothesis 4: Context Memoization Issue

Even though we memoized the context value:
```typescript
const value = useMemo(() => ({
  currentSession,
  lastAttemptResult,
  startSession,
  useHint,
  submitAttempt,
  endSession,
  clearLastResult,
  isActive,
}), [currentSession, lastAttemptResult, startSession, useHint, submitAttempt, endSession, clearLastResult])
```

The dependencies include `startSession`, `submitAttempt`, etc. These callbacks have their own dependencies:
- `submitAttempt` depends on `[currentSession, user]`
- When `currentSession` updates, `submitAttempt` is recreated
- When `submitAttempt` is recreated, the memoized `value` is recreated
- This causes consumers to re-render
- **This might trigger `handleSendMessage` again**

---

## Code Snippets for Reference

### Current handleStartPractice
```typescript
// src/App.tsx
const handleStartPractice = async (subtopicId: string) => {
  console.log('🎯 [App] Start practice for subtopic:', subtopicId)
  
  // ✅ CRITICAL: Reset session flag BEFORE clearing conversation
  sessionStartedRef.current = false
  console.log('🔄 [App] Reset sessionStartedRef to false')
  
  setCurrentSubtopicId(subtopicId)    // ❌ Async
  setCurrentView('tutor')              // ❌ Async
  clearConversation()                  // ❌ Async - triggers re-renders
  
  const problem = generateProblemForSubtopic(subtopicId)
  
  if (problem) {
    setTimeout(() => {
      handleSendMessage(problem, undefined, subtopicId)  // ✅ Passes subtopicId explicitly
    }, 100)
  }
}
```

### Current handleSendMessage (Session Start Logic)
```typescript
// src/App.tsx
const handleSendMessage = async (content: string, imageUrl?: string, explicitSubtopicId?: string) => {
  let messageContent = content
  
  // Use explicit subtopicId if provided, otherwise use state
  const activeSubtopicId = explicitSubtopicId || currentSubtopicId
  
  console.log('📨 [App] handleSendMessage called:', {
    messagesLength: conversation.messages.length,
    currentSubtopicId,                    // ❌ Shows stale state in logs
    explicitSubtopicId,
    activeSubtopicId,
    sessionActive: practiceSession.isActive,
    sessionStartedRef: sessionStartedRef.current,
  })
  
  // Start session ONLY if:
  // 1. Session hasn't been started yet (ref is false)
  // 2. We have a subtopic ID
  if (!sessionStartedRef.current && activeSubtopicId) {
    console.log('🎯 [App] Starting practice session for subtopic:', activeSubtopicId)
    
    // Mark as started BEFORE calling startSession
    sessionStartedRef.current = true
    
    practiceSession.startSession(activeSubtopicId, content, imageUrl)
    
    // Update state to match if explicit ID provided
    if (explicitSubtopicId && explicitSubtopicId !== currentSubtopicId) {
      setCurrentSubtopicId(explicitSubtopicId)  // ❌ More async state updates!
    }
    
    console.log('✅ [App] Practice session started successfully (ref now true)')
  } else {
    console.log('✅ [App] Session already started (ref=true), continuing with existing session')
  }
  
  // ... rest of message handling
}
```

### Current PracticeSessionContext
```typescript
// src/contexts/PracticeSessionContext.tsx
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
  
  setCurrentSession(newSession)  // ❌ Async state update
  setLastAttemptResult(null)
  
  console.log('✅ [PracticeSessionProvider] Session started:', newSession)
}, [])  // Empty deps

// Memoized value
const value = useMemo(() => ({
  currentSession,
  lastAttemptResult,
  startSession,
  useHint,
  submitAttempt,  // ❌ This changes when currentSession changes
  endSession,
  clearLastResult,
  isActive,
}), [currentSession, lastAttemptResult, startSession, useHint, submitAttempt, endSession, clearLastResult])
```

---

## Potential Solutions

### Solution 1: Remove State Updates from handleStartPractice

**Don't call setState before starting the session**. Use only the ref and explicit parameters:

```typescript
const handleStartPractice = async (subtopicId: string) => {
  console.log('🎯 [App] Start practice for subtopic:', subtopicId)
  
  // ✅ Only reset ref and clear conversation
  sessionStartedRef.current = false
  clearConversation()
  
  // ✅ DON'T update currentSubtopicId here - let handleSendMessage do it
  // setCurrentSubtopicId(subtopicId)  // ❌ REMOVE THIS
  setCurrentView('tutor')
  
  const problem = generateProblemForSubtopic(subtopicId)
  
  if (problem) {
    setTimeout(() => {
      handleSendMessage(problem, undefined, subtopicId)  // Explicit ID is all we need
    }, 100)
  }
}
```

Then in `handleSendMessage`, update `currentSubtopicId` AFTER session starts:
```typescript
if (!sessionStartedRef.current && activeSubtopicId) {
  sessionStartedRef.current = true
  practiceSession.startSession(activeSubtopicId, content, imageUrl)
  
  // ✅ Update state AFTER session starts
  setCurrentSubtopicId(activeSubtopicId)  // This ensures it's always in sync
  
  console.log('✅ Session started successfully')
}
```

### Solution 2: Use useEffect to Sync State

Add a `useEffect` to ensure `currentSubtopicId` syncs with session:

```typescript
// In App.tsx
useEffect(() => {
  if (practiceSession.currentSession?.subtopicId) {
    setCurrentSubtopicId(practiceSession.currentSession.subtopicId)
  }
}, [practiceSession.currentSession?.subtopicId])
```

### Solution 3: Remove currentSubtopicId State Entirely

If we're always passing `explicitSubtopicId` and storing it in the session, we don't need `currentSubtopicId` state in App at all:

```typescript
// ❌ Remove this:
// const [currentSubtopicId, setCurrentSubtopicId] = useState<string | null>(null)

// ✅ Get it from session instead:
const currentSubtopicId = practiceSession.currentSession?.subtopicId || null
```

### Solution 4: Add More Logging to Debug

Add comprehensive logging in `startSession` to see if it's actually being called:

```typescript
const startSession = useCallback((subtopicId: string, problemText: string, imageUrl?: string) => {
  console.log('🎯 [PracticeSessionProvider] startSession CALLED with:', {
    subtopicId,
    problemTextLength: problemText.length,
    hasImage: !!imageUrl,
  })
  console.log('📝 [PracticeSessionProvider] Current session BEFORE:', currentSession)
  
  const newSession: PracticeSession = {
    subtopicId,
    problemText,
    startTime: new Date(),
    hintsUsed: 0,
    problemImageUrl: imageUrl,
  }
  
  console.log('📦 [PracticeSessionProvider] New session object created:', newSession)
  setCurrentSession(newSession)
  console.log('📤 [PracticeSessionProvider] setCurrentSession called with:', newSession)
  setLastAttemptResult(null)
  
  console.log('✅ [PracticeSessionProvider] startSession completed')
}, [])
```

### Solution 5: Fix Memoization Dependencies

The `value` memo depends on `submitAttempt`, which depends on `currentSession`. This creates a dependency chain that causes re-creation:

```typescript
// ❌ Current: submitAttempt in dependencies causes re-memoization
const value = useMemo(() => ({
  ...
  submitAttempt,  // This changes when currentSession changes
  ...
}), [currentSession, ..., submitAttempt, ...])

// ✅ Better: Don't include callbacks that have dependencies in the memo deps
// The callbacks themselves are already memoized with useCallback
const value = useMemo(() => ({
  currentSession,
  lastAttemptResult,
  startSession,
  useHint,
  submitAttempt,
  endSession,
  clearLastResult,
  isActive,
}), [currentSession, lastAttemptResult, isActive])  // Only include primitive values
```

---

## Debugging Steps

1. **Add a console.log immediately after practiceSession.startSession() is called**:
```typescript
practiceSession.startSession(activeSubtopicId, content, imageUrl)
console.log('🔍 [App] Immediately after startSession, check context:', {
  isActive: practiceSession.isActive,
  session: practiceSession.currentSession,
})
```

2. **Check if startSession is actually being called in the Provider**:
Look for this log:
```
🎯 [PracticeSessionProvider] startSession CALLED
```

3. **Check if the Provider is unmounting**:
Look for:
```
💥 [PracticeSessionProvider] UNMOUNTED
```

4. **Check the order of state changes**:
Look for:
```
📊 [PracticeSessionProvider] Session state changed: { isActive: true, subtopicId: 'sub-angles' }
```

5. **Add timing logs**:
```typescript
const now = Date.now()
console.log(`[${now}] Session start requested`)
practiceSession.startSession(...)
console.log(`[${now}] Session start completed`)
```

---

## Most Likely Solution

Based on the symptoms, **Solution 1** is most likely to work:

**Remove `setCurrentSubtopicId()` from `handleStartPractice`** and only set it INSIDE `handleSendMessage` AFTER the session has started. This eliminates the race condition between multiple async state updates.

The key insight is: **Don't manage subtopicId in two places**. Let the session be the single source of truth, and derive `currentSubtopicId` from the session state.

---

## Questions for Investigation

1. **Is `startSession` actually being called?**
   - Check for `🎯 [PracticeSessionProvider] startSession CALLED` in console

2. **Is the session being set in the Provider?**
   - Check for `📊 [PracticeSessionProvider] Session state changed: { isActive: true }`

3. **Is something clearing the session immediately?**
   - Check for `setCurrentSession(null)` calls or `endSession()` calls

4. **Is the Provider being unmounted?**
   - Check for `💥 [PracticeSessionProvider] UNMOUNTED`

5. **Are there multiple renders causing the check to happen before state updates?**
   - Count how many times `handleSendMessage` is called for the first problem

---

## Summary

The bug appears to be caused by **multiple async state updates racing with each other**, combined with **React's batching and memoization** causing stale state to appear in logs and checks.

The session might actually be starting, but by the time we check it, we're looking at stale state. Or the session starts but gets cleared by subsequent state updates.

**Recommended fix**: Remove `setCurrentSubtopicId()` from `handleStartPractice` and only update it inside `handleSendMessage` after the session successfully starts. This creates a single, predictable flow without race conditions.

