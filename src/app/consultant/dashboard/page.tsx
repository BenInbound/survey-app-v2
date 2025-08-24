'use client'

import { useState, useEffect } from 'react'
import { OrganizationalAssessment, AssessmentStatus, Department } from '@/lib/types'
import { OrganizationalAssessmentManager } from '@/lib/organizational-assessment-manager'
import { createDemoAssessment } from '@/lib/demo-data'
import Logo from '@/components/ui/Logo'
import AuthGuard from '@/components/ui/ConsultantAuthGuard'
import QuestionEditor from '@/components/ui/QuestionEditor'
import DepartmentConfig from '@/components/ui/DepartmentConfig'
import DepartmentManager from '@/components/ui/DepartmentManager'

export default function ConsultantDashboard() {
  const [assessments, setAssessments] = useState<OrganizationalAssessment[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [questionManagerAssessmentId, setQuestionManagerAssessmentId] = useState<string | null>(null)
  const [newAssessment, setNewAssessment] = useState({
    organizationName: '',
    consultantId: 'guro@inbound.com', // Default for demo
    departments: [] as Department[]
  })

  const assessmentManager = new OrganizationalAssessmentManager()

  useEffect(() => {
    loadAssessments()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAssessments = () => {
    // Only create demo assessment if no assessments exist at all
    const existingAssessments = assessmentManager.getAllAssessments()
    if (existingAssessments.length === 0) {
      createDemoAssessment()
    } else {
      // If demo exists, just fix its status, don't recreate it
      const demoExists = existingAssessments.some(a => a.id === 'demo-org')
      if (demoExists) {
        // Demo assessment will be properly configured with new createDemoAssessment() format
      }
    }
    
    const allAssessments = assessmentManager.getAllAssessments()
    setAssessments(allAssessments)
  }

  const handleCreateAssessment = () => {
    if (!newAssessment.organizationName.trim()) return

    try {
      const assessment = assessmentManager.createAssessment(
        newAssessment.organizationName,
        newAssessment.consultantId,
        undefined, // questionSetup
        newAssessment.departments
      )

      setAssessments(prev => [assessment, ...prev])
      setNewAssessment({ organizationName: '', consultantId: 'guro@inbound.com', departments: [] })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating assessment:', error)
      alert('Failed to create assessment. Please try again.')
    }
  }

  const handleCloseSurvey = (assessmentId: string, organizationName: string) => {
    const isConfirmed = confirm(
      `Close survey for "${organizationName}"?\n\nThis will:\n- Stop accepting new responses\n- Expire access codes\n- Lock the assessment for analysis\n\nYou can still view results, but participants cannot submit new responses.`
    )
    
    if (isConfirmed) {
      try {
        assessmentManager.updateAssessmentStatus(assessmentId, 'locked')
        loadAssessments()
        alert('Survey closed successfully!')
      } catch (error) {
        console.error('Error closing survey:', error)
        alert('Failed to close survey. Please try again.')
      }
    }
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

  const handleDeleteAssessment = (assessmentId: string, organizationName: string) => {
    const isConfirmed = confirm(
      `Are you sure you want to delete the assessment for "${organizationName}"?\n\nThis will permanently delete:\n- The assessment configuration\n- All participant responses\n- All collected data\n\nThis action cannot be undone.`
    )
    
    if (isConfirmed) {
      try {
        // If deleting the demo assessment, set a flag to prevent recreation
        if (assessmentId === 'demo-org') {
          localStorage.setItem('demo-assessment-deleted', 'true')
        }
        
        assessmentManager.deleteAssessment(assessmentId)
        loadAssessments()
        alert('Assessment deleted successfully!')
      } catch (error) {
        console.error('Error deleting assessment:', error)
        alert('Failed to delete assessment. Please try again.')
      }
    }
  }

  const getStatusDisplay = (status: AssessmentStatus) => {
    switch (status) {
      case 'collecting': 
      case 'ready': 
        return { text: 'Survey Active', color: 'bg-success-100 text-success-800', icon: '🟢' }
      case 'locked': 
        return { text: 'Survey Closed', color: 'bg-neutral-100 text-neutral-800', icon: '🔒' }
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
    <AuthGuard pageName="Consultant Dashboard">
      <div className="min-h-screen bg-custom-gray py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="mb-8">
          <Logo />
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Consultant Dashboard
              </h1>
              <p className="text-neutral-600 mt-2">
                Manage organizational assessments and track participation
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/admin"
                className="bg-neutral-600 text-white px-6 py-3 rounded-lg hover:bg-neutral-700 transition-colors font-medium"
              >
                Admin Portal
              </a>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Assessment
              </button>
            </div>
          </div>
        </div>

        {/* Question Management Section */}
        {questionManagerAssessmentId && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-neutral-200 mb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Managing Questions for: {assessments.find(a => a.id === questionManagerAssessmentId)?.organizationName}
                </h3>
                <button
                  onClick={() => setQuestionManagerAssessmentId(null)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  Close
                </button>
              </div>
            </div>
            <QuestionEditor 
              assessmentId={questionManagerAssessmentId}
              onQuestionsChange={() => {
                // Optionally trigger any updates needed when questions change
                console.log(`Questions updated for assessment: ${questionManagerAssessmentId}`)
              }}
            />
          </div>
        )}

        {/* Create Assessment Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Create New Assessment
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Consultant Email
                  </label>
                  <input
                    type="email"
                    value={newAssessment.consultantId}
                    onChange={(e) => setNewAssessment(prev => ({
                      ...prev,
                      consultantId: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                {/* Department Configuration */}
                <DepartmentConfig
                  departments={newAssessment.departments}
                  onDepartmentsChange={(departments) => setNewAssessment(prev => ({ ...prev, departments }))}
                  organizationName={newAssessment.organizationName || 'Organization'}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-neutral-200 text-neutral-800 px-4 py-2 rounded-lg hover:bg-neutral-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAssessment}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Assessment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assessments List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">
            Active Assessments ({assessments.length})
          </h2>
          
          {assessments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg text-center py-12">
              <div className="text-neutral-400 text-lg mb-4">
                No assessments created yet
              </div>
              <p className="text-neutral-600 mb-6">
                Create your first organizational assessment to get started
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Assessment
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="bg-white rounded-xl shadow-lg p-6 border border-neutral-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {assessment.organizationName}
                      </h3>
                      {(() => {
                        const status = getStatusDisplay(assessment.status)
                        return (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${status.color}`}>
                            <span>{status.icon}</span>
                            {status.text}
                          </span>
                        )
                      })()}
                    </div>
                    <div className="text-sm text-neutral-500">
                      Created {new Date(assessment.created).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Participation Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-custom-gray p-4 rounded-lg">
                      <h4 className="font-medium text-neutral-900 mb-2">Management Participation</h4>
                      <div className="text-2xl font-bold text-primary-600 mb-1">
                        {assessment.responseCount.management}
                      </div>
                      <p className="text-sm text-neutral-600">responses received</p>
                    </div>

                    <div className="bg-custom-gray p-4 rounded-lg">
                      <h4 className="font-medium text-neutral-900 mb-2">Employee Participation</h4>
                      <div className="text-2xl font-bold text-primary-600 mb-1">
                        {assessment.responseCount.employee}
                      </div>
                      <p className="text-sm text-neutral-600">responses received</p>
                    </div>
                  </div>

                  {/* View Results Button */}
                  <div className="mb-6 flex justify-center">
                    <a
                      href={`/consultant/results/${assessment.id}`}
                      className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    >
                      View Assessment Results
                    </a>
                  </div>

                  {/* Department Management Section */}
                  <DepartmentManager
                    assessmentId={assessment.id}
                    departments={assessment.departments || []}
                    onDepartmentsChange={(departments) => {
                      // Update the assessment with new departments
                      const updatedAssessments = assessments.map(a =>
                        a.id === assessment.id ? { ...a, departments } : a
                      )
                      setAssessments(updatedAssessments)
                    }}
                    onRegenerateCode={handleRegenerateCode}
                    copyToClipboard={copyToClipboard}
                    isLocked={assessment.status === 'locked'}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {assessment.status !== 'locked' && (
                        <button
                          onClick={() => handleCloseSurvey(assessment.id, assessment.organizationName)}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center gap-1"
                          title={`Close survey and stop accepting responses`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Close Survey
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setQuestionManagerAssessmentId(assessment.id)}
                        className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
                      >
                        📝 Manage Questions
                      </button>
                      <button
                        onClick={() => handleDeleteAssessment(assessment.id, assessment.organizationName)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-1"
                        title={`Delete ${assessment.organizationName} assessment`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </AuthGuard>
  )
}