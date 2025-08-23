'use client'

import { useState, useEffect, ReactNode } from 'react'
import { ConsultantAuth } from '@/lib/consultant-auth'
import ConsultantLogin from './ConsultantLogin'

interface ConsultantAuthGuardProps {
  children: ReactNode
  pageName: string // e.g., "Consultant Dashboard" or "Admin Portal"
}

export default function ConsultantAuthGuard({ children, pageName }: ConsultantAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null) // null = loading
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const checkAuthentication = () => {
    const authStatus = ConsultantAuth.isAuthenticated()
    setIsAuthenticated(authStatus)
    
    // Extend session for active users
    if (authStatus) {
      ConsultantAuth.extendSession()
    }
  }

  useEffect(() => {
    // Check authentication on mount
    checkAuthentication()

    // Check authentication when window regains focus (handles expired sessions)
    const handleFocus = () => {
      checkAuthentication()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    ConsultantAuth.logout()
    setIsAuthenticated(false)
    setShowLogoutConfirm(false)
  }

  // Show loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-custom-gray flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <ConsultantLogin onLoginSuccess={handleLoginSuccess} />
  }

  // Show protected content with logout header
  return (
    <div>
      {/* Logout Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-green-700 font-medium">
                Consultant Access: {pageName}
              </span>
            </div>
            
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <div className="text-center">
              <div className="bg-rose-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sign Out of Consultant Portal?
              </h3>
              <p className="text-gray-600 mb-6">
                You will need to enter your password again to access consultant features.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Protected Content */}
      {children}
    </div>
  )
}