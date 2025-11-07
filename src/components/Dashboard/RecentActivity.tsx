/**
 * RecentActivity - Display recent conversations
 */

import { useState, useEffect } from 'react'
import { MessageSquare, Clock, History } from 'lucide-react'
import { getUserConversations } from '../../services/firestoreService'

interface RecentActivityProps {
  userId: string
}

interface ConversationItem {
  conversationId: string
  problemText: string
  messageCount: number
  updatedAt: Date
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [userId])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const recentConversations = await getUserConversations(userId, 4)
      setConversations(recentConversations.map(conv => ({
        conversationId: conv.conversationId,
        problemText: conv.problemText || 'Untitled conversation',
        messageCount: conv.messages.length,
        updatedAt: conv.updatedAt?.toDate() || new Date(),
      })))
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">History</h2>
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-spin" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">History</h2>
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No conversations yet</p>
          <p className="text-sm text-gray-400 mt-1">Start solving problems to see your chat history!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">History</h2>
        <History className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {conversations.map((conversation) => (
          <div
            key={conversation.conversationId}
            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {/* Icon */}
            <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {conversation.problemText}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-gray-500">
                  {conversation.messageCount} {conversation.messageCount === 1 ? 'message' : 'messages'}
                </p>
                <span className="text-xs text-gray-400">•</span>
                <p className="text-xs text-gray-500">
                  {formatTimeAgo(conversation.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
        onClick={() => {
          // Trigger the history modal - we'll use the global history button
          const historyButton = document.querySelector('[aria-label="View conversation history"]') as HTMLButtonElement
          if (historyButton) historyButton.click()
        }}
      >
        View All Conversations →
      </button>
    </div>
  )
}

