import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import DepartmentConfig from '../DepartmentConfig'
import { Department } from '@/lib/types'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
})

describe('DepartmentConfig', () => {
  const mockOnDepartmentsChange = jest.fn()
  const organizationName = 'Test Organization'

  beforeEach(() => {
    mockOnDepartmentsChange.mockClear()
    ;(navigator.clipboard.writeText as jest.Mock).mockClear()
  })

  it('renders empty state correctly', () => {
    render(
      <DepartmentConfig
        departments={[]}
        onDepartmentsChange={mockOnDepartmentsChange}
        organizationName={organizationName}
      />
    )

    expect(screen.getByText('Department Configuration')).toBeInTheDocument()
    expect(screen.getByText('No departments configured')).toBeInTheDocument()
    expect(screen.getByText('Add departments to enable role-specific survey distribution')).toBeInTheDocument()
    expect(screen.getByText('Add Department')).toBeInTheDocument()
  })

  it('allows adding a new department', async () => {
    render(
      <DepartmentConfig
        departments={[]}
        onDepartmentsChange={mockOnDepartmentsChange}
        organizationName={organizationName}
      />
    )

    // Click Add Department button
    fireEvent.click(screen.getByText('Add Department'))
    
    // Form should appear
    expect(screen.getByLabelText('Department Name')).toBeInTheDocument()
    
    // Fill in department name
    const input = screen.getByPlaceholderText('e.g., Human Resources, Engineering, Sales')
    fireEvent.change(input, { target: { value: 'Human Resources' } })
    
    // Submit form - find the submit button specifically (not the main add button)
    const addButtons = screen.getAllByText('Add Department')
    const submitButton = addButtons.find(button => 
      button.classList.contains('bg-primary-600')
    )
    fireEvent.click(submitButton!)
    
    await waitFor(() => {
      expect(mockOnDepartmentsChange).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Human Resources',
          managementCode: expect.stringMatching(/TESTORGA-MGMT-HUM\d{4}/),
          employeeCode: expect.stringMatching(/TESTORGA-EMP-HUM\d{4}/)
        })
      ])
    })
  })

  it('allows canceling department addition', () => {
    render(
      <DepartmentConfig
        departments={[]}
        onDepartmentsChange={mockOnDepartmentsChange}
        organizationName={organizationName}
      />
    )

    // Click Add Department button
    fireEvent.click(screen.getByText('Add Department'))
    
    // Fill in department name
    const input = screen.getByPlaceholderText('e.g., Human Resources, Engineering, Sales')
    fireEvent.change(input, { target: { value: 'Test Department' } })
    
    // Click Cancel
    fireEvent.click(screen.getByText('Cancel'))
    
    // Form should disappear and no changes should be made
    expect(screen.queryByLabelText('Department Name')).not.toBeInTheDocument()
    expect(mockOnDepartmentsChange).not.toHaveBeenCalled()
  })

  it('supports Enter key for adding department', async () => {
    render(
      <DepartmentConfig
        departments={[]}
        onDepartmentsChange={mockOnDepartmentsChange}
        organizationName={organizationName}
      />
    )

    // Click Add Department button
    fireEvent.click(screen.getByText('Add Department'))
    
    // Fill in department name
    const input = screen.getByPlaceholderText('e.g., Human Resources, Engineering, Sales')
    fireEvent.change(input, { target: { value: 'Engineering' } })
    
    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    await waitFor(() => {
      expect(mockOnDepartmentsChange).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Engineering'
        })
      ])
    })
  })

  it('supports Escape key for canceling', () => {
    render(
      <DepartmentConfig
        departments={[]}
        onDepartmentsChange={mockOnDepartmentsChange}
        organizationName={organizationName}
      />
    )

    // Click Add Department button
    fireEvent.click(screen.getByText('Add Department'))
    
    const input = screen.getByPlaceholderText('e.g., Human Resources, Engineering, Sales')
    fireEvent.change(input, { target: { value: 'Test Department' } })
    
    // Press Escape
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })
    
    // Form should disappear
    expect(screen.queryByLabelText('Department Name')).not.toBeInTheDocument()
    expect(mockOnDepartmentsChange).not.toHaveBeenCalled()
  })

  it('displays existing departments with access codes', () => {
    const existingDepartments: Department[] = [
      {
        id: 'hr',
        name: 'Human Resources',
        managementCode: 'TEST-MGMT-HR25',
        employeeCode: 'TEST-EMP-HR25'
      },
      {
        id: 'eng',
        name: 'Engineering',
        managementCode: 'TEST-MGMT-ENG25',
        employeeCode: 'TEST-EMP-ENG25'
      }
    ]

    render(
      <DepartmentConfig
        departments={existingDepartments}
        onDepartmentsChange={mockOnDepartmentsChange}
        organizationName={organizationName}
      />
    )

    // Check that departments are displayed
    expect(screen.getByText('Human Resources')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    
    // Check that access codes are displayed
    expect(screen.getByText('TEST-MGMT-HR25')).toBeInTheDocument()
    expect(screen.getByText('TEST-EMP-HR25')).toBeInTheDocument()
    expect(screen.getByText('TEST-MGMT-ENG25')).toBeInTheDocument()
    expect(screen.getByText('TEST-EMP-ENG25')).toBeInTheDocument()
  })

  it('allows removing departments', async () => {
    const existingDepartments: Department[] = [
      {
        id: 'hr',
        name: 'Human Resources',
        managementCode: 'TEST-MGMT-HR25',
        employeeCode: 'TEST-EMP-HR25'
      }
    ]

    render(
      <DepartmentConfig
        departments={existingDepartments}
        onDepartmentsChange={mockOnDepartmentsChange}
        organizationName={organizationName}
      />
    )

    // Find and click the remove button (X icon)
    const removeButtons = screen.getAllByRole('button')
    const removeButton = removeButtons.find(button => 
      button.querySelector('svg path[d="M6 18L18 6M6 6l12 12"]')
    )
    
    expect(removeButton).toBeInTheDocument()
    fireEvent.click(removeButton!)
    
    expect(mockOnDepartmentsChange).toHaveBeenCalledWith([])
  })

  it('supports copying access codes to clipboard', async () => {
    const existingDepartments: Department[] = [
      {
        id: 'hr',
        name: 'Human Resources',
        managementCode: 'TEST-MGMT-HR25',
        employeeCode: 'TEST-EMP-HR25'
      }
    ]

    render(
      <DepartmentConfig
        departments={existingDepartments}
        onDepartmentsChange={mockOnDepartmentsChange}
        organizationName={organizationName}
      />
    )

    // Find copy buttons by their aria-label or data-testid if we add them
    // For now, find by the clipboard icon path
    const copyButtons = screen.getAllByRole('button').filter(button => {
      const svg = button.querySelector('svg')
      const path = svg?.querySelector('path')
      return path?.getAttribute('d')?.includes('M8 16H6a2 2 0 01-2-2V6')
    })
    
    expect(copyButtons.length).toBeGreaterThan(0)
    
    // Click the first copy button
    fireEvent.click(copyButtons[0])
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
  })

  it('prevents adding departments with empty names', () => {
    render(
      <DepartmentConfig
        departments={[]}
        onDepartmentsChange={mockOnDepartmentsChange}
        organizationName={organizationName}
      />
    )

    // Click Add Department button to show form
    fireEvent.click(screen.getByRole('button', { name: 'Add Department' }))
    
    // The submit button should be disabled when input is empty
    const submitButtons = screen.getAllByRole('button', { name: 'Add Department' })
    const submitButton = submitButtons[1] // Second one is the submit button in the form
    
    expect(submitButton).toBeDisabled()
    expect(mockOnDepartmentsChange).not.toHaveBeenCalled()
  })

  it('shows helpful distribution instructions', () => {
    const existingDepartments: Department[] = [
      {
        id: 'hr',
        name: 'Human Resources',
        managementCode: 'TEST-MGMT-HR25',
        employeeCode: 'TEST-EMP-HR25'
      }
    ]

    render(
      <DepartmentConfig
        departments={existingDepartments}
        onDepartmentsChange={mockOnDepartmentsChange}
        organizationName={organizationName}
      />
    )

    expect(screen.getByText(/Share management codes with department leaders/)).toBeInTheDocument()
    expect(screen.getByText(/Each code provides role-appropriate survey access/)).toBeInTheDocument()
  })

  it('generates unique department IDs for duplicate names', async () => {
    const existingDepartments: Department[] = [
      {
        id: 'hr',
        name: 'HR',
        managementCode: 'TEST-MGMT-HR25',
        employeeCode: 'TEST-EMP-HR25'
      }
    ]

    render(
      <DepartmentConfig
        departments={existingDepartments}
        onDepartmentsChange={mockOnDepartmentsChange}
        organizationName={organizationName}
      />
    )

    // Add another department with similar name
    fireEvent.click(screen.getByText('Add Department'))
    
    const input = screen.getByPlaceholderText('e.g., Human Resources, Engineering, Sales')
    fireEvent.change(input, { target: { value: 'HR' } })
    
    // Find the submit button in the form
    const addButtons = screen.getAllByText('Add Department')
    const submitButton = addButtons.find(button => 
      button.classList.contains('bg-primary-600')
    )
    fireEvent.click(submitButton!)
    
    await waitFor(() => {
      expect(mockOnDepartmentsChange).toHaveBeenCalledWith([
        existingDepartments[0],
        expect.objectContaining({
          id: 'hr1', // Should get unique ID
          name: 'HR'
        })
      ])
    })
  })
})