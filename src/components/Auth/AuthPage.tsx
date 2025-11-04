import { useState } from 'react'
import LoginForm from './LoginForm'
import SignUpForm from './SignUpForm'
import SparkieIcon3D from '../Landing/SparkieIcon3D'

interface AuthPageProps {
  onAuthSuccess: () => void
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap');
      `}</style>
      
      <div className="bg-[url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/gridBackground.png')] min-h-screen w-full bg-no-repeat bg-cover bg-center flex flex-col items-center justify-center px-4 py-12">
        {/* Logo with Sparkie */}
        <div className="relative mb-8 inline-block">
          <h1 
            className="text-5xl md:text-6xl text-gray-900 relative z-10"
            style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600 }}
          >
            Sparkie
          </h1>
          {/* Small Sparkie 3D icon */}
          <span className="absolute -top-8 -right-4 md:-top-10 md:-right-6 z-0">
            <div className="h-20 w-20 md:h-24 md:w-24">
              <SparkieIcon3D />
            </div>
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-center text-gray-600 mb-8 max-w-md">
          Your AI-powered math tutor using the Socratic method
        </p>

        {/* Auth Form Card */}
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6">
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
    </>
  )
}

