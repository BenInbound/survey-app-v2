import { supabase } from './supabase'
import { OrganizationalAssessment, ParticipantResponse } from './types'

/**
 * Supabase Database Manager
 * Works alongside existing localStorage functionality
 * Provides async database operations with localStorage fallback
 */
export class SupabaseManager {
  
  /**
   * Sync assessment from localStorage to Supabase
   */
  async syncAssessmentToDatabase(assessment: OrganizationalAssessment): Promise<boolean> {
    if (!supabase) {
      console.log('Supabase not configured, skipping database sync')
      return false
    }
    
    try {
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
        department_data: assessment.departmentData,
        management_responses: assessment.managementResponses,
        employee_responses: assessment.employeeResponses,
        response_count: assessment.responseCount,
        privacy_metadata: {}
      }

      const { error } = await supabase
        .from('organizational_assessments')
        .upsert(databaseRecord)

      if (error) {
        console.error('Supabase sync error:', error)
        return false
      }

      return true
    } catch (err) {
      console.error('Database sync failed:', err)
      return false
    }
  }

  /**
   * Sync participant response from localStorage to Supabase
   */
  async syncResponseToDatabase(response: ParticipantResponse): Promise<boolean> {
    if (!supabase) {
      console.log('Supabase not configured, skipping response sync')
      return false
    }
    
    try {
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

      const { error } = await supabase
        .from('participant_responses')
        .upsert(databaseResponse, {
          onConflict: 'assessment_id,participant_id'
        })

      if (error) {
        console.error('Response sync error:', error)
        return false
      }

      return true
    } catch (err) {
      console.error('Response sync failed:', err)
      return false
    }
  }

  /**
   * Load assessment from database with localStorage fallback
   */
  async loadAssessment(id: string): Promise<OrganizationalAssessment | null> {
    if (!supabase) {
      return null
    }
    
    try {
      const { data, error } = await supabase
        .from('organizational_assessments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        throw error
      }

      return this.mapDatabaseToAssessment(data)
    } catch (err) {
      console.error('Database load failed, using localStorage fallback')
      return null
    }
  }

  /**
   * Load all assessments from database with localStorage fallback
   */
  async loadAllAssessments(): Promise<OrganizationalAssessment[]> {
    if (!supabase) {
      return []
    }
    
    try {
      const { data, error } = await supabase
        .from('organizational_assessments')
        .select('*')
        .order('created', { ascending: false })

      if (error) {
        throw error
      }

      return data.map(this.mapDatabaseToAssessment)
    } catch (err) {
      console.error('Database load failed, using localStorage fallback')
      return []
    }
  }

  /**
   * Check if database is available and working
   */
  async isDatabaseAvailable(): Promise<boolean> {
    if (!supabase) {
      return false
    }
    
    try {
      const { error } = await supabase
        .from('organizational_assessments')
        .select('id')
        .limit(1)

      return !error
    } catch {
      return false
    }
  }

  /**
   * Bulk sync all localStorage data to Supabase
   */
  async syncAllLocalStorageToDatabase(): Promise<{ assessments: number, responses: number }> {
    if (typeof window === 'undefined' || !supabase) return { assessments: 0, responses: 0 }

    let syncedAssessments = 0
    let syncedResponses = 0

    try {
      // Sync assessments
      const storedAssessments = localStorage.getItem('organizational-assessments')
      if (storedAssessments) {
        const assessments = JSON.parse(storedAssessments) as OrganizationalAssessment[]
        for (const assessment of assessments) {
          const success = await this.syncAssessmentToDatabase({
            ...assessment,
            created: new Date(assessment.created),
            lockedAt: assessment.lockedAt ? new Date(assessment.lockedAt) : undefined,
            codeExpiration: assessment.codeExpiration ? new Date(assessment.codeExpiration) : undefined,
            codeRegeneratedAt: assessment.codeRegeneratedAt ? new Date(assessment.codeRegeneratedAt) : undefined
          })
          if (success) syncedAssessments++
        }
      }

      // Sync responses
      const storedResponses = localStorage.getItem('organizational-responses')
      if (storedResponses) {
        const responses = JSON.parse(storedResponses) as ParticipantResponse[]
        for (const response of responses) {
          const success = await this.syncResponseToDatabase({
            ...response,
            startedAt: new Date(response.startedAt),
            completedAt: response.completedAt ? new Date(response.completedAt) : undefined
          })
          if (success) syncedResponses++
        }
      }

      console.log(`Synced ${syncedAssessments} assessments and ${syncedResponses} responses to database`)
      return { assessments: syncedAssessments, responses: syncedResponses }
    } catch (err) {
      console.error('Bulk sync failed:', err)
      return { assessments: syncedAssessments, responses: syncedResponses }
    }
  }

  private mapDatabaseToAssessment(data: any): OrganizationalAssessment {
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
      questionSource: data.question_source || { source: 'default' },
      departmentData: data.department_data || [],
      managementResponses: data.management_responses || {
        categoryAverages: [],
        overallAverage: 0,
        responseCount: 0
      },
      employeeResponses: data.employee_responses || {
        categoryAverages: [],
        overallAverage: 0,
        responseCount: 0
      },
      responseCount: data.response_count || { management: 0, employee: 0 }
    }
  }
}

export const supabaseManager = new SupabaseManager()