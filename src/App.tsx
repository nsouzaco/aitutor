import { useEffect, useState, useRef } from 'react'
import { Header, EmptyState, LoadingState } from './components/Layout'
import { MessageList, InputArea, TypingIndicator } from './components/Chat'
import { AuthPage } from './components/Auth'
import { LandingPage } from './components/Landing'
import { Whiteboard } from './components/Whiteboard'
import { ProgressDashboard } from './components/Dashboard'
import { TopicBrowser } from './components/Topics'
import { XPFeedback } from './components/Practice'
import { PlacementTest } from './components/Placement'
import { useConversation, useAuth, usePracticeSession } from './contexts'
import { sendMessage, extractTextFromImage } from './services/vercelApiService'
import { initializeStudentProfile } from './services/progressService'
import { hasCompletedPlacementTest } from './services/placementService'
import {
  buildConversationContext,
  detectStuckResponse,
  detectCelebration,
} from './utils/promptBuilder'
import { detectCorrectAnswer, detectIncorrectAnswer, isAskingQuestion, stripValidationMarkers } from './utils/answerDetection'
import { generateProblemForSubtopic, getSubtopicContext } from './utils/problemGenerator'
import { getSubtopicById } from './data/curriculum'

type ViewMode = 'tutor' | 'dashboard' | 'topics' | 'placement'

