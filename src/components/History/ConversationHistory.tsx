import { useState, useEffect } from 'react'
import { Clock, MessageCircle, Loader2 } from 'lucide-react'
import { getUserConversations, ConversationDocument } from '../../services/firestoreService'
import { useAuth } from '../../contexts'

interface ConversationHistoryProps {
  onLoadConversation: (conversationId: string) => void
  onClose: () => void
}

export default function ConversationHistory({
  onLoadConversation,
  onClose,
}: ConversationHistoryProps) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ConversationDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadConversations() {
      console.log('🔍 ConversationHistory: Loading conversations for user:', user)
      if (!user) {
        console.log('❌ No user logged in')
        return
      }

      try {
        console.log('📡 Fetching conversations for userId:', user.uid)
        setLoading(true)
        const userConversations = await getUserConversations(user.uid)
        console.log('✅ Received conversations:', userConversations.length)
        console.log('📋 Conversation details:', userConversations)
        setConversations(userConversations)
      } catch (err: any) {
        console.error('❌ Error loading conversations:', err)
        console.error('Error details:', err.message, err.code)
        setError(`Failed to load conversation history: ${err.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    loadConversations()
  }, [user])

  const handleLoadConversation = (conversationId: string) => {
    onLoadConversation(conversationId)
    onClose()
  }

  const formatTimestamp = (timestamp: any) => {
    const date = timestamp.toDate()
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const truncateProblem = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-xl font-bold text-gray-900">Conversation History</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 size={32} className="animate-spin" />
              <p className="mt-4">Loading conversations...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-center text-red-700">
              {error}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <MessageCircle size={48} className="text-gray-300" />
              <p className="mt-4 text-lg font-medium">No conversations yet</p>
              <p className="mt-2 text-sm">Start a new problem to begin!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <button
                  key={conv.conversationId}
                  onClick={() => handleLoadConversation(conv.conversationId)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {truncateProblem(conv.problemText || 'Untitled conversation')}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageCircle size={14} />
                          {conv.messages.length} messages
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatTimestamp(conv.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

