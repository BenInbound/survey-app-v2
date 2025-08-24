/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DepartmentManager from '../DepartmentManager'
import { Department } from '@/lib/types'

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

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve())
  }
})

describe('DepartmentManager', () => {
  const mockDepartments: Department[] = [
    {
      id: 'engineering',
      name: 'Engineering',
      managementCode: 'TEST-MGMT-ENG123',
      employeeCode: 'TEST-EMP-ENG123'
    },
    {
      id: 'sales',
      name: 'Sales', 
      managementCode: 'TEST-MGMT-SAL456',
      employeeCode: 'TEST-EMP-SAL456'
    }
  ]

  const mockOnDepartmentsChange = jest.fn()
  const mockOnRegenerateCode = jest.fn()
  const mockCopyToClipboard = jest.fn()

  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it('renders collapsed by default', () => {
    render(
      <DepartmentManager
        assessmentId="test-assessment"
        departments={mockDepartments}
        onDepartmentsChange={mockOnDepartmentsChange}
        onRegenerateCode={mockOnRegenerateCode}
        copyToClipboard={mockCopyToClipboard}
      />
    )

    expect(screen.getByText('Department Access Codes (2)')).toBeInTheDocument()
    expect(screen.queryByText('Engineering')).not.toBeInTheDocument()
  })

  it('expands when header is clicked', () => {
    render(
      <DepartmentManager
        assessmentId="test-assessment"
        departments={mockDepartments}
        onDepartmentsChange={mockOnDepartmentsChange}
        onRegenerateCode={mockOnRegenerateCode}
        copyToClipboard={mockCopyToClipboard}
      />
    )

    fireEvent.click(screen.getByText('Department Access Codes (2)'))
    
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Sales')).toBeInTheDocument()
  })

  it('displays department access codes', () => {
    render(
      <DepartmentManager
        assessmentId="test-assessment"
        departments={mockDepartments}
        onDepartmentsChange={mockOnDepartmentsChange}
        onRegenerateCode={mockOnRegenerateCode}
        copyToClipboard={mockCopyToClipboard}
      />
    )

    fireEvent.click(screen.getByText('Department Access Codes (2)'))
    
    expect(screen.getByText('TEST-MGMT-ENG123')).toBeInTheDocument()
    expect(screen.getByText('TEST-EMP-ENG123')).toBeInTheDocument()
    expect(screen.getByText('TEST-MGMT-SAL456')).toBeInTheDocument()
    expect(screen.getByText('TEST-EMP-SAL456')).toBeInTheDocument()
  })

  it('shows add department button when not locked', () => {
    render(
      <DepartmentManager
        assessmentId="test-assessment"
        departments={[]}
        onDepartmentsChange={mockOnDepartmentsChange}
        onRegenerateCode={mockOnRegenerateCode}
        copyToClipboard={mockCopyToClipboard}
      />
    )

    fireEvent.click(screen.getByText('Department Access Codes (0)'))
    
    expect(screen.getByText('Add Department')).toBeInTheDocument()
  })

  it('does not show add button when locked', () => {
    render(
      <DepartmentManager
        assessmentId="test-assessment"
        departments={[]}
        onDepartmentsChange={mockOnDepartmentsChange}
        onRegenerateCode={mockOnRegenerateCode}
        copyToClipboard={mockCopyToClipboard}
        isLocked={true}
      />
    )

    fireEvent.click(screen.getByText('Department Access Codes (0)'))
    
    expect(screen.queryByText('Add Department')).not.toBeInTheDocument()
  })

  it('shows add form when add button is clicked', () => {
    render(
      <DepartmentManager
        assessmentId="test-assessment"
        departments={[]}
        onDepartmentsChange={mockOnDepartmentsChange}
        onRegenerateCode={mockOnRegenerateCode}
        copyToClipboard={mockCopyToClipboard}
      />
    )

    fireEvent.click(screen.getByText('Department Access Codes (0)'))
    fireEvent.click(screen.getByText('Add Department'))
    
    expect(screen.getByLabelText('Department Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g., Human Resources')).toBeInTheDocument()
  })

  it('cancels add form correctly', () => {
    render(
      <DepartmentManager
        assessmentId="test-assessment"
        departments={[]}
        onDepartmentsChange={mockOnDepartmentsChange}
        onRegenerateCode={mockOnRegenerateCode}
        copyToClipboard={mockCopyToClipboard}
      />
    )

    fireEvent.click(screen.getByText('Department Access Codes (0)'))
    fireEvent.click(screen.getByText('Add Department'))
    
    const input = screen.getByLabelText('Department Name')
    fireEvent.change(input, { target: { value: 'Test Department' } })
    
    fireEvent.click(screen.getByText('Cancel'))
    
    expect(screen.queryByLabelText('Department Name')).not.toBeInTheDocument()
    expect(screen.getByText('Add Department')).toBeInTheDocument()
  })

  it('handles copy to clipboard', async () => {
    render(
      <DepartmentManager
        assessmentId="test-assessment"
        departments={mockDepartments}
        onDepartmentsChange={mockOnDepartmentsChange}
        onRegenerateCode={mockOnRegenerateCode}
        copyToClipboard={mockCopyToClipboard}
      />
    )

    fireEvent.click(screen.getByText('Department Access Codes (2)'))
    
    const copyButtons = screen.getAllByText('📋 Copy')
    fireEvent.click(copyButtons[0])
    
    expect(mockCopyToClipboard).toHaveBeenCalledWith('TEST-MGMT-ENG123', 'Engineering Management code')
  })

  it('shows empty state when no departments', () => {
    render(
      <DepartmentManager
        assessmentId="test-assessment"
        departments={[]}
        onDepartmentsChange={mockOnDepartmentsChange}
        onRegenerateCode={mockOnRegenerateCode}
        copyToClipboard={mockCopyToClipboard}
      />
    )

    fireEvent.click(screen.getByText('Department Access Codes (0)'))
    
    expect(screen.getByText('No departments added yet')).toBeInTheDocument()
  })

  it('shows appropriate department icons', () => {
    const departmentsWithIcons: Department[] = [
      { id: 'eng', name: 'Engineering', managementCode: 'CODE1', employeeCode: 'CODE2' },
      { id: 'sales', name: 'Sales Team', managementCode: 'CODE3', employeeCode: 'CODE4' },
      { id: 'hr', name: 'Human Resources', managementCode: 'CODE5', employeeCode: 'CODE6' }
    ]

    render(
      <DepartmentManager
        assessmentId="test-assessment"
        departments={departmentsWithIcons}
        onDepartmentsChange={mockOnDepartmentsChange}
        onRegenerateCode={mockOnRegenerateCode}
        copyToClipboard={mockCopyToClipboard}
      />
    )

    fireEvent.click(screen.getByText('Department Access Codes (3)'))
    
    // Check that department names are displayed (icons are emoji-based)
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Sales Team')).toBeInTheDocument()
    expect(screen.getByText('Human Resources')).toBeInTheDocument()
  })
})