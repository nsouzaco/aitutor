/**
 * StatsHeader - Display XP, streaks, and pace
 */

import { TrendingUp, Flame, Star, Calendar } from 'lucide-react'

interface StatsHeaderProps {
  totalXP: number
  weeklyXP: number
  monthlyXP: number
  dailyAverageXP: number
  currentStreak: number
  paceRating: {
    rating: 'excellent' | 'good' | 'fair' | 'needs-improvement'
    label: string
    color: string
  }
}

export function StatsHeader({
  totalXP,
  weeklyXP,
  monthlyXP,
  dailyAverageXP,
  currentStreak,
  paceRating,
}: StatsHeaderProps) {
  const getPaceColor = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'fair':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total XP */}
        <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex-shrink-0">
            <Star className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-purple-600 font-medium">Total XP</p>
            <p className="text-2xl font-bold text-purple-900">{totalXP.toLocaleString()}</p>
          </div>
        </div>

        {/* Weekly XP */}
        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex-shrink-0">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-blue-600 font-medium">This Week</p>
            <p className="text-2xl font-bold text-blue-900">{weeklyXP}</p>
            <p className="text-xs text-blue-600">~{dailyAverageXP}/day</p>
          </div>
        </div>

        {/* Current Streak */}
        <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex-shrink-0">
            <Flame className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-orange-600 font-medium">Streak</p>
            <p className="text-2xl font-bold text-orange-900">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>

        {/* Pace Rating */}
        <div className={`flex items-center space-x-3 p-4 rounded-lg border ${getPaceColor(paceRating.rating)}`}>
          <div className="flex-shrink-0">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium">Learning Pace</p>
            <p className="text-lg font-bold">{paceRating.label}</p>
          </div>
        </div>
      </div>

      {/* Monthly Stats Bar */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Monthly XP</span>
          <span className="font-semibold text-gray-900">{monthlyXP} XP</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((monthlyXP / 400) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Goal: 400 XP/month</p>
      </div>
    </div>
  )
}

