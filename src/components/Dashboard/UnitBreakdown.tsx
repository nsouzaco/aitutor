/**
 * UnitBreakdown - Display progress per curriculum unit
 */

import React from 'react'
import { BookOpen, TrendingUp } from 'lucide-react'

interface UnitProgress {
  unitId: string
  unitName: string
  totalSubtopics: number
  masteredSubtopics: number
  inProgressSubtopics: number
  completionPercentage: number
}

interface UnitBreakdownProps {
  units: UnitProgress[]
}

export function UnitBreakdown({ units }: UnitBreakdownProps) {
  const getUnitColor = (index: number) => {
    const colors = [
      { bg: 'bg-purple-50', border: 'border-purple-200', bar: 'from-purple-400 to-purple-600', text: 'text-purple-900' },
      { bg: 'bg-blue-50', border: 'border-blue-200', bar: 'from-blue-400 to-blue-600', text: 'text-blue-900' },
      { bg: 'bg-green-50', border: 'border-green-200', bar: 'from-green-400 to-green-600', text: 'text-green-900' },
      { bg: 'bg-orange-50', border: 'border-orange-200', bar: 'from-orange-400 to-orange-600', text: 'text-orange-900' },
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Unit Progress</h2>
        <BookOpen className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {units.map((unit, index) => {
          const colors = getUnitColor(index)
          
          return (
            <div
              key={unit.unitId}
              className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-semibold ${colors.text}`}>
                  {unit.unitName}
                </h3>
                <span className={`text-sm font-bold ${colors.text}`}>
                  {unit.completionPercentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white rounded-full h-2 mb-2">
                <div
                  className={`bg-gradient-to-r ${colors.bar} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${unit.completionPercentage}%` }}
                />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  {unit.masteredSubtopics} mastered
                  {unit.inProgressSubtopics > 0 && (
                    <>, {unit.inProgressSubtopics} in progress</>
                  )}
                </span>
                <span>
                  {unit.masteredSubtopics} / {unit.totalSubtopics} topics
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Overall Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">Overall Progress</span>
          </div>
          <span className="font-semibold text-gray-900">
            {Math.round(
              (units.reduce((sum, u) => sum + u.masteredSubtopics, 0) /
                units.reduce((sum, u) => sum + u.totalSubtopics, 0)) *
                100
            )}
            % Complete
          </span>
        </div>
      </div>
    </div>
  )
}

