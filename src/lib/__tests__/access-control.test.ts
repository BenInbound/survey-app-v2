import { AccessController } from '../access-control'
import { OrganizationalAssessment } from '../types'

describe('AccessController', () => {
  let controller: AccessController

  beforeEach(() => {
    controller = new AccessController()
  })

  describe('generateAccessCode', () => {
    it('creates unique formatted codes', () => {
      const code1 = controller.generateAccessCode('Stork Technologies')
      const code2 = controller.generateAccessCode('Demo Organization')
      
      expect(code1).toMatch(/^[A-Z0-9]+-2025-[A-Z]+$/)
      expect(code2).toMatch(/^[A-Z0-9]+-2025-[A-Z]+$/)
      expect(code1).not.toEqual(code2)
    })

    it('handles special characters in organization names', () => {
      const code = controller.generateAccessCode('Stork & Co. Ltd.')
      // Should remove special chars and take first 4 chars of each word up to 8 total
      expect(code).toMatch(/^STOR[A-Z]*-2025-[A-Z]+$/)
      expect(code.split('-')[0]).toHaveLength(8) // Should be 8 chars max
    })

    it('limits organization name length appropriately', () => {
      const code = controller.generateAccessCode('Very Long Organization Name That Should Be Truncated')
      const orgPart = code.split('-')[0]
      expect(orgPart.length).toBeLessThanOrEqual(8)
    })
  })

  describe('validateAccessCode', () => {
    const mockAssessment: OrganizationalAssessment = {
      id: 'test-id',
      organizationName: 'Test Org',
      consultantId: 'consultant@test.com',
      status: 'collecting',
      created: new Date(),
      accessCode: 'TESTORG-2025-STRATEGY',
      managementResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
      employeeResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
      responseCount: { management: 0, employee: 0 }
    }

    it('returns correct assessment for valid codes', () => {
      const result = controller.validateAccessCode('TESTORG-2025-STRATEGY', [mockAssessment])
      
      expect(result.isValid).toBe(true)
      expect(result.assessmentId).toBe('test-id')
      expect(result.organizationName).toBe('Test Org')
    })

    it('rejects invalid expired codes', () => {
      const expiredAssessment = {
        ...mockAssessment,
        codeExpiration: new Date(Date.now() - 1000) // 1 second ago
      }

      const result = controller.validateAccessCode('TESTORG-2025-STRATEGY', [expiredAssessment])
      
      expect(result.isValid).toBe(false)
      expect(result.isExpired).toBe(true)
    })

    it('rejects codes for locked assessments', () => {
      const lockedAssessment = { ...mockAssessment, status: 'locked' as const }

      const result = controller.validateAccessCode('TESTORG-2025-STRATEGY', [lockedAssessment])
      
      expect(result.isValid).toBe(false)
    })

    it('handles non-existent codes gracefully', () => {
      const result = controller.validateAccessCode('NONEXISTENT-CODE', [mockAssessment])
      
      expect(result.isValid).toBe(false)
      expect(result.assessmentId).toBe('')
    })
  })

  describe('expireAccessCode', () => {
    it('sets expiration date on assessment', () => {
      const assessment: OrganizationalAssessment = {
        id: 'test-id',
        organizationName: 'Test Org',
        consultantId: 'consultant@test.com',
        status: 'collecting',
        created: new Date(),
        accessCode: 'TEST-CODE',
        managementResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
        employeeResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
        responseCount: { management: 0, employee: 0 }
      }

      const result = controller.expireAccessCode(assessment)
      
      expect(result.codeExpiration).toBeInstanceOf(Date)
      expect(result.codeExpiration!.getTime()).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('regenerateAccessCode', () => {
    it('updates existing assessment code', () => {
      const assessment: OrganizationalAssessment = {
        id: 'test-id',
        organizationName: 'Test Organization',
        consultantId: 'consultant@test.com',
        status: 'collecting',
        created: new Date(),
        accessCode: 'OLD-CODE',
        codeExpiration: new Date(), // Has expiration
        managementResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
        employeeResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
        responseCount: { management: 0, employee: 0 }
      }

      const result = controller.regenerateAccessCode(assessment)
      
      expect(result.accessCode).not.toBe('OLD-CODE')
      expect(result.accessCode).toMatch(/^TESTORGA-2025-[A-Z]+$/)
      expect(result.codeRegeneratedAt).toBeInstanceOf(Date)
      expect(result.codeExpiration).toBeUndefined() // Expiration cleared
    })
  })
})