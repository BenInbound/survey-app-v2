import { 
  OrganizationalAssessment, 
  AssessmentStatus, 
  AggregatedResponses, 
  CategoryAverage,
  ParticipantResponse,
  ParticipantRole,
  AssessmentQuestionSetup,
  Question
} from './types'
import { AccessController } from './access-control'
import { questionTemplateManager } from './question-templates'

export class OrganizationalAssessmentManager {
  private readonly STORAGE_KEY = 'organizational-assessments'
  private readonly RESPONSES_KEY = 'organizational-responses'
  private readonly accessController = new AccessController()

  createAssessment(
    organizationName: string, 
    consultantId: string, 
    questionSetup?: AssessmentQuestionSetup,
    id?: string
  ): OrganizationalAssessment {
    const questions = this.getQuestionsForSetup(questionSetup)
    
    const assessment: OrganizationalAssessment = {
      id: id || this.generateId(),
      organizationName,
      consultantId,
      status: 'collecting',
      created: new Date(),
      accessCode: this.accessController.generateAccessCode(organizationName),
      questions,
      questionSource: questionSetup || { source: 'default' },
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

    this.saveAssessment(assessment)
    return assessment
  }

  getAllAssessments(): OrganizationalAssessment[] {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return []
    
    try {
      const assessments = JSON.parse(stored) as OrganizationalAssessment[]
      return assessments.map(a => ({
        ...a,
        created: new Date(a.created),
        lockedAt: a.lockedAt ? new Date(a.lockedAt) : undefined,
        codeExpiration: a.codeExpiration ? new Date(a.codeExpiration) : undefined,
        codeRegeneratedAt: a.codeRegeneratedAt ? new Date(a.codeRegeneratedAt) : undefined
      }))
    } catch {
      return []
    }
  }

  getAssessment(id: string): OrganizationalAssessment | null {
    const assessments = this.getAllAssessments()
    return assessments.find(a => a.id === id) || null
  }

  updateAssessmentStatus(id: string, status: AssessmentStatus): void {
    const assessments = this.getAllAssessments()
    const assessment = assessments.find(a => a.id === id)
    
    if (!assessment) return
    
    assessment.status = status
    if (status === 'locked') {
      assessment.lockedAt = new Date()
      const expiredAssessment = this.accessController.expireAccessCode(assessment)
      Object.assign(assessment, expiredAssessment)
    }
    
    this.saveAllAssessments(assessments)
  }

  lockAssessmentAndExpireCode(assessmentId: string): void {
    this.updateAssessmentStatus(assessmentId, 'locked')
  }

  regenerateAccessCode(assessmentId: string): string {
    const assessment = this.getAssessment(assessmentId)
    if (!assessment) throw new Error('Assessment not found')

    const updatedAssessment = this.accessController.regenerateAccessCode(assessment)
    this.saveAssessment(updatedAssessment)
    
    return updatedAssessment.accessCode
  }

  validateAccessCode(code: string): import('./types').AccessCodeValidation {
    const assessments = this.getAllAssessments()
    return this.accessController.validateAccessCode(code, assessments)
  }

  addParticipantResponse(assessmentId: string, response: ParticipantResponse): void {
    // Store individual response
    const responses = this.getAllResponses()
    responses.push(response)
    this.saveAllResponses(responses)

    // Update aggregated data
    this.updateAggregatedData(assessmentId)
  }

  getParticipantResponses(assessmentId: string, role?: ParticipantRole): ParticipantResponse[] {
    const responses = this.getAllResponses()
    let filtered = responses.filter(r => r.assessmentId === assessmentId)
    
    if (role) {
      filtered = filtered.filter(r => r.role === role)
    }
    
    return filtered
  }

  private updateAggregatedData(assessmentId: string): void {
    const assessments = this.getAllAssessments()
    const assessment = assessments.find(a => a.id === assessmentId)
    if (!assessment) return

    const managementResponses = this.getParticipantResponses(assessmentId, 'management')
    const employeeResponses = this.getParticipantResponses(assessmentId, 'employee')

    assessment.managementResponses = this.aggregateResponses(managementResponses)
    assessment.employeeResponses = this.aggregateResponses(employeeResponses)
    assessment.responseCount = {
      management: managementResponses.length,
      employee: employeeResponses.length
    }

    this.saveAllAssessments(assessments)
  }

  private aggregateResponses(responses: ParticipantResponse[]): AggregatedResponses {
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
        // We need to get the question to find its category
        // For now, assume we have the questions available
        const questionId = answer.questionId
        const category = this.getQuestionCategory(questionId)
        
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
      average: data.sum / data.count,
      responses: data.count
    }))

    return {
      categoryAverages,
      overallAverage: totalCount > 0 ? totalSum / totalCount : 0,
      responseCount: responses.length
    }
  }

  private getQuestionCategory(questionId: string): string {
    // Import questions data to get category
    // For now, return a default mapping
    const categoryMap: Record<string, string> = {
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

  private getAllResponses(): ParticipantResponse[] {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(this.RESPONSES_KEY)
    if (!stored) return []
    
    try {
      const responses = JSON.parse(stored) as ParticipantResponse[]
      return responses.map(r => ({
        ...r,
        startedAt: new Date(r.startedAt),
        completedAt: r.completedAt ? new Date(r.completedAt) : undefined
      }))
    } catch {
      return []
    }
  }

  private saveAllResponses(responses: ParticipantResponse[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.RESPONSES_KEY, JSON.stringify(responses))
  }

  saveAssessment(assessment: OrganizationalAssessment): void {
    const assessments = this.getAllAssessments()
    const existingIndex = assessments.findIndex(a => a.id === assessment.id)
    
    if (existingIndex >= 0) {
      assessments[existingIndex] = assessment
    } else {
      assessments.push(assessment)
    }
    
    this.saveAllAssessments(assessments)
  }

  private saveAllAssessments(assessments: OrganizationalAssessment[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assessments))
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
        const sourceAssessment = this.getAssessment(questionSetup.sourceAssessmentId)
        if (!sourceAssessment) {
          throw new Error(`Source assessment not found: ${questionSetup.sourceAssessmentId}`)
        }
        return sourceAssessment.questions
        
      case 'blank':
        return []
        
      default:
        return questionTemplateManager.getDefaultTemplate().questions
    }
  }

  updateAssessmentQuestions(assessmentId: string, questions: Question[]): void {
    const assessment = this.getAssessment(assessmentId)
    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`)
    }
    
    assessment.questions = questions
    this.saveAssessment(assessment)
  }

  getAssessmentQuestions(assessmentId: string) {
    const assessment = this.getAssessment(assessmentId)
    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`)
    }
    
    return assessment.questions
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // Utility methods for development/testing
  clearAllAssessments(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.RESPONSES_KEY)
  }

  exportData(): { assessments: OrganizationalAssessment[], responses: ParticipantResponse[] } {
    return {
      assessments: this.getAllAssessments(),
      responses: this.getAllResponses()
    }
  }
}