/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ConsultantDashboard from '../page'
import { OrganizationalAssessmentManager } from '../../../../lib/organizational-assessment-manager'

// Mock the organizational assessment manager
jest.mock('../../../../lib/organizational-assessment-manager')

// Mock demo data
jest.mock('../../../../lib/demo-data', () => ({
  createDemoAssessment: jest.fn(),
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
})

// Mock alert
global.alert = jest.fn()

// Mock authentication guard to always pass
jest.mock('@/components/ui/ConsultantAuthGuard')

const mockManager = OrganizationalAssessmentManager as jest.MockedClass<typeof OrganizationalAssessmentManager>

describe('ConsultantDashboard - Access Code Management', () => {
  const mockAssessment = {
    id: 'test-assessment',
    organizationName: 'Test Organization',
    consultantId: 'consultant@test.com',
    status: 'collecting' as const,
    created: new Date(),
    accessCode: 'TESTORG-2025-STRATEGY',
    managementResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
    employeeResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
    responseCount: { management: 3, employee: 12 }
  }

  beforeEach(() => {
    mockManager.mockImplementation(() => ({
      getAllAssessments: jest.fn().mockReturnValue([mockAssessment]),
      createAssessment: jest.fn().mockReturnValue(mockAssessment),
      updateAssessmentStatus: jest.fn(),
      regenerateAccessCode: jest.fn().mockReturnValue('NEWCODE-2025-UPDATE'),
    } as any))

    jest.clearAllMocks()
  })

  it('displays access code prominently for each assessment', () => {
    render(<ConsultantDashboard />)
    
    expect(screen.getByText('Assessment Access Code')).toBeInTheDocument()
    expect(screen.getByText('TESTORG-2025-STRATEGY')).toBeInTheDocument()
  })

  it('shows access code in monospace font for easy reading', () => {
    render(<ConsultantDashboard />)
    
    const codeElement = screen.getByText('TESTORG-2025-STRATEGY')
    expect(codeElement).toHaveClass('font-mono')
  })

  it('provides copy button for access code', () => {
    render(<ConsultantDashboard />)
    
    const copyButton = screen.getByRole('button', { name: 'Copy Code' })
    expect(copyButton).toBeInTheDocument()
    
    fireEvent.click(copyButton)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('TESTORG-2025-STRATEGY')
    expect(global.alert).toHaveBeenCalledWith('Access code copied to clipboard!')
  })

  it('shows distribution instructions for client contact', () => {
    render(<ConsultantDashboard />)
    
    expect(screen.getByText('Distribution Instructions:')).toBeInTheDocument()
    expect(screen.getByText(/Share this access code with your client contact/)).toBeInTheDocument()
    expect(screen.getByText(/Client distributes code to employees and management/)).toBeInTheDocument()
    expect(screen.getByText(/Participants enter the access code to begin/)).toBeInTheDocument()
  })

  it('includes regenerate code functionality', () => {
    render(<ConsultantDashboard />)
    
    const regenerateButton = screen.getByRole('button', { name: 'Regenerate Code' })
    expect(regenerateButton).toBeInTheDocument()
    expect(regenerateButton).not.toBeDisabled()
  })

  it('handles access code regeneration', () => {
    const mockRegenerateAccessCode = jest.fn().mockReturnValue('NEWCODE-2025-UPDATE')
    const mockGetAllAssessments = jest.fn().mockReturnValue([mockAssessment])
    
    mockManager.mockImplementation(() => ({
      getAllAssessments: mockGetAllAssessments,
      regenerateAccessCode: mockRegenerateAccessCode,
      createAssessment: jest.fn(),
      updateAssessmentStatus: jest.fn(),
    } as any))

    render(<ConsultantDashboard />)
    
    const regenerateButton = screen.getByRole('button', { name: 'Regenerate Code' })
    fireEvent.click(regenerateButton)
    
    expect(mockRegenerateAccessCode).toHaveBeenCalledWith('test-assessment')
    expect(mockGetAllAssessments).toHaveBeenCalledTimes(2) // Initial load + after regeneration
    expect(global.alert).toHaveBeenCalledWith('Access code regenerated successfully!')
  })

  it('disables regenerate button when assessment is locked', () => {
    const lockedAssessment = { ...mockAssessment, status: 'locked' as const }
    
    mockManager.mockImplementation(() => ({
      getAllAssessments: jest.fn().mockReturnValue([lockedAssessment]),
      createAssessment: jest.fn(),
      updateAssessmentStatus: jest.fn(),
      regenerateAccessCode: jest.fn(),
    } as any))

    render(<ConsultantDashboard />)
    
    const regenerateButton = screen.getByRole('button', { name: 'Regenerate Code' })
    expect(regenerateButton).toBeDisabled()
    expect(regenerateButton).toHaveClass('cursor-not-allowed')
  })

  it('handles regeneration errors gracefully', () => {
    const mockRegenerateAccessCode = jest.fn().mockImplementation(() => {
      throw new Error('Network error')
    })
    
    mockManager.mockImplementation(() => ({
      getAllAssessments: jest.fn().mockReturnValue([mockAssessment]),
      regenerateAccessCode: mockRegenerateAccessCode,
      createAssessment: jest.fn(),
      updateAssessmentStatus: jest.fn(),
    } as any))

    render(<ConsultantDashboard />)
    
    const regenerateButton = screen.getByRole('button', { name: 'Regenerate Code' })
    fireEvent.click(regenerateButton)
    
    expect(global.alert).toHaveBeenCalledWith('Failed to regenerate access code. Please try again.')
  })

  it('shows participation statistics without direct survey links', () => {
    render(<ConsultantDashboard />)
    
    expect(screen.getByText('Management Participation')).toBeInTheDocument()
    expect(screen.getByText('Employee Participation')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument() // Management count
    expect(screen.getByText('12')).toBeInTheDocument() // Employee count
    
    // Should NOT show direct survey links anymore
    expect(screen.queryByText('Survey Link:')).not.toBeInTheDocument()
  })

  it('provides access URL template for participants', () => {
    render(<ConsultantDashboard />)
    
    // Should show the access entry URL pattern
    expect(screen.getByText(/survey\/\[assessment-id\]\/access/)).toBeInTheDocument()
  })

  it('creates new assessment with access code generation', () => {
    const mockCreateAssessment = jest.fn().mockReturnValue({
      ...mockAssessment,
      accessCode: 'NEWORG-2025-FOCUS'
    })
    
    mockManager.mockImplementation(() => ({
      getAllAssessments: jest.fn().mockReturnValue([]),
      createAssessment: mockCreateAssessment,
      updateAssessmentStatus: jest.fn(),
      regenerateAccessCode: jest.fn(),
    } as any))

    render(<ConsultantDashboard />)
    
    // Open create form
    const createButton = screen.getByRole('button', { name: 'Create New Assessment' })
    fireEvent.click(createButton)
    
    // Fill form
    const orgInput = screen.getByPlaceholderText('e.g., Stork')
    fireEvent.change(orgInput, { target: { value: 'New Organization' } })
    
    // Submit using the specific button in the modal (not the empty state button)
    const allSubmitButtons = screen.getAllByRole('button', { name: 'Create Assessment' })
    const modalSubmitButton = allSubmitButtons.find(button => 
      button.className.includes('flex-1')
    )
    expect(modalSubmitButton).toBeInTheDocument()
    
    fireEvent.click(modalSubmitButton!)
    
    expect(mockCreateAssessment).toHaveBeenCalledWith('New Organization', 'guro@inbound.com')
  })

  it('shows simplified survey controls', () => {
    render(<ConsultantDashboard />)
    
    // Should show status displays instead of control buttons
    expect(screen.getByText(/Survey Active|Survey Closed/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Close Survey/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View Assessment Results' })).toBeInTheDocument()
  })
})