function App() {
  const { user, loading: authLoading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [currentView, setCurrentView] = useState<ViewMode>('tutor')
  const [currentSubtopicId, setCurrentSubtopicId] = useState<string | null>(null)
  const [checkingPlacement, setCheckingPlacement] = useState(true)
  
  // ✅ SOLUTION B: Store pending attempt to be submitted AFTER session becomes active
  const [pendingAttempt, setPendingAttempt] = useState<{
    response: string
    isCorrect: boolean
    history: any[]
  } | null>(null)
  
  // ✅ FIX: Track if session was started to prevent re-initialization on re-renders
  const sessionStartedRef = useRef(false)
  
  // ✅ CRITICAL FIX: Store current subtopic in ref for immediate access
  // Refs don't have async timing issues like setState, and persist across renders
  const currentSubtopicRef = useRef<string | null>(null)
  const {
    conversation,
    addMessage,
    clearConversation,
    setStatus,
    incrementStuckCount,
    resetStuckCount,
    saveConversation,
  } = useConversation()
  
  const practiceSession = usePracticeSession()

  // Initialize student profile when user logs in
  useEffect(() => {
    if (user?.uid && user?.email) {
      initializeStudentProfile(user.uid, user.email).catch(err => {
        console.error('Error initializing student profile:', err)
      })
    }
  }, [user])

  // Check if user has completed placement test
  useEffect(() => {
    async function checkPlacement() {
      if (user?.uid) {
        setCheckingPlacement(true)
        try {
          const completed = await hasCompletedPlacementTest(user.uid)
          console.log('📋 [App] Placement test completed:', completed)
          
          // Redirect to placement if not completed
          if (!completed) {
            console.log('🔄 [App] Redirecting to placement test')
            setCurrentView('placement')
          }
        } catch (error) {
          console.error('❌ [App] Error checking placement:', error)
        } finally {
          setCheckingPlacement(false)
        }
      } else {
        setCheckingPlacement(false)
      }
    }

    checkPlacement()
  }, [user])

  // ✅ SOLUTION B: Submit attempt AFTER session becomes active
  // This useEffect waits for React to finish updating the Provider state
  // and only then submits the attempt with fresh, non-stale context values
  useEffect(() => {
    // Nothing to do if no attempt pending
    if (!pendingAttempt) return

    // Wait until the Provider actually has a session
    if (!practiceSession.isActive || !practiceSession.currentSession) {
      console.log('⏳ [App] Waiting for session to be ready before submitting attempt...')
      console.log('📊 [App] Current state:', {
        pendingAttempt: !!pendingAttempt,
        isActive: practiceSession.isActive,
        hasSession: !!practiceSession.currentSession,
      })
      return
    }

    console.log('✅ [App] Session ready — submitting attempt now')
    console.log('📊 [App] Session details:', {
      isActive: practiceSession.isActive,
      subtopicId: practiceSession.currentSession.subtopicId,
      isCorrect: pendingAttempt.isCorrect,
    })

    const { response, isCorrect, history } = pendingAttempt

    practiceSession
      .submitAttempt(response, isCorrect, history)
      .then(result => {
        if (result) {
          console.log('🎉 [App] XP awarded from useEffect:', result.xpEarned)
          console.log('📊 [App] AttemptResult:', result)
          console.log('🎯 [App] XP Modal SHOULD NOW SHOW because lastAttemptResult is set')
          
          // Refresh Header XP
          if ((window as any).refreshHeaderXP) {
            console.log('🔄 [App] Refreshing Header XP...')
            setTimeout(() => (window as any).refreshHeaderXP(), 500)
          } else {
            console.warn('⚠️ [App] refreshHeaderXP function not found on window')
          }
        } else {
          console.warn('⚠️ [App] submitAttempt returned null - no result!')
        }
      })
      .catch(error => {
        console.error('❌ [App] Error submitting attempt:', error)
      })
      .finally(() => {
        console.log('🧹 [App] Clearing pendingAttempt')
        setPendingAttempt(null)
      })
  }, [
    pendingAttempt,
    practiceSession.isActive,
    practiceSession.currentSession,
    practiceSession,
  ])

  // Debug: Log when lastAttemptResult changes
  useEffect(() => {
    console.log('🎯 [App] lastAttemptResult changed:', {
      exists: !!practiceSession.lastAttemptResult,
      xpEarned: practiceSession.lastAttemptResult?.xpEarned,
      isCorrect: practiceSession.lastAttemptResult?.isCorrect,
    })
    if (practiceSession.lastAttemptResult) {
      console.log('✨ [App] XP MODAL SHOULD BE VISIBLE NOW')
    } else {
      console.log('🚫 [App] XP MODAL SHOULD NOT BE VISIBLE')
    }
  }, [practiceSession.lastAttemptResult])

  const handlePlacementComplete = () => {
    console.log('✅ [App] Placement test completed')
    setCurrentView('dashboard') // Redirect to dashboard after placement
  }

  // Auto-save conversation after each message
  useEffect(() => {
    if (user && conversation.messages.length > 0 && conversation.status === 'idle') {
      console.log('💾 Auto-saving conversation...', {
        userId: user.uid,
        conversationId: conversation.conversationId,
        messageCount: conversation.messages.length,
        problemText: conversation.problemText
      })
      // Save after a brief delay to batch rapid changes
      const timer = setTimeout(() => {
        saveConversation(user.uid).then(() => {
          console.log('✅ Conversation saved successfully!')
        }).catch(err => {
          console.error('❌ Failed to save conversation:', err)
        })
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [conversation.messages.length, conversation.status, user, saveConversation])

  // Show loading state while checking authentication
  if (authLoading) {
    return <LoadingState message="Loading..." />
  }

  // Show landing page or auth page if not authenticated
  if (!user) {
    if (!showAuth) {
      return <LandingPage onGetStarted={() => setShowAuth(true)} />
    }
    return <AuthPage onAuthSuccess={() => {}} />
  }

  const handleNewProblem = () => {
    clearConversation()
    setCurrentView('tutor')
  }

  const handleNavigate = (view: ViewMode) => {
    setCurrentView(view)
  }

  const handleStartPractice = async (subtopicId: string) => {
    console.log('🎯 [App] Start practice for subtopic:', subtopicId)
    
    // ✅ CRITICAL: Reset flags and store subtopic in ref
    sessionStartedRef.current = false
    currentSubtopicRef.current = subtopicId  // ✅ Store in ref - available immediately
    console.log('🔄 [App] Reset sessionStartedRef to false, set currentSubtopicRef to:', subtopicId)
    
    setCurrentView('tutor')
    clearConversation()
    
    // Generate and auto-send a problem from this subtopic
    const problem = generateProblemForSubtopic(subtopicId)
    
    if (problem) {
      console.log('📝 [App] Auto-generated problem:', problem)
      // Wait a brief moment for view to switch, then send the problem
      // No need to pass subtopicId - it's in the ref
      setTimeout(() => {
        handleSendMessage(problem)
      }, 100)
    } else {
      // Fallback if no problem could be generated
      console.error('❌ [App] No problem could be generated for subtopic:', subtopicId)
      console.error('💡 [App] This subtopic may be missing example problems in curriculum.ts')
      
      // Send generic practice message so session can still start
      const subtopic = getSubtopicById(subtopicId)
      const fallbackMessage = subtopic 
        ? `Let's practice ${subtopic.name}! What problem would you like to work on?`
        : `Let's start practicing! What problem would you like to work on?`
      
      console.log('📝 [App] Using fallback message:', fallbackMessage)
      
      setTimeout(() => {
        handleSendMessage(fallbackMessage)
      }, 100)
    }
  }

  const handleWhiteboardEvaluate = async (imageDataUrl: string) => {
    console.log('🎨 [App] Whiteboard evaluate called')
    console.log('📊 [App] Image data URL length:', imageDataUrl.length)
    console.log('📊 [App] Image data URL prefix:', imageDataUrl.substring(0, 50))
    
    // Use existing handleSendMessage flow with whiteboard image
    // Add context message for whiteboard evaluation - emphasize Socratic method
    await handleSendMessage('Here is my work. What do you think?', imageDataUrl)
  }

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    let messageContent = content
    
    // ✅ FIXED: Get subtopicId from ref - always current, no async timing issues
    const activeSubtopicId = currentSubtopicRef.current
    
    console.log('📨 [App] handleSendMessage called:', {
      messagesLength: conversation.messages.length,
      activeSubtopicId,
      currentSubtopicIdState: currentSubtopicId,
      sessionActive: practiceSession.isActive,
      sessionStartedRef: sessionStartedRef.current,
    })
    
    // Start session ONLY if:
    // 1. Session hasn't been started yet (ref is false)
    // 2. We have a subtopic ID in the ref
    if (!sessionStartedRef.current && activeSubtopicId) {
      console.log('🎯 [App] Starting practice session for subtopic:', activeSubtopicId)
      console.log('📝 [App] Session will track XP from this point forward')
      
      // Mark as started BEFORE calling startSession to prevent race conditions
      sessionStartedRef.current = true
      
      // Start the session in the Context
      practiceSession.startSession(activeSubtopicId, content, imageUrl)
      
      // ✅ Sync state for UI (non-critical, just for display)
      console.log('📌 [App] Updating currentSubtopicId state to match session:', activeSubtopicId)
      setCurrentSubtopicId(activeSubtopicId)
      
      // Verify session started
      console.log('🔍 [App] Immediately after startSession:', {
        isActive: practiceSession.isActive,
        subtopicId: practiceSession.currentSession?.subtopicId || 'null',
      })
      
      console.log('✅ [App] Practice session started successfully (ref now true)')
    } else if (!activeSubtopicId) {
      console.warn('⚠️ [App] No subtopic in ref - XP will not be tracked!')
      console.warn('💡 [App] To track XP, start practice from Dashboard or Topics view')
    } else {
      console.log('✅ [App] Session already started (ref=true), continuing with existing session')
    }
    
    // Show typing indicator early if processing image
    if (imageUrl) {
      setStatus('thinking')
    }

    // If image is provided, extract text using Vision API
    if (imageUrl) {
      try {
        console.log('🖼️ [App] Processing image, URL length:', imageUrl.length)
        // Extract base64 data from data URL
        const base64Data = imageUrl.split(',')[1]
        console.log('📦 [App] Base64 data length:', base64Data?.length || 0)
        
        // Check if this is a whiteboard evaluation (contains whiteboard context)
        const isWhiteboardEvaluation = content.toLowerCase().includes('here is my work') || content.toLowerCase().includes('what do you think')
        console.log('🎯 [App] Is whiteboard evaluation:', isWhiteboardEvaluation)
        
        const extractedText = await extractTextFromImage(base64Data, isWhiteboardEvaluation)
        console.log('✅ [App] Text extracted successfully:', extractedText.substring(0, 100))
        
        // Combine extracted text with user's message
        // For whiteboard evaluation, format more naturally
        if (content.toLowerCase().includes('here is my work') || content.toLowerCase().includes('what do you think')) {
          messageContent = `${content}\n\n${extractedText}`
        } else {
          messageContent = content
            ? `${content}\n\nExtracted from image: ${extractedText}`
            : `Problem from image: ${extractedText}`
        }
        
        // Add user message with image
        addMessage(messageContent, 'user', 'text', imageUrl)
      } catch (error: any) {
        console.error('Error extracting text from image:', error)
        addMessage(
          `I had trouble reading the image. ${error.message || 'Please try again or type your problem.'}`,
          'assistant'
        )
        setStatus('idle')
        return
      }
    } else {
      // Add regular text message
      addMessage(messageContent, 'user')
    }

    // Check if user seems stuck
    if (detectStuckResponse(messageContent)) {
      incrementStuckCount()
    } else if (conversation.messages.length > 0) {
      // Reset stuck count if they seem to be making progress
      resetStuckCount()
    }

    // Show typing indicator
    setStatus('thinking')

    try {
      // Check if this is a whiteboard evaluation (contains whiteboard context)
      const isWhiteboardEval = content.toLowerCase().includes('here is my work') || 
                               content.toLowerCase().includes('what do you think') ||
                               (!!imageUrl && content.toLowerCase().includes('evaluate'))
      
      // Get subtopic context for AI if we're in a practice session
      const subtopicContext = activeSubtopicId 
        ? getSubtopicContext(activeSubtopicId) 
        : null
      
      console.log('📚 [App] Subtopic context for AI:', subtopicContext ? 'Added' : 'None')
      
      // Build conversation context with current stuck count and whiteboard evaluation flag
      const messages = buildConversationContext(
        [...conversation.messages, {
          id: 'temp',
          sender: 'user',
          content: messageContent,
          timestamp: new Date(),
        }],
        conversation.stuckCount,
        isWhiteboardEval,
        subtopicContext  // ✅ Pass subtopic context to AI
      )

      // Get response from OpenAI
      const response = await sendMessage({ messages })

      // Detect answer validation BEFORE stripping markers
      const isCorrectAnswer = detectCorrectAnswer(response)
      const isIncorrectAnswer = detectIncorrectAnswer(response)

      // Strip validation markers from response for display
      const displayResponse = stripValidationMarkers(response)

      // Check if this is a celebration moment
      const isCelebration = detectCelebration(displayResponse)

      // Add AI response (with markers stripped)
      addMessage(displayResponse, 'assistant', isCelebration ? 'celebration' : undefined)

      // Track hints (Socratic questions count as hints)
      if (practiceSession.isActive && isAskingQuestion(displayResponse)) {
        practiceSession.useHint()
        console.log('💡 [App] Hint detected in AI response')
      }

      // ✅ SOLUTION B: Detect correctness and queue attempt for submission
      // DO NOT check practiceSession.isActive here - it's stale!
      // The useEffect will handle submission after session becomes active
      console.log('🔍 [App] Checking AI response for answer detection...')
      console.log('📝 [App] AI Response (with markers):', response.substring(0, 200))
      console.log('📝 [App] Display Response (markers stripped):', displayResponse.substring(0, 200))
      console.log(`🎯 [App] Detection results - Correct: ${isCorrectAnswer}, Incorrect: ${isIncorrectAnswer}`)
      console.log(`🎯 [App] Practice session state:`, {
        isActive: practiceSession.isActive,
        subtopicId: practiceSession.currentSession?.subtopicId,
        sessionStartedRef: sessionStartedRef.current,
        currentSubtopicRef: currentSubtopicRef.current,
      })
      
      if (isCorrectAnswer || isIncorrectAnswer) {
        console.log(`${isCorrectAnswer ? '✅' : '❌'} [App] Answer detected as ${isCorrectAnswer ? 'correct' : 'incorrect'}`)
        console.log(`📝 [App] Queueing attempt for submission: "${messageContent.substring(0, 50)}"`)
        console.log(`🎯 [App] Session should be active: ${practiceSession.isActive}`)
        
        // ✅ Queue the attempt - useEffect will submit it after session becomes active
        setPendingAttempt({
          response: messageContent,
          isCorrect: isCorrectAnswer,
          history: conversation.messages,
        })
        
        console.log('⏳ [App] Attempt queued, waiting for session to be ready...')
        console.log('📊 [App] Current lastAttemptResult before submission:', practiceSession.lastAttemptResult ? 'EXISTS' : 'NULL')
      } else {
        console.log('⏳ [App] No final answer detected yet, continuing conversation')
      }

      setStatus('idle')
    } catch (error: any) {
      console.error('Error getting response:', error)

      // Add error message
      addMessage(
        `I'm having trouble connecting right now. ${error.message || 'Please try again in a moment.'}`,
        'assistant'
      )

      setStatus('idle')
    }
  }

  const hasMessages = conversation.messages.length > 0
  const isThinking = conversation.status === 'thinking'

  // Render different views based on currentView
  const renderView = () => {
    if (!user) return null

    switch (currentView) {
      case 'placement':
        return (
          <PlacementTest
            userId={user.uid}
            onComplete={handlePlacementComplete}
          />
        )
      
      case 'dashboard':
        return (
          <ProgressDashboard 
            userId={user.uid}
            onStartPractice={handleStartPractice}
          />
        )
      
      case 'topics':
        return (
          <TopicBrowser
            userId={user.uid}
            onStartPractice={handleStartPractice}
          />
        )
      
      case 'tutor':
      default:
        return (
          <div className="flex flex-1 overflow-hidden">
            {/* Left Side: Chat Interface (35%) */}
            <div className="flex w-[35%] flex-col border-r border-gray-200">
              {/* Scrollable Content Area - Fixed height with scroll */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {!hasMessages ? (
                  <EmptyState />
                ) : (
                  <div className="pb-4">
                    <MessageList messages={conversation.messages} />
                    {isThinking && (
                      <div className="mx-auto max-w-4xl px-4 sm:px-6">
                        <TypingIndicator />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fixed Input Area - Always visible at bottom */}
              <div className="flex-shrink-0">
                <InputArea
                  onSend={handleSendMessage}
                  disabled={isThinking}
                  placeholder="Type your math problem or answer..."
                />
              </div>
            </div>

            {/* Right Side: Whiteboard (65%) */}
            <div className="flex w-[65%] flex-col">
              <Whiteboard onEvaluate={handleWhiteboardEvaluate} />
            </div>
          </div>
        )
    }
  }

  // Don't show anything while checking placement or auth
  if (authLoading || (user && checkingPlacement)) {
    return <LoadingState />
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Hide header during placement test */}
      {currentView !== 'placement' && (
        <Header 
          currentView={currentView}
          onNewProblem={hasMessages ? handleNewProblem : undefined}
          onNavigate={handleNavigate}
        />
      )}
      {renderView()}
      
      {/* XP Feedback Modal */}
      {practiceSession.lastAttemptResult && (
        <XPFeedback
          result={practiceSession.lastAttemptResult}
          onClose={() => {
            console.log('🔄 [App] Closing XP feedback and resetting for next practice')
            practiceSession.clearLastResult()
            // Reset session tracking for next practice
            sessionStartedRef.current = false
            currentSubtopicRef.current = null  // ✅ Reset ref too
            // Clear subtopic selection after completing a problem
            setCurrentSubtopicId(null)
          }}
          onContinuePractice={() => {
            console.log('🔄 [App] Continue practicing same subtopic')
            practiceSession.clearLastResult()
            
            // Get the current subtopic from the ref
            const subtopicId = currentSubtopicRef.current
            if (subtopicId) {
              console.log('🎯 [App] Continuing practice for subtopic:', subtopicId)
              // Start a new practice session with the same subtopic
              handleStartPractice(subtopicId)
            } else {
              console.warn('⚠️ [App] No subtopic to continue practicing')
              // Fallback to just closing
              sessionStartedRef.current = false
              currentSubtopicRef.current = null
              setCurrentSubtopicId(null)
            }
          }}
        />
      )}
    </div>
  )
}

export default App

