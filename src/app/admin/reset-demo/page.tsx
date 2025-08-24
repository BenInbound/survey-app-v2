'use client'

import { useRouter } from 'next/navigation'
import { OrganizationalAssessmentManager } from '@/lib/organizational-assessment-manager'
import { createDemoAssessment } from '@/lib/demo-data'

export default function ResetDemo() {
  const router = useRouter()

  const handleResetDemo = () => {
    if (typeof window !== 'undefined') {
      // Clear existing demo data
      localStorage.removeItem('organizational-assessments')
      localStorage.removeItem('organizational-responses')
      
      // Recreate demo data
      createDemoAssessment()
      
      alert('Demo data has been reset! Access code is now: DEMO-2025-STRATEGY')
      router.push('/consultant/dashboard')
    }
  }

  const checkDemoData = () => {
    if (typeof window !== 'undefined') {
      const manager = new OrganizationalAssessmentManager()
      const demoAssessment = manager.getAssessment('demo-org')
      
      if (demoAssessment) {
        alert(`Demo Assessment Found!\nAccess Code: ${demoAssessment.accessCode}\nStatus: ${demoAssessment.status}\nOrganization: ${demoAssessment.organizationName}`)
      } else {
        alert('No demo assessment found!')
      }
    }
  }

  return (
    <div className="min-h-screen bg-custom-gray p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Demo Data Reset</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <p className="text-neutral-600">
            Use this page to reset the demo assessment data and ensure the access code is properly set.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={checkDemoData}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors mr-4"
            >
              Check Demo Data
            </button>
            
            <button
              onClick={handleResetDemo}
              className="bg-error text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reset Demo Data
            </button>
          </div>
          
          <div className="mt-8 p-4 bg-neutral-50 rounded-lg">
            <h3 className="font-semibold text-neutral-900 mb-2">After Reset:</h3>
            <ul className="text-sm text-neutral-600 space-y-1">
              <li>• Access code will be: <code className="bg-neutral-200 px-2 py-1 rounded">DEMO-2025-STRATEGY</code></li>
              <li>• Status will be: <code className="bg-neutral-200 px-2 py-1 rounded">collecting</code></li>
              <li>• Demo responses will be re-added</li>
              <li>• You can then access the survey at: <code className="bg-neutral-200 px-2 py-1 rounded">http://localhost:3000/survey/demo-org/access</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}