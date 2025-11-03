import { Lightbulb, Image, Type } from 'lucide-react'

interface EmptyStateProps {
  onStartConversation?: () => void
}

export default function EmptyState({ onStartConversation: _onStartConversation }: EmptyStateProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Lightbulb size={40} className="text-primary" />
        </div>

        {/* Heading */}
        <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
          Let's solve a problem together!
        </h2>

        {/* Description */}
        <p className="mb-8 text-lg text-gray-600">
          I'm here to guide you through math problems using questions and hints.
          You'll discover the solution yourself!
        </p>

        {/* Features */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-left">
            <Type className="mb-2 text-primary" size={24} />
            <h3 className="mb-1 font-semibold text-gray-900">Type Your Problem</h3>
            <p className="text-sm text-gray-600">
              Enter any math problem in the chat below
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-left">
            <Image className="mb-2 text-primary" size={24} />
            <h3 className="mb-1 font-semibold text-gray-900">Upload an Image</h3>
            <p className="text-sm text-gray-600">
              Take a photo of your homework or textbook
            </p>
          </div>
        </div>

        {/* Example Problems */}
        <div className="rounded-lg bg-surface p-6 text-left">
          <p className="mb-3 text-sm font-semibold text-gray-700">
            Try these examples:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="mr-2 text-primary">•</span>
              <span>Solve for x: 2x + 5 = 13</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-primary">•</span>
              <span>
                A rectangle has a perimeter of 24 cm. The length is 3 cm more
                than the width. What are the dimensions?
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-primary">•</span>
              <span>Factor: x² + 5x + 6</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

