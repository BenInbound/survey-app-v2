import { 
  OrganizationalAssessment, 
  AssessmentStatus, 
  AggregatedResponses, 
  CategoryAverage,
  ParticipantResponse,
  ParticipantRole,
  AssessmentQuestionSetup,
  Question,
  Department
} from './types'
import { AccessController } from './access-control'
import { questionTemplateManager } from './question-templates'
import { supabaseManager } from './supabase-manager'

export class OrganizationalAssessmentManager {
  private readonly accessController = new AccessController()

  async createAssessment(
    organizationName: string, 
    consultantId: string, 
    questionSetup?: AssessmentQuestionSetup,
    departments?: Department[],
    id?: string
  ): Promise<OrganizationalAssessment> {
    const questions = this.getQuestionsForSetup(questionSetup)
    
    // Generate department access codes if departments are provided
    const departmentsWithCodes = departments ? 
      this.generateDepartmentAccessCodes(organizationName, departments) : 
      []

    const assessment: OrganizationalAssessment = {
      id: id || this.generateId(),
      organizationName,
      consultantId,
      status: 'collecting',
      created: new Date(),
      accessCode: this.accessController.generateAccessCode(organizationName),
      departments: departmentsWithCodes,  // NEW: Use departments with generated codes
      questions,
      questionSource: questionSetup || { source: 'default' },
      departmentData: [], // NEW: Start with empty department data
      managementResponses: {
        categoryAverages: [],
        overallAverage: 0,
        responseCount: 0
      },
      employeeResponses: {
        categoryAverages: [],
        overallAverage: 0,
        responseCount: 0
      },
      responseCount: { management: 0, employee: 0 }
    }

    const savedAssessment = await supabaseManager.saveAssessment(assessment)
    return savedAssessment
  }

  async getAllAssessments(): Promise<OrganizationalAssessment[]> {
    try {
      return await supabaseManager.getAllAssessments()
    } catch (error) {
      console.error('Failed to fetch assessments:', error)
      return []
    }
  }

  async getAssessment(id: string): Promise<OrganizationalAssessment | null> {
    try {
      return await supabaseManager.getAssessment(id)
    } catch (error) {
      console.error('Failed to fetch assessment:', error)
      return null
    }
  }

  async saveAssessment(assessment: OrganizationalAssessment): Promise<OrganizationalAssessment> {
    // Calculate aggregated data before saving
    await this.updateAggregatedData(assessment.id)
    
    try {
      return await supabaseManager.saveAssessment(assessment)
    } catch (error) {
      console.error('Failed to save assessment:', error)
      throw error
    }
  }

  async deleteAssessment(id: string): Promise<void> {
    try {
      await supabaseManager.deleteAssessment(id)
    } catch (error) {
      console.error('Failed to delete assessment:', error)
      throw error
    }
  }

  private migrateAssessment(assessment: any): OrganizationalAssessment {
    // Ensure questions field exists for older assessments
    if (!assessment.questions) {
      const defaultQuestions = questionTemplateManager.getDefaultTemplate().questions
      assessment.questions = defaultQuestions
    }
    
    // Ensure questionSource exists
    if (!assessment.questionSource) {
      assessment.questionSource = { source: 'default' }
    }
    
    // Ensure new department fields exist (migration from legacy assessments)
    if (!assessment.departments) {
      assessment.departments = []
    }
    
    if (!assessment.departmentData) {
      assessment.departmentData = []
    }
    
    return assessment as OrganizationalAssessment
  }

  async updateAssessmentStatus(id: string, status: AssessmentStatus): Promise<void> {
    try {
      const assessment = await this.getAssessment(id)
      if (!assessment) return
      
      assessment.status = status
      if (status === 'locked') {
        assessment.lockedAt = new Date()
        const expiredAssessment = this.accessController.expireAccessCode(assessment)
        Object.assign(assessment, expiredAssessment)
      }
      
      await this.saveAssessment(assessment)
    } catch (error) {
      console.error('Failed to update assessment status:', error)
      throw error
    }
  }

