/**
 * XPFeedback - Display XP earned and progress updates after solving problems
 */

import { useEffect, useState } from 'react'
import { Star, TrendingUp, Unlock, CheckCircle, X } from 'lucide-react'
import { AttemptResult } from '../../types/attempt'
import { getSubtopicName } from '../../data/curriculum'

interface XPFeedbackProps {
  result: AttemptResult
  onClose: () => void
  onContinuePractice?: () => void
}

export function XPFeedback({ result, onClose, onContinuePractice }: XPFeedbackProps) {
  const [show, setShow] = useState(false)
  const [confetti, setConfetti] = useState(false)

  useEffect(() => {
    // Trigger animation
    setShow(true)
    if (result.isCorrect) {
      setConfetti(true)
      // Add confetti effect for correct answers
      setTimeout(() => setConfetti(false), 3000)
      
      // Play success sound
      const audio = new Audio('/assets/mixkit-correct-positive-notification-957.wav')
      audio.play().catch(error => {
        console.warn('Could not play success sound:', error)
      })
    }
  }, [result.isCorrect])

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 300) // Wait for animation
  }

  const handleContinue = () => {
    setShow(false)
    setTimeout(() => {
      if (onContinuePractice) {
        onContinuePractice()
      } else {
        onClose()
      }
    }, 300)
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      {/* Confetti animation */}
      {confetti && result.isCorrect && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
                animation: `fall ${2 + Math.random() * 2}s linear ${Math.random() * 0.5}s`,
                animationFillMode: 'forwards',
              }}
            />
          ))}
        </div>
      )}
      
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>

      <div
        className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform transition-all duration-500 ${
          show ? 'scale-100 translate-y-0 rotate-0' : 'scale-75 translate-y-8 rotate-3'
        } ${result.isCorrect ? 'animate-bounce-in' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes bounce-in {
            0% { transform: scale(0.3) rotate(0deg); }
            50% { transform: scale(1.05) rotate(2deg); }
            70% { transform: scale(0.9) rotate(-1deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          .animate-bounce-in {
            animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
        `}</style>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        {result.isCorrect && (
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
        )}

        {/* Feedback Message */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {result.isCorrect ? 'Great Job!' : 'Keep Trying!'}
          </h2>
          <p className="text-gray-600">{result.feedback}</p>
        </div>

        {/* XP Earned */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center space-x-3">
            <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-900">
                +{result.xpEarned}
              </div>
              <div className="text-sm text-purple-600 font-medium">XP Earned</div>
            </div>
          </div>
        </div>

        {/* Mastery Achievement */}
        {result.masteryAchieved && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-bold text-green-900">Mastery Achieved! 🎉</div>
                <div className="text-sm text-green-700">
                  You've mastered this topic with 85%+ accuracy!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Topics Unlocked */}
        {result.newTopicsUnlocked && result.newTopicsUnlocked.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-3 mb-2">
              <Unlock className="w-6 h-6 text-blue-600" />
              <div className="font-bold text-blue-900">New Topics Unlocked!</div>
            </div>
            <div className="ml-9 space-y-1">
              {result.newTopicsUnlocked.map((topicId) => (
                <div key={topicId} className="text-sm text-blue-700">
                  • {getSubtopicName(topicId)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg"
        >
          {onContinuePractice ? 'Continue Practicing' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

