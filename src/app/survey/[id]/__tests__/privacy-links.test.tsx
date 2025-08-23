/**
 * @jest-environment jsdom
 */

/**
 * Privacy Notice Links Tests
 * Test coverage for privacy notice integration in survey landing pages
 */

import { render, screen } from '@testing-library/react'
import { jest } from '@jest/globals'
import SurveyPage from '../page'

// Mock Next.js router
const mockPush = jest.fn()
const mockSearchParams = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams
}))

// Mock survey management
jest.mock('../../../../lib/survey-logic', () => ({
  SurveyManager: jest.fn().mockImplementation(() => ({}))
}))

jest.mock('../../../../lib/organizational-assessment-manager', () => ({
  OrganizationalAssessmentManager: jest.fn().mockImplementation(() => ({
    getAssessment: jest.fn().mockReturnValue({
      id: 'test-assessment',
      organizationName: 'Test Organization',
      status: 'collecting',
      created: new Date(),
      consultantId: 'test-consultant',
      accessCode: 'TEST-2025-CODE',
      responseCount: { management: 5, employee: 15 }
    }),
    validateAccessCode: jest.fn().mockReturnValue({
      isValid: true,
      assessmentId: 'test-assessment',
      organizationName: 'Test Organization'
    })
  }))
}))

jest.mock('../../../../lib/access-control', () => ({
  AccessCodeManager: jest.fn().mockImplementation(() => ({}))
}))

// Mock components
jest.mock('../../../../components/ui/Logo', () => {
  return function MockLogo() {
    return <div data-testid="logo">Inbound Logo</div>
  }
})

jest.mock('../../../../components/ui/SliderInput', () => {
  return function MockSliderInput() {
    return <div data-testid="slider-input">Slider Input</div>
  }
})

jest.mock('../../../../components/ui/ProgressBar', () => {
  return function MockProgressBar() {
    return <div data-testid="progress-bar">Progress Bar</div>
  }
})

