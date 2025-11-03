import { useState } from 'react'
import { Brain } from 'lucide-react'
import LoginForm from './LoginForm'
import SignUpForm from './SignUpForm'

interface AuthPageProps {
  onAuthSuccess: () => void
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary/5 via-white to-purple-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 bg-gradient-to-br from-primary to-purple-600 text-white">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="rounded-full bg-white/20 p-3 backdrop-blur">
              <Brain size={40} />
            </div>
            <h1 className="text-4xl font-bold">AI Math Tutor</h1>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Master Math Through Guided Discovery
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Your personal Socratic tutor that helps you learn by asking the right questions
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-full bg-white/20 p-1.5 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Socratic Learning</h3>
                <p className="text-white/80 text-sm">Guided questions help you discover solutions on your own</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-full bg-white/20 p-1.5 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Upload Math Photos</h3>
                <p className="text-white/80 text-sm">Take a photo of your homework and get instant guidance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-full bg-white/20 p-1.5 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Beautiful Math Rendering</h3>
                <p className="text-white/80 text-sm">LaTeX-powered equations display perfectly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="rounded-full bg-primary/10 p-2">
              <Brain size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI Math Tutor</h1>
          </div>

          {mode === 'login' ? (
            <LoginForm
              onSuccess={onAuthSuccess}
              onSwitchToSignUp={() => setMode('signup')}
            />
          ) : (
            <SignUpForm
              onSuccess={onAuthSuccess}
              onSwitchToLogin={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

