import { Image, Type } from 'lucide-react'
import SparkieIcon3D from '../Landing/SparkieIcon3D'

interface EmptyStateProps {
  onStartConversation?: () => void
}

export default function EmptyState({ onStartConversation: _onStartConversation }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl text-center">
        {/* Icon - Sparkie 3D Model - Centered above text */}
        <div className="mx-auto mb-8">
          <div className="h-32 w-32 md:h-40 md:w-40 mx-auto">
            <SparkieIcon3D />
          </div>
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
      </div>
    </div>
  )
}

