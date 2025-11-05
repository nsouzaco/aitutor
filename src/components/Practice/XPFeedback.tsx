/**
 * XPFeedback - Display XP earned and progress updates after solving problems
 */

import React, { useEffect, useState } from 'react'
import { Star, TrendingUp, Unlock, CheckCircle, X } from 'lucide-react'
import { AttemptResult } from '../../types/attempt'
import { getSubtopicName } from '../../data/curriculum'

interface XPFeedbackProps {
  result: AttemptResult
  onClose: () => void
}

export function XPFeedback({ result, onClose }: XPFeedbackProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Trigger animation
    setShow(true)
  }, [])

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 300) // Wait for animation
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform transition-all duration-300 ${
          show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
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
          onClick={handleClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

