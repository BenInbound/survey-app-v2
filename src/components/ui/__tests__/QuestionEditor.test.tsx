import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import QuestionEditor from '../QuestionEditor'

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

// Mock the question manager
jest.mock('../../../lib/question-manager', () => {
  const mockQuestions = [
    { id: 'test-1', text: 'Test Question 1', category: 'Category A', order: 1 },
    { id: 'test-2', text: 'Test Question 2', category: 'Category B', order: 2 }
  ]

  return {
    questionManager: {
      getQuestions: jest.fn(() => mockQuestions),
      getAvailableCategories: jest.fn(() => ['Category A', 'Category B']),
      isUsingDefaults: jest.fn(() => true),
      addQuestion: jest.fn(),
      updateQuestion: jest.fn(),
      deleteQuestion: jest.fn(),
      resetToDefaults: jest.fn(),
      reorderQuestions: jest.fn()
    }
  }
})

describe('QuestionEditor', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    jest.clearAllMocks()
  })

  it('renders questions list', async () => {
    render(<QuestionEditor />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Question 1')).toBeInTheDocument()
      expect(screen.getByText('Test Question 2')).toBeInTheDocument()
      expect(screen.getByText('Category A')).toBeInTheDocument()
      expect(screen.getByText('Category B')).toBeInTheDocument()
    })
  })

  it('shows question count and status', async () => {
    render(<QuestionEditor />)
    
    await waitFor(() => {
      expect(screen.getByText('2 questions • Using defaults')).toBeInTheDocument()
    })
  })

  it('opens add question form when clicking Add Question', async () => {
    render(<QuestionEditor />)
    
    const addButton = screen.getByText('Add Question')
    fireEvent.click(addButton)
    
    expect(screen.getByText('Add New Question')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter question text...')).toBeInTheDocument()
  })

  it('enters edit mode when clicking Edit button', async () => {
    render(<QuestionEditor />)
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit')
      fireEvent.click(editButtons[0])
    })
    
    expect(screen.getByDisplayValue('Test Question 1')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('shows confirmation dialog when deleting question', async () => {
    // Mock window.confirm
    const originalConfirm = window.confirm
    window.confirm = jest.fn(() => false)
    
    render(<QuestionEditor />)
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete')
      fireEvent.click(deleteButtons[0])
    })
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this question?')
    
    // Restore original confirm
    window.confirm = originalConfirm
  })

  it('shows reset button when not using defaults', async () => {
    const { questionManager } = require('../../../lib/question-manager')
    questionManager.isUsingDefaults.mockReturnValue(false)
    
    render(<QuestionEditor />)
    
    await waitFor(() => {
      expect(screen.getByText('Reset to Defaults')).toBeInTheDocument()
    })
  })

  it('calls onQuestionsChange callback when provided', async () => {
    const mockCallback = jest.fn()
    render(<QuestionEditor onQuestionsChange={mockCallback} />)
    
    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled()
    })
  })
})