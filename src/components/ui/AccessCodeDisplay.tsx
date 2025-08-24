'use client'

import { useState } from 'react'
import { OrganizationalAssessment, Department } from '@/lib/types'

interface AccessCodeDisplayProps {
  assessment: OrganizationalAssessment
  onRegenerateCode: (assessmentId: string) => void
  copyToClipboard: (text: string, label: string) => void
  getAccessUrl: () => string
}

export default function AccessCodeDisplay({ 
  assessment, 
  onRegenerateCode, 
  copyToClipboard, 
  getAccessUrl 
}: AccessCodeDisplayProps) {
  const hasDepartments = assessment.departments && assessment.departments.length > 0
  const [regeneratingDept, setRegeneratingDept] = useState<string | null>(null)

  const handleRegenerateDepartmentCodes = async (deptId?: string) => {
    if (deptId) {
      setRegeneratingDept(deptId)
    }
    
    try {
      await onRegenerateCode(assessment.id)
    } finally {
      setRegeneratingDept(null)
    }
  }

  if (hasDepartments) {
    return (
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-primary-900">
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Department Access Codes
          </h4>
          <button
            onClick={() => handleRegenerateDepartmentCodes()}
            disabled={assessment.status === 'locked'}
            className={`text-sm px-3 py-1 rounded ${
              assessment.status === 'locked' 
                ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed' 
                : 'bg-primary-200 text-primary-800 hover:bg-primary-300'
            }`}
          >
            Regenerate All Codes
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {assessment.departments.map((department: Department) => (
            <div key={department.id} className="bg-white rounded-lg border border-primary-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-primary-900 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {department.name}
                </h5>
                
                <div className="text-xs text-neutral-600">
                  {/* TODO: Add department-specific response counts when available */}
                  Department codes active
                </div>
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
                    <code className="bg-blue-100 px-1 rounded font-mono text-xs">{getAccessUrl()}/[code]</code>
                    <button
                      onClick={() => copyToClipboard(`${getAccessUrl()}/[code]`, 'Survey URL')}
                      className="p-1 hover:bg-blue-200 rounded transition-colors"
                      title="Copy survey URL template"
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
      </div>
    )
  }

  // Legacy single access code display
  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-primary-900">
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Assessment Access Code
        </h4>
        <button
          onClick={() => onRegenerateCode(assessment.id)}
          disabled={assessment.status === 'locked'}
          className={`text-sm px-3 py-1 rounded ${
            assessment.status === 'locked' 
              ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed' 
              : 'bg-primary-200 text-primary-800 hover:bg-primary-300'
          }`}
        >
          Regenerate Code
        </button>
      </div>
      
      <div className="bg-white rounded-lg p-4 border border-primary-200">
        <div className="flex items-center justify-between">
          <div className="font-mono text-2xl font-bold text-primary-900 tracking-wider">
            {assessment.accessCode}
          </div>
          <button
            onClick={() => copyToClipboard(assessment.accessCode, 'Access code')}
            className="bg-secondary-600 text-white px-4 py-2 rounded-lg hover:bg-secondary-700 transition-colors text-sm font-medium"
          >
            Copy Code
          </button>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-primary-800">
        <strong>Distribution Instructions:</strong>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Share this access code with your client contact (HR/Management)</li>
          <li>Client distributes code to employees and management via internal channels</li>
          <li className="flex items-center gap-2">
            <span>Participants visit:</span>
            <div className="flex items-center gap-1">
              <code className="bg-primary-100 px-1 rounded">{getAccessUrl()}</code>
              <button
                onClick={() => copyToClipboard(getAccessUrl(), 'Survey URL')}
                className="p-1 hover:bg-primary-200 rounded transition-colors"
                title="Copy survey URL"
              >
                <svg className="w-3 h-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </li>
          <li>Participants enter the access code to begin their assessment</li>
        </ol>
      </div>
    </div>
  )
}