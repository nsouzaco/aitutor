/**
 * TopicBrowser - Browse curriculum topics with list and graph views
 */

import { useState, useEffect } from 'react'
import { List, Network, Loader2, Filter } from 'lucide-react'
import { KnowledgeGraph } from './KnowledgeGraph'
import { TopicCard } from './TopicCard'
import { CURRICULUM } from '../../data/curriculum'
import { getAllSubtopicsWithStatus, getLockedReason } from '../../services/gatingService'
import { getStudentProgress } from '../../services/progressService'
import { SubtopicStatus, Subtopic } from '../../types/curriculum'
import { StudentProgress } from '../../types/progress'

interface TopicBrowserProps {
  userId: string
  onStartPractice?: (subtopicId: string) => void
}

type ViewMode = 'list' | 'graph'
type FilterMode = 'all' | 'available' | 'mastered' | 'in-progress'

export function TopicBrowser({ userId, onStartPractice }: TopicBrowserProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Load from localStorage
    return (localStorage.getItem('topicBrowserView') as ViewMode) || 'list'
  })
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [loading, setLoading] = useState(true)
  const [topics, setTopics] = useState<Array<{ subtopic: Subtopic; status: SubtopicStatus }>>([])
  const [lockedReasons, setLockedReasons] = useState<Record<string, string>>({})
  const [userProgress, setUserProgress] = useState<StudentProgress | undefined>()

  useEffect(() => {
    loadTopics()
  }, [userId])

  useEffect(() => {
    // Save view preference
    localStorage.setItem('topicBrowserView', viewMode)
  }, [viewMode])

  const loadTopics = async () => {
    try {
      setLoading(true)
      console.log('🔍 [TopicBrowser] Loading topics for user:', userId)
      const [topicsWithStatus, progress] = await Promise.all([
        getAllSubtopicsWithStatus(userId),
        getStudentProgress(userId),
      ])

      console.log('✅ [TopicBrowser] Topics loaded:', topicsWithStatus.length)
      console.log('📊 [TopicBrowser] User progress:', progress)
      setTopics(topicsWithStatus)
      setUserProgress(progress)

      // Load locked reasons for locked topics
      const reasons: Record<string, string> = {}
      for (const { subtopic, status } of topicsWithStatus) {
        if (status === 'locked') {
          reasons[subtopic.id] = await getLockedReason(userId, subtopic.id)
        }
      }
      setLockedReasons(reasons)
      console.log('🔒 [TopicBrowser] Locked reasons:', reasons)
    } catch (error) {
      console.error('❌ [TopicBrowser] Error loading topics:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTopics = topics.filter(({ status }) => {
    switch (filterMode) {
      case 'available':
        return status !== 'locked'
      case 'mastered':
        return status === 'mastered'
      case 'in-progress':
        return status === 'in-progress'
      default:
        return true
    }
  })

  const groupedByUnit = CURRICULUM.units.map(unit => ({
    unit,
    topics: filteredTopics.filter(({ subtopic }) =>
      unit.topics.some(topic => topic.subtopics.some(sub => sub.id === subtopic.id))
    ),
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading curriculum...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Curriculum</h1>
          <p className="text-gray-600 mt-1">Explore topics and track your progress</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">List</span>
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'graph'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Network className="w-4 h-4" />
              <span className="text-sm font-medium">Graph</span>
            </button>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as FilterMode)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Topics</option>
              <option value="available">Available</option>
              <option value="mastered">Mastered</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'graph' ? (
          <KnowledgeGraph
            userProgress={userProgress}
            onNodeClick={(subtopicId) => onStartPractice?.(subtopicId)}
          />
        ) : (
          <div className="space-y-8">
            {groupedByUnit.map(({ unit, topics }) => {
              if (topics.length === 0) return null

              return (
                <div key={unit.id}>
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{unit.name}</h2>
                    <p className="text-gray-600 text-sm mt-1">{unit.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topics.map(({ subtopic, status }) => (
                      <TopicCard
                        key={subtopic.id}
                        topic={{
                          ...subtopic,
                          status,
                          masteryScore: userProgress?.subtopics[subtopic.id]?.masteryScore || 0,
                          attemptCount: userProgress?.subtopics[subtopic.id]?.attemptCount || 0,
                          correctCount: userProgress?.subtopics[subtopic.id]?.correctCount || 0,
                          lastAttemptedAt: userProgress?.subtopics[subtopic.id]?.lastAttemptedAt,
                        }}
                        isLocked={status === 'locked'}
                        lockedReason={lockedReasons[subtopic.id]}
                        onStartPractice={() => onStartPractice?.(subtopic.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

