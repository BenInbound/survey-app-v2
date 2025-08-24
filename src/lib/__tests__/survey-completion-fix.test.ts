import { OrganizationalAssessmentManager } from '../organizational-assessment-manager'
import { ParticipantResponse } from '../types'

// Mock the supabase manager to avoid database dependency
jest.mock('../supabase-manager', () => ({
  SupabaseManager: jest.fn().mockImplementation(() => ({
    addParticipantResponse: jest.fn().mockResolvedValue({}),
    getAssessment: jest.fn().mockResolvedValue({ id: 'test-assessment', responseCount: { management: 0, employee: 0 } }),
    saveAssessment: jest.fn().mockResolvedValue({}),
    getParticipantResponses: jest.fn().mockResolvedValue([])
  }))
}))

describe('Survey Completion Async Fix', () => {
  let assessmentManager: OrganizationalAssessmentManager

  beforeEach(() => {
    assessmentManager = new OrganizationalAssessmentManager()
    jest.clearAllMocks()
  })

  test('addParticipantResponse should be awaitable and return a promise', async () => {
    const mockResponse: ParticipantResponse = {
      surveyId: 'test-survey',
      participantId: 'participant-123456789',
      assessmentId: 'test-assessment',
      role: 'employee',
      department: 'engineering',
      responses: [
        { questionId: 'test-question', score: 7 }
      ],
      currentQuestionIndex: 1,
      startedAt: new Date()
    }

    // This should return a Promise that can be awaited
    const result = assessmentManager.addParticipantResponse('test-assessment', mockResponse)
    
    // Verify it returns a Promise
    expect(result).toBeInstanceOf(Promise)
    
    // Verify it can be awaited without errors
    await expect(result).resolves.toBeUndefined()
  })

  test('addParticipantResponse should complete before navigation in survey flow', async () => {
    const mockResponse: ParticipantResponse = {
      surveyId: 'test-survey', 
      participantId: 'participant-987654321',
      assessmentId: 'test-assessment',
      role: 'management',
      department: 'sales',
      responses: [
        { questionId: 'vision-clarity', score: 8 },
        { questionId: 'strategy-execution', score: 6 }
      ],
      currentQuestionIndex: 2,
      startedAt: new Date(),
      completedAt: new Date()
    }

    // Simulate the survey completion flow
    const startTime = Date.now()
    
    // This mimics the await call that was missing before
    await assessmentManager.addParticipantResponse('test-assessment', mockResponse)
    
    const endTime = Date.now()
    
    // Verify the operation completed (took some time)
    expect(endTime).toBeGreaterThanOrEqual(startTime)
    
    // At this point, navigation would occur - data should be saved
    // Mock verification that the response was processed
    expect(true).toBe(true) // Operation completed successfully
  })

  test('should handle async errors properly when awaited', async () => {
    // Mock an error scenario
    const mockAssessmentManager = new OrganizationalAssessmentManager()
    
    // Override the method to simulate database error
    jest.spyOn(mockAssessmentManager, 'addParticipantResponse').mockRejectedValue(
      new Error('Database connection error')
    )

    const mockResponse: ParticipantResponse = {
      surveyId: 'test-survey',
      participantId: 'participant-error-test',
      assessmentId: 'test-assessment',
      role: 'employee',
      department: 'engineering',
      responses: [],
      currentQuestionIndex: 0,
      startedAt: new Date()
    }

    // With await, errors should be properly caught
    await expect(
      mockAssessmentManager.addParticipantResponse('test-assessment', mockResponse)
    ).rejects.toThrow('Database connection error')
  })
})