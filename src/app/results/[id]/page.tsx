'use client'

import { useState, useEffect } from 'react'
import { SurveyManager } from '@/lib/survey-logic'
import { ParticipantSession, Question } from '@/lib/types'
import { SpiderChart, CategoryAverage } from '@/components/ui/SpiderChart'
import { SummaryCard } from '@/components/ui/SummaryCard'
import Logo from '@/components/ui/Logo'

interface ResultsPageProps {
  params: { id: string }
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const { id: surveyId } = params
  const [manager] = useState(() => new SurveyManager(surveyId))
  const [session, setSession] = useState<ParticipantSession | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeData = async () => {
      const storedSession = manager.getStoredSession()
      if (storedSession) {
        const questionsData = await manager.getQuestions()
        setQuestions(questionsData)
      }
      setSession(storedSession)
      setIsLoading(false)
    }
    
    initializeData()
  }, [manager])

  const handleStartNew = () => {
    manager.clearSession()
    window.location.href = `/survey/${surveyId}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || questions.length === 0 || session.responses.length !== questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Survey Not Complete
          </h2>
          <p className="text-gray-600 mb-6">
            You need to complete all questions before viewing results.
          </p>
          <a
            href={`/survey/${surveyId}`}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
          >
            Continue Survey
          </a>
        </div>
      </div>
    )
  }

  // Group responses by category
  const responsesByCategory: Record<string, Array<{ question: string; score: number }>> = {}
  
  session.responses.forEach(response => {
    const question = questions.find(q => q.id === response.questionId)
    if (question) {
      if (!responsesByCategory[question.category]) {
        responsesByCategory[question.category] = []
      }
      // Skip null/skipped responses in results display
      if (response.score !== null) {
        responsesByCategory[question.category].push({
          question: question.text,
          score: response.score
        })
      }
    }
  })

  // Calculate category averages
  const categoryAverages = Object.entries(responsesByCategory).map(([category, responses]) => ({
    category,
    average: responses.length > 0 
      ? Math.round((responses.reduce((sum, r) => sum + r.score, 0) / responses.length) * 10) / 10
      : 0,
    responses: responses.length
  }))

  const validResponses = session.responses.filter(r => r.score !== null)
  const overallAverage = validResponses.length > 0 
    ? Math.round((validResponses.reduce((sum, r) => sum + (r.score as number), 0) / validResponses.length) * 10) / 10
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Logo */}
        <div className="mb-8">
          <Logo />
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Survey Complete
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Assessment Results
          </h1>
          <p className="text-gray-600">
            Thank you for completing the strategic assessment
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Score</h2>
            <div className="inline-block">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {overallAverage}
              </div>
              <div className="text-lg text-gray-600">out of 10</div>
            </div>
            <div className="mt-6 w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${(overallAverage / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Spider Chart Visualization */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Strategic Assessment Overview</h2>
          <SpiderChart 
            categoryData={categoryAverages}
            className="mx-auto"
          />
          <div className="mt-4 text-center text-sm text-gray-500">
            Interactive radar chart showing performance across all strategic dimensions
          </div>
        </div>

        {/* AI Strategic Insights */}
        <SummaryCard
          categoryAverages={categoryAverages}
          overallAverage={overallAverage}
          totalResponses={session.responses.length}
          department={session.department}
          className="mb-8"
        />

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Breakdown</h2>
          <div className="space-y-6">
            {categoryAverages.map(({ category, average, responses }) => (
              <div key={category}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900">{category}</h3>
                  <span className="text-lg font-semibold text-blue-600">{average}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(average / 10) * 100}%` }}
                  />
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Based on {responses} question{responses !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Responses */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed Responses</h2>
          <div className="space-y-8">
            {Object.entries(responsesByCategory).map(([category, responses]) => (
              <div key={category}>
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  {category}
                </h3>
                <div className="space-y-3">
                  {responses.map((response, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <p className="text-gray-700">{response.question}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          {response.score}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <div className="text-gray-600 text-sm">
            Completed on {session.completedAt ? new Date(session.completedAt).toLocaleDateString() : 'Today'}
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleStartNew}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Take Survey Again
            </button>
            <a
              href="/"
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-custom-gray transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}