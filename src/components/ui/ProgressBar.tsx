'use client'

import { ProgressBarProps } from '@/lib/types'

interface ProgressBarComponentProps extends ProgressBarProps {
  className?: string
}

export default function ProgressBar({ 
  progress, 
  animated = true, 
  className = '' 
}: ProgressBarComponentProps) {
  const { currentIndex, totalQuestions, percentage } = progress

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Text */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span className="text-sm font-semibold text-blue-600">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`
            h-full bg-gradient-to-r from-blue-500 to-blue-600 
            rounded-full transition-all duration-500 ease-out
            ${animated ? 'transform-gpu' : ''}
          `}
          style={{
            width: `${percentage}%`,
            transform: animated ? 'translateZ(0)' : undefined
          }}
        >
          {/* Animated shine effect */}
          {animated && percentage > 0 && (
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between mt-3">
        {Array.from({ length: totalQuestions }, (_, index) => (
          <div
            key={index}
            className={`
              w-2 h-2 rounded-full transition-colors duration-300
              ${index <= currentIndex 
                ? 'bg-blue-500' 
                : 'bg-gray-300'
              }
            `}
          />
        ))}
      </div>

      {/* Completion Message */}
      {percentage === 100 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Complete!
          </div>
        </div>
      )}
    </div>
  )
}