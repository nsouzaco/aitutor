import { useState } from 'react'
import { BookOpen, User, History } from 'lucide-react'
import { useAuth } from '../../contexts'
import { signOut } from '../../services/authService'
import { ConversationHistory } from '../History'

interface HeaderProps {
  onNewProblem?: () => void
  onLoadConversation?: (conversationId: string) => void
}

export default function Header({ onNewProblem, onLoadConversation }: HeaderProps) {
  const { user } = useAuth()
  const [showHistory, setShowHistory] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleLoadConversation = (conversationId: string) => {
    if (onLoadConversation) {
      onLoadConversation(conversationId)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap');
      `}</style>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Logo and Title - Left Side */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              <BookOpen size={24} />
            </div>
            <h1 
              className="text-lg text-gray-900"
              style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600 }}
            >
              Sparkie
            </h1>
          </div>

          {/* User Menu - Right Side */}
          {user && (
            <div className="flex items-center gap-2">
              {/* History Button */}
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                aria-label="View conversation history"
                title="View conversation history"
              >
                <History size={16} />
                <span className="hidden sm:inline">History</span>
              </button>

              {/* New Problem Button */}
              {onNewProblem && (
                <button
                  onClick={onNewProblem}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                  aria-label="Start new problem"
                  title="Start new problem"
                >
                  New Problem
                </button>
              )}

              {/* User Info */}
              <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700">
                <User size={14} />
                <span className="font-medium max-w-[120px] truncate">
                  {user.displayName || user.email}
                </span>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                aria-label="Sign out"
                title="Sign out"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Conversation History Modal */}
        {showHistory && (
          <ConversationHistory
            onLoadConversation={handleLoadConversation}
            onClose={() => setShowHistory(false)}
          />
        )}
      </header>
    </>
  )
}

