export interface Question {
  id: string
  text: string
  category: string
  order: number
}

export interface SurveyResponse {
  questionId: string
  score: SliderValue
}

export interface ParticipantSession {
  surveyId: string
  participantId: string
  department: string
  responses: SurveyResponse[]
  currentQuestionIndex: number
  completedAt?: Date
  startedAt: Date
}

export interface Survey {
  id: string
  name: string
  questions: Question[]
  branding: SurveyBranding
  createdAt: Date
}

export interface SurveyBranding {
  name: string
  primaryColor: string
  logoUrl?: string
}

export interface SurveyProgress {
  currentIndex: number
  totalQuestions: number
  percentage: number
}

export interface SurveyStats {
  totalResponses: number
  completionRate: number
  averageScores: Record<string, number>
  departmentBreakdown: Record<string, number>
}

export type SliderValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface QuestionFormData {
  text: string
  category: string
}

export interface QuestionValidationResult {
  isValid: boolean
  errors: string[]
}

export interface QuestionManagerState {
  questions: Question[]
  isModified: boolean
  lastModified?: Date
}

export interface QuestionTemplate {
  id: string
  name: string
  description: string
  questions: Question[]
  strategicFocus: StrategicFocus
  createdAt: Date
  isDefault: boolean
}

export type StrategicFocus = 
  | 'strategic-alignment'
  | 'innovation-growth' 
  | 'leadership-culture'
  | 'operational-excellence'
  | 'performance-results'
  | 'digital-transformation'
  | 'custom'

export interface AssessmentQuestionSetup {
  source: 'default' | 'template' | 'copy-assessment' | 'blank'
  templateId?: string
  sourceAssessmentId?: string
}

export interface QuestionLibraryState {
  templates: QuestionTemplate[]
  lastModified: Date
}

export interface SliderProps {
  value: SliderValue | null
  onChange: (value: SliderValue) => void
  disabled?: boolean
}

export interface ProgressBarProps {
  progress: SurveyProgress
  animated?: boolean
}

// Organizational Assessment Types
export type ParticipantRole = 'management' | 'employee'
export type AssessmentStatus = 'collecting' | 'ready' | 'locked'

export interface CategoryAverage {
  category: string
  average: number
  responses: number
}

export interface AggregatedResponses {
  categoryAverages: CategoryAverage[]
  overallAverage: number
  responseCount: number
}

export interface OrganizationalAssessment {
  id: string
  organizationName: string
  consultantId: string
  status: AssessmentStatus
  created: Date
  lockedAt?: Date
  
  // Access control
  accessCode: string
  codeExpiration?: Date
  codeRegeneratedAt?: Date
  
  // Assessment-specific questions
  questions: Question[]
  questionSource: AssessmentQuestionSetup
  
  // Anonymous aggregated data only
  managementResponses: AggregatedResponses
  employeeResponses: AggregatedResponses
  responseCount: { management: number, employee: number }
}

export interface ParticipantResponse extends ParticipantSession {
  role: ParticipantRole
  assessmentId: string
}

export interface AssessmentParticipationStats {
  managementInvited: number
  managementCompleted: number
  employeeInvited: number
  employeeCompleted: number
  completionRate: {
    management: number
    employee: number
    overall: number
  }
}

export interface ComparativeAnalysis {
  gapAnalysis: {
    category: string
    managementScore: number
    employeeScore: number
    gap: number
    significance: 'high' | 'medium' | 'low'
  }[]
  overallAlignment: number
  criticalGaps: string[]
  recommendations: string[]
}

export interface AccessCodeValidation {
  code: string
  assessmentId: string
  organizationName: string
  isValid: boolean
  isExpired?: boolean
  expiresAt?: Date
}