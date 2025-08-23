'use client'

import { useState, useEffect } from 'react'
import { OrganizationalAssessment, AssessmentStatus } from '@/lib/types'
import { OrganizationalAssessmentManager } from '@/lib/organizational-assessment-manager'
import { createDemoAssessment } from '@/lib/demo-data'

export default function ConsultantDashboard() {
  const [assessments, setAssessments] = useState<OrganizationalAssessment[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newAssessment, setNewAssessment] = useState({
    organizationName: '',
    consultantId: 'guro@inbound.com' // Default for demo
  })

  const assessmentManager = new OrganizationalAssessmentManager()

  useEffect(() => {
    loadAssessments()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAssessments = () => {
    // Ensure demo assessment exists
    createDemoAssessment()
    
    const allAssessments = assessmentManager.getAllAssessments()
    setAssessments(allAssessments)
  }

  const handleCreateAssessment = () => {
    if (!newAssessment.organizationName.trim()) return

    const assessment = assessmentManager.createAssessment(
      newAssessment.organizationName,
      newAssessment.consultantId
    )

    setAssessments(prev => [assessment, ...prev])
    setNewAssessment({ organizationName: '', consultantId: 'guro@inbound.com' })
    setShowCreateForm(false)
  }

  const handleStatusChange = (assessmentId: string, newStatus: AssessmentStatus) => {
    assessmentManager.updateAssessmentStatus(assessmentId, newStatus)
    loadAssessments()
  }

  const handleRegenerateCode = (assessmentId: string) => {
    try {
      assessmentManager.regenerateAccessCode(assessmentId)
      loadAssessments()
      // Show success feedback
      alert('Access code regenerated successfully!')
    } catch (error) {
      alert('Failed to regenerate access code. Please try again.')
    }
  }

  const getStatusColor = (status: AssessmentStatus) => {
    switch (status) {
      case 'collecting': return 'bg-yellow-100 text-yellow-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'locked': return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    // Show success feedback
    alert(`${type} copied to clipboard!`)
  }

  const getAccessUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/survey/[assessment-id]/access`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Consultant Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage organizational assessments and track participation
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create New Assessment
            </button>
          </div>
        </div>

        {/* Create Assessment Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-md mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Create New Assessment
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={newAssessment.organizationName}
                    onChange={(e) => setNewAssessment(prev => ({
                      ...prev,
                      organizationName: e.target.value
                    }))}
                    placeholder="e.g., Stork"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultant Email
                  </label>
                  <input
                    type="email"
                    value={newAssessment.consultantId}
                    onChange={(e) => setNewAssessment(prev => ({
                      ...prev,
                      consultantId: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAssessment}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Assessment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assessments List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Active Assessments ({assessments.length})
            </h2>
          </div>
          
          {assessments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">
                No assessments created yet
              </div>
              <p className="text-gray-600 mb-6">
                Create your first organizational assessment to get started
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Assessment
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assessment.organizationName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(assessment.status)}`}>
                        {assessment.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Created {new Date(assessment.created).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Access Code Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-blue-900">
                        <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Assessment Access Code
                      </h4>
                      <button
                        onClick={() => handleRegenerateCode(assessment.id)}
                        disabled={assessment.status === 'locked'}
                        className={`text-sm px-3 py-1 rounded ${
                          assessment.status === 'locked' 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                        }`}
                      >
                        Regenerate Code
                      </button>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-2xl font-bold text-blue-900 tracking-wider">
                          {assessment.accessCode}
                        </div>
                        <button
                          onClick={() => copyToClipboard(assessment.accessCode, 'Access code')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Copy Code
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-blue-800">
                      <strong>Distribution Instructions:</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Share this access code with your client contact (HR/Management)</li>
                        <li>Client distributes code to employees and management via internal channels</li>
                        <li>Participants visit: <code className="bg-blue-100 px-1 rounded">{getAccessUrl()}</code></li>
                        <li>Participants enter the access code to begin their assessment</li>
                      </ol>
                    </div>
                  </div>

                  {/* Participation Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Management Participation</h4>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {assessment.responseCount.management}
                      </div>
                      <p className="text-sm text-gray-600">responses received</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Employee Participation</h4>
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {assessment.responseCount.employee}
                      </div>
                      <p className="text-sm text-gray-600">responses received</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(assessment.id, 'collecting')}
                        disabled={assessment.status === 'collecting'}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          assessment.status === 'collecting'
                            ? 'bg-yellow-200 text-yellow-800 cursor-not-allowed'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        Collecting
                      </button>
                      <button
                        onClick={() => handleStatusChange(assessment.id, 'ready')}
                        disabled={assessment.status === 'ready' || assessment.responseCount.management + assessment.responseCount.employee === 0}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          assessment.status === 'ready' || (assessment.responseCount.management + assessment.responseCount.employee === 0)
                            ? 'bg-green-200 text-green-800 cursor-not-allowed'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        Ready
                      </button>
                      <button
                        onClick={() => handleStatusChange(assessment.id, 'locked')}
                        disabled={assessment.status === 'locked'}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          assessment.status === 'locked'
                            ? 'bg-gray-200 text-gray-800 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        Lock
                      </button>
                    </div>

                    {(assessment.responseCount.management > 0 || assessment.responseCount.employee > 0) && (
                      <a
                        href={`/consultant/results/${assessment.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View Results
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}