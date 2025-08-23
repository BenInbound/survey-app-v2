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

export interface SliderProps {
  value: SliderValue | null
  onChange: (value: SliderValue) => void
  disabled?: boolean
}

export interface ProgressBarProps {
  progress: SurveyProgress
  animated?: boolean
}