import { Bot } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-6">
      {/* Avatar */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
        <Bot size={18} className="text-white" />
      </div>

      {/* Typing Animation */}
      <div className="flex max-w-[85%] flex-col items-start">
        <div className="rounded-2xl bg-tutor-message px-4 py-3">
          <div className="flex gap-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
          </div>
        </div>
        <span className="mt-1 text-xs text-gray-500">Thinking...</span>
      </div>
    </div>
  )
}

