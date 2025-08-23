'use client'

import { useState, useEffect } from 'react'
import { CategoryAverage } from './SpiderChart'
import { generateSummary } from '@/lib/ai-summary'

interface SummaryCardProps {
  categoryAverages: CategoryAverage[]
  overallAverage: number
  totalResponses: number
  department?: string
  className?: string
}

export function SummaryCard({ 
  categoryAverages, 
  overallAverage, 
  totalResponses, 
  department,
  className = '' 
}: SummaryCardProps) {
  const [summary, setSummary] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleGenerateSummary = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await generateSummary({
        categoryAverages,
        overallAverage,
        totalResponses,
        department
      })
      setSummary(result)
      setHasGenerated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary')
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasGenerated && !isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
        <div className="text-center">
          <div className="mb-6">
            <svg className="mx-auto h-12 w-12 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.548-1.146l-.548-.547z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              AI Strategic Insights
            </h2>
            <p className="text-gray-600 mb-6">
              Generate personalized insights and recommendations based on your assessment results
            </p>
          </div>
          <button
            onClick={handleGenerateSummary}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Generate Insights
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
      <div className="flex items-center mb-6">
        <svg className="h-6 w-6 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.548-1.146l-.548-.547z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900">AI Strategic Insights</h2>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your results...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-red-800 font-medium">Unable to generate insights</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={handleGenerateSummary}
            className="mt-3 text-red-700 hover:text-red-800 font-medium text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      {summary && !isLoading && (
        <div className="prose prose-gray max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {summary}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleGenerateSummary}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Regenerate Insights
            </button>
          </div>
        </div>
      )}
    </div>
  )
}