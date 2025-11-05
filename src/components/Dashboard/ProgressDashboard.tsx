/**
 * ProgressDashboard - Main dashboard component
 * Displays all progress, stats, and recommendations
 */

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { StatsHeader } from './StatsHeader'
import { MasteryProgress } from './MasteryProgress'
import { RecentActivity } from './RecentActivity'
import { UnitBreakdown } from './UnitBreakdown'
import { KnowledgeFrontier } from './KnowledgeFrontier'
import { getDashboardSummary, getUnitProgressBreakdown, getPaceRating, getGreeting } from '../../services/dashboardService'
import { getNextRecommendedSubtopic } from '../../services/recommendationEngine'
import { DashboardSummary } from '../../services/dashboardService'
import { UnitProgress } from '../../services/dashboardService'
import { SubtopicWithProgress } from '../../types/curriculum'

interface ProgressDashboardProps {
  userId: string
  onStartPractice?: (subtopicId: string) => void
}

export function ProgressDashboard({ userId, onStartPractice }: ProgressDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null)
  const [unitProgress, setUnitProgress] = useState<UnitProgress[]>([])
  const [recommendedTopic, setRecommendedTopic] = useState<SubtopicWithProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [userId])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load all dashboard data in parallel
      const [summary, units, recommended] = await Promise.all([
        getDashboardSummary(userId),
        getUnitProgressBreakdown(userId),
        getNextRecommendedSubtopic(userId),
      ])

      setDashboardData(summary)
      setUnitProgress(units)
      setRecommendedTopic(recommended)
    } catch (err: any) {
      console.error('Error loading dashboard:', err)
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">{error || 'Something went wrong'}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const paceRating = getPaceRating(dashboardData.weeklyXP)
  const greeting = getGreeting()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{greeting}! 👋</h1>
          <p className="text-gray-600 mt-1">Here's your learning progress</p>
        </div>

        {/* Stats Header */}
        <div className="mb-6">
          <StatsHeader
            totalXP={dashboardData.totalXP}
            weeklyXP={dashboardData.weeklyXP}
            monthlyXP={dashboardData.monthlyXP}
            dailyAverageXP={dashboardData.dailyAverageXP}
            currentStreak={dashboardData.currentStreak}
            paceRating={paceRating}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Knowledge Frontier */}
            <KnowledgeFrontier
              recommendedTopic={recommendedTopic}
              onStartPractice={onStartPractice}
            />

            {/* Mastery Progress */}
            <MasteryProgress
              masteryPercentage={dashboardData.masteryPercentage}
              topicsMastered={dashboardData.topicsMastered}
              totalTopics={dashboardData.totalTopics}
              topicsInProgress={dashboardData.topicsInProgress}
              topicsLocked={dashboardData.topicsLocked}
            />

            {/* Unit Breakdown */}
            <UnitBreakdown units={unitProgress} />
          </div>

          {/* Right Column - Sidebar (1/3) */}
          <div className="lg:col-span-1">
            <RecentActivity activities={dashboardData.recentActivity} />
          </div>
        </div>
      </div>
    </div>
  )
}

