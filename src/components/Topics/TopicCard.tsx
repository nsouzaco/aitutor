/**
 * TopicCard - Individual topic card with status and CTA
 */

import { CheckCircle, Circle, Lock, PlayCircle, ArrowRight, Clock } from 'lucide-react'
import { SubtopicWithProgress } from '../../types/curriculum'

interface TopicCardProps {
  topic: SubtopicWithProgress
  isLocked: boolean
  lockedReason?: string
  onStartPractice?: () => void
}

export function TopicCard({ topic, isLocked, lockedReason, onStartPractice }: TopicCardProps) {
  const getStatusInfo = () => {
    if (isLocked) {
      return {
        icon: Lock,
        iconColor: 'text-gray-400',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        badge: 'Locked',
        badgeColor: 'bg-gray-100 text-gray-600',
      }
    }

    switch (topic.status) {
      case 'mastered':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badge: 'Mastered',
          badgeColor: 'bg-green-100 text-green-700',
        }
      case 'in-progress':
        return {
          icon: PlayCircle,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          badge: 'In Progress',
          badgeColor: 'bg-yellow-100 text-yellow-700',
        }
      default:
        return {
          icon: Circle,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badge: 'Not Started',
          badgeColor: 'bg-blue-100 text-blue-700',
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  const getDifficultyLabel = (difficulty: 1 | 2 | 3) => {
    switch (difficulty) {
      case 1:
        return 'Beginner'
      case 2:
        return 'Intermediate'
      case 3:
        return 'Advanced'
    }
  }

  return (
    <div
      className={`p-4 rounded-lg border ${statusInfo.borderColor} ${statusInfo.bgColor} ${
        isLocked ? 'opacity-60' : 'hover:shadow-md'
      } transition-all flex flex-col h-full`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <StatusIcon className={`w-5 h-5 ${statusInfo.iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-tight">
              {topic.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {topic.description}
            </p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center space-x-2 mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.badgeColor}`}>
          {statusInfo.badge}
        </span>
        <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium">
          {getDifficultyLabel(topic.difficulty)}
        </span>
      </div>

      {/* Estimated Time */}
      {!isLocked && (
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <Clock className="w-3.5 h-3.5 mr-1" />
          <span>~{topic.estimatedMinutes} min</span>
        </div>
      )}

      {/* Locked Reason */}
      {isLocked && lockedReason && (
        <div className="mb-3 text-sm text-gray-500 flex items-start">
          <Lock className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
          <span>{lockedReason}</span>
        </div>
      )}

      {/* Spacer to push button to bottom */}
      <div className="flex-1"></div>

      {/* Progress Bar (if in progress) */}
      {topic.status === 'in-progress' && !isLocked && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progress to Mastery</span>
            <span className="font-medium">{Math.round((topic.correctCount / 10) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(topic.correctCount / 10) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {topic.correctCount} / 10 correct • {topic.attemptCount} attempts
          </p>
        </div>
      )}

      {/* Mastery Score (if mastered) */}
      {topic.status === 'mastered' && !isLocked && (
        <div className="mb-3 text-sm text-green-700">
          <span className="font-medium">{topic.masteryScore}% accuracy</span>
          <span className="text-green-600 mx-1">•</span>
          <span>{topic.correctCount} / 10 completed</span>
        </div>
      )}

      {/* CTA Button */}
      {!isLocked && (
        <button
          onClick={onStartPractice}
          className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2 group ${
            topic.status === 'mastered'
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : topic.status === 'in-progress'
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <span>
            {topic.status === 'mastered'
              ? 'Review'
              : topic.status === 'in-progress'
              ? 'Continue'
              : 'Start Practice'}
          </span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {isLocked && (
        <button
          disabled
          className="w-full py-2 px-4 rounded-lg font-medium text-sm bg-gray-200 text-gray-400 cursor-not-allowed"
        >
          <Lock className="w-4 h-4 inline mr-1" />
          Locked
        </button>
      )}
    </div>
  )
}

