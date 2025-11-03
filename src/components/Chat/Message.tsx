import { Bot, User } from 'lucide-react'
import { Message as MessageType } from '../../types'
import { MathContent } from '../MathRenderer'

interface MessageProps {
  message: MessageType
}

export default function Message({ message }: MessageProps) {
  const isUser = message.sender === 'user'
  const isHint = message.type === 'hint'
  const isCelebration = message.type === 'celebration'

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6 animate-fade-in`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-gray-200' : 'bg-primary'
        }`}
      >
        {isUser ? (
          <User size={18} className="text-gray-700" />
        ) : (
          <Bot size={18} className="text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex max-w-[85%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-white border border-gray-200'
              : isCelebration
              ? 'bg-gradient-to-r from-green-50 to-primary/10 border border-primary/20'
              : isHint
              ? 'bg-amber-50 border-l-4 border-amber-400'
              : 'bg-tutor-message'
          }`}
        >
          {isHint && (
            <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-amber-700">
              💡 Hint
            </div>
          )}
          {isCelebration && (
            <div className="mb-1 text-2xl">🎉</div>
          )}
          {message.imageUrl && (
            <div className="mb-3">
              <img
                src={message.imageUrl}
                alt="Uploaded math problem"
                className="max-h-64 rounded-lg border border-gray-200"
              />
            </div>
          )}
          <div className={`text-${isUser ? 'base' : 'lg'} text-gray-900`}>
            <MathContent content={message.content} />
          </div>
        </div>

        {/* Timestamp */}
        <span className="mt-1 text-xs text-gray-500">
          {message.timestamp.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  )
}

