import { useState } from 'react'
import { Header, EmptyState } from './components/Layout'
import { MessageList, InputArea, TypingIndicator } from './components/Chat'
import { useConversation } from './contexts'

// Mock responses for testing
const mockResponses = [
  "Great! Let's work through this together. What are we trying to find in this problem?",
  "Exactly! Now, what information do we have that might help us?",
  "Good thinking! What operation could we use to isolate the variable?",
  "Perfect! Can you try that step and tell me what you get?",
]

function App() {
  const { conversation, addMessage, clearConversation, setStatus } = useConversation()
  const [mockResponseIndex, setMockResponseIndex] = useState(0)

  const handleNewProblem = () => {
    clearConversation()
    setMockResponseIndex(0)
  }

  const handleSendMessage = (content: string) => {
    // Add user message
    addMessage(content, 'user')
    
    // Show typing indicator
    setStatus('thinking')

    // Simulate AI response after a delay
    setTimeout(() => {
      const response = mockResponses[mockResponseIndex % mockResponses.length]
      addMessage(response, 'assistant')
      setStatus('idle')
      setMockResponseIndex(prev => prev + 1)
    }, 1500)
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

