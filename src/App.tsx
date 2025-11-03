import { Header, EmptyState } from './components/Layout'
import { MessageList, InputArea, TypingIndicator } from './components/Chat'
import { useConversation } from './contexts'
import { sendMessage } from './services/openaiService'
import {
  buildConversationContext,
  detectStuckResponse,
  detectCelebration,
} from './utils/promptBuilder'

function App() {
  const {
    conversation,
    addMessage,
    clearConversation,
    setStatus,
    incrementStuckCount,
    resetStuckCount,
  } = useConversation()

  const handleNewProblem = () => {
    clearConversation()
  }

  const handleSendMessage = async (content: string) => {
    // Add user message
    addMessage(content, 'user')

    // Check if user seems stuck
    if (detectStuckResponse(content)) {
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
          content,
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
      <Header onNewProblem={hasMessages ? handleNewProblem : undefined} />

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

