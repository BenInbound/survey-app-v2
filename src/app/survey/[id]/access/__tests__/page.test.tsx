/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import AccessCodeEntry from '../page'
import { OrganizationalAssessmentManager } from '../../../../../lib/organizational-assessment-manager'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock the organizational assessment manager
jest.mock('../../../../../lib/organizational-assessment-manager')

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockManager = OrganizationalAssessmentManager as jest.MockedClass<typeof OrganizationalAssessmentManager>

describe('AccessCodeEntry', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    })

    mockManager.mockImplementation(() => ({
      validateAccessCode: jest.fn(),
    } as any))

    mockPush.mockClear()
  })

  const defaultProps = {
    params: { id: 'test-assessment' },
    searchParams: { role: 'employee' }
  }

  it('displays access code entry form correctly', () => {
    render(<AccessCodeEntry {...defaultProps} />)
    
    expect(screen.getByText('Secure Assessment Access')).toBeInTheDocument()
    expect(screen.getByText("Enter your organization's assessment code to begin")).toBeInTheDocument()
    expect(screen.getByLabelText('Assessment Code')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Access Assessment' })).toBeInTheDocument()
  })

  it('validates codes before proceeding to survey', async () => {
    const mockValidateAccessCode = jest.fn().mockReturnValue({
      isValid: true,
      assessmentId: 'validated-assessment-id',
      organizationName: 'Test Org'
    })

    mockManager.mockImplementation(() => ({
      validateAccessCode: mockValidateAccessCode,
    } as any))

    render(<AccessCodeEntry {...defaultProps} />)
    
    const input = screen.getByLabelText('Assessment Code')
    const button = screen.getByRole('button', { name: 'Access Assessment' })
    
    fireEvent.change(input, { target: { value: 'TEST-2025-CODE' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockValidateAccessCode).toHaveBeenCalledWith('TEST-2025-CODE')
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/survey/validated-assessment-id?role=employee&code=TEST-2025-CODE')
    })
  })

  it('shows error for invalid codes', async () => {
    const mockValidateAccessCode = jest.fn().mockReturnValue({
      isValid: false,
      isExpired: false
    })

    mockManager.mockImplementation(() => ({
      validateAccessCode: mockValidateAccessCode,
    } as any))

    render(<AccessCodeEntry {...defaultProps} />)
    
    const input = screen.getByLabelText('Assessment Code')
    const button = screen.getByRole('button', { name: 'Access Assessment' })
    
    fireEvent.change(input, { target: { value: 'INVALID-CODE' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Invalid assessment code. Please check your code and try again.')).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows specific error message for expired codes', async () => {
    const mockValidateAccessCode = jest.fn().mockReturnValue({
      isValid: false,
      isExpired: true
    })

    mockManager.mockImplementation(() => ({
      validateAccessCode: mockValidateAccessCode,
    } as any))

    render(<AccessCodeEntry {...defaultProps} />)
    
    const input = screen.getByLabelText('Assessment Code')
    const button = screen.getByRole('button', { name: 'Access Assessment' })
    
    fireEvent.change(input, { target: { value: 'EXPIRED-CODE' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('This assessment code has expired. Please contact your organization for a new code.')).toBeInTheDocument()
    })
  })

  it('prevents submission of empty codes', () => {
    render(<AccessCodeEntry {...defaultProps} />)
    
    const button = screen.getByRole('button', { name: 'Access Assessment' })
    expect(button).toBeDisabled()
    
    const input = screen.getByLabelText('Assessment Code')
    fireEvent.change(input, { target: { value: '   ' } }) // Just spaces
    fireEvent.blur(input)
    
    expect(button).toBeDisabled()
  })

  it('converts input to uppercase automatically', () => {
    render(<AccessCodeEntry {...defaultProps} />)
    
    const input = screen.getByLabelText('Assessment Code') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'test-code-123' } })
    
    expect(input.value).toBe('TEST-CODE-123')
  })

  it('defaults to employee role when no role specified', async () => {
    const propsWithoutRole = {
      params: { id: 'test-assessment' },
      searchParams: {}
    }

    const mockValidateAccessCode = jest.fn().mockReturnValue({
      isValid: true,
      assessmentId: 'validated-assessment-id'
    })

    mockManager.mockImplementation(() => ({
      validateAccessCode: mockValidateAccessCode,
    } as any))

    render(<AccessCodeEntry {...propsWithoutRole} />)
    
    const input = screen.getByLabelText('Assessment Code')
    const button = screen.getByRole('button', { name: 'Access Assessment' })
    
    fireEvent.change(input, { target: { value: 'TEST-CODE' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/survey/validated-assessment-id?role=employee&code=TEST-CODE')
    })
  })

  it('clears error when user starts typing again', async () => {
    const mockValidateAccessCode = jest.fn().mockReturnValue({
      isValid: false,
      isExpired: false
    })

    mockManager.mockImplementation(() => ({
      validateAccessCode: mockValidateAccessCode,
    } as any))

    render(<AccessCodeEntry {...defaultProps} />)
    
    const input = screen.getByLabelText('Assessment Code')
    const button = screen.getByRole('button', { name: 'Access Assessment' })
    
    // First, trigger an error
    fireEvent.change(input, { target: { value: 'INVALID' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Invalid assessment code. Please check your code and try again.')).toBeInTheDocument()
    })

    // Now type again - error should clear
    fireEvent.change(input, { target: { value: 'INVALID2' } })
    
    expect(screen.queryByText('Invalid assessment code. Please check your code and try again.')).not.toBeInTheDocument()
  })
})