  async lockAssessmentAndExpireCode(assessmentId: string): Promise<void> {
    await this.updateAssessmentStatus(assessmentId, 'locked')
  }

  async regenerateAccessCode(assessmentId: string): Promise<string> {
    try {
      const assessment = await this.getAssessment(assessmentId)
      if (!assessment) throw new Error('Assessment not found')

      const updatedAssessment = this.accessController.regenerateAccessCode(assessment)
      await this.saveAssessment(updatedAssessment)
      
      return updatedAssessment.accessCode
    } catch (error) {
      console.error('Failed to regenerate access code:', error)
      throw error
    }
  }

  async validateAccessCode(code: string): Promise<import('./types').AccessCodeValidation> {
    try {
      const assessments = await this.getAllAssessments()
      return this.accessController.validateAccessCode(code, assessments)
    } catch (error) {
      console.error('Failed to validate access code:', error)
      throw error
    }
  }

  async addParticipantResponse(assessmentId: string, response: ParticipantResponse): Promise<void> {
    console.log('📝 Adding participant response:', {
      assessmentId,
      role: response.role,
      department: response.department,
      participantId: response.participantId
    })
    
    try {
      // Save response directly to database
      await supabaseManager.addParticipantResponse(response)
      
      console.log('📊 Response saved to database')

      // Update aggregated data
      await this.updateAggregatedData(assessmentId)
    } catch (error) {
      console.error('Failed to save participant response:', error)
      throw error
    }
  }

  async getParticipantResponses(assessmentId: string, role?: ParticipantRole): Promise<ParticipantResponse[]> {
    try {
      return await supabaseManager.getParticipantResponses(assessmentId, role)
    } catch (error) {
      console.error('Failed to fetch participant responses:', error)
      return []
    }
  }

  async updateAggregatedData(assessmentId: string): Promise<void> {
    console.log('🔄 Updating aggregated data for assessment:', assessmentId)
    
    try {
      const assessment = await this.getAssessment(assessmentId)
      if (!assessment) {
        console.log('❌ Assessment not found:', assessmentId)
        return
      }

      const managementResponses = await this.getParticipantResponses(assessmentId, 'management')
      const employeeResponses = await this.getParticipantResponses(assessmentId, 'employee')

      console.log('📊 Response counts for', assessmentId, ':', {
        management: managementResponses.length,
        employee: employeeResponses.length,
        managementDepartments: managementResponses.map(r => r.department),
        employeeDepartments: employeeResponses.map(r => r.department),
        managementIds: managementResponses.map(r => r.participantId),
        employeeIds: employeeResponses.map(r => r.participantId)
      })

      // Update aggregated data
      assessment.managementResponses = this.aggregateResponses(managementResponses, assessmentId)
      assessment.employeeResponses = this.aggregateResponses(employeeResponses, assessmentId)
      assessment.responseCount = {
        management: managementResponses.length,
        employee: employeeResponses.length
      }

      console.log('✅ Updated assessment responseCount:', assessment.responseCount)

      // Update department-specific aggregated data
      assessment.departmentData = await this.aggregateDepartmentData(assessmentId)
      
      console.log('📄 Department data before saving:', assessment.departmentData?.map(d => ({
        dept: d.department,
        mgmtAvg: d.managementResponses.overallAverage,
        empAvg: d.employeeResponses.overallAverage,
        mgmtCount: d.responseCount.management,
        empCount: d.responseCount.employee
      })))

      // Save updated assessment to database
      console.log('🔄 Saving updated assessment to database...')
      const savedAssessment = await supabaseManager.saveAssessment(assessment)
      
      console.log('📄 Department data after saving:', savedAssessment.departmentData?.map(d => ({
        dept: d.department,
        mgmtAvg: d.managementResponses.overallAverage,
        empAvg: d.employeeResponses.overallAverage,
        mgmtCount: d.responseCount.management,
        empCount: d.responseCount.employee
      })))
    } catch (error) {
      console.error('Failed to update aggregated data:', error)
      throw error
    }
  }

