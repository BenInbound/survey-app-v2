'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SliderInput from '@/components/ui/SliderInput'
import ProgressBar from '@/components/ui/ProgressBar'
import { SurveyManager } from '@/lib/survey-logic'
import { OrganizationalAssessmentManager } from '@/lib/organizational-assessment-manager'
import { 
  ParticipantSession, 
  SliderValue, 
  Question, 
  ParticipantRole,
  ParticipantResponse 
} from '@/lib/types'

// Role-specific landing page components
function EmployeeLandingPage({ organizationName, onStart }: { organizationName: string; onStart: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {organizationName} Strategic Assessment
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your Voice Matters - Help Shape Our Future
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Completely Anonymous</p>
              <p className="text-sm text-gray-600">Your individual responses are never shared or identified</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Quick & Simple</p>
              <p className="text-sm text-gray-600">Takes just 3-4 minutes to complete</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Makes a Difference</p>
              <p className="text-sm text-gray-600">Your honest feedback helps shape {organizationName}&apos;s future direction</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800 leading-relaxed">
            <strong>Your Privacy is Protected:</strong> This assessment is conducted by external consultants. 
            Your individual answers will never be seen by {organizationName} management - only aggregated, anonymous insights.
          </p>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors"
        >
          Begin Anonymous Assessment
        </button>
      </div>
    </div>
  )
}

function ManagementLandingPage({ organizationName, onStart }: { organizationName: string; onStart: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {organizationName} Leadership Assessment
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Strategic Organizational Health Initiative
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Strategic Focus</p>
              <p className="text-sm text-gray-600">Assess organizational health across key strategic dimensions</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Leadership Perspective</p>
              <p className="text-sm text-gray-600">Share your management viewpoint on organizational performance</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Strategic Insights</p>
              <p className="text-sm text-gray-600">Contribute to data-driven organizational improvement initiatives</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>Professional Consultation:</strong> Your responses will be analyzed by our strategy consultants 
            to provide organizational insights and recommendations through facilitated leadership sessions.
          </p>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
        >
          Begin Leadership Assessment
        </button>
      </div>
    </div>
  )
}

interface SurveyPageProps {
  params: { id: string }
}

