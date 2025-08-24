'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Question, QuestionFormData } from '@/lib/types'
import { QuestionManager } from '@/lib/question-manager'

interface QuestionEditorProps {
  assessmentId: string
  onQuestionsChange?: () => void
}

export default function QuestionEditor({ assessmentId, onQuestionsChange }: QuestionEditorProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [editingCategory, setEditingCategory] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState<QuestionFormData>({ text: '', category: '' })
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const questionManager = useMemo(() => new QuestionManager(assessmentId), [assessmentId])

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true)
      // Try async loading from database first
      const currentQuestions = await questionManager.getQuestionsAsync()
      setQuestions(currentQuestions || [])
      setAvailableCategories(await questionManager.getAvailableCategories())
      onQuestionsChange?.()
    } catch (error) {
      console.error('Failed to load questions from database, trying localStorage:', error)
      // Load questions from Supabase
      try {
        const currentQuestions = await questionManager.getQuestions()
        setQuestions(currentQuestions || [])
        setAvailableCategories(await questionManager.getAvailableCategories())
        onQuestionsChange?.()
      } catch (fallbackError) {
        console.error('Failed to load questions:', fallbackError)
        setQuestions([])
        setAvailableCategories([])
        alert(`Error loading questions for assessment ${assessmentId}: ${(fallbackError as Error).message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [questionManager, onQuestionsChange, assessmentId])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  const startEditing = (question: Question) => {
    setEditingId(question.id)
    setEditingText(question.text)
    setEditingCategory(question.category)
  }

  const saveEdit = () => {
    if (!editingId || !editingText.trim() || !editingCategory.trim()) return

    try {
      questionManager.updateQuestion(editingId, {
        text: editingText,
        category: editingCategory
      })
      setEditingId(null)
      setEditingText('')
      setEditingCategory('')
      loadQuestions()
    } catch (error) {
      alert('Error updating question: ' + (error as Error).message)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingText('')
    setEditingCategory('')
  }

  const deleteQuestion = (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      questionManager.deleteQuestion(questionId)
      loadQuestions()
    } catch (error) {
      alert('Error deleting question: ' + (error as Error).message)
    }
  }

  const addQuestion = () => {
    if (!newQuestion.text.trim() || !newQuestion.category.trim()) return

    try {
      questionManager.addQuestion(newQuestion)
      setNewQuestion({ text: '', category: '' })
      setShowAddForm(false)
      loadQuestions()
    } catch (error) {
      alert('Error adding question: ' + (error as Error).message)
    }
  }

  const resetToDefaults = () => {
    if (!confirm('Are you sure you want to reset all questions to defaults? This will delete all custom questions.')) return

    questionManager.resetToDefaults()
    loadQuestions()
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const reorderedQuestions = [...questions]
    const [draggedQuestion] = reorderedQuestions.splice(draggedIndex, 1)
    reorderedQuestions.splice(dropIndex, 0, draggedQuestion)

    try {
      questionManager.reorderQuestions(reorderedQuestions.map(q => q.id))
      loadQuestions()
    } catch (error) {
      alert('Error reordering questions: ' + (error as Error).message)
    }

    setDraggedIndex(null)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-gray-600">Loading questions from database...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Manage Questions</h3>
          <p className="text-sm text-gray-600">
            {questions.length} questions • {questionManager.isUsingDefaults() ? 'Using defaults' : 'Custom questions'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Add Question
          </button>
          {!questionManager.isUsingDefaults() && (
            <button
              onClick={resetToDefaults}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm font-medium"
            >
              Reset to Defaults
            </button>
          )}
        </div>
      </div>

      {/* Add Question Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3">Add New Question</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Text
              </label>
              <input
                type="text"
                value={newQuestion.text}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Enter question text..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={newQuestion.category}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select or enter new category...</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                type="text"
                value={newQuestion.category}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Or type new category..."
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addQuestion}
                disabled={!newQuestion.text.trim() || !newQuestion.category.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 text-sm font-medium"
              >
                Add Question
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewQuestion({ text: '', category: '' })
                }}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((question, index) => (
          <div
            key={question.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`p-4 rounded-lg border cursor-move transition-all ${
              draggedIndex === index
                ? 'border-blue-300 bg-blue-50 shadow-lg transform scale-105'
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full text-sm font-medium">
                  {question.order}
                </div>
                <div className="flex-1">
                  {editingId === question.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                      <select
                        value={editingCategory}
                        onChange={(e) => setEditingCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        {availableCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-900">{question.text}</p>
                      <p className="text-sm text-gray-600">{question.category}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editingId === question.id ? (
                  <>
                    <button
                      onClick={saveEdit}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditing(question)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {questions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No questions available</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Add First Question
          </button>
        </div>
      )}
    </div>
  )
}