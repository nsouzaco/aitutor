import { useEffect } from 'react'
import { Header, EmptyState, LoadingState } from './components/Layout'
import { MessageList, InputArea, TypingIndicator } from './components/Chat'
import { AuthPage } from './components/Auth'
import { useConversation, useAuth } from './contexts'
import { sendMessage, extractTextFromImage } from './services/openaiService'
import {
  buildConversationContext,
  detectStuckResponse,
  detectCelebration,
} from './utils/promptBuilder'

function App() {
  const { user, loading: authLoading } = useAuth()
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
      // Save after a brief delay to batch rapid changes
      const timer = setTimeout(() => {
        saveConversation(user.uid)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [conversation.messages.length, conversation.status, user, saveConversation])

  // Show loading state while checking authentication
  if (authLoading) {
    return <LoadingState message="Loading..." />
  }

  // Show auth page if not authenticated
  if (!user) {
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

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    let messageContent = content
    
    // Show typing indicator early if processing image
    if (imageUrl) {
      setStatus('thinking')
    }

    // If image is provided, extract text using Vision API
    if (imageUrl) {
      try {
        // Extract base64 data from data URL
        const base64Data = imageUrl.split(',')[1]
        const extractedText = await extractTextFromImage(base64Data)
        
        // Combine extracted text with user's message
        messageContent = content
          ? `${content}\n\nExtracted from image: ${extractedText}`
          : `Problem from image: ${extractedText}`
        
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
      // Build conversation context with current stuck count
      const messages = buildConversationContext(
        [...conversation.messages, {
          id: 'temp',
          sender: 'user',
          content: messageContent,
          timestamp: new Date(),
        }],
        conversation.stuckCount
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
    <div className="flex min-h-screen flex-col bg-white">
      <Header 
        onNewProblem={hasMessages ? handleNewProblem : undefined}
        onLoadConversation={handleLoadConversation}
      />

      <main className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <EmptyState />
        ) : (
          <div className="pb-32">
            <MessageList messages={conversation.messages} />
            {isThinking && (
              <div className="mx-auto max-w-4xl px-4 sm:px-6">
                <TypingIndicator />
              </div>
            )}
          </div>
        )}
      </main>

      <InputArea
        onSend={handleSendMessage}
        disabled={isThinking}
        placeholder="Type your math problem or answer..."
      />
    </div>
  )
}

export default App

