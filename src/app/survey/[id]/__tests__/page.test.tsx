/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import SurveyPage from '../page'
import { OrganizationalAssessmentManager } from '../../../../lib/organizational-assessment-manager'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock the organizational assessment manager
jest.mock('../../../../lib/organizational-assessment-manager')

// Mock the survey manager
jest.mock('../../../../lib/survey-logic', () => ({
  SurveyManager: jest.fn().mockImplementation(() => ({
    getStoredSession: jest.fn().mockReturnValue(null),
    initializeSurvey: jest.fn(),
    getCurrentQuestion: jest.fn(),
    getCurrentResponse: jest.fn(),
    calculateProgress: jest.fn().mockReturnValue({ currentIndex: 0, totalQuestions: 8, percentage: 0 }),
  })),
}))

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>
const mockManager = OrganizationalAssessmentManager as jest.MockedClass<typeof OrganizationalAssessmentManager>

describe('SurveyPage Role-Specific Landing Pages', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    })

    mockPush.mockClear()
  })

  const defaultProps = {
    params: { id: 'test-assessment' }
  }

  describe('Employee Landing Page', () => {
    beforeEach(() => {
      const mockSearchParams = new URLSearchParams()
      mockSearchParams.set('role', 'employee')
      mockSearchParams.set('code', 'TEST-2025-CODE')
      
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => mockSearchParams.get(key),
      } as any)

      mockManager.mockImplementation(() => ({
        validateAccessCode: jest.fn().mockReturnValue({
          isValid: true,
          assessmentId: 'test-assessment',
          organizationName: 'Test Organization'
        }),
        getAssessment: jest.fn().mockReturnValue({
          id: 'test-assessment',
          organizationName: 'Test Organization',
          status: 'collecting'
        }),
      } as any))
    })

    it('displays employee-focused messaging', () => {
      render(<SurveyPage {...defaultProps} />)
      
      expect(screen.getByText('Test Organization Strategic Assessment')).toBeInTheDocument()
      expect(screen.getByText('Your Voice Matters - Help Shape Our Future')).toBeInTheDocument()
    })

    it('emphasizes anonymity and privacy protection', () => {
      render(<SurveyPage {...defaultProps} />)
      
      expect(screen.getByText('Completely Anonymous')).toBeInTheDocument()
      expect(screen.getByText('Your individual responses are never shared or identified')).toBeInTheDocument()
      expect(screen.getByText(/Your Privacy is Protected/)).toBeInTheDocument()
      expect(screen.getByText(/Your individual answers will never be seen by Test Organization management/)).toBeInTheDocument()
    })

    it('shows employee-appropriate call to action', () => {
      render(<SurveyPage {...defaultProps} />)
      
      const startButton = screen.getByRole('button', { name: 'Begin Anonymous Assessment' })
      expect(startButton).toBeInTheDocument()
      expect(startButton).toHaveClass('bg-green-600')
    })

    it('uses green color scheme for employees', () => {
      render(<SurveyPage {...defaultProps} />)
      
      const container = document.querySelector('.from-green-50')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Management Landing Page', () => {
    beforeEach(() => {
      const mockSearchParams = new URLSearchParams()
      mockSearchParams.set('role', 'management')
      mockSearchParams.set('code', 'TEST-2025-CODE')
      
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => mockSearchParams.get(key),
      } as any)

      mockManager.mockImplementation(() => ({
        validateAccessCode: jest.fn().mockReturnValue({
          isValid: true,
          assessmentId: 'test-assessment',
          organizationName: 'Test Organization'
        }),
        getAssessment: jest.fn().mockReturnValue({
          id: 'test-assessment',
          organizationName: 'Test Organization',
          status: 'collecting'
        }),
      } as any))
    })

    it('displays management-focused messaging', () => {
      render(<SurveyPage {...defaultProps} />)
      
      expect(screen.getByText('Test Organization Leadership Assessment')).toBeInTheDocument()
      expect(screen.getByText('Strategic Organizational Health Initiative')).toBeInTheDocument()
    })

    it('emphasizes strategic value and professional context', () => {
      render(<SurveyPage {...defaultProps} />)
      
      expect(screen.getByText('Strategic Focus')).toBeInTheDocument()
      expect(screen.getByText('Assess organizational health across key strategic dimensions')).toBeInTheDocument()
      expect(screen.getByText('Leadership Perspective')).toBeInTheDocument()
      expect(screen.getByText(/Professional Consultation/)).toBeInTheDocument()
    })

    it('shows management-appropriate call to action', () => {
      render(<SurveyPage {...defaultProps} />)
      
      const startButton = screen.getByRole('button', { name: 'Begin Leadership Assessment' })
      expect(startButton).toBeInTheDocument()
      expect(startButton).toHaveClass('bg-blue-600')
    })

    it('uses blue color scheme for management', () => {
      render(<SurveyPage {...defaultProps} />)
      
      const container = document.querySelector('.from-blue-50')
      expect(container).toBeInTheDocument()
    })

    it('mentions consultant-facilitated sessions not direct results', () => {
      render(<SurveyPage {...defaultProps} />)
      
      expect(screen.getByText(/through facilitated leadership sessions/)).toBeInTheDocument()
      expect(screen.queryByText(/you will receive results/)).not.toBeInTheDocument()
    })
  })

  describe('Access Code Validation', () => {
    it('redirects to access page when no code provided', () => {
      const mockSearchParams = new URLSearchParams()
      mockSearchParams.set('role', 'employee')
      // No code provided
      
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => mockSearchParams.get(key),
      } as any)

      render(<SurveyPage {...defaultProps} />)
      
      expect(mockPush).toHaveBeenCalledWith('/survey/test-assessment/access?role=employee')
    })

    it('shows error for invalid access codes', () => {
      const mockSearchParams = new URLSearchParams()
      mockSearchParams.set('role', 'employee')
      mockSearchParams.set('code', 'INVALID-CODE')
      
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => mockSearchParams.get(key),
      } as any)

      mockManager.mockImplementation(() => ({
        validateAccessCode: jest.fn().mockReturnValue({
          isValid: false,
        }),
      } as any))

      render(<SurveyPage {...defaultProps} />)
      
      expect(screen.getByText('Invalid or expired access code. Please contact your organization.')).toBeInTheDocument()
    })
  })

  describe('Survey Start Flow', () => {
    beforeEach(() => {
      const mockSearchParams = new URLSearchParams()
      mockSearchParams.set('role', 'employee')
      mockSearchParams.set('code', 'TEST-2025-CODE')
      
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => mockSearchParams.get(key),
      } as any)

      mockManager.mockImplementation(() => ({
        validateAccessCode: jest.fn().mockReturnValue({
          isValid: true,
          assessmentId: 'test-assessment',
          organizationName: 'Test Organization'
        }),
        getAssessment: jest.fn().mockReturnValue({
          id: 'test-assessment',
          organizationName: 'Test Organization',
          status: 'collecting'
        }),
      } as any))
    })

    it('starts survey when user clicks begin button', () => {
      render(<SurveyPage {...defaultProps} />)
      
      const beginButton = screen.getByRole('button', { name: 'Begin Anonymous Assessment' })
      fireEvent.click(beginButton)
      
      // Should transition from landing page to loading state
      expect(screen.getByText('Loading survey...')).toBeInTheDocument()
    })
  })
})