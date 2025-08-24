import { AccessController } from '../access-control'
import { OrganizationalAssessment, Department } from '../types'

describe('AccessController - Department Features', () => {
  let controller: AccessController

  beforeEach(() => {
    controller = new AccessController()
  })

  describe('generateDepartmentAccessCode', () => {
    it('creates correctly formatted department access codes', () => {
      const mgmtCode = controller.generateDepartmentAccessCode('Stork Technologies', 'management', 'HR')
      const empCode = controller.generateDepartmentAccessCode('Stork Technologies', 'employee', 'Engineering')
      
      expect(mgmtCode).toMatch(/^[A-Z0-9]+-MGMT-[A-Z0-9]+\d{4}$/)
      expect(empCode).toMatch(/^[A-Z0-9]+-EMP-[A-Z0-9]+\d{4}$/)
      expect(mgmtCode).toContain('MGMT')
      expect(empCode).toContain('EMP')
    })

    it('limits department code length appropriately', () => {
      const code = controller.generateDepartmentAccessCode('Test Org', 'management', 'VeryLongDepartmentName')
      const parts = code.split('-')
      const deptPart = parts[2].replace(/\d{4}$/, '') // Remove timestamp suffix
      expect(deptPart.length).toBeLessThanOrEqual(4)
    })

    it('handles special characters in department names', () => {
      const code = controller.generateDepartmentAccessCode('Test Org', 'employee', 'R&D Dept.')
      // Should remove special chars and create valid format: TESTORG-EMP-RD25
      expect(code).toMatch(/^[A-Z0-9]+-EMP-[A-Z0-9]+\d{4}$/)
      expect(code).toContain('RD') // R&D should become RD
    })
  })

  describe('parseAccessCode', () => {
    it('correctly parses department-embedded codes', () => {
      const result = controller.parseAccessCode('STORK-MGMT-HR1234')
      
      expect(result.isValid).toBe(true)
      expect(result.role).toBe('management')
      expect(result.department).toBe('HR')
    })

    it('correctly parses employee department codes', () => {
      const result = controller.parseAccessCode('DEMO-EMP-ENG1234')
      
      expect(result.isValid).toBe(true)
      expect(result.role).toBe('employee')
      expect(result.department).toBe('ENG')
    })

    it('correctly parses legacy access codes', () => {
      const result = controller.parseAccessCode('STORK-2025-STRATEGY')
      
      expect(result.isValid).toBe(true)
      expect(result.role).toBeUndefined()
      expect(result.department).toBeUndefined()
    })

    it('rejects invalid access code formats', () => {
      const result = controller.parseAccessCode('INVALID-CODE-FORMAT-TOO-LONG')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid access code format')
    })

    it('handles case-insensitive parsing', () => {
      const result = controller.parseAccessCode('stork-mgmt-hr1234')
      
      expect(result.isValid).toBe(true)
      expect(result.role).toBe('management')
      expect(result.department).toBe('HR')
    })
  })

  describe('validateAccessCode with departments', () => {
    const departments: Department[] = [
      {
        id: 'hr',
        name: 'Human Resources',
        managementCode: 'STORK-MGMT-HR1234',
        employeeCode: 'STORK-EMP-HR1234'
      },
      {
        id: 'eng',
        name: 'Engineering',
        managementCode: 'STORK-MGMT-ENG1234',
        employeeCode: 'STORK-EMP-ENG1234'
      }
    ]

    const mockAssessment: OrganizationalAssessment = {
      id: 'test-id',
      organizationName: 'Stork Technologies',
      consultantId: 'consultant@test.com',
      status: 'collecting',
      created: new Date(),
      accessCode: 'STORK-2025-STRATEGY', // Legacy code
      departments,
      questions: [],
      questionSource: { source: 'default' },
      departmentData: [],
      managementResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
      employeeResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
      responseCount: { management: 0, employee: 0 }
    }

    it('validates department management codes correctly', () => {
      const result = controller.validateAccessCode('STORK-MGMT-HR1234', [mockAssessment])
      
      expect(result.isValid).toBe(true)
      expect(result.assessmentId).toBe('test-id')
      expect(result.role).toBe('management')
      expect(result.department).toBe('HR')
    })

    it('validates department employee codes correctly', () => {
      const result = controller.validateAccessCode('STORK-EMP-ENG1234', [mockAssessment])
      
      expect(result.isValid).toBe(true)
      expect(result.assessmentId).toBe('test-id')
      expect(result.role).toBe('employee')
      expect(result.department).toBe('ENG')
    })

    it('validates legacy codes correctly', () => {
      const result = controller.validateAccessCode('STORK-2025-STRATEGY', [mockAssessment])
      
      expect(result.isValid).toBe(true)
      expect(result.assessmentId).toBe('test-id')
      expect(result.role).toBeUndefined()
      expect(result.department).toBeUndefined()
    })

    it('rejects non-existent department codes', () => {
      const result = controller.validateAccessCode('STORK-MGMT-SALES1234', [mockAssessment])
      
      expect(result.isValid).toBe(false)
      expect(result.assessmentId).toBe('')
    })

    it('rejects codes for locked assessments', () => {
      const lockedAssessment = { ...mockAssessment, status: 'locked' as const }
      const result = controller.validateAccessCode('STORK-MGMT-HR1234', [lockedAssessment])
      
      expect(result.isValid).toBe(false)
    })
  })
})