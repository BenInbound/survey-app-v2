'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

export interface CategoryAverage {
  category: string
  average: number
  responses: number
}

interface SpiderChartProps {
  categoryData: CategoryAverage[]
  className?: string
}

export function transformDataForChart(categoryData: CategoryAverage[]) {
  const labels = categoryData.map(item => item.category)
  const data = categoryData.map(item => item.average)
  
  return {
    labels,
    datasets: [
      {
        label: 'Category Scores',
        data,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  }
}

export function getChartConfig() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed.r}/10`
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
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: {
            size: 14,
            weight: 'bold' as const
          },
          color: '#374151'
        }
      },
    },
  }
}

export function SpiderChart({ categoryData, className = '' }: SpiderChartProps) {
  const chartRef = useRef<any>(null)

  useEffect(() => {
    const chart = chartRef.current
    if (chart) {
      chart.update('active')
    }
  }, [categoryData])

  if (!categoryData || categoryData.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-custom-gray rounded-lg ${className}`}>
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>No data available for visualization</p>
        </div>
      </div>
    )
  }

  const chartData = transformDataForChart(categoryData)
  const options = getChartConfig()

  return (
    <div className={`w-full h-64 sm:h-80 lg:h-96 ${className}`}>
      <Radar 
        ref={chartRef}
        data={chartData} 
        options={options}
      />
    </div>
  )
}