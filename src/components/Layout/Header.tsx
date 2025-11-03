import { BookOpen } from 'lucide-react'

interface HeaderProps {
  onNewProblem?: () => void
}

export default function Header({ onNewProblem }: HeaderProps) {
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
      </div>
    </header>
  )
}

