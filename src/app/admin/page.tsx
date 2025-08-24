'use client'

import { useState, useEffect } from 'react'
import { getAllSurveyData, clearAllSurveyData } from '@/lib/survey-logic'
import { ParticipantSession } from '@/lib/types'
import { restoreDemoAssessment } from '@/lib/demo-data'
import Logo from '@/components/ui/Logo'
// import AuthGuard from '@/components/ui/ConsultantAuthGuard'

export default function AdminPage() {
  const [sessions, setSessions] = useState<ParticipantSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  const loadData = () => {
    const data = getAllSurveyData()
    setSessions(data)
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleClearAll = () => {
    clearAllSurveyData()
    setSessions([])
    setShowConfirmClear(false)
  }

  const handleRestoreDemo = () => {
    try {
      restoreDemoAssessment()
      alert('Demo assessment restored successfully! Visit the consultant dashboard to see it.')
    } catch (error) {
      console.error('Error restoring demo assessment:', error)
      alert('Failed to restore demo assessment. Please try again.')
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  const getCompletionStatus = (session: ParticipantSession) => {
    return session.completedAt ? 'Complete' : 'In Progress'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-custom-gray py-8">
        <div className="container mx-auto px-4 max-w-6xl">
        {/* Logo */}
        <div className="mb-8">
          <Logo />
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Admin Portal</h1>
              <p className="text-neutral-600 mt-2">
                Manage survey data and view participant responses
              </p>
            </div>
            <a
              href="/consultant/dashboard"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Consultant Dashboard
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Total Sessions</h3>
            <div className="text-3xl font-bold text-primary-600">{sessions.length}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Completed</h3>
            <div className="text-3xl font-bold text-success">
              {sessions.filter(s => s.completedAt).length}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">In Progress</h3>
            <div className="text-3xl font-bold text-secondary-600">
              {sessions.filter(s => !s.completedAt).length}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Actions</h2>
          <div className="flex space-x-4">
            <button
              onClick={loadData}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Refresh Data
            </button>
            
            <button
              onClick={() => setShowConfirmClear(true)}
              className="bg-error text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All Data
            </button>

            <a
              href="/survey/stork-assessment"
              className="bg-success text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
            >
              Test Survey
            </a>

            <button
              onClick={handleRestoreDemo}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              title="Restore the Demo Organization assessment if it was deleted"
            >
              Restore Demo Assessment
            </button>
          </div>
        </div>

        {/* Clear Data Confirmation */}
        {showConfirmClear && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Clear All Data?
              </h3>
              <p className="text-neutral-600 mb-6">
                This action will permanently delete all survey sessions and responses. 
                This cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleClearAll}
                  className="bg-error text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Yes, Clear All
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="bg-neutral-300 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Survey Sessions
            </h2>
            
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No survey data</h3>
                <p className="text-neutral-600 mb-4">
                  No survey sessions have been started yet.
                </p>
                <a
                  href="/survey/stork-assessment"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 inline-block"
                >
                  Start Test Survey
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-custom-gray">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        Survey ID
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        Participant
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        Department
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        Responses
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        Started
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                        Completed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {sessions.map((session, index) => (
                      <tr key={index} className="hover:bg-custom-gray">
                        <td className="px-4 py-3 text-sm text-neutral-900">
                          {session.surveyId}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-900">
                          {session.participantId}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-900">
                          {session.department}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            session.completedAt 
                              ? 'bg-success bg-opacity-20 text-success' 
                              : 'bg-secondary-100 text-secondary-800'
                          }`}>
                            {getCompletionStatus(session)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-900">
                          {session.responses.length}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-900">
                          {formatDate(session.startedAt)}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-900">
                          {session.completedAt ? formatDate(session.completedAt) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}