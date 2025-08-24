/**
 * @jest-environment jsdom
 */

import { OrganizationalAssessmentManager } from '../organizational-assessment-manager'
import { Department } from '../types'

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

describe('Department Addition - Full Integration', () => {
  let manager: OrganizationalAssessmentManager

  beforeEach(() => {
    localStorageMock.clear()
    manager = new OrganizationalAssessmentManager()
  })

  it('completes full consultant workflow: create assessment → add departments → validate', () => {
    // Step 1: Create assessment with initial departments (simulating consultant dashboard)
    const initialDepartments: Department[] = [
      { id: 'engineering', name: 'Engineering', managementCode: '', employeeCode: '' }
    ]
    
    const assessment = manager.createAssessment(
      'Acme Corporation',
      'consultant@example.com',
      undefined,
      initialDepartments
    )

    // Verify initial state
    expect(assessment.departments).toHaveLength(1)
    expect(assessment.departments[0].name).toBe('Engineering')
    expect(assessment.departments[0].managementCode).toBeTruthy()
    expect(assessment.departments[0].employeeCode).toBeTruthy()

    // Step 2: Add department (simulating DepartmentManager component)
    const newDepartment = manager.addDepartmentToAssessment(assessment.id, 'Sales')

    // Verify new department
    expect(newDepartment.name).toBe('Sales')
    expect(newDepartment.id).toBe('sales')
    expect(newDepartment.managementCode).toBeTruthy()
    expect(newDepartment.employeeCode).toBeTruthy()
    expect(newDepartment.managementCode).toMatch(/^ACMECORP-MGMT-SAL\d+$/)
    expect(newDepartment.employeeCode).toMatch(/^ACMECORP-EMP-SAL\d+$/)

    // Step 3: Verify assessment was updated (simulating dashboard state update)
    const updatedAssessment = manager.getAssessment(assessment.id)
    expect(updatedAssessment?.departments).toHaveLength(2)
    expect(updatedAssessment?.departments.map(d => d.name)).toContain('Sales')

    // Step 4: Add another department
    const hrDepartment = manager.addDepartmentToAssessment(assessment.id, 'Human Resources')
    expect(hrDepartment.name).toBe('Human Resources')
    expect(hrDepartment.id).toBe('human-resources')

    // Step 5: Verify final state
    const finalAssessment = manager.getAssessment(assessment.id)
    expect(finalAssessment?.departments).toHaveLength(3)
    expect(finalAssessment?.departments.map(d => d.name)).toEqual([
      'Engineering',
      'Sales', 
      'Human Resources'
    ])

    // Step 6: Verify all access codes are unique
    const allCodes = finalAssessment?.departments.flatMap(d => [d.managementCode, d.employeeCode])
    const uniqueCodes = [...new Set(allCodes)]
    expect(allCodes?.length).toBe(uniqueCodes.length) // No duplicates

    // Step 7: Test validation (duplicate prevention)
    expect(() => {
      manager.addDepartmentToAssessment(assessment.id, 'Sales')
    }).toThrow('Department "Sales" already exists in this assessment')

    // Step 8: Test locked assessment protection
    manager.lockAssessmentAndExpireCode(assessment.id)
    expect(() => {
      manager.addDepartmentToAssessment(assessment.id, 'Marketing')
    }).toThrow('Cannot add department to locked assessment')
  })

  it('handles special characters and formatting in department names', () => {
    const assessment = manager.createAssessment('Test Org', 'consultant@test.com')

    // Test various department name formats
    const testNames = [
      'IT & Technology',
      'Research & Development (R&D)',
      'Customer Service/Support',
      'Finance & Accounting',
      'Legal & Compliance'
    ]

    const expectedIds = [
      'it-technology',
      'research-development-r-d',
      'customer-service-support', 
      'finance-accounting',
      'legal-compliance'
    ]

    testNames.forEach((name, index) => {
      const department = manager.addDepartmentToAssessment(assessment.id, name)
      expect(department.name).toBe(name)
      expect(department.id).toBe(expectedIds[index])
    })

    const finalAssessment = manager.getAssessment(assessment.id)
    expect(finalAssessment?.departments).toHaveLength(5)
  })

  it('validates consultant workflow with realistic scenario', () => {
    // Simulate consultant creating assessment for a mid-size company
    const assessment = manager.createAssessment(
      'TechStart Inc',
      'guro@inbound.com',
      undefined,
      [
        { id: 'engineering', name: 'Engineering', managementCode: '', employeeCode: '' },
        { id: 'product', name: 'Product', managementCode: '', employeeCode: '' }
      ]
    )

    // Consultant realizes they need more departments
    const departments = [
      'Sales & Marketing',
      'Customer Success',
      'Operations',
      'HR & Admin'
    ]

    departments.forEach(name => {
      const dept = manager.addDepartmentToAssessment(assessment.id, name)
      expect(dept.managementCode).toMatch(/^TECHINC-MGMT-\w+\d+$/)
      expect(dept.employeeCode).toMatch(/^TECHINC-EMP-\w+\d+$/)
    })

    const finalAssessment = manager.getAssessment(assessment.id)
    expect(finalAssessment?.departments).toHaveLength(6) // 2 initial + 4 added
    
    // Verify all department names
    const departmentNames = finalAssessment?.departments.map(d => d.name).sort()
    expect(departmentNames).toEqual([
      'Customer Success',
      'Engineering',
      'HR & Admin',
      'Operations',
      'Product',
      'Sales & Marketing'
    ].sort())
  })
})