import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SummaryCard } from '../SummaryCard'
import { generateSummary } from '@/lib/ai-summary'

// Mock the AI summary module
jest.mock('../../../lib/ai-summary', () => ({
  generateSummary: jest.fn(),
}))

const mockGenerateSummary = generateSummary as jest.MockedFunction<typeof generateSummary>

describe('SummaryCard', () => {
  const mockProps = {
    categoryAverages: [
      { category: 'Strategy', average: 7.5, responses: 3 },
      { category: 'Operations', average: 6.2, responses: 2 },
    ],
    overallAverage: 6.8,
    totalResponses: 5,
    department: 'Engineering',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows generate button initially', () => {
    render(<SummaryCard {...mockProps} />)
    
    expect(screen.getByText('AI Strategic Insights')).toBeInTheDocument()
    expect(screen.getByText('Generate personalized insights and recommendations based on your assessment results')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Generate Insights' })).toBeInTheDocument()
  })

  it('shows loading state during generation', async () => {
    mockGenerateSummary.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<SummaryCard {...mockProps} />)
    
    fireEvent.click(screen.getByRole('button', { name: 'Generate Insights' }))
    
    expect(screen.getByText('Analyzing your results...')).toBeInTheDocument()
    expect(screen.getByTestId('loading-spinner') || document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('displays generated summary', async () => {
    const mockSummary = 'Your organization shows strong performance in Strategy with room for improvement in Operations.'
    mockGenerateSummary.mockResolvedValue(mockSummary)
    
    render(<SummaryCard {...mockProps} />)
    
    fireEvent.click(screen.getByRole('button', { name: 'Generate Insights' }))
    
    await waitFor(() => {
      expect(screen.getByText(mockSummary)).toBeInTheDocument()
    })
    
    expect(screen.getByText('Regenerate Insights')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    const errorMessage = 'API key not configured'
    mockGenerateSummary.mockRejectedValue(new Error(errorMessage))
    
    render(<SummaryCard {...mockProps} />)
    
    fireEvent.click(screen.getByRole('button', { name: 'Generate Insights' }))
    
    await waitFor(() => {
      expect(screen.getByText('Unable to generate insights')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
  })

  it('allows retry after error', async () => {
    mockGenerateSummary
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce('Successful summary')
    
    render(<SummaryCard {...mockProps} />)
    
    // First attempt fails
    fireEvent.click(screen.getByRole('button', { name: 'Generate Insights' }))
    
    await waitFor(() => {
      expect(screen.getByText('Unable to generate insights')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    expect(screen.getByText('Network error')).toBeInTheDocument()
    
    // Retry succeeds
    fireEvent.click(screen.getByText('Try again'))
    
    await waitFor(() => {
      expect(screen.getByText('Successful summary')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('passes correct context to generateSummary', async () => {
    mockGenerateSummary.mockResolvedValue('Mock summary')
    
    render(<SummaryCard {...mockProps} />)
    
    fireEvent.click(screen.getByRole('button', { name: 'Generate Insights' }))
    
    await waitFor(() => {
      expect(mockGenerateSummary).toHaveBeenCalledWith({
        categoryAverages: mockProps.categoryAverages,
        overallAverage: mockProps.overallAverage,
        totalResponses: mockProps.totalResponses,
        department: mockProps.department,
      })
    })
  })

  it('applies custom className', () => {
    const { container } = render(
      <SummaryCard {...mockProps} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('allows regenerating summary', async () => {
    mockGenerateSummary.mockResolvedValue('First summary')
    
    render(<SummaryCard {...mockProps} />)
    
    // Generate initial summary
    fireEvent.click(screen.getByRole('button', { name: 'Generate Insights' }))
    
    await waitFor(() => {
      expect(screen.getByText('First summary')).toBeInTheDocument()
    })
    
    // Regenerate
    mockGenerateSummary.mockResolvedValue('Regenerated summary')
    fireEvent.click(screen.getByText('Regenerate Insights'))
    
    await waitFor(() => {
      expect(screen.getByText('Regenerated summary')).toBeInTheDocument()
    })
    
    expect(mockGenerateSummary).toHaveBeenCalledTimes(2)
  })
})