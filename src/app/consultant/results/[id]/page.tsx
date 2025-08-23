'use client'

import { useState, useEffect } from 'react'
import { OrganizationalAssessmentManager } from '@/lib/organizational-assessment-manager'
import { OrganizationalAssessment, ComparativeAnalysis } from '@/lib/types'
import { ComparativeSpiderChart } from '@/components/ui/ComparativeSpiderChart'
import { generateOrganizationalSummary } from '@/lib/ai-summary'
import { createDemoAssessment } from '@/lib/demo-data'

interface ConsultantResultsProps {
  params: { id: string }
}

export default function ConsultantResults({ params }: ConsultantResultsProps) {
  const { id: assessmentId } = params
  const [assessment, setAssessment] = useState<OrganizationalAssessment | null>(null)
  const [comparativeAnalysis, setComparativeAnalysis] = useState<ComparativeAnalysis | null>(null)
  const [aiInsights, setAiInsights] = useState<string | null>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const assessmentManager = new OrganizationalAssessmentManager()

  useEffect(() => {
    loadAssessmentData()
  }, [assessmentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAssessmentData = () => {
    try {
      // Ensure demo assessment exists if this is the demo
      if (assessmentId === 'demo-org') {
        createDemoAssessment()
      }
      
      const assessmentData = assessmentManager.getAssessment(assessmentId)
      if (!assessmentData) {
        setError('Assessment not found')
        return
      }

      setAssessment(assessmentData)

      // Generate comparative analysis
      const analysis = generateComparativeAnalysis(assessmentData)
      setComparativeAnalysis(analysis)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment')
    }
  }

  const generateComparativeAnalysis = (assessment: OrganizationalAssessment): ComparativeAnalysis => {
    const gapAnalysis = assessment.managementResponses.categoryAverages.map(mgmtCategory => {
      const empCategory = assessment.employeeResponses.categoryAverages.find(
        cat => cat.category === mgmtCategory.category
      )

      const gap = mgmtCategory.average - (empCategory?.average || 0)
      const absGap = Math.abs(gap)

      return {
        category: mgmtCategory.category,
        managementScore: mgmtCategory.average,
        employeeScore: empCategory?.average || 0,
        gap,
        significance: absGap > 2.5 ? 'high' as const : absGap > 1.5 ? 'medium' as const : 'low' as const
      }
    })

    const overallAlignment = 100 - (gapAnalysis.reduce((acc, item) => acc + Math.abs(item.gap), 0) / gapAnalysis.length) * 10

    const criticalGaps = gapAnalysis
      .filter(item => item.significance === 'high')
      .map(item => item.category)

    const recommendations = generateRecommendations(gapAnalysis)

    return {
      gapAnalysis,
      overallAlignment: Math.max(0, Math.min(100, overallAlignment)),
      criticalGaps,
      recommendations
    }
  }

  const generateRecommendations = (gapAnalysis: any[]): string[] => {
    const recommendations: string[] = []

    gapAnalysis.forEach(item => {
      if (item.significance === 'high') {
        if (item.gap > 0) {
          recommendations.push(`Address overconfidence in ${item.category} - management rates this significantly higher than employees`)
        } else {
          recommendations.push(`Improve communication about ${item.category} - employees see this more positively than management realizes`)
        }
      }
    })

    return recommendations
  }

  const handleGenerateInsights = async () => {
    if (!assessment || !comparativeAnalysis) return

    setIsLoadingInsights(true)
    try {
      const insights = await generateOrganizationalSummary(assessment, comparativeAnalysis)
      setAiInsights(insights)
    } catch (err) {
      console.error('Failed to generate insights:', err)
      setError('Failed to generate AI insights. Please try again.')
    } finally {
      setIsLoadingInsights(false)
    }
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

  if (!assessment || !comparativeAnalysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment results...</p>
        </div>
      </div>
    )
  }

  const hasData = assessment.responseCount.management > 0 || assessment.responseCount.employee > 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {assessment.organizationName} - Organizational Analysis
              </h1>
              <p className="text-gray-600 mt-2">
                Comparative insights between management and employee perspectives
              </p>
            </div>
            <div className="flex gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                assessment.status === 'collecting' ? 'bg-yellow-100 text-yellow-800' :
                assessment.status === 'ready' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {assessment.status}
              </span>
              <a
                href="/consultant/dashboard"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>

        {!hasData ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              No responses collected yet
            </div>
            <p className="text-gray-600 mb-6">
              Share the survey links to start collecting responses from management and employees
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Management Responses</h3>
                <div className="text-3xl font-bold text-blue-600">{assessment.responseCount.management}</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Employee Responses</h3>
                <div className="text-3xl font-bold text-green-600">{assessment.responseCount.employee}</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Overall Alignment</h3>
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(comparativeAnalysis.overallAlignment)}%
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Critical Gaps</h3>
                <div className="text-3xl font-bold text-red-600">
                  {comparativeAnalysis.criticalGaps.length}
                </div>
              </div>
            </div>

            {/* Comparative Spider Chart */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Management vs Employee Perspectives
              </h2>
              <ComparativeSpiderChart
                managementData={assessment.managementResponses.categoryAverages}
                employeeData={assessment.employeeResponses.categoryAverages}
              />
            </div>

            {/* Gap Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gap Analysis</h2>
              <div className="space-y-4">
                {comparativeAnalysis.gapAnalysis.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.category}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Management: {item.managementScore.toFixed(1)}</span>
                        <span>Employee: {item.employeeScore.toFixed(1)}</span>
                        <span>Gap: {Math.abs(item.gap).toFixed(1)}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.significance === 'high' ? 'bg-red-100 text-red-800' :
                      item.significance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.significance} impact
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {comparativeAnalysis.recommendations.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Recommendations</h2>
                <div className="space-y-3">
                  {comparativeAnalysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">AI Strategic Insights</h2>
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
                    {isLoadingInsights ? 'Generating...' : 'Generate Insights'}
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
                  <p>Generate AI-powered strategic insights based on the organizational assessment data</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}