  private aggregateResponses(responses: ParticipantResponse[], assessmentId?: string): AggregatedResponses {
    if (responses.length === 0) {
      return {
        categoryAverages: [],
        overallAverage: 0,
        responseCount: 0
      }
    }

    // Group responses by category
    const categoryData: Record<string, { sum: number, count: number }> = {}
    let totalSum = 0
    let totalCount = 0

    responses.forEach(response => {
      response.responses.forEach(answer => {
        // Skip null/skipped responses
        if (answer.score === null || answer.score === undefined) {
          return
        }
        
        // Get the question category from the assessment
        const questionId = answer.questionId
        const category = this.getQuestionCategory(questionId, assessmentId)
        
        if (!categoryData[category]) {
          categoryData[category] = { sum: 0, count: 0 }
        }
        
        categoryData[category].sum += answer.score
        categoryData[category].count += 1
        totalSum += answer.score
        totalCount += 1
      })
    })

    const categoryAverages: CategoryAverage[] = Object.entries(categoryData).map(([category, data]) => ({
      category,
      average: data.count > 0 ? data.sum / data.count : 0,
      responses: data.count
    }))

    return {
      categoryAverages,
      overallAverage: totalCount > 0 ? totalSum / totalCount : 0,
      responseCount: responses.length
    }
  }

  private getQuestionCategory(questionId: string, assessmentId?: string): string {
    // Use default mapping for backward compatibility and performance
    const categoryMap: Record<string, string> = {
      // Strategic Alignment Template (default)
      'vision-clarity': 'Vision & Strategy',
      'strategy-execution': 'Vision & Strategy',
      'leadership-alignment': 'Leadership & Culture',
      'stakeholder-buyin': 'Vision & Strategy',
      'strategic-communication': 'Leadership & Culture',
      'resource-allocation': 'Operations & Performance',
      'strategic-metrics': 'Operations & Performance',
      'strategic-agility': 'Innovation & Agility',
      
      // Legacy questions (keep for backward compatibility)
      'strategy-clarity': 'Strategic Clarity',
      'market-position': 'Market Position', 
      'competitive-advantage': 'Competitive Advantage',
      'innovation-capability': 'Innovation',
      'operational-efficiency': 'Operations',
      'talent-capabilities': 'Talent & Culture',
      'financial-performance': 'Financial Performance',
      'customer-satisfaction': 'Customer Focus'
    }
    
    return categoryMap[questionId] || 'Other'
  }



  private getQuestionsForSetup(questionSetup?: AssessmentQuestionSetup) {
    if (!questionSetup || questionSetup.source === 'default') {
      return questionTemplateManager.getDefaultTemplate().questions
    }
    
    switch (questionSetup.source) {
      case 'template':
        if (!questionSetup.templateId) {
          throw new Error('Template ID is required for template source')
        }
        const template = questionTemplateManager.getAllTemplates().find(t => t.id === questionSetup.templateId)
        if (!template) {
          throw new Error(`Template not found: ${questionSetup.templateId}`)
        }
        return template.questions
        
      case 'copy-assessment':
        if (!questionSetup.sourceAssessmentId) {
          throw new Error('Source assessment ID is required for copy-assessment source')
        }
        // This would need to be async in the future if copy-assessment is needed
        throw new Error('Copy-assessment not supported in Supabase-only mode')
        
      case 'blank':
        return []
        
      default:
        return questionTemplateManager.getDefaultTemplate().questions
    }
  }

  async updateAssessmentQuestions(assessmentId: string, questions: Question[]): Promise<void> {
    try {
      const assessment = await this.getAssessment(assessmentId)
      if (!assessment) {
        throw new Error(`Assessment not found: ${assessmentId}`)
      }
      
      assessment.questions = questions
      await this.saveAssessment(assessment)
    } catch (error) {
      console.error('Failed to update assessment questions:', error)
      throw error
    }
  }

