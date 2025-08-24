import { Question, QuestionFormData, QuestionValidationResult } from './types'
import { OrganizationalAssessmentManager } from './organizational-assessment-manager'

export class QuestionManager {
  private readonly assessmentId: string
  private readonly assessmentManager = new OrganizationalAssessmentManager()

  constructor(assessmentId: string) {
    this.assessmentId = assessmentId
  }

  getQuestions(): Question[] {
    try {
      const questions = this.assessmentManager.getAssessmentQuestions(this.assessmentId)
      // Ensure we always return an array
      return Array.isArray(questions) ? questions : []
    } catch (error) {
      console.error('Failed to load assessment questions:', error)
      throw error
    }
  }

  // NEW: Async version that loads from database first
  async getQuestionsAsync(): Promise<Question[]> {
    try {
      const questions = await this.assessmentManager.getAssessmentQuestionsWithDatabase(this.assessmentId)
      // Ensure we always return an array
      return Array.isArray(questions) ? questions : []
    } catch (error) {
      console.error('Failed to load assessment questions from database:', error)
      throw error
    }
  }

  saveQuestions(questions: Question[]): void {
    const validation = this.validateQuestions(questions)
    if (!validation.isValid) {
      throw new Error(`Invalid questions: ${validation.errors.join(', ')}`)
    }

    const normalizedQuestions = this.normalizeQuestions(questions)
    this.assessmentManager.updateAssessmentQuestions(this.assessmentId, normalizedQuestions)
  }

  // NEW: Async version that saves to database
  async saveQuestionsAsync(questions: Question[]): Promise<void> {
    const validation = this.validateQuestions(questions)
    if (!validation.isValid) {
      throw new Error(`Invalid questions: ${validation.errors.join(', ')}`)
    }

    const normalizedQuestions = this.normalizeQuestions(questions)
    await this.assessmentManager.updateAssessmentQuestionsWithDatabase(this.assessmentId, normalizedQuestions)
  }

  addQuestion(questionData: QuestionFormData): Question {
    const questions = this.getQuestions()
    const newQuestion: Question = {
      id: this.generateQuestionId(questionData.text),
      text: questionData.text.trim(),
      category: questionData.category.trim(),
      order: Math.max(...questions.map(q => q.order), 0) + 1
    }

    const updatedQuestions = [...questions, newQuestion]
    this.saveQuestions(updatedQuestions)
    return newQuestion
  }

  updateQuestion(questionId: string, questionData: QuestionFormData): Question {
    const questions = this.getQuestions()
    const questionIndex = questions.findIndex(q => q.id === questionId)
    
    if (questionIndex === -1) {
      throw new Error(`Question with id ${questionId} not found`)
    }

    const updatedQuestion: Question = {
      ...questions[questionIndex],
      text: questionData.text.trim(),
      category: questionData.category.trim()
    }

    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex] = updatedQuestion
    this.saveQuestions(updatedQuestions)
    return updatedQuestion
  }

  deleteQuestion(questionId: string): void {
    const questions = this.getQuestions()
    const filteredQuestions = questions.filter(q => q.id !== questionId)
    
    if (filteredQuestions.length === questions.length) {
      throw new Error(`Question with id ${questionId} not found`)
    }

    if (filteredQuestions.length === 0) {
      throw new Error('Cannot delete the last question')
    }

    this.saveQuestions(filteredQuestions)
  }

  reorderQuestions(questionIds: string[]): void {
    const questions = this.getQuestions()
    const reorderedQuestions = questionIds.map((id, index) => {
      const question = questions.find(q => q.id === id)
      if (!question) {
        throw new Error(`Question with id ${id} not found`)
      }
      return { ...question, order: index + 1 }
    })

    this.saveQuestions(reorderedQuestions)
  }

  resetToDefaults(): void {
    const { questionTemplateManager } = require('./question-templates')
    const defaultQuestions = questionTemplateManager.getDefaultTemplate().questions
    this.saveQuestions(defaultQuestions)
  }

  getAvailableCategories(): string[] {
    try {
      const questions = this.getQuestions()
      return Array.from(new Set(questions.map(q => q.category))).sort()
    } catch (error) {
      console.error('Failed to load categories:', error)
      return []
    }
  }

  isUsingDefaults(): boolean {
    try {
      const { questionTemplateManager } = require('./question-templates')
      const defaultQuestions = questionTemplateManager.getDefaultTemplate().questions
      const currentQuestions = this.getQuestions()
      
      if (currentQuestions.length !== defaultQuestions.length) return false
      
      return currentQuestions.every((current, index) => {
        const defaultQ = defaultQuestions[index]
        return current.id === defaultQ.id && 
               current.text === defaultQ.text && 
               current.category === defaultQ.category
      })
    } catch (error) {
      console.error('Failed to check if using defaults:', error)
      return false
    }
  }

  private validateQuestions(questions: Question[]): QuestionValidationResult {
    const errors: string[] = []

    if (!Array.isArray(questions)) {
      errors.push('Questions must be an array')
      return { isValid: false, errors }
    }

    if (questions.length === 0) {
      errors.push('At least one question is required')
      return { isValid: false, errors }
    }

    const ids = new Set<string>()
    questions.forEach((question, index) => {
      if (!question.id || typeof question.id !== 'string') {
        errors.push(`Question ${index + 1}: ID is required`)
      } else if (ids.has(question.id)) {
        errors.push(`Question ${index + 1}: Duplicate ID "${question.id}"`)
      } else {
        ids.add(question.id)
      }

      if (!question.text || typeof question.text !== 'string' || !question.text.trim()) {
        errors.push(`Question ${index + 1}: Text is required`)
      }

      if (!question.category || typeof question.category !== 'string' || !question.category.trim()) {
        errors.push(`Question ${index + 1}: Category is required`)
      }

      if (typeof question.order !== 'number' || question.order < 1) {
        errors.push(`Question ${index + 1}: Order must be a positive number`)
      }
    })

    return { isValid: errors.length === 0, errors }
  }


  private normalizeQuestions(questions: Question[]): Question[] {
    return questions
      .map((q, index) => ({
        ...q,
        id: q.id || this.generateQuestionId(q.text),
        order: index + 1
      }))
      .sort((a, b) => a.order - b.order)
  }

  private generateQuestionId(text: string): string {
    const baseId = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
      .replace(/-+$/, '')
      || 'question'
    
    // Check if ID already exists
    const existingQuestions = this.getQuestions()
    const existingIds = new Set(existingQuestions.map(q => q.id))
    
    let finalId = baseId
    let counter = 1
    
    while (existingIds.has(finalId)) {
      finalId = `${baseId}-${counter}`
      counter++
    }
    
    return finalId
  }
}

// QuestionManager now requires an assessmentId parameter
// Usage: const questionManager = new QuestionManager(assessmentId)