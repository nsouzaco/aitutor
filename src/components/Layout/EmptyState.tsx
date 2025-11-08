import { Image, Type } from 'lucide-react'
import SparkieIcon3D from '../Landing/SparkieIcon3D'

interface EmptyStateProps {
  onStartConversation?: () => void
}

export default function EmptyState({ onStartConversation: _onStartConversation }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8">
      <div className="w-full text-center">
        {/* Icon - Sparkie 3D Model - Centered above text */}
        <div className="flex justify-center mb-2">
          <SparkieIcon3D size="large" />
        </div>

        {/* Heading */}
        <h2 className="mb-3 text-2xl font-bold text-gray-900">
          Let's solve a problem together!
        </h2>

        {/* Description */}
        <p className="mb-6 text-base text-gray-600 px-2">
          I'm here to guide you through math problems using questions and hints.
          You'll discover the solution yourself!
        </p>

        {/* Features */}
        <div className="mb-4 space-y-3 px-2">
          <div className="rounded-lg border border-gray-200 bg-white p-3 text-left">
            <div className="flex items-start gap-3">
              <Type className="text-primary flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="mb-1 font-semibold text-gray-900 text-sm">Type Your Problem</h3>
                <p className="text-xs text-gray-600">
                  Enter any math problem in the chat below
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 text-left">
            <div className="flex items-start gap-3">
              <Image className="text-primary flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="mb-1 font-semibold text-gray-900 text-sm">Upload an Image</h3>
                <p className="text-xs text-gray-600">
                  Take a photo of your homework or textbook
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

