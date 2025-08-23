import { QuestionManager } from '../question-manager'
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

// Use the actual default questions for testing
const defaultQuestions: Question[] = [
  { id: 'vision-clarity', text: 'Our organization has a clear and compelling vision for the future', category: 'Vision & Strategy', order: 1 },
  { id: 'strategy-execution', text: 'We consistently execute on our strategic priorities', category: 'Vision & Strategy', order: 2 },
  { id: 'customer-focus', text: 'We deeply understand and respond to customer needs', category: 'Market & Customer', order: 3 },
  { id: 'innovation-capability', text: 'Our organization fosters innovation and adapts quickly to change', category: 'Innovation & Agility', order: 4 },
  { id: 'leadership-effectiveness', text: 'Leadership provides clear direction and inspiration', category: 'Leadership & Culture', order: 5 },
  { id: 'team-collaboration', text: 'Teams collaborate effectively across the organization', category: 'Leadership & Culture', order: 6 },
  { id: 'operational-efficiency', text: 'Our processes and operations run smoothly and efficiently', category: 'Operations & Performance', order: 7 },
  { id: 'financial-performance', text: 'We consistently meet our financial targets and goals', category: 'Operations & Performance', order: 8 }
]

describe('QuestionManager', () => {
  let questionManager: QuestionManager
  
  beforeEach(() => {
    mockLocalStorage.clear()
    questionManager = new QuestionManager()
  })

  describe('getQuestions', () => {
    it('should return default questions when no custom questions exist', () => {
      const questions = questionManager.getQuestions()
      expect(questions).toEqual(defaultQuestions)
    })

    it('should return custom questions when they exist in localStorage', () => {
      const customQuestions: Question[] = [
        { id: 'custom-1', text: 'Custom Question 1', category: 'Custom Category', order: 1 }
      ]
      
      const state = {
        questions: customQuestions,
        isModified: true,
        lastModified: new Date()
      }
      
      mockLocalStorage.setItem('custom-questions-v1', JSON.stringify(state))
      
      const questions = questionManager.getQuestions()
      expect(questions).toEqual(customQuestions)
    })

    it('should fallback to defaults when localStorage contains invalid data', () => {
      mockLocalStorage.setItem('custom-questions-v1', 'invalid-json')
      
      const questions = questionManager.getQuestions()
      expect(questions).toEqual(defaultQuestions)
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
      const questionIds = ['strategy-execution', 'vision-clarity', 'customer-focus', 'innovation-capability', 'leadership-effectiveness', 'team-collaboration', 'operational-efficiency', 'financial-performance']
      questionManager.reorderQuestions(questionIds)
      
      const questions = questionManager.getQuestions()
      expect(questions[0].id).toBe('strategy-execution')
      expect(questions[0].order).toBe(1)
      expect(questions[1].id).toBe('vision-clarity')
      expect(questions[1].order).toBe(2)
    })

    it('should throw an error when reordering with invalid question ID', () => {
      expect(() => {
        questionManager.reorderQuestions(['vision-clarity', 'non-existent'])
      }).toThrow('Question with id non-existent not found')
    })
  })

  describe('getAvailableCategories', () => {
    it('should return unique categories sorted alphabetically', () => {
      const categories = questionManager.getAvailableCategories()
      expect(categories).toEqual(['Innovation & Agility', 'Leadership & Culture', 'Market & Customer', 'Operations & Performance', 'Vision & Strategy'])
    })

    it('should include categories from custom questions', () => {
      questionManager.addQuestion({ text: 'Test', category: 'Custom Category' })
      
      const categories = questionManager.getAvailableCategories()
      expect(categories).toEqual(['Custom Category', 'Innovation & Agility', 'Leadership & Culture', 'Market & Customer', 'Operations & Performance', 'Vision & Strategy'])
    })
  })

  describe('resetToDefaults', () => {
    it('should clear localStorage and return to default questions', () => {
      questionManager.addQuestion({ text: 'Custom', category: 'Custom' })
      expect(questionManager.isUsingDefaults()).toBe(false)
      
      questionManager.resetToDefaults()
      
      expect(questionManager.isUsingDefaults()).toBe(true)
      expect(questionManager.getQuestions()).toEqual(defaultQuestions)
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
})