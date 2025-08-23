import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SpiderChart, transformDataForChart, getChartConfig, CategoryAverage } from '../SpiderChart'

// Mock Chart.js and react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Radar: ({ data, options }: any) => (
    <div data-testid="radar-chart" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Mock Radar Chart
    </div>
  )
}))

jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  RadialLinearScale: {},
  PointElement: {},
  LineElement: {},
  Filler: {},
  Tooltip: {},
  Legend: {},
}))

describe('SpiderChart', () => {
  const mockCategoryData: CategoryAverage[] = [
    { category: 'Strategy', average: 7.5, responses: 3 },
    { category: 'Operations', average: 6.2, responses: 2 },
    { category: 'Culture', average: 8.0, responses: 4 },
  ]

  it('renders spider chart with category data', () => {
    render(<SpiderChart categoryData={mockCategoryData} />)
    
    const chart = screen.getByTestId('radar-chart')
    expect(chart).toBeInTheDocument()
    expect(chart).toHaveTextContent('Mock Radar Chart')
  })

  it('handles empty data gracefully', () => {
    render(<SpiderChart categoryData={[]} />)
    
    expect(screen.getByText('No data available for visualization')).toBeInTheDocument()
    expect(screen.queryByTestId('radar-chart')).not.toBeInTheDocument()
  })

  it('handles undefined data gracefully', () => {
    render(<SpiderChart categoryData={undefined as any} />)
    
    expect(screen.getByText('No data available for visualization')).toBeInTheDocument()
    expect(screen.queryByTestId('radar-chart')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <SpiderChart categoryData={mockCategoryData} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('transformDataForChart', () => {
  it('transforms category data correctly', () => {
    const categoryData: CategoryAverage[] = [
      { category: 'Strategy', average: 7.5, responses: 3 },
      { category: 'Operations', average: 6.2, responses: 2 },
    ]

    const result = transformDataForChart(categoryData)

    expect(result.labels).toEqual(['Strategy', 'Operations'])
    expect(result.datasets[0].data).toEqual([7.5, 6.2])
    expect(result.datasets[0].label).toBe('Category Scores')
  })

  it('handles empty array', () => {
    const result = transformDataForChart([])
    
    expect(result.labels).toEqual([])
    expect(result.datasets[0].data).toEqual([])
  })
})

describe('getChartConfig', () => {
  it('returns valid chart configuration', () => {
    const config = getChartConfig()

    expect(config.responsive).toBe(true)
    expect(config.maintainAspectRatio).toBe(false)
    expect(config.scales.r.min).toBe(0)
    expect(config.scales.r.max).toBe(10)
    expect(config.plugins.legend.display).toBe(false)
  })

  it('includes tooltip callback for score formatting', () => {
    const config = getChartConfig()
    const tooltipCallback = config.plugins.tooltip.callbacks.label

    const mockContext = {
      label: 'Strategy',
      parsed: { r: 7.5 }
    }

    const result = tooltipCallback(mockContext)
    expect(result).toBe('Strategy: 7.5/10')
  })
})