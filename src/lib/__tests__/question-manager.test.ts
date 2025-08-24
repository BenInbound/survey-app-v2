import { QuestionManager } from '../question-manager'
import { OrganizationalAssessmentManager } from '../organizational-assessment-manager'
import { questionTemplateManager } from '../question-templates'
import { Question, QuestionFormData } from '../types'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Get default questions from the strategic-alignment template
const getDefaultQuestions = (): Question[] => {
  return questionTemplateManager.getDefaultTemplate().questions
}

describe('QuestionManager', () => {
  let questionManager: QuestionManager
  let assessmentManager: OrganizationalAssessmentManager
  const testAssessmentId = 'test-assessment-id'
  
  beforeEach(() => {
    mockLocalStorage.clear()
    assessmentManager = new OrganizationalAssessmentManager()
    
    // Create a test assessment for the QuestionManager to work with
    assessmentManager.createAssessment('Test Organization', 'test@consultant.com', undefined, undefined, testAssessmentId)
    
    questionManager = new QuestionManager(testAssessmentId)
  })

  describe('getQuestions', () => {
    it('should return default questions when no custom questions exist', () => {
      const questions = questionManager.getQuestions()
      expect(questions).toEqual(getDefaultQuestions())
    })

    it('should return custom questions when they exist in localStorage', () => {
      // Add a custom question using the QuestionManager API
      const addedQuestion = questionManager.addQuestion({ text: 'Custom Question 1', category: 'Custom Category' })
      
      const questions = questionManager.getQuestions()
      expect(questions).toContainEqual(addedQuestion)
      expect(questions.length).toBeGreaterThan(getDefaultQuestions().length)
    })

    it('should fallback to defaults when localStorage contains invalid data', () => {
      mockLocalStorage.setItem('custom-questions-v1', 'invalid-json')
      
      const questions = questionManager.getQuestions()
      expect(questions).toEqual(getDefaultQuestions())
    })
  })

  describe('addQuestion', () => {
    it('should add a new question with correct properties', () => {
      const questionData: QuestionFormData = {
        text: 'New Test Question',
        category: 'New Category'
      }
      
      const newQuestion = questionManager.addQuestion(questionData)
      
      expect(newQuestion.text).toBe('New Test Question')
      expect(newQuestion.category).toBe('New Category')
      expect(newQuestion.order).toBe(9) // Should be max order + 1
      expect(newQuestion.id).toBe('new-test-question')
    })

    it('should persist the new question in localStorage', () => {
      const questionData: QuestionFormData = {
        text: 'Persistent Question',
        category: 'Test Category'
      }
      
      questionManager.addQuestion(questionData)
      
      const questions = questionManager.getQuestions()
      expect(questions.length).toBe(9)
      expect(questions[8].text).toBe('Persistent Question')
    })

    it('should generate unique IDs for questions', () => {
      const questionData1: QuestionFormData = {
        text: 'Same Text',
        category: 'Category'
      }
      const questionData2: QuestionFormData = {
        text: 'Same Text',
        category: 'Category'
      }
      
      const question1 = questionManager.addQuestion(questionData1)
      const question2 = questionManager.addQuestion(questionData2)
      
      expect(question1.id).not.toBe(question2.id)
    })
  })

  describe('updateQuestion', () => {
    it('should update an existing question', () => {
      const questionData: QuestionFormData = {
        text: 'Updated Question Text',
        category: 'Updated Category'
      }
      
      const updatedQuestion = questionManager.updateQuestion('vision-clarity', questionData)
      
      expect(updatedQuestion.text).toBe('Updated Question Text')
      expect(updatedQuestion.category).toBe('Updated Category')
      expect(updatedQuestion.id).toBe('vision-clarity') // ID should remain the same
      expect(updatedQuestion.order).toBe(1) // Order should remain the same
    })

    it('should throw an error when updating non-existent question', () => {
      const questionData: QuestionFormData = {
        text: 'Test',
        category: 'Test'
      }
      
      expect(() => {
        questionManager.updateQuestion('non-existent', questionData)
      }).toThrow('Question with id non-existent not found')
    })
  })

  describe('deleteQuestion', () => {
    it('should delete an existing question', () => {
      questionManager.deleteQuestion('vision-clarity')
      
      const questions = questionManager.getQuestions()
      expect(questions.length).toBe(7)
      expect(questions[0].id).toBe('strategy-execution')
    })

    it('should throw an error when deleting non-existent question', () => {
      expect(() => {
        questionManager.deleteQuestion('non-existent')
      }).toThrow('Question with id non-existent not found')
    })

    it('should throw an error when trying to delete the last question', () => {
      // Delete all questions except one
      const questions = questionManager.getQuestions()
      for (let i = 0; i < questions.length - 1; i++) {
        questionManager.deleteQuestion(questions[i].id)
      }
      
      // Try to delete the last question
      const remainingQuestions = questionManager.getQuestions()
      expect(() => {
        questionManager.deleteQuestion(remainingQuestions[0].id)
      }).toThrow('Cannot delete the last question')
    })
  })

  describe('reorderQuestions', () => {
    it('should reorder questions correctly', () => {
      const allQuestions = questionManager.getQuestions()
      const questionIds = [allQuestions[1].id, allQuestions[0].id, ...allQuestions.slice(2).map(q => q.id)] // Swap first two questions
      
      questionManager.reorderQuestions(questionIds)
      
      const questions = questionManager.getQuestions()
      expect(questions[0].id).toBe(allQuestions[1].id) // Second question is now first
      expect(questions[0].order).toBe(1)
      expect(questions[1].id).toBe(allQuestions[0].id) // First question is now second
      expect(questions[1].order).toBe(2)
    })

    it('should throw an error when reordering with invalid question ID', () => {
      const allQuestions = questionManager.getQuestions()
      expect(() => {
        questionManager.reorderQuestions([allQuestions[0].id, 'non-existent'])
      }).toThrow('Question with id non-existent not found')
    })
  })

  describe('getAvailableCategories', () => {
    it('should return unique categories sorted alphabetically', () => {
      const categories = questionManager.getAvailableCategories()
      const expectedCategories = Array.from(new Set(getDefaultQuestions().map(q => q.category))).sort()
      expect(categories).toEqual(expectedCategories)
    })

    it('should include categories from custom questions', () => {
      questionManager.addQuestion({ text: 'Test', category: 'Custom Category' })
      
      const categories = questionManager.getAvailableCategories()
      const defaultCategories = Array.from(new Set(getDefaultQuestions().map(q => q.category)))
      const expectedCategories = ['Custom Category', ...defaultCategories].sort()
      expect(categories).toEqual(expectedCategories)
    })
  })

  describe('resetToDefaults', () => {
    it('should clear localStorage and return to default questions', () => {
      questionManager.addQuestion({ text: 'Custom', category: 'Custom' })
      expect(questionManager.isUsingDefaults()).toBe(false)
      
      questionManager.resetToDefaults()
      
      expect(questionManager.isUsingDefaults()).toBe(true)
      expect(questionManager.getQuestions()).toEqual(getDefaultQuestions())
    })
  })

  describe('isUsingDefaults', () => {
    it('should return true when using default questions', () => {
      expect(questionManager.isUsingDefaults()).toBe(true)
    })

    it('should return false when custom questions exist', () => {
      questionManager.addQuestion({ text: 'Custom', category: 'Custom' })
      expect(questionManager.isUsingDefaults()).toBe(false)
    })
  })

  describe('validation', () => {
    it('should validate questions correctly', () => {
      const validQuestions: Question[] = [
        { id: 'valid-1', text: 'Valid Question', category: 'Valid Category', order: 1 }
      ]
      
      expect(() => {
        questionManager.saveQuestions(validQuestions)
      }).not.toThrow()
    })

    it('should reject questions with missing required fields', () => {
      const invalidQuestions = [
        { id: '', text: 'Test', category: 'Test', order: 1 },
        { id: 'test', text: '', category: 'Test', order: 1 },
        { id: 'test', text: 'Test', category: '', order: 1 }
      ] as Question[]
      
      expect(() => {
        questionManager.saveQuestions(invalidQuestions)
      }).toThrow()
    })

    it('should reject questions with duplicate IDs', () => {
      const invalidQuestions: Question[] = [
        { id: 'duplicate', text: 'Question 1', category: 'Category', order: 1 },
        { id: 'duplicate', text: 'Question 2', category: 'Category', order: 2 }
      ]
      
      expect(() => {
        questionManager.saveQuestions(invalidQuestions)
      }).toThrow(/Duplicate ID/)
    })
  })

  describe('error handling', () => {
    it('should return empty categories when assessment not found', () => {
      const invalidQuestionManager = new QuestionManager('non-existent-assessment')
      const categories = invalidQuestionManager.getAvailableCategories()
      expect(categories).toEqual([])
    })

    it('should return false for isUsingDefaults when assessment not found', () => {
      const invalidQuestionManager = new QuestionManager('non-existent-assessment')
      const isUsingDefaults = invalidQuestionManager.isUsingDefaults()
      expect(isUsingDefaults).toBe(false)
    })
  })
})