  // NEW: Department management methods
  async updateAssessmentDepartments(assessmentId: string, departments: Department[]): Promise<void> {
    const assessment = await this.getAssessment(assessmentId)
    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`)
    }
    
    assessment.departments = departments
    await this.saveAssessment(assessment)
  }

  async getAssessmentDepartments(assessmentId: string): Promise<Department[]> {
    const assessment = await this.getAssessment(assessmentId)
    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`)
    }
    
    return assessment.departments || []
  }

  generateDepartmentAccessCodes(organizationName: string, departments: Department[]): Department[] {
    return departments.map(dept => ({
      ...dept,
      managementCode: this.accessController.generateDepartmentAccessCode(organizationName, 'management', dept.id),
      employeeCode: this.accessController.generateDepartmentAccessCode(organizationName, 'employee', dept.id)
    }))
  }

  async regenerateDepartmentAccessCodes(assessmentId: string): Promise<OrganizationalAssessment> {
    const assessment = await this.getAssessment(assessmentId)
    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`)
    }

    // Regenerate all department access codes
    assessment.departments = this.generateDepartmentAccessCodes(
      assessment.organizationName, 
      assessment.departments
    )
    
    await this.saveAssessment(assessment)
    return assessment
  }

  // NEW: Aggregate data by department
  private async aggregateDepartmentData(assessmentId: string): Promise<import('./types').AggregatedDepartmentData[]> {
    try {
      const allResponses = await this.getParticipantResponses(assessmentId)
      const assessment = await this.getAssessment(assessmentId)
      
      console.log('🏢 Aggregating department data:', {
        assessmentId,
        totalResponses: allResponses.length,
      departments: assessment?.departments?.map(d => d.id) || [],
      responsesByDept: allResponses.reduce((acc, r) => {
        acc[r.department] = (acc[r.department] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    })
    
    if (!assessment || assessment.departments.length === 0) {
      console.log('❌ No assessment or departments found')
      return []
    }

    return assessment.departments.map(dept => {
      // CRITICAL FIX: Match both full department ID and truncated access code version
      const deptMgmtResponses = allResponses.filter(r => 
        (r.department === dept.id || this.matchesDepartmentCode(r.department, dept)) && 
        r.role === 'management'
      )
      const deptEmpResponses = allResponses.filter(r => 
        (r.department === dept.id || this.matchesDepartmentCode(r.department, dept)) && 
        r.role === 'employee'
      )
      
      console.log(`🏢 Department ${dept.id} (${dept.name}):`, {
        deptId: dept.id,
        mgmtCode: dept.managementCode,
        empCode: dept.employeeCode,
        mgmtResponses: deptMgmtResponses.length,
        empResponses: deptEmpResponses.length,
        mgmtDepartments: deptMgmtResponses.map(r => `"${r.department}"`),
        empDepartments: deptEmpResponses.map(r => `"${r.department}"`)
      })
      
      const mgmtAggregated = this.aggregateResponses(deptMgmtResponses, assessmentId)
      const empAggregated = this.aggregateResponses(deptEmpResponses, assessmentId)
      
      // Calculate perception gaps
      const perceptionGaps = this.calculatePerceptionGaps(mgmtAggregated, empAggregated)
      
      return {
        department: dept.id,
        departmentName: dept.name,
        managementResponses: mgmtAggregated,
        employeeResponses: empAggregated,
        responseCount: {
          management: deptMgmtResponses.length,
          employee: deptEmpResponses.length
        },
        perceptionGaps
      }
    })
    } catch (error) {
      console.error('Failed to aggregate department data:', error)
      return []
    }
  }

  // NEW: Calculate perception gaps between management and employee responses
  private calculatePerceptionGaps(mgmtResponses: import('./types').AggregatedResponses, empResponses: import('./types').AggregatedResponses): import('./types').CategoryGap[] {
    const gaps: import('./types').CategoryGap[] = []
    
    // Create a map of employee category averages for quick lookup
    const empCategoryMap = new Map(
      empResponses.categoryAverages.map(cat => [cat.category, cat.average])
    )
    
    mgmtResponses.categoryAverages.forEach(mgmtCat => {
      const empAverage = empCategoryMap.get(mgmtCat.category) || 0
      const gap = mgmtCat.average - empAverage
      
      gaps.push({
        category: mgmtCat.category,
        managementScore: mgmtCat.average,
        employeeScore: empAverage,
        gap,
        gapDirection: gap > 0 ? 'positive' : gap < 0 ? 'negative' : 'neutral',
        significance: Math.abs(gap) >= 2 ? 'high' : Math.abs(gap) > 1 ? 'medium' : 'low'
      })
    })
    
    return gaps
  }

  // CRITICAL FIX: Match department codes from access codes to full department IDs
  private matchesDepartmentCode(responseDepartment: string, department: Department): boolean {
    // Extract department code from access codes - could be 3 or 8 characters
    const mgmtCodeMatch = department.managementCode?.match(/^[A-Z0-9]+-MGMT-([A-Z0-9]+)\d{4}$/)
    const empCodeMatch = department.employeeCode?.match(/^[A-Z0-9]+-EMP-([A-Z0-9]+)\d{4}$/)
    
    const deptCodeFromMgmt = mgmtCodeMatch?.[1]
    const deptCodeFromEmp = empCodeMatch?.[1]
    
    // UPDATED: Also check if response department matches the department ID or partial matches
    const matches = responseDepartment === deptCodeFromMgmt || 
                   responseDepartment === deptCodeFromEmp ||
                   responseDepartment === department.id ||
                   // Check if responseDepartment is a truncated version
                   (deptCodeFromMgmt && deptCodeFromMgmt.startsWith(responseDepartment)) ||
                   (deptCodeFromEmp && deptCodeFromEmp.startsWith(responseDepartment)) ||
                   // Or if department id contains response department
                   department.id.includes(responseDepartment.toLowerCase())
    
    console.log(`🔍 Matching "${responseDepartment}" against dept ${department.id}:`, {
      responseDepartment,
      departmentId: department.id,
      deptCodeFromMgmt,
      deptCodeFromEmp,
      matches
    })
    
    return matches
  }

  async getAssessmentQuestions(assessmentId: string): Promise<Question[]> {
    try {
      const assessment = await this.getAssessment(assessmentId)
      if (!assessment) {
        throw new Error(`Assessment not found: ${assessmentId}`)
      }
      
      // Return questions array if it exists, otherwise return empty array
      return assessment.questions || []
    } catch (error) {
      console.error('Failed to fetch assessment questions:', error)
      throw error
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // Add department to existing assessment
  async addDepartmentToAssessment(assessmentId: string, departmentName: string): Promise<Department> {
    const assessment = await this.getAssessment(assessmentId)
    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`)
    }

    // Prevent adding to locked assessments
    if (assessment.status === 'locked') {
      throw new Error('Cannot add department to locked assessment')
    }

    // Validate department name
    if (!departmentName || typeof departmentName !== 'string' || departmentName.trim().length === 0) {
      throw new Error('Department name is required')
    }

    const trimmedName = departmentName.trim()
    
    // Check if department already exists
    const existingDepartment = assessment.departments.find(d => 
      d.name.toLowerCase() === trimmedName.toLowerCase()
    )
    if (existingDepartment) {
      throw new Error(`Department "${trimmedName}" already exists in this assessment`)
    }

    // Create new department with generated ID
    const departmentId = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const newDepartment: Department = {
      id: departmentId,
      name: trimmedName,
      managementCode: '',
      employeeCode: ''
    }

    // Generate unique access codes
    const [departmentWithCodes] = this.generateDepartmentAccessCodes(
      assessment.organizationName,
      [newDepartment]
    )

    // Add department to assessment
    assessment.departments.push(departmentWithCodes)
    
    // Save updated assessment
    await this.saveAssessment(assessment)

    return departmentWithCodes
  }

}
