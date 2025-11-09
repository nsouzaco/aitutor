import { useEffect, useRef } from 'react'
import { Message as MessageType } from '../../types'
import Message from './Message'

interface MessageListProps {
  messages: MessageType[]
}

export default function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  // Scroll the parent container instead of using scrollIntoView
  useEffect(() => {
    if (containerRef.current) {
      // Find the scrollable parent container
      const scrollableParent = containerRef.current.closest('[class*="overflow-y-auto"]') as HTMLElement
      if (scrollableParent) {
        // Use scrollTop for more reliable behavior
        scrollableParent.scrollTop = scrollableParent.scrollHeight
      }
    }
  }, [messages])

  if (messages.length === 0) {
    return null
  }

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <div className="space-y-4">
        {messages.map(message => (
          <Message key={message.id} message={message} />
        ))}
      </div>
    </div>
  )
}

