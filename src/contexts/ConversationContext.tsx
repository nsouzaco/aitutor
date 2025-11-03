import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { Message, ConversationState } from '../types'
import {
  saveConversation as saveConversationToFirestore,
  loadConversation as loadConversationFromFirestore,
} from '../services/firestoreService'

interface ConversationContextType {
  conversation: ConversationState
  addMessage: (content: string, sender: 'user' | 'assistant', type?: Message['type'], imageUrl?: string) => void
  clearConversation: () => void
  setStatus: (status: ConversationState['status']) => void
  incrementStuckCount: () => void
  resetStuckCount: () => void
  saveConversation: (userId: string) => Promise<void>
  loadConversation: (conversationId: string) => Promise<void>
}

const ConversationContext = createContext<ConversationContextType | undefined>(
  undefined
)

const initialState: ConversationState = {
  conversationId: crypto.randomUUID(),
  messages: [],
  problemText: '',
  status: 'idle',
  stuckCount: 0,
}

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [conversation, setConversation] = useState<ConversationState>(initialState)

  const addMessage = useCallback(
    (content: string, sender: 'user' | 'assistant', type?: Message['type'], imageUrl?: string) => {
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
        // Set problemText from first user message
        problemText: prev.problemText || (sender === 'user' ? content : ''),
      }))
    },
    []
  )

  const clearConversation = useCallback(() => {
    setConversation({
      ...initialState,
      conversationId: crypto.randomUUID(),
    })
  }, [])

  const setStatus = useCallback((status: ConversationState['status']) => {
    setConversation(prev => ({ ...prev, status }))
  }, [])

  const incrementStuckCount = useCallback(() => {
    setConversation(prev => ({ ...prev, stuckCount: prev.stuckCount + 1 }))
  }, [])

  const resetStuckCount = useCallback(() => {
    setConversation(prev => ({ ...prev, stuckCount: 0 }))
  }, [])

  const saveConversation = useCallback(
    async (userId: string) => {
      try {
        // Only save if there are messages
        if (conversation.messages.length > 0) {
          await saveConversationToFirestore(userId, conversation)
        }
      } catch (error) {
        console.error('Error saving conversation:', error)
        // Don't throw - saving is a nice-to-have, not critical
      }
    },
    [conversation]
  )

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      const loadedConversation = await loadConversationFromFirestore(
        conversationId
      )
      if (loadedConversation) {
        setConversation(loadedConversation)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      throw error
    }
  }, [])

  return (
    <ConversationContext.Provider
      value={{
        conversation,
        addMessage,
        clearConversation,
        setStatus,
        incrementStuckCount,
        resetStuckCount,
        saveConversation,
        loadConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  )
}

export function useConversation() {
  const context = useContext(ConversationContext)
  if (!context) {
    throw new Error('useConversation must be used within ConversationProvider')
  }
  return context
}

