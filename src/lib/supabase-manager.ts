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

  /**
   * Load participant responses from database for an assessment
   */
  async loadParticipantResponses(assessmentId: string): Promise<ParticipantResponse[]> {
    if (!supabase) {
      return []
    }
    
    try {
      const { data, error } = await supabase
        .from('participant_responses')
        .select('*')
        .eq('assessment_id', assessmentId)

      if (error) {
        throw error
      }

      return data.map(this.mapDatabaseToResponse)
    } catch (err) {
      console.error('Failed to load responses from database:', err)
      return []
    }
  }

  /**
   * Clean corrupted department data by deleting and regenerating 
   * This is safer than trying to map corrupted values back to departments
   */
  async cleanCorruptedDepartmentData(assessmentId: string): Promise<{ cleaned: boolean, errors: string[] }> {
    if (!supabase) {
      return { cleaned: false, errors: ['Supabase not configured'] }
    }

    const errors: string[] = []

    try {
      // Load all responses to check for corruption
      const responses = await this.loadParticipantResponses(assessmentId)
      const corruptedResponses = responses.filter(r => 
        r.department === 'Management' || r.department === 'Employee' || r.department === 'General'
      )

      if (corruptedResponses.length === 0) {
        return { cleaned: false, errors: ['No corrupted data found'] }
      }

      console.log(`Found ${corruptedResponses.length} corrupted responses - cleaning database`)

      // Delete ALL data for this assessment (start fresh)
      const deleted = await this.deleteAssessmentData(assessmentId)
      if (!deleted) {
        return { cleaned: false, errors: ['Failed to delete corrupted data'] }
      }

      console.log(`Deleted corrupted data for assessment ${assessmentId}`)
      
      // For demo-org, we can regenerate with clean data
      if (assessmentId === 'demo-org') {
        console.log('Assessment data deleted - clean demo data will be regenerated on next access')
        return { cleaned: true, errors: [] }
      }

      return { cleaned: true, errors: ['Data cleaned - assessment will need to be recreated manually'] }
      
    } catch (err) {
      errors.push(`Clean operation failed: ${err}`)
      return { cleaned: false, errors }
    }
  }

  /**
   * Diagnose corruption issues in database
   */
  async diagnoseDatabaseIssues(assessmentId: string): Promise<{ corruption: any, suggestions: string[] }> {
    if (!supabase) {
      return { corruption: null, suggestions: ['Supabase not configured'] }
    }

    try {
      const responses = await this.loadParticipantResponses(assessmentId)
      const assessment = await this.loadAssessment(assessmentId)
      
      const corruptedResponses = responses.filter(r => 
        r.department === 'Management' || r.department === 'Employee' || r.department === 'General'
      )
      
      const validDepartments = assessment?.departments.map(d => d.id) || []
      const responseDepartments = Array.from(new Set(responses.map(r => r.department)))
      
      const suggestions = []
      if (corruptedResponses.length > 0) {
        suggestions.push(`Found ${corruptedResponses.length} corrupted responses with role-based department values`)
        suggestions.push('Recommend using cleanCorruptedDepartmentData() to delete and regenerate')
      }
      
      if (assessment && assessment.departments.length === 0) {
        suggestions.push('Assessment has no department configuration')
      }

      return {
        corruption: {
          totalResponses: responses.length,
          corruptedCount: corruptedResponses.length,
          corruptedDepartments: corruptedResponses.map(r => r.department),
          validDepartments,
          foundDepartments: responseDepartments
        },
        suggestions
      }
    } catch (err) {
      return { 
        corruption: { error: err }, 
        suggestions: [`Diagnosis failed: ${err}`] 
      }
    }
  }

  /**
   * Delete all data for an assessment from Supabase (for cleanup)
   */
  async deleteAssessmentData(assessmentId: string): Promise<boolean> {
    if (!supabase) {
      return false
    }

    try {
      // Delete responses first (foreign key constraint)
      await supabase
        .from('participant_responses')
        .delete()
        .eq('assessment_id', assessmentId)

      // Delete assessment
      await supabase
        .from('organizational_assessments')
        .delete()
        .eq('id', assessmentId)

      return true
    } catch (err) {
      console.error('Failed to delete assessment data:', err)
      return false
    }
  }

  /**
   * Fix department ID truncation issues in responses
   * This repairs data where department codes were truncated from 8 chars to 3 chars
   */
  async repairDepartmentTruncationIssues(assessmentId: string): Promise<{ repaired: boolean, fixed: number, errors: string[] }> {
    if (!supabase) {
      return { repaired: false, fixed: 0, errors: ['Supabase not configured'] }
    }

    const errors: string[] = []
    let fixedCount = 0

    try {
      // Load assessment to get correct department mappings
      const assessment = await this.loadAssessment(assessmentId)
      if (!assessment || !assessment.departments) {
        return { repaired: false, fixed: 0, errors: ['Assessment not found or has no departments'] }
      }

      // Create mapping from truncated codes to full department IDs
      const departmentMapping = new Map<string, string>()
      assessment.departments.forEach(dept => {
        const truncated = dept.id.substring(0, 3).toUpperCase()
        departmentMapping.set(truncated, dept.id)
        // Also map common corrupted values
        departmentMapping.set('SAL', 'sales')
        departmentMapping.set('MAR', 'marketing') 
        departmentMapping.set('ENG', 'engineering')
        departmentMapping.set('HR', 'hr')
        departmentMapping.set('FIN', 'finance')
      })

      // Load all responses for this assessment
      const responses = await this.loadParticipantResponses(assessmentId)
      
      for (const response of responses) {
        // Check if department ID looks truncated (3 chars or less, or is a role name)
        const needsRepair = response.department.length <= 3 || 
                           ['Management', 'Employee', 'General'].includes(response.department) ||
                           departmentMapping.has(response.department.toUpperCase())
        
        if (needsRepair) {
          let correctedDepartment = response.department
          
          // Try to map truncated code to full department
          const mapped = departmentMapping.get(response.department.toUpperCase())
          if (mapped) {
            correctedDepartment = mapped
          } else {
            // For role-based corruption, try to infer from other responses
            const otherResponses = responses.filter(r => 
              r.participantId !== response.participantId && 
              !['Management', 'Employee', 'General'].includes(r.department) &&
              r.department.length > 3
            )
            
            if (otherResponses.length > 0) {
              // Use most common department as fallback
              const deptCounts = otherResponses.reduce((acc, r) => {
                acc[r.department] = (acc[r.department] || 0) + 1
                return acc
              }, {} as Record<string, number>)
              
              const mostCommon = Object.entries(deptCounts).sort(([,a], [,b]) => b - a)[0]
              if (mostCommon) {
                correctedDepartment = mostCommon[0]
              }
            }
          }

          // Update the response in database
          if (correctedDepartment !== response.department) {
            const { error } = await supabase
              .from('participant_responses')
              .update({ department: correctedDepartment })
              .eq('assessment_id', assessmentId)
              .eq('participant_id', response.participantId)
            
            if (error) {
              errors.push(`Failed to update response ${response.participantId}: ${error.message}`)
            } else {
              console.log(`Fixed department ID: ${response.department} → ${correctedDepartment} for participant ${response.participantId}`)
              fixedCount++
            }
          }
        }
      }

      return { repaired: fixedCount > 0, fixed: fixedCount, errors }
      
    } catch (err) {
      errors.push(`Repair operation failed: ${err}`)
      return { repaired: false, fixed: fixedCount, errors }
    }
  }

  /**
   * Comprehensive data migration utility that fixes all known issues
   */
  async comprehensiveDataMigration(assessmentId: string): Promise<{ 
    success: boolean, 
    operations: { name: string, success: boolean, details: string }[],
    summary: string 
  }> {
    const operations = []
    let overallSuccess = true

    // 1. Diagnose issues first
    operations.push({ name: 'Diagnosis', success: true, details: 'Starting comprehensive migration' })
    const diagnosis = await this.diagnoseDatabaseIssues(assessmentId)
    
    if (diagnosis.corruption?.error) {
      operations.push({ 
        name: 'Diagnosis', 
        success: false, 
        details: `Failed to diagnose: ${diagnosis.corruption.error}` 
      })
      overallSuccess = false
    } else {
      operations.push({ 
        name: 'Diagnosis', 
        success: true, 
        details: `Found ${diagnosis.corruption?.corruptedCount || 0} corrupted responses` 
      })
    }

    // 2. Repair department truncation issues
    const repairResult = await this.repairDepartmentTruncationIssues(assessmentId)
    operations.push({
      name: 'Department Repair',
      success: repairResult.repaired || repairResult.errors.length === 0,
      details: `Fixed ${repairResult.fixed} responses. Errors: ${repairResult.errors.join(', ') || 'None'}`
    })
    
    if (repairResult.errors.length > 0) {
      overallSuccess = false
    }

    // 3. Clean any remaining corrupted data if repair failed
    if (!repairResult.repaired && diagnosis.corruption?.corruptedCount > 0) {
      const cleanResult = await this.cleanCorruptedDepartmentData(assessmentId)
      operations.push({
        name: 'Data Cleanup',
        success: cleanResult.cleaned,
        details: cleanResult.cleaned ? 'Cleaned corrupted data' : `Cleanup failed: ${cleanResult.errors.join(', ')}`
      })
      
      if (!cleanResult.cleaned) {
        overallSuccess = false
      }
    }

    // 4. Final verification
    const finalDiagnosis = await this.diagnoseDatabaseIssues(assessmentId)
    operations.push({
      name: 'Verification',
      success: (finalDiagnosis.corruption?.corruptedCount || 0) === 0,
      details: `Final state: ${finalDiagnosis.corruption?.corruptedCount || 0} corrupted responses remaining`
    })

    const summary = overallSuccess 
      ? `Migration completed successfully. Fixed ${repairResult.fixed} responses.`
      : `Migration completed with errors. Check operation details.`

    return { success: overallSuccess, operations, summary }
  }

  /**
   * Repair localStorage data that has department truncation issues
   */
  repairLocalStorageData(): { repaired: number, errors: string[] } {
    if (typeof window === 'undefined') {
      return { repaired: 0, errors: ['Not in browser environment'] }
    }

    const errors: string[] = []
    let repairedCount = 0

    try {
      // Repair assessment data
      const assessmentsData = localStorage.getItem('organizational-assessments')
      if (assessmentsData) {
        const assessments = JSON.parse(assessmentsData) as OrganizationalAssessment[]
        let modified = false
        
        assessments.forEach(assessment => {
          if (assessment.departments) {
            assessment.departments.forEach(dept => {
              // Fix truncated department IDs in department configs
              if (dept.id.length <= 3 && dept.name.length > 3) {
                const newId = dept.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8)
                console.log(`Fixing department ID: ${dept.id} → ${newId}`)
                dept.id = newId
                modified = true
                repairedCount++
              }
            })
          }
        })
        
        if (modified) {
          localStorage.setItem('organizational-assessments', JSON.stringify(assessments))
        }
      }

      // Repair response data
      const responsesData = localStorage.getItem('organizational-responses')
      if (responsesData) {
        const responses = JSON.parse(responsesData) as ParticipantResponse[]
        let modified = false
        
        responses.forEach(response => {
          // Fix truncated or corrupted department IDs in responses
          if (response.department.length <= 3 || ['Management', 'Employee', 'General'].includes(response.department)) {
            // Try common mappings
            const mapping: Record<string, string> = {
              'SAL': 'sales',
              'MAR': 'marketing',
              'ENG': 'engineering', 
              'HR': 'hr',
              'FIN': 'finance',
              'Management': 'sales', // Fallback
              'Employee': 'sales',   // Fallback
              'General': 'sales'     // Fallback
            }
            
            const mapped = mapping[response.department.toUpperCase()]
            if (mapped) {
              console.log(`Fixing response department: ${response.department} → ${mapped}`)
              response.department = mapped
              modified = true
              repairedCount++
            }
          }
        })
        
        if (modified) {
          localStorage.setItem('organizational-responses', JSON.stringify(responses))
        }
      }

    } catch (err) {
      errors.push(`localStorage repair failed: ${err}`)
    }

    return { repaired: repairedCount, errors }
  }

  private mapDatabaseToResponse(data: any): ParticipantResponse {
    return {
      assessmentId: data.assessment_id,
      participantId: data.participant_id,
      role: data.role,
      department: data.department,
      surveyId: data.survey_id,
      responses: data.responses || [],
      currentQuestionIndex: data.current_question_index || 0,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      startedAt: new Date(data.started_at)
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

/**
 * Quick migration utility for fixing department truncation issues
 * Can be called from admin panel or console
 */
export async function fixDepartmentTruncationIssues(assessmentId?: string) {
  console.log('🔧 Starting department truncation repair...')
  
  // Fix localStorage first
  const localRepair = supabaseManager.repairLocalStorageData()
  console.log(`📱 localStorage: Fixed ${localRepair.repaired} items. Errors: ${localRepair.errors.join(', ') || 'None'}`)
  
  if (assessmentId) {
    // Fix specific assessment in database
    const migration = await supabaseManager.comprehensiveDataMigration(assessmentId)
    console.log(`🗄️  Database migration for ${assessmentId}:`, migration.summary)
    migration.operations.forEach(op => {
      console.log(`  ${op.success ? '✅' : '❌'} ${op.name}: ${op.details}`)
    })
    return migration
  } else {
    // Fix all assessments
    console.log('🔍 Scanning all assessments for issues...')
    const allAssessments = await supabaseManager.loadAllAssessments()
    
    for (const assessment of allAssessments) {
      const migration = await supabaseManager.comprehensiveDataMigration(assessment.id)
      if (!migration.success) {
        console.log(`⚠️  Issues with ${assessment.organizationName} (${assessment.id}):`, migration.summary)
      } else {
        console.log(`✅ ${assessment.organizationName} (${assessment.id}): ${migration.summary}`)
      }
    }
  }
  
  console.log('🎉 Department truncation repair completed!')
}