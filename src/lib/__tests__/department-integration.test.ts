import { OrganizationalAssessmentManager } from '../organizational-assessment-manager'
import { AccessController } from '../access-control'
import { Department, ParticipantResponse, OrganizationalAssessment } from '../types'

describe('Department Integration', () => {
  let manager: OrganizationalAssessmentManager
  let accessController: AccessController

  beforeEach(() => {
    manager = new OrganizationalAssessmentManager()
    accessController = new AccessController()
    // Clear any existing data
    manager.clearAllAssessments()
  })

  describe('End-to-End Department Flow', () => {
    it('creates assessment with departments and generates access codes', () => {
      const departments: Department[] = [
        {
          id: 'hr',
          name: 'Human Resources',
          managementCode: '',
          employeeCode: ''
        },
        {
          id: 'eng',
          name: 'Engineering', 
          managementCode: '',
          employeeCode: ''
        }
      ]

      const assessment = manager.createAssessment(
        'Test Organization',
        'consultant@test.com',
        { source: 'default' },
        departments
      )

      // Verify departments have generated access codes
      expect(assessment.departments).toHaveLength(2)
      expect(assessment.departments[0].managementCode).toMatch(/TESTORGA-MGMT-HR\d{4}/)
      expect(assessment.departments[0].employeeCode).toMatch(/TESTORGA-EMP-HR\d{4}/)
      expect(assessment.departments[1].managementCode).toMatch(/TESTORGA-MGMT-ENG\d{4}/)
      expect(assessment.departments[1].employeeCode).toMatch(/TESTORGA-EMP-ENG\d{4}/)
    })

    it('validates department access codes correctly', () => {
      const departments: Department[] = [
        {
          id: 'hr',
          name: 'Human Resources',
          managementCode: '',
          employeeCode: ''
        }
      ]

      const assessment = manager.createAssessment(
        'Test Org',
        'consultant@test.com',
        { source: 'default' },
        departments
      )

      const hrMgmtCode = assessment.departments[0].managementCode
      const hrEmpCode = assessment.departments[0].employeeCode

      // Test management code validation
      const mgmtValidation = manager.validateAccessCode(hrMgmtCode)
      expect(mgmtValidation.isValid).toBe(true)
      expect(mgmtValidation.role).toBe('management')
      expect(mgmtValidation.department).toBe('HR')
      expect(mgmtValidation.assessmentId).toBe(assessment.id)

      // Test employee code validation
      const empValidation = manager.validateAccessCode(hrEmpCode)
      expect(empValidation.isValid).toBe(true)
      expect(empValidation.role).toBe('employee')
      expect(empValidation.department).toBe('HR')
      expect(empValidation.assessmentId).toBe(assessment.id)
    })

    it('processes participant responses with department information', () => {
      const departments: Department[] = [
        {
          id: 'hr',
          name: 'Human Resources',
          managementCode: '',
          employeeCode: ''
        },
        {
          id: 'eng',
          name: 'Engineering',
          managementCode: '',
          employeeCode: ''
        }
      ]

      const assessment = manager.createAssessment(
        'Test Org',
        'consultant@test.com',
        { source: 'default' },
        departments
      )

      // Create mock responses from different departments
      const hrMgmtResponse: ParticipantResponse = {
        surveyId: assessment.id,
        participantId: 'hr-mgmt-1',
        department: 'hr',
        responses: [
          { questionId: 'q1', score: 8 },
          { questionId: 'q2', score: 7 }
        ],
        currentQuestionIndex: 2,
        completedAt: new Date(),
        startedAt: new Date(),
        role: 'management',
        assessmentId: assessment.id
      }

      const hrEmpResponse: ParticipantResponse = {
        surveyId: assessment.id,
        participantId: 'hr-emp-1',
        department: 'hr',
        responses: [
          { questionId: 'q1', score: 5 },
          { questionId: 'q2', score: 6 }
        ],
        currentQuestionIndex: 2,
        completedAt: new Date(),
        startedAt: new Date(),
        role: 'employee',
        assessmentId: assessment.id
      }

      const engEmpResponse: ParticipantResponse = {
        surveyId: assessment.id,
        participantId: 'eng-emp-1', 
        department: 'eng',
        responses: [
          { questionId: 'q1', score: 9 },
          { questionId: 'q2', score: 8 }
        ],
        currentQuestionIndex: 2,
        completedAt: new Date(),
        startedAt: new Date(),
        role: 'employee',
        assessmentId: assessment.id
      }

      // Add responses
      manager.addParticipantResponse(assessment.id, hrMgmtResponse)
      manager.addParticipantResponse(assessment.id, hrEmpResponse)
      manager.addParticipantResponse(assessment.id, engEmpResponse)

      // Verify department data aggregation
      const updatedAssessment = manager.getAssessment(assessment.id)
      expect(updatedAssessment).toBeTruthy()
      expect(updatedAssessment!.departmentData).toHaveLength(2)

      // Find HR department data
      const hrData = updatedAssessment!.departmentData.find(d => d.department === 'hr')
      expect(hrData).toBeTruthy()
      expect(hrData!.responseCount.management).toBe(1)
      expect(hrData!.responseCount.employee).toBe(1)
      expect(hrData!.managementResponses.overallAverage).toBe(7.5) // (8+7)/2
      expect(hrData!.employeeResponses.overallAverage).toBe(5.5) // (5+6)/2

      // Find Engineering department data  
      const engData = updatedAssessment!.departmentData.find(d => d.department === 'eng')
      expect(engData).toBeTruthy()
      expect(engData!.responseCount.management).toBe(0)
      expect(engData!.responseCount.employee).toBe(1)
      expect(engData!.employeeResponses.overallAverage).toBe(8.5) // (9+8)/2

      // Verify perception gaps are calculated for HR
      expect(hrData!.perceptionGaps).toHaveLength(1) // Should have gaps for categories with both mgmt and emp responses
      expect(hrData!.perceptionGaps[0].managementScore).toBe(7.5)
      expect(hrData!.perceptionGaps[0].employeeScore).toBe(5.5) 
      expect(hrData!.perceptionGaps[0].gap).toBe(2) // 7.5 - 5.5
      expect(hrData!.perceptionGaps[0].gapDirection).toBe('positive') // Management scores higher
      expect(hrData!.perceptionGaps[0].significance).toBe('high') // Gap > 2
    })

    it('regenerates department access codes', async () => {
      const departments: Department[] = [
        {
          id: 'hr',
          name: 'Human Resources',
          managementCode: '',
          employeeCode: ''
        }
      ]

      const assessment = manager.createAssessment(
        'Test Org',
        'consultant@test.com',
        { source: 'default' },
        departments
      )

      const originalMgmtCode = assessment.departments[0].managementCode
      const originalEmpCode = assessment.departments[0].employeeCode

      // Add small delay to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // Regenerate codes
      const updatedAssessment = manager.regenerateDepartmentAccessCodes(assessment.id)

      expect(updatedAssessment.departments[0].managementCode).not.toBe(originalMgmtCode)
      expect(updatedAssessment.departments[0].employeeCode).not.toBe(originalEmpCode)
      expect(updatedAssessment.departments[0].managementCode).toMatch(/TESTORG-MGMT-HR\d{4}/)
      expect(updatedAssessment.departments[0].employeeCode).toMatch(/TESTORG-EMP-HR\d{4}/)
    })

    it('handles mixed legacy and department access codes', () => {
      // Create assessment with departments
      const departments: Department[] = [
        {
          id: 'hr',
          name: 'Human Resources',
          managementCode: '',
          employeeCode: ''
        }
      ]

      const assessment = manager.createAssessment(
        'Test Org',
        'consultant@test.com',
        { source: 'default' },
        departments
      )

      // Test legacy access code (should still work)
      const legacyValidation = manager.validateAccessCode(assessment.accessCode)
      expect(legacyValidation.isValid).toBe(true)
      expect(legacyValidation.role).toBeUndefined() // No role for legacy codes
      expect(legacyValidation.department).toBeUndefined() // No department for legacy codes

      // Test department access code
      const deptValidation = manager.validateAccessCode(assessment.departments[0].managementCode)
      expect(deptValidation.isValid).toBe(true)
      expect(deptValidation.role).toBe('management')
      expect(deptValidation.department).toBe('HR')

      // Both should point to the same assessment
      expect(legacyValidation.assessmentId).toBe(assessment.id)
      expect(deptValidation.assessmentId).toBe(assessment.id)
    })

    it('rejects invalid department access codes', () => {
      const assessment = manager.createAssessment(
        'Test Org',
        'consultant@test.com',
        { source: 'default' },
        []
      )

      // Test completely invalid code
      const invalidValidation = manager.validateAccessCode('INVALID-CODE-FORMAT')
      expect(invalidValidation.isValid).toBe(false)

      // Test well-formed but non-existent department code
      const nonExistentValidation = manager.validateAccessCode('TESTORGA-MGMT-FAKE25')
      expect(nonExistentValidation.isValid).toBe(false)
    })

    it('handles locked assessments correctly', () => {
      const departments: Department[] = [
        {
          id: 'hr', 
          name: 'Human Resources',
          managementCode: '',
          employeeCode: ''
        }
      ]

      const assessment = manager.createAssessment(
        'Test Org',
        'consultant@test.com',
        { source: 'default' },
        departments
      )

      const hrMgmtCode = assessment.departments[0].managementCode

      // Code should be valid initially
      let validation = manager.validateAccessCode(hrMgmtCode)
      expect(validation.isValid).toBe(true)

      // Lock the assessment
      manager.updateAssessmentStatus(assessment.id, 'locked')

      // Code should now be invalid
      validation = manager.validateAccessCode(hrMgmtCode)
      expect(validation.isValid).toBe(false)
    })
  })
})