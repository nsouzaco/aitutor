import { useState } from 'react'
import { Brain, CheckCircle, ChevronRight, Sparkles } from 'lucide-react'
import { PLACEMENT_TEST_QUESTIONS } from '../../data/placementTest'
import { submitPlacementTest } from '../../services/placementService'

interface PlacementTestProps {
  userId: string
  onComplete: () => void
}

export function PlacementTest({ userId, onComplete }: PlacementTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<{
    score: number
    level: string
    unlockedSubtopics: string[]
  } | null>(null)

  const question = PLACEMENT_TEST_QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / PLACEMENT_TEST_QUESTIONS.length) * 100
  const isLastQuestion = currentQuestion === PLACEMENT_TEST_QUESTIONS.length - 1
  const hasAnswer = answers[question.id]?.trim().length > 0

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < PLACEMENT_TEST_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const result = await submitPlacementTest(userId, answers)
      setResults({
        score: result.score,
        level: result.level,
        unlockedSubtopics: result.unlockedSubtopics,
      })
      setShowResults(true)
      console.log('✅ [PlacementTest] Test submitted successfully')
    } catch (error) {
      console.error('❌ [PlacementTest] Error submitting test:', error)
      alert('Error submitting test. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFinish = () => {
    onComplete()
  }

  // Results screen
  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Placement Complete!
            </h1>
            
            <p className="text-gray-600 mb-8">
              You're ready to start learning
            </p>

            {/* Score Card */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Your Score</p>
                  <p className="text-4xl font-bold text-purple-600">{results.score}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Level</p>
                  <p className="text-2xl font-bold text-blue-600 capitalize">
                    {results.level}
                  </p>
                </div>
              </div>
            </div>

            {/* Unlocked Topics */}
            <div className="text-left mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Topics Unlocked
              </h3>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">
                  {results.unlockedSubtopics.length} topics ready for practice
                </span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Learning
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Test screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Placement Test
          </h1>
          <p className="text-gray-600">
            Answer {PLACEMENT_TEST_QUESTIONS.length} questions to find your starting point
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} of {PLACEMENT_TEST_QUESTIONS.length}
            </span>
            <span className="text-sm font-medium text-purple-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-6">
            <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-4 capitalize">
              {question.difficulty}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {question.question}
            </h2>
          </div>

          {/* Answer Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer
            </label>
            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-0 text-lg"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && hasAnswer) {
                  if (isLastQuestion) {
                    handleSubmit()
                  } else {
                    handleNext()
                  }
                }
              }}
            />
            <p className="text-sm text-gray-500 mt-2">
              Press Enter to continue
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!hasAnswer || isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Test
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!hasAnswer}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {PLACEMENT_TEST_QUESTIONS.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(idx)}
              className={`w-10 h-10 rounded-lg font-medium transition-all ${
                idx === currentQuestion
                  ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                  : answers[q.id]
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