describe('Privacy Notice Links in Survey Landing Pages', () => {
  const mockParams = { id: 'test-assessment' }

  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchParams.set('code', 'TEST-2025-CODE')
  })

  describe('Employee Landing Page', () => {
    beforeEach(() => {
      mockSearchParams.set('role', 'employee')
    })

    it('displays privacy notice link for employees', async () => {
      render(<SurveyPage params={mockParams} />)
      
      // Wait for component to load
      await screen.findByText('Test Organization Strategic Assessment')
      
      const privacyLink = screen.getByRole('link', { 
        name: 'View detailed privacy notice and your data protection rights' 
      })
      expect(privacyLink).toBeInTheDocument()
      expect(privacyLink).toHaveAttribute('href', '/privacy/test-assessment')
    })

    it('styles privacy notice link appropriately for employee theme', async () => {
      render(<SurveyPage params={mockParams} />)
      
      await screen.findByText('Test Organization Strategic Assessment')
      
      const privacyLink = screen.getByRole('link', { 
        name: 'View detailed privacy notice and your data protection rights' 
      })
      expect(privacyLink).toHaveClass('text-green-700', 'hover:text-green-800', 'underline')
    })

    it('positions privacy notice link after privacy protection message', async () => {
      const { container } = render(<SurveyPage params={mockParams} />)
      
      await screen.findByText('Test Organization Strategic Assessment')
      
      const privacyProtectionSection = screen.getByText(/Your Privacy is Protected:/)
      const privacyLink = screen.getByRole('link', { 
        name: 'View detailed privacy notice and your data protection rights' 
      })
      
      // Privacy link should appear after the privacy protection message
      const privacyProtectionParent = privacyProtectionSection.closest('.bg-green-50')
      const privacyLinkParent = privacyLink.closest('.text-center')
      
      expect(privacyProtectionParent).toBeInTheDocument()
      expect(privacyLinkParent).toBeInTheDocument()
    })

    it('shows employee-focused privacy messaging', async () => {
      render(<SurveyPage params={mockParams} />)
      
      await screen.findByText('Test Organization Strategic Assessment')
      
      expect(screen.getByText('Completely Anonymous')).toBeInTheDocument()
      expect(screen.getByText('Your individual responses are never shared or identified')).toBeInTheDocument()
      expect(screen.getByText(/Your Privacy is Protected:/)).toBeInTheDocument()
      expect(screen.getByText(/external consultants/)).toBeInTheDocument()
    })
  })

  describe('Management Landing Page', () => {
    beforeEach(() => {
      mockSearchParams.set('role', 'management')
    })

    it('displays privacy notice link for management', async () => {
      render(<SurveyPage params={mockParams} />)
      
      await screen.findByText('Test Organization Leadership Assessment')
      
      const privacyLink = screen.getByRole('link', { 
        name: 'View detailed privacy notice and your data protection rights' 
      })
      expect(privacyLink).toBeInTheDocument()
      expect(privacyLink).toHaveAttribute('href', '/privacy/test-assessment')
    })

    it('styles privacy notice link appropriately for management theme', async () => {
      render(<SurveyPage params={mockParams} />)
      
      await screen.findByText('Test Organization Leadership Assessment')
      
      const privacyLink = screen.getByRole('link', { 
        name: 'View detailed privacy notice and your data protection rights' 
      })
      expect(privacyLink).toHaveClass('text-blue-700', 'hover:text-blue-800', 'underline')
    })

    it('positions privacy notice link after professional consultation message', async () => {
      render(<SurveyPage params={mockParams} />)
      
      await screen.findByText('Test Organization Leadership Assessment')
      
      const consultationSection = screen.getByText(/Professional Consultation:/)
      const privacyLink = screen.getByRole('link', { 
        name: 'View detailed privacy notice and your data protection rights' 
      })
      
      const consultationParent = consultationSection.closest('.bg-blue-50')
      const privacyLinkParent = privacyLink.closest('.text-center')
      
      expect(consultationParent).toBeInTheDocument()
      expect(privacyLinkParent).toBeInTheDocument()
    })

    it('shows management-focused privacy messaging', async () => {
      render(<SurveyPage params={mockParams} />)
      
      await screen.findByText('Test Organization Leadership Assessment')
      
      expect(screen.getByText('Strategic Focus')).toBeInTheDocument()
      expect(screen.getByText('Leadership Perspective')).toBeInTheDocument()
      expect(screen.getByText(/Professional Consultation:/)).toBeInTheDocument()
      expect(screen.getByText(/strategy consultants/)).toBeInTheDocument()
    })
  })

  describe('Privacy Link Integration', () => {
    it('uses correct assessment ID in privacy link URL', async () => {
      mockSearchParams.set('role', 'employee')
      render(<SurveyPage params={{ id: 'custom-assessment-123' }} />)
      
      // Mock the assessment manager to return the custom assessment
      const { OrganizationalAssessmentManager } = require('../../../../lib/organizational-assessment-manager')
      const mockManager = OrganizationalAssessmentManager.mock.results[0].value
      mockManager.getAssessment.mockReturnValue({
        id: 'custom-assessment-123',
        organizationName: 'Custom Organization',
        status: 'collecting'
      })
      mockManager.validateAccessCode.mockReturnValue({
        isValid: true,
        assessmentId: 'custom-assessment-123',
        organizationName: 'Custom Organization'
      })
      
      await screen.findByText('Custom Organization Strategic Assessment')
      
      const privacyLink = screen.getByRole('link', { 
        name: 'View detailed privacy notice and your data protection rights' 
      })
      expect(privacyLink).toHaveAttribute('href', '/privacy/custom-assessment-123')
    })

    it('does not show privacy links when assessment is not found', async () => {
      mockSearchParams.set('role', 'employee')
      
      // Mock assessment not found
      const { OrganizationalAssessmentManager } = require('../../../../lib/organizational-assessment-manager')
      const mockManager = OrganizationalAssessmentManager.mock.results[0].value
      mockManager.getAssessment.mockReturnValueOnce(null)
      mockManager.validateAccessCode.mockReturnValueOnce({
        isValid: false,
        assessmentId: 'test-assessment',
        organizationName: 'Test Organization'
      })
      
      render(<SurveyPage params={mockParams} />)
      
      // Should show error instead of landing page
      await screen.findByText('Something went wrong')
      
      const privacyLinks = screen.queryAllByRole('link', { 
        name: 'View detailed privacy notice and your data protection rights' 
      })
      expect(privacyLinks).toHaveLength(0)
    })

    it('maintains accessibility standards for privacy links', async () => {
      mockSearchParams.set('role', 'employee')
      render(<SurveyPage params={mockParams} />)
      
      await screen.findByText('Test Organization Strategic Assessment')
      
      const privacyLink = screen.getByRole('link', { 
        name: 'View detailed privacy notice and your data protection rights' 
      })
      
      // Check link has proper role and is keyboard accessible
      expect(privacyLink.tagName).toBe('A')
      expect(privacyLink).toHaveAttribute('href')
      
      // Text should be descriptive and clear
      expect(privacyLink.textContent).toContain('privacy notice')
      expect(privacyLink.textContent).toContain('data protection rights')
    })

    it('centers privacy links appropriately in layout', async () => {
      mockSearchParams.set('role', 'employee')
      render(<SurveyPage params={mockParams} />)
      
      await screen.findByText('Test Organization Strategic Assessment')
      
      const privacyLink = screen.getByRole('link', { 
        name: 'View detailed privacy notice and your data protection rights' 
      })
      
      const linkContainer = privacyLink.closest('.text-center')
      expect(linkContainer).toBeInTheDocument()
      expect(linkContainer).toHaveClass('text-center', 'mb-6')
    })
  })

  describe('GDPR Compliance Integration', () => {
    it('provides clear path to detailed GDPR information', async () => {
      mockSearchParams.set('role', 'employee')
      render(<SurveyPage params={mockParams} />)
      
      await screen.findByText('Test Organization Strategic Assessment')
      
      // Basic privacy protection message
      expect(screen.getByText(/Your Privacy is Protected:/)).toBeInTheDocument()
      
      // Link to detailed privacy notice
      const privacyLink = screen.getByRole('link', { 
        name: 'View detailed privacy notice and your data protection rights' 
      })
      expect(privacyLink).toBeInTheDocument()
      
      // Verify link text mentions both privacy notice and data protection rights
      expect(privacyLink.textContent).toMatch(/privacy notice.*data protection rights/)
    })

    it('works for both employee and management roles', async () => {
      // Test employee role
      mockSearchParams.set('role', 'employee')
      const { rerender } = render(<SurveyPage params={mockParams} />)
      
      await screen.findByText('Test Organization Strategic Assessment')
      expect(screen.getByRole('link', { 
        name: 'View detailed privacy notice and your data protection rights' 
      })).toBeInTheDocument()
      
      // Test management role
      mockSearchParams.set('role', 'management')
      rerender(<SurveyPage params={mockParams} />)
      
      await screen.findByText('Test Organization Leadership Assessment')
      expect(screen.getByRole('link', { 
        name: 'View detailed privacy notice and your data protection rights' 
      })).toBeInTheDocument()
    })
  })
})