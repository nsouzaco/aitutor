/**
 * RecentActivity - Display recent attempts
 */

import { CheckCircle, XCircle, Clock, Star } from 'lucide-react'
import { RecentActivity as RecentActivityType } from '../../types/attempt'

interface RecentActivityProps {
  activities: RecentActivityType[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No activity yet</p>
          <p className="text-sm text-gray-400 mt-1">Start solving problems to see your progress here!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.attemptId}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Status Icon */}
              {activity.isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}

              {/* Topic Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.subtopicName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTimeAgo(activity.attemptedAt)}
                </p>
              </div>
            </div>

            {/* XP Badge */}
            <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-900">
                +{activity.xpEarned}
              </span>
            </div>
          </div>
        ))}
      </div>

      {activities.length >= 5 && (
        <button className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All Activity →
        </button>
      )}
    </div>
  )
}

