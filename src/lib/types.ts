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

export type SliderValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | null

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

// Department Types
export interface Department {
  id: string                         // "HR", "ENG", "SAL", "OPS"
  name: string                       // "Human Resources", "Engineering"
  managementCode: string             // "STORK-MGMT-HR25"
  employeeCode: string               // "STORK-EMP-HR25"
  expectedParticipants?: {           // Optional: for tracking
    management: number
    employee: number
  }
}

export interface DepartmentAccessCode {
  department: string
  role: ParticipantRole
  code: string
  assessmentId: string
}

export interface AccessCodeParseResult {
  isValid: boolean
  assessmentId?: string
  role?: ParticipantRole
  department?: string
  organizationName?: string
  errors?: string[]
}

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
  
  // Access control (legacy single code - maintained for compatibility)
  accessCode: string
  codeExpiration?: Date
  codeRegeneratedAt?: Date
  
  // Department configuration (NEW)
  departments: Department[]           // Department configuration
  
  // Assessment-specific questions
  questions: Question[]
  questionSource: AssessmentQuestionSetup
  
  // Anonymous aggregated data by department (NEW)
  departmentData: AggregatedDepartmentData[]
  
  // Legacy aggregated data (kept for compatibility)
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

export interface AggregatedDepartmentData {
  department: string
  departmentName: string
  managementResponses: AggregatedResponses
  employeeResponses: AggregatedResponses
  responseCount: { management: number, employee: number }
  perceptionGaps: CategoryGap[]      // NEW: Mgmt vs Employee gaps by category
}

export interface CategoryGap {
  category: string
  managementScore: number
  employeeScore: number
  gap: number
  gapDirection: 'positive' | 'negative' | 'neutral'  // positive = mgmt higher, negative = employee higher
  significance: 'high' | 'medium' | 'low'
}

export interface DepartmentalInsights {
  highestPerformingDepartment: {
    department: string
    score: number
  }
  lowestPerformingDepartment: {
    department: string  
    score: number
  }
  categoryVariation: {
    category: string
    variation: number  // Standard deviation across departments
    departments: { department: string, score: number }[]
  }[]
  departmentGaps: {
    department: string
    averageGap: number
    criticalCategories: string[]
  }[]
}

export interface AccessCodeValidation {
  code: string
  assessmentId: string
  organizationName: string
  role?: ParticipantRole              // NEW: Role extracted from department codes (optional for legacy)
  department?: string                 // NEW: Department extracted from department codes (optional for legacy)
  isValid: boolean
  isExpired?: boolean
  expiresAt?: Date
}