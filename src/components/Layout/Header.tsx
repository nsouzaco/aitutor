import { useState, useEffect } from 'react'
import { BookOpen, User, History, LayoutDashboard, Library, MessageSquare, Star } from 'lucide-react'
import { useAuth } from '../../contexts'
import { signOut } from '../../services/authService'
import { ConversationHistory } from '../History'
import { getStudentProfile } from '../../services/dashboardService'

interface HeaderProps {
  currentView?: 'tutor' | 'dashboard' | 'topics'
  onNewProblem?: () => void
  onLoadConversation?: (conversationId: string) => void
  onNavigate?: (view: 'tutor' | 'dashboard' | 'topics') => void
  onXPUpdate?: () => void
}

// Expose the refresh function
export const refreshHeaderXP = () => {
  // This will be set by the Header component
  if ((window as any).refreshHeaderXP) {
    (window as any).refreshHeaderXP()
  }
}

export default function Header({ currentView = 'tutor', onNewProblem, onLoadConversation, onNavigate, onXPUpdate }: HeaderProps) {
  const { user } = useAuth()
  const [showHistory, setShowHistory] = useState(false)
  const [totalXP, setTotalXP] = useState(0)
  const [xpPulse, setXpPulse] = useState(false)

  // Load and update XP
  useEffect(() => {
    if (user?.uid) {
      loadXP()
      // Refresh XP every 5 seconds
      const interval = setInterval(loadXP, 5000)
      return () => clearInterval(interval)
    }
  }, [user?.uid])

  useEffect(() => {
    // Expose refresh function globally
    (window as any).refreshHeaderXP = loadXP
    return () => {
      delete (window as any).refreshHeaderXP
    }
  }, [user?.uid])

  const loadXP = async () => {
    if (!user?.uid) return
    try {
      const profile = await getStudentProfile(user.uid)
      const oldXP = totalXP
      setTotalXP(profile.totalXP)
      console.log('📊 [Header] XP updated:', profile.totalXP)
      
      // Trigger pulse animation if XP increased
      if (profile.totalXP > oldXP && oldXP > 0) {
        setXpPulse(true)
        setTimeout(() => setXpPulse(false), 1000)
      }
    } catch (error) {
      console.error('Error loading XP:', error)
    }
  }

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
          <div className="flex items-center gap-6">
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

            {/* Navigation */}
            {user && onNavigate && (
              <nav className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => onNavigate('tutor')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'tutor'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare size={16} />
                  <span>Tutor</span>
                </button>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => onNavigate('topics')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'topics'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Library size={16} />
                  <span>Topics</span>
                </button>
              </nav>
            )}
          </div>

          {/* User Menu - Right Side */}
          {user && (
            <div className="flex items-center gap-2">
              {/* XP Display */}
              <div className={`flex items-center gap-1.5 rounded-full border border-purple-300 bg-purple-50 px-3 py-2 transition-all duration-300 ${
                xpPulse ? 'scale-110 shadow-lg ring-2 ring-purple-400' : 'scale-100'
              }`}>
                <Star className={`w-4 h-4 text-purple-600 fill-purple-600 transition-transform duration-300 ${
                  xpPulse ? 'rotate-180 scale-125' : 'rotate-0 scale-100'
                }`} />
                <span className="text-sm font-bold text-purple-900">{totalXP.toLocaleString()}</span>
                <span className="text-xs text-purple-600 hidden sm:inline">XP</span>
              </div>

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

