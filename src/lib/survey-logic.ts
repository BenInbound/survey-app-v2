import { Question, ParticipantSession, SurveyProgress, SliderValue, SurveyStats } from './types'
import { QuestionManager } from './question-manager'

export class SurveyManager {
  private storageKey: string
  private questionManager: QuestionManager

  constructor(assessmentId: string) {
    this.storageKey = `survey-session-${assessmentId}`
    this.questionManager = new QuestionManager(assessmentId)
  }

  getCurrentQuestion(session: ParticipantSession): Question | null {
    const questions = this.getQuestions()
    if (session.currentQuestionIndex >= questions.length) {
      return null
    }
    return questions[session.currentQuestionIndex]
  }

  saveResponse(session: ParticipantSession, score: SliderValue): ParticipantSession {
    const currentQuestion = this.getCurrentQuestion(session)
    if (!currentQuestion) {
      throw new Error('No current question available')
    }

    const updatedSession = {
      ...session,
      responses: [
        ...session.responses.filter(r => r.questionId !== currentQuestion.id),
        { questionId: currentQuestion.id, score }
      ]
    }

    this.saveSession(updatedSession)
    return updatedSession
  }

  navigateToNext(session: ParticipantSession): ParticipantSession {
    const questions = this.getQuestions()
    const nextIndex = session.currentQuestionIndex + 1
    
    const updatedSession = {
      ...session,
      currentQuestionIndex: nextIndex,
      completedAt: nextIndex >= questions.length ? new Date() : undefined
    }

    this.saveSession(updatedSession)
    return updatedSession
  }

  calculateProgress(session: ParticipantSession): SurveyProgress {
    const questions = this.getQuestions()
    const totalQuestions = questions.length
    const currentIndex = session.currentQuestionIndex
    
    return {
      currentIndex,
      totalQuestions,
      percentage: Math.round((session.responses.length / totalQuestions) * 100)
    }
  }

  initializeSurvey(surveyId: string, participantId: string, department: string): ParticipantSession {
    const session: ParticipantSession = {
      surveyId,
      participantId,
      department,
      responses: [],
      currentQuestionIndex: 0,
      startedAt: new Date()
    }

    this.saveSession(session)
    return session
  }

  getStoredSession(): ParticipantSession | null {
    if (typeof window === 'undefined') return null
    
    const stored = localStorage.getItem(this.storageKey)
    if (!stored) return null
    
    try {
      const session = JSON.parse(stored)
      return {
        ...session,
        startedAt: new Date(session.startedAt),
        completedAt: session.completedAt ? new Date(session.completedAt) : undefined
      }
    } catch {
      return null
    }
  }

  saveSession(session: ParticipantSession): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.storageKey, JSON.stringify(session))
  }

  clearSession(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.storageKey)
  }

  async getQuestions(): Promise<Question[]> {
    return await this.questionManager.getQuestions()
  }

  async isComplete(session: ParticipantSession): Promise<boolean> {
    const questions = await this.getQuestions()
    return session.responses.length === questions.length
  }

  getCurrentResponse(session: ParticipantSession): SliderValue | null {
    const currentQuestion = this.getCurrentQuestion(session)
    if (!currentQuestion) return null
    
    const response = session.responses.find(r => r.questionId === currentQuestion.id)
    return response?.score || null
  }
}

export function getAllSurveyData(): ParticipantSession[] {
  if (typeof window === 'undefined') return []
  
  const sessions: ParticipantSession[] = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('survey-session-')) {
      const stored = localStorage.getItem(key)
      if (stored) {
        try {
          const session = JSON.parse(stored)
          sessions.push({
            ...session,
            startedAt: new Date(session.startedAt),
            completedAt: session.completedAt ? new Date(session.completedAt) : undefined
          })
        } catch {
          // Skip invalid sessions
        }
      }
    }
  }
  
  return sessions
}

export function clearAllSurveyData(): void {
  if (typeof window === 'undefined') return
  
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('survey-session-')) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key))
}