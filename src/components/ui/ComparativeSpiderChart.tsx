'use client'

import { useRef, useEffect } from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartConfiguration
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { CategoryAverage } from '@/lib/types'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

interface ComparativeSpiderChartProps {
  managementData: CategoryAverage[]
  employeeData: CategoryAverage[]
}

export function ComparativeSpiderChart({ managementData, employeeData }: ComparativeSpiderChartProps) {
  // Combine and normalize data
  const allCategories = Array.from(
    new Set([
      ...managementData.map(item => item.category),
      ...employeeData.map(item => item.category)
    ])
  )

  const managementScores = allCategories.map(category => {
    const item = managementData.find(d => d.category === category)
    return item ? item.average : 0
  })

  const employeeScores = allCategories.map(category => {
    const item = employeeData.find(d => d.category === category)
    return item ? item.average : 0
  })

  const data = {
    labels: allCategories,
    datasets: [
      {
        label: 'Management Perspective',
        data: managementScores,
        backgroundColor: 'rgba(13, 148, 136, 0.2)',
        borderColor: 'rgb(13, 148, 136)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(13, 148, 136)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Employee Perspective',
        data: employeeScores,
        backgroundColor: 'rgba(217, 119, 6, 0.2)',
        borderColor: 'rgb(217, 119, 6)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(217, 119, 6)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  }

  const options: ChartConfiguration<'radar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          label: function(context) {
            const datasetLabel = context.dataset.label || ''
            const value = context.parsed.r
            return `${datasetLabel}: ${value.toFixed(1)}/10`
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          font: {
            size: 12
          },
          color: '#78716C'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: {
            size: 13,
            weight: 'bold'
          },
          color: '#44403C',
          padding: 15
        }
      }
    },
    elements: {
      line: {
        tension: 0.1
      }
    }
  }

  // Calculate gap insights
  const gapInsights = allCategories.map(category => {
    const mgmtScore = managementScores[allCategories.indexOf(category)]
    const empScore = employeeScores[allCategories.indexOf(category)]
    const gap = mgmtScore - empScore
    return { category, gap: Math.abs(gap), direction: gap > 0 ? 'management higher' : 'employee higher' }
  }).sort((a, b) => b.gap - a.gap)

  return (
    <div className="w-full">
      {/* Chart Container */}
      <div className="relative h-96 mb-8">
        <Radar 
          data={data} 
          options={options}
          data-testid="comparative-radar-chart"
        />
      </div>

      {/* Gap Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Largest Perception Gaps</h3>
          <div className="space-y-3">
            {gapInsights.slice(0, 3).map((insight, index) => (
              <div key={insight.category} className="flex items-center justify-between p-3 bg-custom-gray rounded-lg">
                <div>
                  <div className="font-medium text-neutral-900">{insight.category}</div>
                  <div className="text-sm text-neutral-600">{insight.direction}</div>
                </div>
                <div className="text-lg font-bold text-neutral-900">
                  {insight.gap.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Data Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
              <div>
                <div className="font-medium text-primary-900">Management Average</div>
                <div className="text-sm text-primary-700">Across all categories</div>
              </div>
              <div className="text-lg font-bold text-primary-900">
                {managementData.length > 0 
                  ? (managementScores.reduce((a, b) => a + b, 0) / managementScores.length).toFixed(1)
                  : '0.0'
                }
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <div>
                <div className="font-medium text-secondary-900">Employee Average</div>
                <div className="text-sm text-secondary-700">Across all categories</div>
              </div>
              <div className="text-lg font-bold text-secondary-900">
                {employeeData.length > 0 
                  ? (employeeScores.reduce((a, b) => a + b, 0) / employeeScores.length).toFixed(1)
                  : '0.0'
                }
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-info bg-opacity-10 rounded-lg">
              <div>
                <div className="font-medium text-info">Overall Gap</div>
                <div className="text-sm text-info opacity-80">Average difference</div>
              </div>
              <div className="text-lg font-bold text-info">
                {managementData.length > 0 && employeeData.length > 0
                  ? Math.abs(
                      (managementScores.reduce((a, b) => a + b, 0) / managementScores.length) -
                      (employeeScores.reduce((a, b) => a + b, 0) / employeeScores.length)
                    ).toFixed(1)
                  : '0.0'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}