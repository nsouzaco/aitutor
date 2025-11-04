import { useEffect, useState } from 'react'
import { Header, EmptyState, LoadingState } from './components/Layout'
import { MessageList, InputArea, TypingIndicator } from './components/Chat'
import { AuthPage } from './components/Auth'
import { LandingPage } from './components/Landing'
import { Whiteboard } from './components/Whiteboard'
import { useConversation, useAuth } from './contexts'
import { sendMessage, extractTextFromImage } from './services/vercelApiService'
import {
  buildConversationContext,
  detectStuckResponse,
  detectCelebration,
} from './utils/promptBuilder'

function App() {
  const { user, loading: authLoading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
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
  }

  const handleLoadConversation = async (conversationId: string) => {
    try {
      await loadConversation(conversationId)
    } catch (error) {
      console.error('Error loading conversation:', error)
      // Could show a toast notification here
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

  return (
    <div className="flex h-screen flex-col bg-white">
      <Header 
        onNewProblem={hasMessages ? handleNewProblem : undefined}
        onLoadConversation={handleLoadConversation}
      />

      {/* Split Screen Layout: Chat (35%) + Whiteboard (65%) */}
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
    </div>
  )
}

export default App

