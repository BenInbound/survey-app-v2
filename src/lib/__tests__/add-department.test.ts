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

describe('OrganizationalAssessmentManager - Add Department', () => {
  let manager: OrganizationalAssessmentManager

  beforeEach(() => {
    localStorageMock.clear()
    manager = new OrganizationalAssessmentManager()
  })

  describe('addDepartmentToAssessment', () => {
    it('should add department to existing assessment', () => {
      // Create assessment with initial departments
      const initialDepartments: Department[] = [
        { id: 'engineering', name: 'Engineering', managementCode: '', employeeCode: '' },
        { id: 'sales', name: 'Sales', managementCode: '', employeeCode: '' }
      ]
      
      const assessment = manager.createAssessment(
        'Test Organization',
        'consultant@test.com',
        undefined,
        initialDepartments
      )

      // Add new department
      const newDepartment = manager.addDepartmentToAssessment(assessment.id, 'Marketing')

      // Verify department was added
      expect(newDepartment).toBeDefined()
      expect(newDepartment.name).toBe('Marketing')
      expect(newDepartment.id).toBe('marketing')
      expect(newDepartment.managementCode).toBeTruthy()
      expect(newDepartment.employeeCode).toBeTruthy()
      expect(newDepartment.managementCode).not.toBe(newDepartment.employeeCode)

      // Verify assessment was updated
      const updatedAssessment = manager.getAssessment(assessment.id)
      expect(updatedAssessment?.departments).toHaveLength(3)
      expect(updatedAssessment?.departments.some(d => d.name === 'Marketing')).toBe(true)
    })

    it('should generate unique access codes', () => {
      const assessment = manager.createAssessment(
        'Test Organization',
        'consultant@test.com',
        undefined,
        [{ id: 'existing', name: 'Existing', managementCode: '', employeeCode: '' }]
      )

      const newDept = manager.addDepartmentToAssessment(assessment.id, 'New Department')
      
      expect(newDept.managementCode).toMatch(/^TESTORGA-MGMT-NEW\d+$/)
      expect(newDept.employeeCode).toMatch(/^TESTORGA-EMP-NEW\d+$/)
      expect(newDept.managementCode).not.toBe(newDept.employeeCode)
    })

    it('should prevent duplicate department names (case insensitive)', () => {
      const departments: Department[] = [
        { id: 'engineering', name: 'Engineering', managementCode: '', employeeCode: '' }
      ]
      
      const assessment = manager.createAssessment(
        'Test Organization',
        'consultant@test.com',
        undefined,
        departments
      )

      // Try to add duplicate (different case)
      expect(() => {
        manager.addDepartmentToAssessment(assessment.id, 'ENGINEERING')
      }).toThrow('Department "ENGINEERING" already exists in this assessment')

      // Try to add duplicate (exact case)
      expect(() => {
        manager.addDepartmentToAssessment(assessment.id, 'Engineering')
      }).toThrow('Department "Engineering" already exists in this assessment')
    })

    it('should prevent adding to locked assessments', () => {
      const assessment = manager.createAssessment(
        'Test Organization',
        'consultant@test.com'
      )

      // Lock the assessment
      manager.lockAssessmentAndExpireCode(assessment.id)

      // Try to add department
      expect(() => {
        manager.addDepartmentToAssessment(assessment.id, 'New Department')
      }).toThrow('Cannot add department to locked assessment')
    })

    it('should validate department name', () => {
      const assessment = manager.createAssessment(
        'Test Organization',
        'consultant@test.com'
      )

      // Empty string
      expect(() => {
        manager.addDepartmentToAssessment(assessment.id, '')
      }).toThrow('Department name is required')

      // Whitespace only
      expect(() => {
        manager.addDepartmentToAssessment(assessment.id, '   ')
      }).toThrow('Department name is required')

      // Null
      expect(() => {
        manager.addDepartmentToAssessment(assessment.id, null as any)
      }).toThrow('Department name is required')

      // Undefined
      expect(() => {
        manager.addDepartmentToAssessment(assessment.id, undefined as any)
      }).toThrow('Department name is required')
    })

    it('should handle non-existent assessment', () => {
      expect(() => {
        manager.addDepartmentToAssessment('non-existent', 'Department')
      }).toThrow('Assessment not found: non-existent')
    })

    it('should create valid department ID from name', () => {
      const assessment = manager.createAssessment(
        'Test Organization',
        'consultant@test.com'
      )

      // Test special characters and spaces
      const dept1 = manager.addDepartmentToAssessment(assessment.id, 'Human Resources & Benefits')
      expect(dept1.id).toBe('human-resources-benefits')

      const dept2 = manager.addDepartmentToAssessment(assessment.id, 'IT/Technology Services')
      expect(dept2.id).toBe('it-technology-services')

      const dept3 = manager.addDepartmentToAssessment(assessment.id, 'Research & Development (R&D)')
      expect(dept3.id).toBe('research-development-r-d')
    })

    it('should trim whitespace from department name', () => {
      const assessment = manager.createAssessment(
        'Test Organization',
        'consultant@test.com'
      )

      const department = manager.addDepartmentToAssessment(assessment.id, '  Marketing  ')
      
      expect(department.name).toBe('Marketing')
      expect(department.id).toBe('marketing')
    })

    it('should work with assessments in collecting and ready status', () => {
      const assessment = manager.createAssessment(
        'Test Organization',
        'consultant@test.com'
      )

      // Should work with 'collecting' status
      expect(assessment.status).toBe('collecting')
      const dept1 = manager.addDepartmentToAssessment(assessment.id, 'Department 1')
      expect(dept1).toBeDefined()

      // Change to 'ready' status and should still work
      const updatedAssessment = manager.getAssessment(assessment.id)!
      updatedAssessment.status = 'ready'
      manager.saveAssessment(updatedAssessment)

      const dept2 = manager.addDepartmentToAssessment(assessment.id, 'Department 2')
      expect(dept2).toBeDefined()
    })
  })
})