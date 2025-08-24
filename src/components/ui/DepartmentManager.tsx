'use client'

import { useState } from 'react'
import { Department } from '@/lib/types'
import { OrganizationalAssessmentManager } from '@/lib/organizational-assessment-manager'

interface DepartmentManagerProps {
  assessmentId: string
  departments: Department[]
  onDepartmentsChange: (departments: Department[]) => void
  onRegenerateCode?: (assessmentId: string) => void
  copyToClipboard: (text: string, label: string) => void
  isLocked?: boolean
}

export default function DepartmentManager({
  assessmentId,
  departments,
  onDepartmentsChange,
  onRegenerateCode,
  copyToClipboard,
  isLocked = false
}: DepartmentManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newDepartmentName, setNewDepartmentName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const assessmentManager = new OrganizationalAssessmentManager()

  const handleAddDepartment = async () => {
    try {
      setError(null)
      const newDepartment = await assessmentManager.addDepartmentToAssessment(assessmentId, newDepartmentName)
      
      // Update the parent component with new departments list
      const updatedAssessment = await assessmentManager.getAssessment(assessmentId)
      if (updatedAssessment) {
        onDepartmentsChange(updatedAssessment.departments)
      }

      // Reset form
      setNewDepartmentName('')
      setIsAdding(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add department')
    }
  }

  const getAccessUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/survey/${assessmentId}/access`
  }

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-lg font-semibold text-primary-900 hover:text-primary-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Department Access Codes ({departments.length})
          {isExpanded ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {onRegenerateCode && (
          <button
            onClick={() => onRegenerateCode(assessmentId)}
            disabled={isLocked}
            className={`text-sm px-3 py-1 rounded ${
              isLocked 
                ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed' 
                : 'bg-primary-200 text-primary-800 hover:bg-primary-300'
            }`}
          >
            Regenerate All Codes
          </button>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <>
          {/* Department Cards */}
          {departments.length > 0 ? (
            <div className="space-y-4 mb-6">
              {departments.map((department) => (
                <div key={department.id} className="bg-white rounded-lg border border-primary-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-primary-900 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {department.name}
                    </h5>
                  </div>

                  <div className="space-y-3">
                    {/* Management Code */}
                    <div className="flex items-center justify-between bg-primary-25 p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="text-xs font-medium text-primary-700 mb-1">
                          👔 Management Access Code
                        </div>
                        <div className="font-mono text-sm font-bold text-primary-900 tracking-wider">
                          {department.managementCode}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(department.managementCode, `${department.name} Management code`)}
                        className="bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors text-xs font-medium ml-3"
                      >
                        📋 Copy
                      </button>
                    </div>

                    {/* Employee Code */}
                    <div className="flex items-center justify-between bg-secondary-25 p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="text-xs font-medium text-secondary-700 mb-1">
                          👥 Employee Access Code
                        </div>
                        <div className="font-mono text-sm font-bold text-secondary-900 tracking-wider">
                          {department.employeeCode}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(department.employeeCode, `${department.name} Employee code`)}
                        className="bg-secondary-600 text-white px-3 py-1.5 rounded-lg hover:bg-secondary-700 transition-colors text-xs font-medium ml-3"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-primary-200 p-6 mb-6 text-center text-neutral-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p>No departments added yet</p>
              <p className="text-sm mt-1">Add departments to generate access codes</p>
            </div>
          )}

          {/* Add Department Section */}
          {!isLocked && (
            <>
              {!isAdding ? (
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full bg-white border-2 border-dashed border-primary-300 hover:border-primary-400 rounded-lg px-4 py-3 flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 transition-colors mb-6"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Department
                </button>
              ) : (
                <div className="bg-white rounded-lg border border-primary-300 p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-medium text-neutral-800">Add New Department</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="departmentName" className="block text-sm font-medium text-neutral-700 mb-1">
                        Department Name
                      </label>
                      <input
                        type="text"
                        id="departmentName"
                        value={newDepartmentName}
                        onChange={(e) => setNewDepartmentName(e.target.value)}
                        placeholder="e.g., Human Resources"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newDepartmentName.trim()) {
                            handleAddDepartment()
                          }
                        }}
                        autoFocus
                      />
                    </div>

                    {error && (
                      <div className="text-sm text-error bg-error bg-opacity-10 border border-error border-opacity-20 rounded-md px-3 py-2">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleAddDepartment}
                        disabled={!newDepartmentName.trim()}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Add Department
                      </button>
                      <button
                        onClick={() => {
                          setIsAdding(false)
                          setNewDepartmentName('')
                          setError(null)
                        }}
                        className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Smart Distribution Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <strong className="text-blue-900">Smart Distribution:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Share <strong>management codes</strong> with department leaders</li>
                  <li>Share <strong>employee codes</strong> with team members in each department</li>
                  <li>Each code provides role-appropriate survey access</li>
                  <li className="flex items-center gap-2">
                    <span>Participants visit:</span>
                    <div className="flex items-center gap-1">
                      <code className="bg-blue-100 px-1 rounded font-mono text-xs">{getAccessUrl()}</code>
                      <button
                        onClick={() => copyToClipboard(getAccessUrl(), 'Survey URL')}
                        className="p-1 hover:bg-blue-200 rounded transition-colors"
                        title="Copy survey URL"
                      >
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}