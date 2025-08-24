'use client'

import { useState } from 'react'
import { ConsultantAuth } from '@/lib/consultant-auth'
import Logo from '@/components/ui/Logo'

interface ConsultantLoginProps {
  onLoginSuccess: () => void
}

export default function ConsultantLogin({ onLoginSuccess }: ConsultantLoginProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = ConsultantAuth.login(password)
      
      if (success) {
        onLoginSuccess()
      } else {
        setError('Invalid password. Please try again.')
      }
    } catch (error) {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
      setPassword('') // Clear password field
    }
  }

  return (
    <div className="min-h-screen bg-custom-gray flex items-center justify-center py-8">
      <div className="max-w-md w-full mx-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Logo />
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-neutral-200">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Consultant Access
            </h1>
            <p className="text-neutral-600">
              Enter your consultant password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter consultant password"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-neutral-900"
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <div className="bg-error bg-opacity-10 border border-error border-opacity-20 rounded-lg p-3">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Access Consultant Portal'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-primary-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-primary-800 font-medium">Consultant Access Only</p>
                  <p className="text-sm text-primary-700 mt-1">
                    This area is restricted to authorized Inbound consultants managing organizational assessments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}