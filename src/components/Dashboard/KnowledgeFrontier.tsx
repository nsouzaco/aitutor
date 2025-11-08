/**
 * KnowledgeFrontier - Recommend next best topic to study
 */

import { ArrowRight, TrendingUp, Clock, Target } from 'lucide-react'
import { SubtopicWithProgress } from '../../types/curriculum'

interface KnowledgeFrontierProps {
  recommendedTopic: SubtopicWithProgress | null
  onStartPractice?: (subtopicId: string) => void
}

export function KnowledgeFrontier({ recommendedTopic, onStartPractice }: KnowledgeFrontierProps) {
  if (!recommendedTopic) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-blue-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">You've mastered all available topics.</p>
          <p className="text-sm text-gray-500 mt-1">Complete prerequisites to unlock more.</p>
        </div>
      </div>
    )
  }

  const getDifficultyLabel = (difficulty: 1 | 2 | 3) => {
    switch (difficulty) {
      case 1:
        return { label: 'Beginner', color: 'text-green-600 bg-green-100' }
      case 2:
        return { label: 'Intermediate', color: 'text-yellow-600 bg-yellow-100' }
      case 3:
        return { label: 'Advanced', color: 'text-red-600 bg-red-100' }
    }
  }

  const difficultyInfo = getDifficultyLabel(recommendedTopic.difficulty)
  const isInProgress = recommendedTopic.status === 'in-progress'
  const progressToMastery = isInProgress
    ? Math.round((recommendedTopic.correctCount / (recommendedTopic.attemptCount * 0.85)) * 100)
    : 0

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Recommended Next</h2>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyInfo.color}`}>
          {difficultyInfo.label}
        </span>
      </div>

      {/* Topic Info */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {recommendedTopic.name}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {recommendedTopic.description}
        </p>
      </div>

      {/* Progress (if in progress) */}
      {isInProgress && (
        <div className="mb-4 p-3 bg-white rounded-lg border border-blue-100">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progress to Mastery</span>
            <span className="font-semibold text-gray-900">
              {recommendedTopic.correctCount} / {Math.ceil(recommendedTopic.attemptCount * 0.85)} correct
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressToMastery, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {recommendedTopic.masteryScore}% accuracy • {recommendedTopic.attemptCount} attempts
          </p>
        </div>
      )}

      {/* Estimated Time */}
      <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        <span>Estimated time: {recommendedTopic.estimatedMinutes} minutes</span>
      </div>

      {/* Example Problems Preview */}
      {recommendedTopic.examples && recommendedTopic.examples.length > 0 && (
        <div className="mb-4 pb-4 border-b border-blue-100">
          <p className="text-xs font-medium text-gray-600 mb-2">Example Problems:</p>
          <ul className="space-y-1">
            {recommendedTopic.examples.slice(0, 2).map((example, index) => (
              <li key={index} className="text-xs text-gray-500 flex items-start">
                <span className="mr-2">•</span>
                <span className="flex-1">{example}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={() => onStartPractice?.(recommendedTopic.id)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-full transition-colors flex items-center justify-center space-x-2 group shadow-md hover:shadow-lg"
      >
        <span>{isInProgress ? 'Continue Practice' : 'Start Practice'}</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  )
}

