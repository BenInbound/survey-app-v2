import { OrganizationalAssessmentManager } from '../organizational-assessment-manager'
import { ParticipantResponse } from '../types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value }),
    removeItem: jest.fn((key: string) => { delete store[key] }),
    clear: jest.fn(() => { store = {} })
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('OrganizationalAssessmentManager Delete Functionality', () => {
  let manager: OrganizationalAssessmentManager

  beforeEach(() => {
    manager = new OrganizationalAssessmentManager()
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  describe('deleteAssessment', () => {
    it('should delete assessment and all related responses', () => {
      // Create test assessment
      const assessment = manager.createAssessment('Test Org', 'test@example.com')
      const assessmentId = assessment.id

      // Add some mock responses
      const mockResponse: ParticipantResponse = {
        surveyId: assessmentId,
        participantId: 'test-participant',
        assessmentId,
        role: 'employee',
        department: '',
        responses: [{ questionId: 'q1', score: 8 }],
        currentQuestionIndex: 0,
        startedAt: new Date(),
        completedAt: new Date()
      }

      manager.addParticipantResponse(assessmentId, mockResponse)

      // Verify assessment and response exist
      expect(manager.getAssessment(assessmentId)).toBeTruthy()
      expect(manager.getParticipantResponses(assessmentId)).toHaveLength(1)

      // Delete assessment
      manager.deleteAssessment(assessmentId)

      // Verify assessment is deleted
      expect(manager.getAssessment(assessmentId)).toBeNull()
      
      // Verify all responses are deleted
      expect(manager.getParticipantResponses(assessmentId)).toHaveLength(0)
    })

    it('should only delete the specified assessment, not others', () => {
      // Create two assessments
      const assessment1 = manager.createAssessment('Org 1', 'test1@example.com')
      const assessment2 = manager.createAssessment('Org 2', 'test2@example.com')

      // Add responses to both
      const response1: ParticipantResponse = {
        surveyId: assessment1.id,
        participantId: 'participant1',
        assessmentId: assessment1.id,
        role: 'employee',
        department: '',
        responses: [{ questionId: 'q1', score: 7 }],
        currentQuestionIndex: 0,
        startedAt: new Date(),
        completedAt: new Date()
      }

      const response2: ParticipantResponse = {
        surveyId: assessment2.id,
        participantId: 'participant2',
        assessmentId: assessment2.id,
        role: 'management',
        department: '',
        responses: [{ questionId: 'q1', score: 9 }],
        currentQuestionIndex: 0,
        startedAt: new Date(),
        completedAt: new Date()
      }

      manager.addParticipantResponse(assessment1.id, response1)
      manager.addParticipantResponse(assessment2.id, response2)

      // Delete only the first assessment
      manager.deleteAssessment(assessment1.id)

      // Verify only assessment1 is deleted
      expect(manager.getAssessment(assessment1.id)).toBeNull()
      expect(manager.getAssessment(assessment2.id)).toBeTruthy()

      // Verify only response1 is deleted
      expect(manager.getParticipantResponses(assessment1.id)).toHaveLength(0)
      expect(manager.getParticipantResponses(assessment2.id)).toHaveLength(1)
    })

    it('should handle non-existent assessment deletion gracefully', () => {
      const initialAssessments = manager.getAllAssessments()
      
      // Attempt to delete non-existent assessment
      expect(() => {
        manager.deleteAssessment('non-existent-id')
      }).not.toThrow()

      // Verify no assessments were affected
      expect(manager.getAllAssessments()).toEqual(initialAssessments)
    })

    it('should handle window undefined case gracefully', () => {
      // Mock window as undefined (SSR case)
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      expect(() => {
        manager.deleteAssessment('test-id')
      }).not.toThrow()

      // Restore window
      global.window = originalWindow
    })
  })
})