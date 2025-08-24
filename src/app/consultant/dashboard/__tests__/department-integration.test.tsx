/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ConsultantDashboard from '../page'
import { OrganizationalAssessmentManager } from '@/lib/organizational-assessment-manager'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock authentication guard to always pass
jest.mock('@/components/ui/ConsultantAuthGuard')

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve())
  }
})

// Mock window.alert
global.alert = jest.fn()

describe('ConsultantDashboard - Department Integration', () => {
  let assessmentManager: OrganizationalAssessmentManager

  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
    assessmentManager = new OrganizationalAssessmentManager()
  })

  it('displays department manager for assessments', async () => {
    // Create a test assessment with departments
    const assessment = assessmentManager.createAssessment(
      'Test Organization',
      'consultant@test.com',
      undefined,
      [
        { id: 'engineering', name: 'Engineering', managementCode: '', employeeCode: '' },
        { id: 'sales', name: 'Sales', managementCode: '', employeeCode: '' }
      ]
    )

    render(<ConsultantDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Test Organization')).toBeInTheDocument()
    })

    // Should show department access codes with count
    expect(screen.getByText('Department Access Codes (2)')).toBeInTheDocument()
  })

  it('allows adding new departments to existing assessment', async () => {
    // Create a test assessment with initial departments
    const assessment = assessmentManager.createAssessment(
      'Test Organization',
      'consultant@test.com',
      undefined,
      [
        { id: 'engineering', name: 'Engineering', managementCode: '', employeeCode: '' }
      ]
    )

    render(<ConsultantDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Test Organization')).toBeInTheDocument()
    })

    // Expand department management
    fireEvent.click(screen.getByText('Department Access Codes (1)'))

    await waitFor(() => {
      expect(screen.getByText('Add Department')).toBeInTheDocument()
    })

    // Click add department
    fireEvent.click(screen.getByText('Add Department'))

    // Fill in department name
    const input = screen.getByLabelText('Department Name')
    fireEvent.change(input, { target: { value: 'Marketing' } })

    // Submit the form
    fireEvent.click(screen.getByText('Add Department'))

    // Wait for the department to be added
    await waitFor(() => {
      expect(screen.getByText('Department Access Codes (2)')).toBeInTheDocument()
    })

    // Verify the new department was added to the assessment
    const updatedAssessment = assessmentManager.getAssessment(assessment.id)
    expect(updatedAssessment?.departments).toHaveLength(2)
    expect(updatedAssessment?.departments.some(d => d.name === 'Marketing')).toBe(true)
  })

  it('prevents adding departments to locked assessments', async () => {
    // Create a locked assessment
    const assessment = assessmentManager.createAssessment(
      'Locked Organization',
      'consultant@test.com',
      undefined,
      [{ id: 'engineering', name: 'Engineering', managementCode: '', employeeCode: '' }]
    )

    // Lock the assessment
    assessmentManager.lockAssessmentAndExpireCode(assessment.id)

    render(<ConsultantDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Locked Organization')).toBeInTheDocument()
    })

    // Expand department management
    fireEvent.click(screen.getByText('Department Access Codes (1)'))

    // Should not show add button for locked assessment
    expect(screen.queryByText('Add Department')).not.toBeInTheDocument()
    expect(screen.getByText('Locked')).toBeInTheDocument()
  })

  it('shows existing departments with access codes', async () => {
    // Create assessment with departments
    const assessment = assessmentManager.createAssessment(
      'Test Organization',
      'consultant@test.com',
      undefined,
      [
        { id: 'engineering', name: 'Engineering', managementCode: '', employeeCode: '' },
        { id: 'sales', name: 'Sales', managementCode: '', employeeCode: '' }
      ]
    )

    render(<ConsultantDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Test Organization')).toBeInTheDocument()
    })

    // Expand department management
    fireEvent.click(screen.getByText('Department Access Codes (2)'))

    await waitFor(() => {
      // Should show department names
      expect(screen.getByText('Engineering')).toBeInTheDocument()
      expect(screen.getByText('Sales')).toBeInTheDocument()

      // Should show access codes (they will be generated)
      const mgmtCodes = screen.getAllByText(/TESTORGA-MGMT-/)
      const empCodes = screen.getAllByText(/TESTORGA-EMP-/)
      expect(mgmtCodes.length).toBeGreaterThan(0)
      expect(empCodes.length).toBeGreaterThan(0)
    })
  })

  it('handles error when adding invalid department name', async () => {
    // Create assessment
    const assessment = assessmentManager.createAssessment(
      'Test Organization',
      'consultant@test.com',
      undefined,
      [{ id: 'engineering', name: 'Engineering', managementCode: '', employeeCode: '' }]
    )

    render(<ConsultantDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Test Organization')).toBeInTheDocument()
    })

    // Expand department management
    fireEvent.click(screen.getByText('Department Access Codes (1)'))
    fireEvent.click(screen.getByText('Add Department'))

    // Try to add duplicate department
    const input = screen.getByLabelText('Department Name')
    fireEvent.change(input, { target: { value: 'Engineering' } })
    fireEvent.click(screen.getByText('Add Department'))

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/already exists in this assessment/)).toBeInTheDocument()
    })
  })

  it('updates department count when departments are added', async () => {
    // Create assessment with no departments
    const assessment = assessmentManager.createAssessment(
      'Empty Organization',
      'consultant@test.com'
    )

    render(<ConsultantDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Empty Organization')).toBeInTheDocument()
    })

    // Initially should show 0 departments
    expect(screen.getByText('Department Access Codes (0)')).toBeInTheDocument()

    // Add a department
    fireEvent.click(screen.getByText('Department Access Codes (0)'))
    fireEvent.click(screen.getByText('Add Department'))
    
    const input = screen.getByLabelText('Department Name')
    fireEvent.change(input, { target: { value: 'New Department' } })
    fireEvent.click(screen.getByText('Add Department'))

    // Should update to show 1 department
    await waitFor(() => {
      expect(screen.getByText('Department Access Codes (1)')).toBeInTheDocument()
    })
  })
})