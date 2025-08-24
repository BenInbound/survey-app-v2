'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Logo from '@/components/ui/Logo'

function SurveyCompleteContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')

  return (
    <div className="min-h-screen bg-custom-gray py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Logo */}
        <div className="mb-8">
          <Logo />
        </div>
        
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-success bg-opacity-20 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-success" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>

          {/* Title and Message */}
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Thank You!
          </h1>
          
          {type === 'employee' ? (
            <div className="space-y-4">
              <p className="text-xl text-neutral-700 mb-6">
                Your responses have been submitted successfully.
              </p>
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                <p className="text-neutral-600 leading-relaxed">
                  Your feedback will contribute to understanding our organization&apos;s strategic alignment 
                  and identifying opportunities for improvement. All responses are kept anonymous and 
                  will be analyzed at the organizational level.
                </p>
                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-800">
                    <strong>Next Steps:</strong> Your leadership team will receive insights from this 
                    assessment to help guide strategic decisions and organizational improvements.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xl text-neutral-700 mb-6">
                Your strategic assessment has been completed successfully.
              </p>
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                <p className="text-neutral-600 leading-relaxed">
                  Your responses have been saved and you can review your results and insights 
                  at any time.
                </p>
                <div className="mt-6">
                  <a 
                    href="/" 
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Return to Dashboard
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SurveyComplete() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    }>
      <SurveyCompleteContent />
    </Suspense>
  )
}