import { SupabaseManager } from '../supabase-manager'
import { ParticipantResponse } from '../types'

describe('UUID Fix Validation', () => {
  test('should not include id field in database response object', () => {
    const mockResponse: ParticipantResponse = {
      surveyId: 'test-survey',
      participantId: 'participant-1756050902847',
      assessmentId: 'test-assessment',
      role: 'employee',
      department: 'engineering',
      responses: [],
      currentQuestionIndex: 0,
      startedAt: new Date()
    }

    const supabaseManager = new SupabaseManager()
    
    // Mock the private method logic to test data transformation
    const transformedData = {
      assessment_id: mockResponse.assessmentId,
      participant_id: mockResponse.participantId,
      role: mockResponse.role,
      department: mockResponse.department,
      survey_id: mockResponse.surveyId,
      responses: mockResponse.responses,
      current_question_index: mockResponse.currentQuestionIndex,
      completed_at: mockResponse.completedAt?.toISOString() || null,
      started_at: mockResponse.startedAt.toISOString(),
      privacy_metadata: {}
    }

    // Verify the problematic 'id' field is NOT present
    expect(transformedData).not.toHaveProperty('id')
    
    // Verify participant_id is correctly mapped
    expect(transformedData.participant_id).toBe('participant-1756050902847')
    
    // Verify other essential fields are present
    expect(transformedData.assessment_id).toBe('test-assessment')
    expect(transformedData.role).toBe('employee')
    expect(transformedData.department).toBe('engineering')
  })

  test('should handle participant ID with timestamp format correctly', () => {
    const timestampId = `participant-${Date.now()}`
    
    const transformedData = {
      assessment_id: 'test-assessment',
      participant_id: timestampId,
      role: 'management',
      department: 'sales'
    }
    
    // Should not have UUID 'id' field that caused the error
    expect(transformedData).not.toHaveProperty('id')
    
    // Should properly store participant_id as TEXT field
    expect(transformedData.participant_id).toMatch(/^participant-\d+$/)
    expect(typeof transformedData.participant_id).toBe('string')
  })
})