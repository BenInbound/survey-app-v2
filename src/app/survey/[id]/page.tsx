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

interface SurveyPageProps {
  params: { id: string }
}

export default function SurveyPage({ params }: SurveyPageProps) {
  const { id: assessmentId } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') as ParticipantRole | null
  
  const [surveyManager] = useState(() => new SurveyManager(assessmentId))
  const [assessmentManager] = useState(() => new OrganizationalAssessmentManager())
  
  const [session, setSession] = useState<ParticipantSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [currentValue, setCurrentValue] = useState<SliderValue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOrganizationalAssessment, setIsOrganizationalAssessment] = useState(false)

  // Initialize or load existing session
  useEffect(() => {
    try {
      // Check if this is an organizational assessment
      const assessment = assessmentManager.getAssessment(assessmentId)
      const isOrgAssessment = assessment !== null
      setIsOrganizationalAssessment(isOrgAssessment)

      if (isOrgAssessment && !role) {
        setError('This is an organizational assessment. Please access through a role-specific link.')
        setIsLoading(false)
        return
      }

      if (isOrgAssessment && role && assessment?.status !== 'collecting') {
        setError('This assessment is no longer accepting responses.')
        setIsLoading(false)
        return
      }

      // Generate session storage key that includes role for organizational assessments
      const sessionKey = isOrgAssessment && role 
        ? `${assessmentId}-${role}-${Date.now().toString().slice(-6)}`
        : assessmentId

      let participantSession = surveyManager.getStoredSession()
      
      if (!participantSession) {
        participantSession = surveyManager.initializeSurvey(
          sessionKey,
          `participant-${Date.now()}`,
          role === 'management' ? 'Management' : role === 'employee' ? 'Employee' : 'General'
        )
      }

      setSession(participantSession)
      
      const question = surveyManager.getCurrentQuestion(participantSession)
      setCurrentQuestion(question)
      
      if (question) {
        const savedResponse = surveyManager.getCurrentResponse(participantSession)
        setCurrentValue(savedResponse)
      } else if (surveyManager.isComplete(participantSession)) {
        // Survey is complete, redirect based on type and role
        if (isOrgAssessment) {
          // For organizational assessments, save as ParticipantResponse and redirect appropriately
          if (role) {
            const participantResponse: ParticipantResponse = {
              ...participantSession,
              role,
              assessmentId
            }
            assessmentManager.addParticipantResponse(assessmentId, participantResponse)
          }
          
          // Redirect based on role
          if (role === 'employee') {
            router.push(`/survey/complete?type=employee`)
          } else if (role === 'management') {
            router.push(`/management/results/${assessmentId}`)
          } else {
            router.push(`/consultant/results/${assessmentId}`)
          }
        } else {
          // Individual assessment
          router.push(`/results/${assessmentId}`)
        }
        return
      }
      
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize survey')
      setIsLoading(false)
    }
  }, [assessmentId, role, surveyManager, assessmentManager, router])

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
        if (isOrganizationalAssessment) {
          // For organizational assessments, save as ParticipantResponse and redirect appropriately
          if (role) {
            const participantResponse: ParticipantResponse = {
              ...nextSession,
              role,
              assessmentId
            }
            assessmentManager.addParticipantResponse(assessmentId, participantResponse)
          }
          
          // Redirect based on role
          if (role === 'employee') {
            router.push(`/survey/complete?type=employee`)
          } else if (role === 'management') {
            router.push(`/management/results/${assessmentId}`)
          } else {
            router.push(`/consultant/results/${assessmentId}`)
          }
        } else {
          // Individual assessment
          router.push(`/results/${assessmentId}`)
        }
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

  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Survey Complete</h2>
          <p className="text-gray-600 mt-2">Redirecting to results...</p>
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
            {isOrganizationalAssessment 
              ? `Organizational Assessment${role ? ` - ${role === 'management' ? 'Management' : 'Employee'} View` : ''}`
              : 'Strategic Assessment'
            }
          </h1>
          <p className="text-gray-600">
            {isOrganizationalAssessment 
              ? `Please rate each statement based on your ${role === 'management' ? 'leadership' : 'employee'} perspective`
              : 'Please rate each statement based on your experience'
            }
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