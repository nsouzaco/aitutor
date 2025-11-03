import { BookOpen, LogOut, User } from 'lucide-react'
import { useAuth } from '../../contexts'
import { signOut } from '../../services/authService'

interface HeaderProps {
  onNewProblem?: () => void
}

export default function Header({ onNewProblem }: HeaderProps) {
  const { user } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        {/* Logo and Title */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
            <BookOpen size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-900">AI Math Tutor</h1>
            <p className="hidden text-xs text-gray-500 sm:block">
              Socratic Learning Assistant
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* New Problem Button */}
          {onNewProblem && (
            <button
              onClick={onNewProblem}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-dark hover:shadow-md active:scale-95"
              aria-label="Start a new problem"
            >
              New Problem
            </button>
          )}

          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-700">
                <User size={14} />
                <span className="font-medium max-w-[120px] truncate">
                  {user.displayName || user.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