export default function SurveyPage({ params }: SurveyPageProps) {
  const { id: assessmentId } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') as ParticipantRole | null
  const code = searchParams.get('code')
  
  const [surveyManager] = useState(() => new SurveyManager(assessmentId))
  const [assessmentManager] = useState(() => new OrganizationalAssessmentManager())
  
  const [session, setSession] = useState<ParticipantSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [currentValue, setCurrentValue] = useState<SliderValue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assessment, setAssessment] = useState<any>(null)
  const [showLandingPage, setShowLandingPage] = useState(true)
  const [surveyStarted, setSurveyStarted] = useState(false)

  // Initialize or load existing session
  useEffect(() => {
    console.log('Survey page initializing with:', { assessmentId, role, code })
    
    try {
      // Validate access code first
      if (!code) {
        console.log('No code provided, redirecting to access page')
        router.push(`/survey/${assessmentId}/access?role=${role || 'employee'}`)
        return
      }

      // Validate the access code
      console.log('Validating access code in survey page:', code)
      const codeValidation = assessmentManager.validateAccessCode(code)
      console.log('Code validation result:', codeValidation)
      
      if (!codeValidation.isValid) {
        console.log('Code validation failed')
        setError('Invalid or expired access code. Please contact your organization.')
        setIsLoading(false)
        return
      }

      // Get the assessment details
      console.log('Looking for assessment with ID:', codeValidation.assessmentId)
      const foundAssessment = assessmentManager.getAssessment(codeValidation.assessmentId)
      console.log('Found assessment:', foundAssessment)
      
      if (!foundAssessment) {
        console.log('Assessment not found for ID:', codeValidation.assessmentId)
        setError('Assessment not found.')
        setIsLoading(false)
        return
      }

      setAssessment(foundAssessment)

      if (!role) {
        console.log('No role specified')
        setError('This is an organizational assessment. Please access through a role-specific link.')
        setIsLoading(false)
        return
      }

      if (foundAssessment.status === 'locked') {
        console.log('Assessment status is locked:', foundAssessment.status)
        setError('This assessment is no longer accepting responses.')
        setIsLoading(false)
        return
      }
      
      // Allow both 'collecting' and 'ready' status for demo purposes
      console.log('Assessment status is:', foundAssessment.status, '- allowing access')

      console.log('Survey initialization successful')
      setIsLoading(false)
      
    } catch (err) {
      console.error('Error during survey initialization:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize survey')
      setIsLoading(false)
    }
  }, [assessmentId, role, code, assessmentManager, router])

  // Handle starting the actual survey
  const handleStartSurvey = () => {
    try {
      // Generate session storage key that includes role
      const sessionKey = `${assessmentId}-${role}-${Date.now().toString().slice(-6)}`

      const participantSession = surveyManager.initializeSurvey(
        sessionKey,
        `participant-${Date.now()}`,
        role === 'management' ? 'Management' : role === 'employee' ? 'Employee' : 'General'
      )

      setSession(participantSession)
      
      const question = surveyManager.getCurrentQuestion(participantSession)
      setCurrentQuestion(question)
      
      const savedResponse = surveyManager.getCurrentResponse(participantSession)
      setCurrentValue(savedResponse)
      
      setShowLandingPage(false)
      setSurveyStarted(true)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start survey')
    }
  }

  const handleValueChange = (value: SliderValue) => {
    setCurrentValue(value)
  }

  const handleNext = () => {
    if (!session || !currentValue) return

    try {
      // Save current response
      const updatedSession = surveyManager.saveResponse(session, currentValue)
      
      // Navigate to next question
      const nextSession = surveyManager.navigateToNext(updatedSession)
      setSession(nextSession)
      
      // Check if survey is complete
      if (surveyManager.isComplete(nextSession)) {
        // Save as ParticipantResponse for organizational assessment
        if (role) {
          const participantResponse: ParticipantResponse = {
            ...nextSession,
            role,
            assessmentId
          }
          assessmentManager.addParticipantResponse(assessmentId, participantResponse)
        }
        
        // All participants go to thank you page - no results access
        router.push(`/survey/complete?type=${role || 'employee'}`)
        return
      }
      
      // Load next question
      const nextQuestion = surveyManager.getCurrentQuestion(nextSession)
      setCurrentQuestion(nextQuestion)
      
      // Reset slider for next question
      const nextResponse = surveyManager.getCurrentResponse(nextSession)
      setCurrentValue(nextResponse)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save response')
    }
  }

  const handlePrevious = () => {
    if (!session || session.currentQuestionIndex === 0) return

    try {
      // Move back one question
      const prevSession = {
        ...session,
        currentQuestionIndex: session.currentQuestionIndex - 1
      }
      
      surveyManager.saveSession(prevSession)
      setSession(prevSession)
      
      // Load previous question
      const prevQuestion = surveyManager.getCurrentQuestion(prevSession)
      setCurrentQuestion(prevQuestion)
      
      // Load previous response
      const prevResponse = surveyManager.getCurrentResponse(prevSession)
      setCurrentValue(prevResponse)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to navigate back')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show role-specific landing page first
  if (showLandingPage && assessment && !surveyStarted) {
    if (role === 'employee') {
      return <EmployeeLandingPage organizationName={assessment.organizationName} onStart={handleStartSurvey} />
    } else if (role === 'management') {
      return <ManagementLandingPage organizationName={assessment.organizationName} onStart={handleStartSurvey} />
    }
  }

  // Survey hasn't started yet or completed
  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    )
  }

  const progress = surveyManager.calculateProgress(session)
  const canGoBack = session.currentQuestionIndex > 0
  const canGoNext = currentValue !== null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {assessment?.organizationName} Assessment - {role === 'management' ? 'Leadership' : 'Employee'} View
          </h1>
          <p className="text-gray-600">
            Please rate each statement based on your {role === 'management' ? 'leadership' : 'employee'} perspective
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <ProgressBar progress={progress} />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
              {currentQuestion.category}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Slider Input */}
          <SliderInput
            value={currentValue}
            onChange={handleValueChange}
            className="mb-8"
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={!canGoBack}
            className={`
              flex items-center px-6 py-3 rounded-lg font-medium transition-colors
              ${canGoBack 
                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="text-center">
            <span className="text-sm text-gray-500">
              {currentValue ? 'Click Next to continue' : 'Please select a rating'}
            </span>
          </div>

          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`
              flex items-center px-6 py-3 rounded-lg font-medium transition-colors
              ${canGoNext 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Next
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}