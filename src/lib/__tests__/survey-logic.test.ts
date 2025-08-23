import { SurveyManager, getAllSurveyData, clearAllSurveyData } from '../survey-logic'
import { ParticipantSession } from '../types'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (index: number) => Object.keys(store)[index] || null
  }
})()

Object.defineProperty(global, 'localStorage', { value: mockLocalStorage })

describe('SurveyManager', () => {
  let manager: SurveyManager
  let session: ParticipantSession

  beforeEach(() => {
    mockLocalStorage.clear()
    manager = new SurveyManager('test-survey')
    session = manager.initializeSurvey('test-survey', 'user-123', 'Engineering')
  })

  describe('initializeSurvey', () => {
    test('creates new survey session with correct data', () => {
      expect(session.surveyId).toBe('test-survey')
      expect(session.participantId).toBe('user-123')
      expect(session.department).toBe('Engineering')
      expect(session.responses).toEqual([])
      expect(session.currentQuestionIndex).toBe(0)
      expect(session.startedAt).toBeInstanceOf(Date)
    })

    test('saves session to localStorage', () => {
      const stored = manager.getStoredSession()
      expect(stored).toBeTruthy()
      expect(stored?.surveyId).toBe('test-survey')
    })
  })

  describe('getCurrentQuestion', () => {
    test('returns first question initially', () => {
      const question = manager.getCurrentQuestion(session)
      expect(question).toBeTruthy()
      expect(question?.id).toBe('vision-clarity')
      expect(question?.order).toBe(1)
    })

    test('returns null when survey is complete', () => {
      const completedSession = { ...session, currentQuestionIndex: 100 }
      const question = manager.getCurrentQuestion(completedSession)
      expect(question).toBeNull()
    })
  })

  describe('saveResponse', () => {
    test('saves response and updates session', () => {
      const updatedSession = manager.saveResponse(session, 8)
      expect(updatedSession.responses).toHaveLength(1)
      expect(updatedSession.responses[0]).toEqual({
        questionId: 'vision-clarity',
        score: 8
      })
    })

    test('overwrites existing response for same question', () => {
      let updatedSession = manager.saveResponse(session, 5)
      updatedSession = manager.saveResponse(updatedSession, 9)
      
      expect(updatedSession.responses).toHaveLength(1)
      expect(updatedSession.responses[0].score).toBe(9)
    })

    test('persists response to localStorage', () => {
      manager.saveResponse(session, 7)
      const stored = manager.getStoredSession()
      expect(stored?.responses).toHaveLength(1)
      expect(stored?.responses[0].score).toBe(7)
    })
  })

  describe('navigateToNext', () => {
    test('advances to next question', () => {
      const updatedSession = manager.navigateToNext(session)
      expect(updatedSession.currentQuestionIndex).toBe(1)
    })

    test('marks survey complete when reaching end', () => {
      const nearEndSession = { ...session, currentQuestionIndex: 7 }
      const completedSession = manager.navigateToNext(nearEndSession)
      expect(completedSession.completedAt).toBeInstanceOf(Date)
    })

    test('persists navigation state to localStorage', () => {
      manager.navigateToNext(session)
      const stored = manager.getStoredSession()
      expect(stored?.currentQuestionIndex).toBe(1)
    })
  })

  describe('calculateProgress', () => {
    test('calculates correct percentage with no responses', () => {
      const progress = manager.calculateProgress(session)
      expect(progress.percentage).toBe(0)
      expect(progress.currentIndex).toBe(0)
      expect(progress.totalQuestions).toBe(8)
    })

    test('calculates correct percentage with responses', () => {
      const sessionWithResponses = {
        ...session,
        responses: [
          { questionId: 'q1', score: 5 as const },
          { questionId: 'q2', score: 7 as const }
        ]
      }
      const progress = manager.calculateProgress(sessionWithResponses)
      expect(progress.percentage).toBe(25) // 2/8 = 25%
    })
  })

  describe('isComplete', () => {
    test('returns false for incomplete survey', () => {
      expect(manager.isComplete(session)).toBe(false)
    })

    test('returns true when all questions answered', () => {
      const completeSession = {
        ...session,
        responses: Array.from({ length: 8 }, (_, i) => ({
          questionId: `q${i}`,
          score: 5 as const
        }))
      }
      expect(manager.isComplete(completeSession)).toBe(true)
    })
  })

  describe('getCurrentResponse', () => {
    test('returns null when no response exists', () => {
      const response = manager.getCurrentResponse(session)
      expect(response).toBeNull()
    })

    test('returns existing response for current question', () => {
      const updatedSession = manager.saveResponse(session, 6)
      const response = manager.getCurrentResponse(updatedSession)
      expect(response).toBe(6)
    })
  })
})

describe('Global survey functions', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  describe('getAllSurveyData', () => {
    test('returns empty array when no surveys exist', () => {
      const data = getAllSurveyData()
      expect(data).toEqual([])
    })

    test('retrieves all survey sessions', () => {
      const manager1 = new SurveyManager('survey1')
      const manager2 = new SurveyManager('survey2')
      
      manager1.initializeSurvey('survey1', 'user1', 'Sales')
      manager2.initializeSurvey('survey2', 'user2', 'Marketing')
      
      const data = getAllSurveyData()
      expect(data).toHaveLength(2)
    })
  })

  describe('clearAllSurveyData', () => {
    test('removes all survey data from localStorage', () => {
      const manager = new SurveyManager('test')
      manager.initializeSurvey('test', 'user', 'IT')
      
      expect(getAllSurveyData()).toHaveLength(1)
      
      clearAllSurveyData()
      
      expect(getAllSurveyData()).toHaveLength(0)
    })
  })
})