'use client'

import { useState, useEffect } from 'react'
import { OrganizationalAssessmentManager } from '@/lib/organizational-assessment-manager'
import { OrganizationalAssessment, CategoryAverage } from '@/lib/types'
import { SpiderChart } from '@/components/ui/SpiderChart'
import { generateSummary } from '@/lib/ai-summary'

interface ManagementResultsProps {
  params: { id: string }
}

export default function ManagementResults({ params }: ManagementResultsProps) {
  const { id: assessmentId } = params
  const [assessment, setAssessment] = useState<OrganizationalAssessment | null>(null)
  const [managementData, setManagementData] = useState<CategoryAverage[]>([])
  const [aiInsights, setAiInsights] = useState<string | null>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const assessmentManager = new OrganizationalAssessmentManager()

  useEffect(() => {
    loadAssessmentData()
  }, [assessmentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAssessmentData = () => {
    try {
      const assessmentData = assessmentManager.getAssessment(assessmentId)
      if (!assessmentData) {
        setError('Assessment not found')
        return
      }

      if (assessmentData.responseCount.management === 0) {
        setError('No management responses found for this assessment')
        return
      }

      setAssessment(assessmentData)
      setManagementData(assessmentData.managementResponses.categoryAverages)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment')
    }
  }

  const handleGenerateInsights = async () => {
    if (!managementData.length) return

    setIsLoadingInsights(true)
    try {
      const summaryContext = {
        categoryAverages: managementData,
        overallAverage: assessment?.managementResponses.overallAverage || 0,
        totalResponses: assessment?.responseCount.management || 0,
        department: 'Management Team'
      }
      
      const insights = await generateSummary(summaryContext)
      setAiInsights(insights)
    } catch (err) {
      console.error('Failed to generate insights:', err)
      setError('Failed to generate AI insights. Please try again.')
    } finally {
      setIsLoadingInsights(false)
    }
  }

  const getPerformanceColor = (average: number) => {
    if (average >= 8) return 'text-green-600'
    if (average >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceLabel = (average: number) => {
    if (average >= 8) return 'Strong'
    if (average >= 6) return 'Good'
    return 'Needs Focus'
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!assessment || !managementData.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {assessment.organizationName} - Leadership Assessment Results
          </h1>
          <p className="text-gray-600">
            Strategic assessment results for the management team
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Overall Score</h3>
            <div className={`text-4xl font-bold mb-2 ${getPerformanceColor(assessment.managementResponses.overallAverage)}`}>
              {assessment.managementResponses.overallAverage.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">out of 10</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Performance Level</h3>
            <div className={`text-2xl font-bold mb-2 ${getPerformanceColor(assessment.managementResponses.overallAverage)}`}>
              {getPerformanceLabel(assessment.managementResponses.overallAverage)}
            </div>
            <div className="text-sm text-gray-600">overall assessment</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Responses</h3>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {assessment.responseCount.management}
            </div>
            <div className="text-sm text-gray-600">leadership participants</div>
          </div>
        </div>

        {/* Strategic Overview Spider Chart */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Strategic Performance Overview
          </h2>
          <div className="max-w-2xl mx-auto">
            <SpiderChart categoryData={managementData} />
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Category Performance</h2>
          <div className="space-y-4">
            {managementData.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{category.category}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          category.average >= 8 ? 'bg-green-500' :
                          category.average >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(category.average / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">
                      {category.average.toFixed(1)}/10
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  category.average >= 8 ? 'bg-green-100 text-green-800' :
                  category.average >= 6 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getPerformanceLabel(category.average)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths and Areas for Growth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-green-800 mb-6">Key Strengths</h2>
            <div className="space-y-4">
              {managementData
                .filter(cat => cat.average >= 7)
                .sort((a, b) => b.average - a.average)
                .slice(0, 3)
                .map((category, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{category.category}</div>
                      <div className="text-sm text-gray-600">Score: {category.average.toFixed(1)}/10</div>
                    </div>
                  </div>
                ))}
              {managementData.filter(cat => cat.average >= 7).length === 0 && (
                <p className="text-gray-600 italic">Focus on building strategic capabilities across all areas.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-orange-800 mb-6">Growth Opportunities</h2>
            <div className="space-y-4">
              {managementData
                .filter(cat => cat.average < 7)
                .sort((a, b) => a.average - b.average)
                .slice(0, 3)
                .map((category, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{category.category}</div>
                      <div className="text-sm text-gray-600">Score: {category.average.toFixed(1)}/10</div>
                    </div>
                  </div>
                ))}
              {managementData.filter(cat => cat.average < 7).length === 0 && (
                <p className="text-gray-600 italic">Strong performance across all strategic areas.</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Strategic Insights */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Strategic Insights</h2>
            {!aiInsights && (
              <button
                onClick={handleGenerateInsights}
                disabled={isLoadingInsights}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isLoadingInsights 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoadingInsights ? 'Generating...' : 'Generate Strategic Insights'}
              </button>
            )}
          </div>
          
          {aiInsights ? (
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {aiInsights}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Generate personalized strategic insights based on your leadership team&apos;s assessment results</p>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Next Steps</h2>
          <div className="space-y-3 text-blue-800">
            <p className="flex items-start gap-2">
              <span className="font-semibold">1.</span>
              <span>Review the results with your leadership team to discuss key findings and alignment</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold">2.</span>
              <span>Focus development efforts on the growth opportunity areas identified above</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold">3.</span>
              <span>Leverage your key strengths to drive strategic initiatives forward</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold">4.</span>
              <span>Consider scheduling follow-up assessments to track progress over time</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}