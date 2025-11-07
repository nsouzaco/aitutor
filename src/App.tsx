import { useEffect, useState } from 'react'
import { Header, EmptyState, LoadingState } from './components/Layout'
import { MessageList, InputArea, TypingIndicator } from './components/Chat'
import { AuthPage } from './components/Auth'
import { LandingPage } from './components/Landing'
import { Whiteboard } from './components/Whiteboard'
import { ProgressDashboard } from './components/Dashboard'
import { TopicBrowser } from './components/Topics'
import { XPFeedback } from './components/Practice'
import { PlacementTest } from './components/Placement'
import { useConversation, useAuth } from './contexts'
import { usePracticeSession } from './hooks'
import { sendMessage, extractTextFromImage } from './services/vercelApiService'
import { initializeStudentProfile } from './services/progressService'
import { hasCompletedPlacementTest } from './services/placementService'
import {
  buildConversationContext,
  detectStuckResponse,
  detectCelebration,
} from './utils/promptBuilder'
import { detectCorrectAnswer, detectIncorrectAnswer, isAskingQuestion } from './utils/answerDetection'
import { generateProblemForSubtopic } from './utils/problemGenerator'

type ViewMode = 'tutor' | 'dashboard' | 'topics' | 'placement'

function App() {
  const { user, loading: authLoading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [currentView, setCurrentView] = useState<ViewMode>('tutor')
  const [currentSubtopicId, setCurrentSubtopicId] = useState<string | null>(null)
  const [checkingPlacement, setCheckingPlacement] = useState(true)
  const {
    conversation,
    addMessage,
    clearConversation,
    setStatus,
    incrementStuckCount,
    resetStuckCount,
    saveConversation,
    loadConversation,
  } = useConversation()
  
  const practiceSession = usePracticeSession(user?.uid || null)

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

  const handleLoadConversation = async (conversationId: string) => {
    try {
      await loadConversation(conversationId)
      setCurrentView('tutor')
    } catch (error) {
      console.error('Error loading conversation:', error)
      // Could show a toast notification here
    }
  }

  const handleNavigate = (view: ViewMode) => {
    setCurrentView(view)
  }

  const handleStartPractice = async (subtopicId: string) => {
    console.log('🎯 [App] Start practice for subtopic:', subtopicId)
    setCurrentSubtopicId(subtopicId)
    setCurrentView('tutor')
    clearConversation()
    
    // Generate and auto-send a problem from this subtopic
    const problem = generateProblemForSubtopic(subtopicId)
    if (problem) {
      console.log('📝 [App] Auto-generated problem:', problem)
      // Wait a brief moment for view to switch, then send the problem
      setTimeout(() => {
        handleSendMessage(problem)
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
    
    // Start practice session if this is the first message and subtopic is selected
    console.log('🔍 [App] Check practice session start:', {
      messagesLength: conversation.messages.length,
      currentSubtopicId,
      isActive: practiceSession.isActive
    })
    
    if (conversation.messages.length === 0 && currentSubtopicId && !practiceSession.isActive) {
      console.log('🎯 [App] Starting practice session for subtopic:', currentSubtopicId)
      practiceSession.startSession(currentSubtopicId, content, imageUrl)
      console.log('✅ [App] Practice session started successfully')
    } else {
      if (conversation.messages.length > 0) {
        console.log('⏭️ [App] Not first message, session should already be started')
      }
      if (!currentSubtopicId) {
        console.warn('⚠️ [App] No subtopic selected - XP will not be tracked!')
      }
      if (practiceSession.isActive) {
        console.log('✅ [App] Session already active')
      }
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
      
      // Build conversation context with current stuck count and whiteboard evaluation flag
      const messages = buildConversationContext(
        [...conversation.messages, {
          id: 'temp',
          sender: 'user',
          content: messageContent,
          timestamp: new Date(),
        }],
        conversation.stuckCount,
        isWhiteboardEval
      )

      // Get response from OpenAI
      const response = await sendMessage({ messages })

      // Check if this is a celebration moment
      const isCelebration = detectCelebration(response)

      // Add AI response
      addMessage(response, 'assistant', isCelebration ? 'celebration' : undefined)

      // Track hints (Socratic questions count as hints)
      if (practiceSession.isActive && isAskingQuestion(response)) {
        practiceSession.useHint()
        console.log('💡 [App] Hint detected in AI response')
      }

      // Detect if answer is correct or incorrect and record attempt
      console.log('🔍 [App] Practice session active?', practiceSession.isActive)
      console.log('🔍 [App] Current session:', practiceSession.currentSession)
      
      if (practiceSession.isActive) {
        console.log('🔍 [App] Checking AI response for answer detection...')
        console.log('📝 [App] AI Response:', response.substring(0, 100))
        console.log('📝 [App] Full AI Response:', response)
        
        const isCorrect = detectCorrectAnswer(response)
        const isIncorrect = detectIncorrectAnswer(response)
        
        console.log(`🎯 [App] Detection results - Correct: ${isCorrect}, Incorrect: ${isIncorrect}`)
        
        if (isCorrect || isIncorrect) {
          console.log(`${isCorrect ? '✅' : '❌'} [App] Answer detected as ${isCorrect ? 'correct' : 'incorrect'}`)
          console.log(`📝 [App] Submitting attempt for message: "${messageContent}"`)
          
          // Record the attempt
          const attemptResult = await practiceSession.submitAttempt(
            messageContent,
            isCorrect,
            conversation.messages
          )
          
          console.log('📊 [App] Attempt result:', attemptResult)
          
          if (attemptResult) {
            console.log('🎉 [App] Attempt recorded successfully, XP:', attemptResult.xpEarned)
            // Refresh Header XP
            if ((window as any).refreshHeaderXP) {
              console.log('🔄 [App] Refreshing Header XP...')
              setTimeout(() => (window as any).refreshHeaderXP(), 500)
            } else {
              console.warn('⚠️ [App] refreshHeaderXP function not found on window')
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
    <div className="flex h-screen flex-col bg-white">
      {/* Hide header during placement test */}
      {currentView !== 'placement' && (
        <Header 
          currentView={currentView}
          onNewProblem={hasMessages ? handleNewProblem : undefined}
          onLoadConversation={handleLoadConversation}
          onNavigate={handleNavigate}
        />
      )}
      {renderView()}
      
      {/* XP Feedback Modal */}
      {practiceSession.lastAttemptResult && (
        <XPFeedback
          result={practiceSession.lastAttemptResult}
          onClose={() => {
            practiceSession.clearLastResult()
            // Clear subtopic selection after completing a problem
            setCurrentSubtopicId(null)
          }}
        />
      )}
    </div>
  )
}

export default App

