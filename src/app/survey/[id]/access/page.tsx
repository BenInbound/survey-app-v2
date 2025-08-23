'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OrganizationalAssessmentManager } from '@/lib/organizational-assessment-manager'
import Logo from '@/components/ui/Logo'

interface AccessCodeEntryProps {
  params: { id: string }
  searchParams: { role?: string }
}

export default function AccessCodeEntry({ params, searchParams }: AccessCodeEntryProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const router = useRouter()
  const manager = new OrganizationalAssessmentManager()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code.trim()) {
      setError('Please enter your assessment code')
      return
    }

    setIsValidating(true)
    setError('')

    try {
      const validation = manager.validateAccessCode(code)
      
      if (!validation.isValid) {
        if (validation.isExpired) {
          setError('This assessment code has expired. Please contact your organization for a new code.')
        } else {
          setError('Invalid assessment code. Please check your code and try again.')
        }
        return
      }

      // Valid code - redirect to survey with role
      const role = searchParams.role || 'employee'
      const targetUrl = `/survey/${validation.assessmentId}?role=${role}&code=${code}`
      router.push(targetUrl)
      
    } catch (error) {
      setError('Unable to validate access code. Please try again.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setCode(value)
    if (error) setError('') // Clear error on input change
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Logo */}
      <div className="pt-8 pb-4 pl-8">
        <Logo />
      </div>
      
      <div className="flex items-center justify-center flex-1">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Secure Assessment Access
          </h1>
          <p className="text-gray-600">
            Enter your organization&apos;s assessment code to begin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="COMPANY-2025-STRATEGY"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono uppercase tracking-wider"
              disabled={isValidating}
              autoComplete="off"
              spellCheck="false"
              maxLength={50}
            />
            {error && (
              <div className="mt-2 flex items-start space-x-2">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isValidating || !code.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isValidating ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                </svg>
                <span>Validating...</span>
              </span>
            ) : (
              'Access Assessment'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Need help?</p>
            <p className="text-xs text-gray-400">
              Contact your HR representative or the person who sent you this assessment link
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}