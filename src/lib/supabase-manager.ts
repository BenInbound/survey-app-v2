import { supabase } from './supabase'
import { OrganizationalAssessment, ParticipantResponse, ParticipantRole } from './types'

/**
 * Supabase Database Manager - Primary Data Layer
 * Direct CRUD operations for assessments and responses
 */
export class SupabaseManager {
  
  /**
   * Get all organizational assessments
   */
  async getAllAssessments(): Promise<OrganizationalAssessment[]> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    try {
      const { data, error } = await supabase
        .from('organizational_assessments')
        .select('*')
        .order('created', { ascending: false })
      
      if (error) {
        console.error('Error fetching assessments:', error)
        throw new Error(`Failed to fetch assessments: ${error.message}`)
      }
      
      return (data || []).map(this.transformFromDatabase)
    } catch (error) {
      console.error('Error in getAllAssessments:', error)
      throw error
    }
  }

  /**
   * Get single assessment by ID
   */
  async getAssessment(id: string): Promise<OrganizationalAssessment | null> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    try {
      const { data, error } = await supabase
        .from('organizational_assessments')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null
        }
        console.error('Error fetching assessment:', error)
        throw new Error(`Failed to fetch assessment: ${error.message}`)
      }
      
      return this.transformFromDatabase(data)
    } catch (error) {
      console.error('Error in getAssessment:', error)
      throw error
    }
  }

  /**
   * Save assessment to database (create or update)
   */
  async saveAssessment(assessment: OrganizationalAssessment): Promise<OrganizationalAssessment> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    try {
      console.log('💾 Saving to database - ID:', assessment.id)
      console.log('💾 Department data length:', assessment.departmentData?.length || 0)
      console.log('💾 Department data sample:', assessment.departmentData?.map(d => ({
        dept: d.department,
        mgmtAvg: d.managementResponses?.overallAverage,
        empAvg: d.employeeResponses?.overallAverage
      })))
      
      const databaseRecord = {
        id: assessment.id,
        organization_name: assessment.organizationName,
        consultant_id: assessment.consultantId,
        status: assessment.status,
        created: assessment.created.toISOString(),
        locked_at: assessment.lockedAt?.toISOString() || null,
        access_code: assessment.accessCode,
        code_expiration: assessment.codeExpiration?.toISOString() || null,
        code_regenerated_at: assessment.codeRegeneratedAt?.toISOString() || null,
        departments: assessment.departments,
        questions: assessment.questions,
        question_source: assessment.questionSource,
        department_data: assessment.departmentData || [],
        management_responses: assessment.managementResponses,
        employee_responses: assessment.employeeResponses,
        response_count: assessment.responseCount || { management: 0, employee: 0 },
        privacy_metadata: {}
      }

      const { data, error } = await supabase
        .from('organizational_assessments')
        .upsert(databaseRecord)
        .select()
        .single()

      if (error) {
        console.error('Error saving assessment:', error)
        throw new Error(`Failed to save assessment: ${error.message}`)
      }

      return this.transformFromDatabase(data)
    } catch (error) {
      console.error('Error in saveAssessment:', error)
      throw error
    }
  }

  /**
   * Delete assessment from database
   */
  async deleteAssessment(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    try {
      // Delete associated responses first
      const { error: responseError } = await supabase
        .from('participant_responses')
        .delete()
        .eq('assessment_id', id)
      
      if (responseError) {
        console.error('Error deleting responses:', responseError)
        throw new Error(`Failed to delete responses: ${responseError.message}`)
      }

      // Delete assessment
      const { error } = await supabase
        .from('organizational_assessments')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting assessment:', error)
        throw new Error(`Failed to delete assessment: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in deleteAssessment:', error)
      throw error
    }
  }

  /**
   * Clear all participant responses for an assessment (admin function)
   */
  async clearParticipantResponses(assessmentId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    try {
      const { error } = await supabase
        .from('participant_responses')
        .delete()
        .eq('assessment_id', assessmentId)
        
      if (error) {
        console.error('Error clearing responses:', error)
        throw new Error(`Failed to clear responses: ${error.message}`)
      }
      
      console.log(`Cleared all participant responses for assessment: ${assessmentId}`)
    } catch (error) {
      console.error('Error in clearParticipantResponses:', error)
      throw error
    }
  }

  /**
   * Get all participant responses, optionally filtered by assessment and role
   */
  async getParticipantResponses(assessmentId?: string, role?: ParticipantRole): Promise<ParticipantResponse[]> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    try {
      let query = supabase
        .from('participant_responses')
        .select('*')
        .order('started_at', { ascending: false })
      
      if (assessmentId) {
        query = query.eq('assessment_id', assessmentId)
      }
      
      if (role) {
        query = query.eq('role', role)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching responses:', error)
        throw new Error(`Failed to fetch responses: ${error.message}`)
      }
      
      return (data || []).map(this.transformResponseFromDatabase)
    } catch (error) {
      console.error('Error in getParticipantResponses:', error)
      throw error
    }
  }

  /**
   * Add participant response to database
   */
  async addParticipantResponse(response: ParticipantResponse): Promise<ParticipantResponse> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    try {
      // First check if this participant already has a response
      const { data: existing, error: checkError } = await supabase
        .from('participant_responses')
        .select('participant_id')
        .eq('assessment_id', response.assessmentId)
        .eq('participant_id', response.participantId)
      
      // Log the check for debugging
      console.log('🔍 Checking for existing response:', {
        assessmentId: response.assessmentId,
        participantId: response.participantId,
        existingCount: existing?.length || 0,
        checkError: checkError?.message || 'no error'
      })
      
      // If there's existing data, skip the insert
      if (existing && existing.length > 0) {
        console.log('⚠️ Participant response already exists, skipping duplicate save:', response.participantId)
        return response // Return the response without saving again
      }
      
      console.log('✅ No existing response found, proceeding with insert')
      
      const databaseResponse = {
        assessment_id: response.assessmentId,
        participant_id: response.participantId,
        role: response.role,
        department: response.department,
        survey_id: response.surveyId,
        responses: response.responses,
        current_question_index: response.currentQuestionIndex,
        completed_at: response.completedAt?.toISOString() || null,
        started_at: response.startedAt.toISOString(),
        privacy_metadata: {}
      }

      const { data, error } = await supabase
        .from('participant_responses')
        .insert(databaseResponse)
        .select()
        .single()

      if (error) {
        console.error('Error saving response:', {
          error,
          participantId: response.participantId,
          assessmentId: response.assessmentId
        })
        // If it's a duplicate key error, try once more with a different ID
        if (error.code === '23505') { // PostgreSQL unique violation
          const newParticipantId = `${response.participantId}-retry-${Date.now()}`
          console.log('Duplicate key detected, retrying with new ID:', newParticipantId)
          const retryResponse = {
            ...response,
            participantId: newParticipantId
          }
          return await this.addParticipantResponse(retryResponse)
        }
        throw new Error(`Failed to save response: ${error.message}`)
      }

      return this.transformResponseFromDatabase(data)
    } catch (error) {
      console.error('Error in addParticipantResponse:', error)
      throw error
    }
  }

  /**
   * Transform database record to OrganizationalAssessment
   */
  private transformFromDatabase(data: any): OrganizationalAssessment {
    console.log('🔄 Transform from database - ID:', data.id)
    console.log('🔄 Department data length:', data.department_data?.length || 0)
    console.log('🔄 Department data raw:', data.department_data)
    
    return {
      id: data.id,
      organizationName: data.organization_name,
      consultantId: data.consultant_id,
      status: data.status,
      created: new Date(data.created),
      lockedAt: data.locked_at ? new Date(data.locked_at) : undefined,
      accessCode: data.access_code,
      codeExpiration: data.code_expiration ? new Date(data.code_expiration) : undefined,
      codeRegeneratedAt: data.code_regenerated_at ? new Date(data.code_regenerated_at) : undefined,
      departments: data.departments || [],
      questions: data.questions || [],
      questionSource: data.question_source,
      departmentData: data.department_data || [],
      managementResponses: data.management_responses,
      employeeResponses: data.employee_responses,
      responseCount: data.response_count || { management: 0, employee: 0 }
    }
  }

  /**
   * Transform database record to ParticipantResponse
   */
  private transformResponseFromDatabase(data: any): ParticipantResponse {
    return {
      surveyId: data.survey_id,
      participantId: data.participant_id,
      department: data.department,
      responses: data.responses || [],
      currentQuestionIndex: data.current_question_index,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      startedAt: new Date(data.started_at),
      role: data.role,
      assessmentId: data.assessment_id
    }
  }
}

// Export singleton instance
export const supabaseManager = new SupabaseManager()