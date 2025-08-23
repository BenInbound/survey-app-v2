/**
 * @jest-environment jsdom
 */

import { OrganizationalAssessmentManager } from '../organizational-assessment-manager'

describe('OrganizationalAssessmentManager - Access Control', () => {
  let manager: OrganizationalAssessmentManager

  beforeEach(() => {
    manager = new OrganizationalAssessmentManager()
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('createAssessment', () => {
    it('includes valid access code in new assessments', () => {
      const assessment = manager.createAssessment('Stork Technologies', 'consultant@test.com')
      
      expect(assessment.accessCode).toBeDefined()
      expect(assessment.accessCode).toMatch(/^[A-Z0-9]+-2025-[A-Z]+$/)
      expect(assessment.codeExpiration).toBeUndefined()
      expect(assessment.codeRegeneratedAt).toBeUndefined()
    })

    it('generates unique access codes for different organizations', () => {
      const assessment1 = manager.createAssessment('Stork Technologies', 'consultant@test.com')
      const assessment2 = manager.createAssessment('Demo Organization', 'consultant@test.com')
      
      expect(assessment1.accessCode).not.toEqual(assessment2.accessCode)
    })
  })

  describe('validateAccessCode', () => {
    it('validates codes for existing assessments', () => {
      const assessment = manager.createAssessment('Test Organization', 'consultant@test.com')
      
      const validation = manager.validateAccessCode(assessment.accessCode)
      
      expect(validation.isValid).toBe(true)
      expect(validation.assessmentId).toBe(assessment.id)
      expect(validation.organizationName).toBe('Test Organization')
    })

    it('rejects non-existent codes', () => {
      const validation = manager.validateAccessCode('INVALID-CODE-123')
      
      expect(validation.isValid).toBe(false)
      expect(validation.assessmentId).toBe('')
    })
  })

  describe('regenerateAccessCode', () => {
    it('updates existing assessment code and metadata', () => {
      const assessment = manager.createAssessment('Test Organization', 'consultant@test.com')
      const originalCode = assessment.accessCode
      
      const newCode = manager.regenerateAccessCode(assessment.id)
      const updatedAssessment = manager.getAssessment(assessment.id)
      
      expect(newCode).not.toBe(originalCode)
      expect(updatedAssessment?.accessCode).toBe(newCode)
      expect(updatedAssessment?.codeRegeneratedAt).toBeInstanceOf(Date)
    })

    it('throws error for non-existent assessment', () => {
      expect(() => {
        manager.regenerateAccessCode('non-existent-id')
      }).toThrow('Assessment not found')
    })
  })

  describe('lockAssessmentAndExpireCode', () => {
    it('locks assessment and expires access code', () => {
      const assessment = manager.createAssessment('Test Organization', 'consultant@test.com')
      
      manager.lockAssessmentAndExpireCode(assessment.id)
      
      const updatedAssessment = manager.getAssessment(assessment.id)
      expect(updatedAssessment?.status).toBe('locked')
      expect(updatedAssessment?.lockedAt).toBeInstanceOf(Date)
      expect(updatedAssessment?.codeExpiration).toBeInstanceOf(Date)
    })

    it('expired codes become invalid for survey access', async () => {
      const assessment = manager.createAssessment('Test Organization', 'consultant@test.com')
      
      // Initially valid
      const initialValidation = manager.validateAccessCode(assessment.accessCode)
      expect(initialValidation.isValid).toBe(true)
      
      // Lock and expire
      manager.lockAssessmentAndExpireCode(assessment.id)
      
      // Small delay to ensure expiration time has passed
      await new Promise(resolve => setTimeout(resolve, 1))
      
      // Now invalid
      const expiredValidation = manager.validateAccessCode(assessment.accessCode)
      expect(expiredValidation.isValid).toBe(false)
      
      // Check the updated assessment has expiration set
      const updatedAssessment = manager.getAssessment(assessment.id)
      expect(updatedAssessment?.codeExpiration).toBeInstanceOf(Date)
      expect(updatedAssessment?.codeExpiration!.getTime()).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('updateAssessmentStatus', () => {
    it('automatically expires code when assessment is locked', async () => {
      const assessment = manager.createAssessment('Test Organization', 'consultant@test.com')
      
      manager.updateAssessmentStatus(assessment.id, 'locked')
      
      // Small delay to ensure expiration time has passed
      await new Promise(resolve => setTimeout(resolve, 1))
      
      const validation = manager.validateAccessCode(assessment.accessCode)
      expect(validation.isValid).toBe(false)
      
      // Verify the assessment was actually expired
      const updatedAssessment = manager.getAssessment(assessment.id)
      expect(updatedAssessment?.codeExpiration).toBeInstanceOf(Date)
      expect(updatedAssessment?.status).toBe('locked')
    })

    it('does not affect code for non-locked status changes', () => {
      const assessment = manager.createAssessment('Test Organization', 'consultant@test.com')
      
      manager.updateAssessmentStatus(assessment.id, 'ready')
      
      const validation = manager.validateAccessCode(assessment.accessCode)
      expect(validation.isValid).toBe(true)
    })
  })
})