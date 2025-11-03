import { Message } from './message'

export interface ConversationState {
  conversationId: string
  messages: Message[]
  problemText: string
  problemImageUrl?: string
  status: 'idle' | 'thinking' | 'error'
  stuckCount: number
  userId?: string | null
}

