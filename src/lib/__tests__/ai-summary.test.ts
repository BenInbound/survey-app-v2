import { formatSummaryPrompt, getSummaryStatistics, generateSummary } from '../ai-summary'
import { CategoryAverage } from '@/components/ui/SpiderChart'

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  }
})

describe('formatSummaryPrompt', () => {
  const mockContext = {
    categoryAverages: [
      { category: 'Strategy', average: 7.5, responses: 3 },
      { category: 'Operations', average: 6.2, responses: 2 },
    ],
    overallAverage: 6.8,
    totalResponses: 5,
    department: 'Engineering',
  }

  it('formats prompt with all context data', () => {
    const prompt = formatSummaryPrompt(mockContext)

    expect(prompt).toContain('Overall Average Score: 6.8/10')
    expect(prompt).toContain('Total Questions Answered: 5')
    expect(prompt).toContain('Department: Engineering')
    expect(prompt).toContain('Strategy: 7.5/10 (based on 3 questions)')
    expect(prompt).toContain('Operations: 6.2/10 (based on 2 questions)')
  })

  it('handles context without department', () => {
    const contextWithoutDept = { ...mockContext, department: undefined }
    const prompt = formatSummaryPrompt(contextWithoutDept)

    expect(prompt).not.toContain('Department:')
    expect(prompt).toContain('Overall Average Score: 6.8/10')
  })

  it('handles singular response count', () => {
    const contextSingular = {
      ...mockContext,
      categoryAverages: [{ category: 'Strategy', average: 7.5, responses: 1 }],
    }
    const prompt = formatSummaryPrompt(contextSingular)

    expect(prompt).toContain('Strategy: 7.5/10 (based on 1 question)')
  })
})

describe('getSummaryStatistics', () => {
  const mockCategoryAverages: CategoryAverage[] = [
    { category: 'Strategy', average: 8.5, responses: 3 },
    { category: 'Operations', average: 6.2, responses: 2 },
    { category: 'Culture', average: 4.8, responses: 4 },
    { category: 'Innovation', average: 7.1, responses: 2 },
  ]

  it('identifies highest and lowest categories correctly', () => {
    const stats = getSummaryStatistics(mockCategoryAverages, 6.65)

    expect(stats.highestCategory.category).toBe('Strategy')
    expect(stats.highestCategory.average).toBe(8.5)
    expect(stats.lowestCategory.category).toBe('Culture')
    expect(stats.lowestCategory.average).toBe(4.8)
  })

  it('calculates score distribution correctly', () => {
    const stats = getSummaryStatistics(mockCategoryAverages, 6.65)

    expect(stats.scoreDistribution.excellent).toBe(1) // Strategy >= 8
    expect(stats.scoreDistribution.good).toBe(2) // Operations, Innovation >= 6 and < 8
    expect(stats.scoreDistribution.needs_improvement).toBe(1) // Culture < 6
  })

  it('determines overall performance level correctly', () => {
    expect(getSummaryStatistics(mockCategoryAverages, 7.5).overallPerformance).toBe('strong')
    expect(getSummaryStatistics(mockCategoryAverages, 6.0).overallPerformance).toBe('moderate')
    expect(getSummaryStatistics(mockCategoryAverages, 4.0).overallPerformance).toBe('needs_attention')
  })
})

describe('generateSummary', () => {
  const mockOpenAI = require('openai').default
  const mockCreate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockOpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }))
  })

  it('calls OpenAI API with correct parameters', async () => {
    process.env.OPENAI_API_KEY = 'test-key'
    
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          content: 'Generated summary content',
        },
      }],
    })

    const context = {
      categoryAverages: [{ category: 'Strategy', average: 7.5, responses: 3 }],
      overallAverage: 7.5,
      totalResponses: 3,
    }

    const result = await generateSummary(context)

    expect(result).toBe('Generated summary content')
    expect(mockCreate).toHaveBeenCalledWith({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: expect.stringContaining('Overall Average Score: 7.5/10'),
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    })
  })

  it('throws error when API key is missing', async () => {
    delete process.env.OPENAI_API_KEY

    const context = {
      categoryAverages: [],
      overallAverage: 5,
      totalResponses: 0,
    }

    await expect(generateSummary(context)).rejects.toThrow('OpenAI API key not configured')
  })

  it('handles API errors gracefully', async () => {
    process.env.OPENAI_API_KEY = 'test-key'
    mockCreate.mockRejectedValue(new Error('API Error'))

    const context = {
      categoryAverages: [],
      overallAverage: 5,
      totalResponses: 0,
    }

    await expect(generateSummary(context)).rejects.toThrow('Failed to generate summary')
  })

  it('handles empty response from API', async () => {
    process.env.OPENAI_API_KEY = 'test-key'
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          content: null,
        },
      }],
    })

    const context = {
      categoryAverages: [],
      overallAverage: 5,
      totalResponses: 0,
    }

    await expect(generateSummary(context)).rejects.toThrow('Failed to generate summary')
  })
})