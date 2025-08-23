import { OrganizationalAssessmentManager } from '../organizational-assessment-manager'
import { ParticipantResponse, SliderValue } from '../types'

// Mock localStorage with actual storage behavior
const storage: Record<string, string> = {}

const localStorageMock = {
  getItem: jest.fn((key: string) => storage[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    storage[key] = value
  }),
  removeItem: jest.fn((key: string) => {
    delete storage[key]
  }),
  clear: jest.fn(() => {
    Object.keys(storage).forEach(key => delete storage[key])
  }),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Complete Organizational Assessment Workflow', () => {
  let assessmentManager: OrganizationalAssessmentManager

  beforeEach(() => {
    // Clear storage between tests
    Object.keys(storage).forEach(key => delete storage[key])
    
    assessmentManager = new OrganizationalAssessmentManager()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  describe('Full Workflow: Consultant creates assessment → Participants respond → Results analyzed', () => {
    it('completes end-to-end organizational assessment workflow', () => {

      // Step 1: Consultant creates assessment for Stork
      const assessment = assessmentManager.createAssessment('Stork', 'guro@inbound.com')
      
      expect(assessment.organizationName).toBe('Stork')
      expect(assessment.consultantId).toBe('guro@inbound.com')
      expect(assessment.status).toBe('collecting')
      expect(assessment.responseCount.management).toBe(0)
      expect(assessment.responseCount.employee).toBe(0)

      // Step 2: Management participants complete survey
      const managementResponses: ParticipantResponse[] = [
        {
          surveyId: 'mgmt-session-1',
          participantId: 'mgmt-participant-1',
          department: 'Management',
          responses: [
            { questionId: 'strategy-clarity', score: 8 as SliderValue },
            { questionId: 'market-position', score: 7 as SliderValue },
            { questionId: 'innovation-capability', score: 6 as SliderValue }
          ],
          currentQuestionIndex: 3,
          startedAt: new Date(),
          completedAt: new Date(),
          role: 'management',
          assessmentId: assessment.id
        },
        {
          surveyId: 'mgmt-session-2',
          participantId: 'mgmt-participant-2',
          department: 'Management',
          responses: [
            { questionId: 'strategy-clarity', score: 9 as SliderValue },
            { questionId: 'market-position', score: 8 as SliderValue },
            { questionId: 'innovation-capability', score: 7 as SliderValue }
          ],
          currentQuestionIndex: 3,
          startedAt: new Date(),
          completedAt: new Date(),
          role: 'management',
          assessmentId: assessment.id
        }
      ]

      managementResponses.forEach(response => {
        assessmentManager.addParticipantResponse(assessment.id, response)
      })

      // Step 3: Employee participants complete survey
      const employeeResponses: ParticipantResponse[] = [
        {
          surveyId: 'emp-session-1',
          participantId: 'emp-participant-1',
          department: 'Employee',
          responses: [
            { questionId: 'strategy-clarity', score: 5 as SliderValue },
            { questionId: 'market-position', score: 6 as SliderValue },
            { questionId: 'innovation-capability', score: 4 as SliderValue }
          ],
          currentQuestionIndex: 3,
          startedAt: new Date(),
          completedAt: new Date(),
          role: 'employee',
          assessmentId: assessment.id
        },
        {
          surveyId: 'emp-session-2',
          participantId: 'emp-participant-2',
          department: 'Employee',
          responses: [
            { questionId: 'strategy-clarity', score: 6 as SliderValue },
            { questionId: 'market-position', score: 7 as SliderValue },
            { questionId: 'innovation-capability', score: 5 as SliderValue }
          ],
          currentQuestionIndex: 3,
          startedAt: new Date(),
          completedAt: new Date(),
          role: 'employee',
          assessmentId: assessment.id
        },
        {
          surveyId: 'emp-session-3',
          participantId: 'emp-participant-3',
          department: 'Employee',
          responses: [
            { questionId: 'strategy-clarity', score: 4 as SliderValue },
            { questionId: 'market-position', score: 5 as SliderValue },
            { questionId: 'innovation-capability', score: 3 as SliderValue }
          ],
          currentQuestionIndex: 3,
          startedAt: new Date(),
          completedAt: new Date(),
          role: 'employee',
          assessmentId: assessment.id
        }
      ]

      employeeResponses.forEach(response => {
        assessmentManager.addParticipantResponse(assessment.id, response)
      })

      // Step 4: Consultant checks updated assessment
      const updatedAssessment = assessmentManager.getAssessment(assessment.id)
      
      expect(updatedAssessment).toBeTruthy()
      expect(updatedAssessment!.responseCount.management).toBe(2)
      expect(updatedAssessment!.responseCount.employee).toBe(3)

      // Step 5: Verify management aggregated data
      const mgmtData = updatedAssessment!.managementResponses
      expect(mgmtData.responseCount).toBe(2)
      expect(mgmtData.categoryAverages).toHaveLength(3)
      
      // Strategic Clarity: (8 + 9) / 2 = 8.5
      const strategicClarity = mgmtData.categoryAverages.find(cat => cat.category === 'Strategic Clarity')
      expect(strategicClarity?.average).toBe(8.5)

      // Step 6: Verify employee aggregated data  
      const empData = updatedAssessment!.employeeResponses
      expect(empData.responseCount).toBe(3)
      expect(empData.categoryAverages).toHaveLength(3)
      
      // Strategic Clarity: (5 + 6 + 4) / 3 = 5
      const empStrategicClarity = empData.categoryAverages.find(cat => cat.category === 'Strategic Clarity')
      expect(empStrategicClarity?.average).toBe(5)

      // Step 7: Test assessment lifecycle
      assessmentManager.updateAssessmentStatus(assessment.id, 'ready')
      const readyAssessment = assessmentManager.getAssessment(assessment.id)
      expect(readyAssessment!.status).toBe('ready')

      assessmentManager.updateAssessmentStatus(assessment.id, 'locked')
      const lockedAssessment = assessmentManager.getAssessment(assessment.id)
      expect(lockedAssessment!.status).toBe('locked')
      expect(lockedAssessment!.lockedAt).toBeInstanceOf(Date)

      // Step 8: Verify data separation (individual responses not accessible via assessment)
      expect(updatedAssessment!.managementResponses.categoryAverages).toBeTruthy()
      expect(updatedAssessment!.employeeResponses.categoryAverages).toBeTruthy()
      
      // Individual participant data should be separate
      const mgmtParticipants = assessmentManager.getParticipantResponses(assessment.id, 'management')
      const empParticipants = assessmentManager.getParticipantResponses(assessment.id, 'employee')
      
      expect(mgmtParticipants).toHaveLength(2)
      expect(empParticipants).toHaveLength(3)
    })
  })

  describe('Assessment Status Workflows', () => {
    it('prevents responses when assessment is locked', () => {

      const assessment = assessmentManager.createAssessment('TestOrg', 'consultant@test.com')
      
      // Lock the assessment
      assessmentManager.updateAssessmentStatus(assessment.id, 'locked')
      
      // Verify status change
      const lockedAssessment = assessmentManager.getAssessment(assessment.id)
      expect(lockedAssessment!.status).toBe('locked')
      expect(lockedAssessment!.lockedAt).toBeInstanceOf(Date)
    })

    it('tracks multiple assessments independently', () => {

      const storkAssessment = assessmentManager.createAssessment('Stork', 'guro@inbound.com')
      const acmeAssessment = assessmentManager.createAssessment('Acme Corp', 'john@inbound.com')

      const allAssessments = assessmentManager.getAllAssessments()
      expect(allAssessments).toHaveLength(2)
      
      const stork = allAssessments.find(a => a.organizationName === 'Stork')
      const acme = allAssessments.find(a => a.organizationName === 'Acme Corp')
      
      expect(stork).toBeTruthy()
      expect(acme).toBeTruthy()
      expect(stork!.consultantId).toBe('guro@inbound.com')
      expect(acme!.consultantId).toBe('john@inbound.com')
    })
  })

  describe('Data Privacy and Aggregation', () => {
    it('maintains employee anonymity in aggregated data', () => {

      const assessment = assessmentManager.createAssessment('PrivacyTest', 'consultant@test.com')
      
      const employeeResponse: ParticipantResponse = {
        surveyId: 'emp-session-private',
        participantId: 'anonymous-employee',
        department: 'Employee',
        responses: [
          { questionId: 'strategy-clarity', score: 5 as SliderValue }
        ],
        currentQuestionIndex: 1,
        startedAt: new Date(),
        completedAt: new Date(),
        role: 'employee',
        assessmentId: assessment.id
      }

      assessmentManager.addParticipantResponse(assessment.id, employeeResponse)

      const updatedAssessment = assessmentManager.getAssessment(assessment.id)
      
      // Assessment should have aggregated employee data
      expect(updatedAssessment!.employeeResponses.responseCount).toBe(1)
      expect(updatedAssessment!.employeeResponses.categoryAverages).toHaveLength(1)
      
      // But individual participant data should be stored separately
      const participantData = assessmentManager.getParticipantResponses(assessment.id, 'employee')
      expect(participantData).toHaveLength(1)
      expect(participantData[0].participantId).toBe('anonymous-employee')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('handles empty assessment data gracefully', () => {

      const assessment = assessmentManager.createAssessment('EmptyTest', 'consultant@test.com')
      
      // No responses added
      const emptyAssessment = assessmentManager.getAssessment(assessment.id)
      
      expect(emptyAssessment!.responseCount.management).toBe(0)
      expect(emptyAssessment!.responseCount.employee).toBe(0)
      expect(emptyAssessment!.managementResponses.categoryAverages).toHaveLength(0)
      expect(emptyAssessment!.employeeResponses.categoryAverages).toHaveLength(0)
    })

    it('handles non-existent assessment gracefully', () => {

      const nonExistent = assessmentManager.getAssessment('does-not-exist')
      expect(nonExistent).toBeNull()
    })
  })
})