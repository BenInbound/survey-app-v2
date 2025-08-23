import { Question, QuestionFormData, QuestionValidationResult, QuestionManagerState } from './types'
import defaultQuestionsData from '@/data/questions.json'

export class QuestionManager {
  private readonly STORAGE_KEY = 'custom-questions-v1'
  private readonly defaultQuestions: Question[] = defaultQuestionsData as Question[]

  getQuestions(): Question[] {
    if (typeof window === 'undefined') {
      return this.defaultQuestions
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        return this.defaultQuestions
      }

      const state: QuestionManagerState = JSON.parse(stored)
      return this.validateAndFixQuestions(state.questions)
    } catch (error) {
      console.warn('Failed to load custom questions, using defaults:', error)
      return this.defaultQuestions
    }
  }

  saveQuestions(questions: Question[]): void {
    if (typeof window === 'undefined') return

    const validation = this.validateQuestions(questions)
    if (!validation.isValid) {
      throw new Error(`Invalid questions: ${validation.errors.join(', ')}`)
    }

    const state: QuestionManagerState = {
      questions: this.normalizeQuestions(questions),
      isModified: true,
      lastModified: new Date()
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state))
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
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.STORAGE_KEY)
  }

  getAvailableCategories(): string[] {
    const questions = this.getQuestions()
    return Array.from(new Set(questions.map(q => q.category))).sort()
  }

  isUsingDefaults(): boolean {
    if (typeof window === 'undefined') return true
    return !localStorage.getItem(this.STORAGE_KEY)
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

  private validateAndFixQuestions(questions: Question[]): Question[] {
    const validation = this.validateQuestions(questions)
    if (validation.isValid) {
      return questions
    }

    console.warn('Questions failed validation, using defaults:', validation.errors)
    return this.defaultQuestions
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

export const questionManager = new QuestionManager()