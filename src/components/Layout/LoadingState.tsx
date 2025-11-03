import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-gray-700">
      <Loader2 size={48} className="animate-spin text-primary" />
      <p className="mt-4 text-lg font-medium">{message}</p>
    </div>
  )
}

