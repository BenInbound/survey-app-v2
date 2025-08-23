import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ComparativeSpiderChart } from '../ComparativeSpiderChart'
import { CategoryAverage } from '@/lib/types'

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  RadialLinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Filler: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}))

jest.mock('react-chartjs-2', () => ({
  Radar: ({ data, options, ...props }: any) => (
    <div data-testid={props['data-testid']} data-chart-data={JSON.stringify(data)}>
      Mock Radar Chart
    </div>
  ),
}))

describe('ComparativeSpiderChart', () => {
  const mockManagementData: CategoryAverage[] = [
    { category: 'Strategic Clarity', average: 8.5, responses: 5 },
    { category: 'Market Position', average: 7.2, responses: 5 },
    { category: 'Innovation', average: 6.8, responses: 5 }
  ]

  const mockEmployeeData: CategoryAverage[] = [
    { category: 'Strategic Clarity', average: 6.5, responses: 12 },
    { category: 'Market Position', average: 7.8, responses: 12 },
    { category: 'Innovation', average: 5.9, responses: 12 }
  ]

  it('renders comparative radar chart with both datasets', () => {
    render(
      <ComparativeSpiderChart 
        managementData={mockManagementData}
        employeeData={mockEmployeeData}
      />
    )
    
    const chart = screen.getByTestId('comparative-radar-chart')
    expect(chart).toBeInTheDocument()
    
    const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '{}')
    expect(chartData.datasets).toHaveLength(2)
    expect(chartData.datasets[0].label).toBe('Management Perspective')
    expect(chartData.datasets[1].label).toBe('Employee Perspective')
  })

  it('displays largest perception gaps section', () => {
    render(
      <ComparativeSpiderChart 
        managementData={mockManagementData}
        employeeData={mockEmployeeData}
      />
    )
    
    expect(screen.getByText('Largest Perception Gaps')).toBeInTheDocument()
    expect(screen.getByText('Strategic Clarity')).toBeInTheDocument()
  })

  it('shows data summary with averages', () => {
    render(
      <ComparativeSpiderChart 
        managementData={mockManagementData}
        employeeData={mockEmployeeData}
      />
    )
    
    expect(screen.getByText('Data Summary')).toBeInTheDocument()
    expect(screen.getByText('Management Average')).toBeInTheDocument()
    expect(screen.getByText('Employee Average')).toBeInTheDocument()
    expect(screen.getByText('Overall Gap')).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    render(
      <ComparativeSpiderChart 
        managementData={[]}
        employeeData={[]}
      />
    )
    
    const chart = screen.getByTestId('comparative-radar-chart')
    expect(chart).toBeInTheDocument()
    
    const zeroValues = screen.getAllByText('0.0')
    expect(zeroValues.length).toBeGreaterThan(0) // Should show 0.0 averages
  })

  it('correctly calculates and displays averages', () => {
    render(
      <ComparativeSpiderChart 
        managementData={mockManagementData}
        employeeData={mockEmployeeData}
      />
    )
    
    // Management average: (8.5 + 7.2 + 6.8) / 3 = 7.5
    // Employee average: (6.5 + 7.8 + 5.9) / 3 = 6.73...
    const managementAvg = screen.getAllByText('7.5')[0]
    const employeeAvg = screen.getAllByText('6.7')[0]
    
    expect(managementAvg).toBeInTheDocument()
    expect(employeeAvg).toBeInTheDocument()
  })

  it('handles mismatched categories between management and employee data', () => {
    const managementDataPartial = [
      { category: 'Strategic Clarity', average: 8.0, responses: 5 }
    ]
    
    const employeeDataPartial = [
      { category: 'Strategic Clarity', average: 6.0, responses: 12 },
      { category: 'New Category', average: 7.0, responses: 12 }
    ]

    render(
      <ComparativeSpiderChart 
        managementData={managementDataPartial}
        employeeData={employeeDataPartial}
      />
    )
    
    const chart = screen.getByTestId('comparative-radar-chart')
    const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '{}')
    
    // Should include both categories
    expect(chartData.labels).toContain('Strategic Clarity')
    expect(chartData.labels).toContain('New Category')
  })
})