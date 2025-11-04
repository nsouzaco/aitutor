/**
 * MasteryProgress - Display mastery overview and topic list
 */

import React from 'react'
import { CheckCircle, Circle, Lock, PlayCircle } from 'lucide-react'

interface MasteryProgressProps {
  masteryPercentage: number
  topicsMastered: number
  totalTopics: number
  topicsInProgress: number
  topicsLocked: number
}

export function MasteryProgress({
  masteryPercentage,
  topicsMastered,
  totalTopics,
  topicsInProgress,
  topicsLocked,
}: MasteryProgressProps) {
  const topicsNotStarted = totalTopics - topicsMastered - topicsInProgress - topicsLocked

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Mastery Overview</h2>

      {/* Overall Progress Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 56}
              strokeDashoffset={(2 * Math.PI * 56) * (1 - masteryPercentage / 100)}
              className="text-green-500 transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{masteryPercentage}%</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm text-green-600 font-medium">Mastered</p>
            <p className="text-lg font-bold text-green-900">{topicsMastered}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <PlayCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="text-sm text-yellow-600 font-medium">In Progress</p>
            <p className="text-lg font-bold text-yellow-900">{topicsInProgress}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Circle className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-600 font-medium">Not Started</p>
            <p className="text-lg font-bold text-blue-900">{topicsNotStarted}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-600 font-medium">Locked</p>
            <p className="text-lg font-bold text-gray-900">{topicsLocked}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Topics Mastered</span>
          <span className="font-semibold text-gray-900">
            {topicsMastered} / {totalTopics}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${masteryPercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

