'use client'

import { SliderProps, SliderValue } from '@/lib/types'

const SLIDER_EMOJIS = {
  1: '😞', 2: '😔', 3: '😕', 4: '😐', 5: '😊',
  6: '🙂', 7: '😄', 8: '😁', 9: '🤩', 10: '🚀'
} as const

const SLIDER_COLORS = {
  1: 'from-red-500 to-red-600',
  2: 'from-red-400 to-red-500', 
  3: 'from-orange-500 to-orange-600',
  4: 'from-orange-400 to-yellow-500',
  5: 'from-yellow-400 to-yellow-500',
  6: 'from-yellow-300 to-green-400',
  7: 'from-green-400 to-green-500',
  8: 'from-green-500 to-green-600',
  9: 'from-blue-500 to-blue-600',
  10: 'from-purple-500 to-purple-600'
} as const

interface SliderInputProps extends SliderProps {
  className?: string
}

export default function SliderInput({ 
  value, 
  onChange, 
  disabled = false, 
  className = '' 
}: SliderInputProps) {
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value) as SliderValue
    onChange(newValue)
  }

  const currentEmoji = value ? SLIDER_EMOJIS[value] : '🤔'
  const currentColor = value ? SLIDER_COLORS[value] : 'from-gray-300 to-gray-400'

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Visual Feedback Display */}
      <div className="text-center mb-8">
        <div className={`inline-block p-6 rounded-full bg-gradient-to-br ${currentColor} shadow-lg transition-all duration-300 ease-out transform ${value ? 'scale-110' : 'scale-100'}`}>
          <span className="text-4xl" role="img" aria-label="reaction">
            {currentEmoji}
          </span>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-bold text-gray-800">
            {value || '?'}
          </span>
          <span className="text-lg text-gray-600 ml-1">/10</span>
        </div>
      </div>

      {/* Slider Input */}
      <div className="relative px-4">
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={value || 1}
          onChange={handleSliderChange}
          disabled={disabled}
          className={`
            w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer
            disabled:cursor-not-allowed disabled:opacity-50
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${value ? `bg-gradient-to-r ${currentColor}` : 'bg-gray-200'}
          `}
          style={{
            background: value ? `linear-gradient(to right, 
              ${value >= 1 ? '#ef4444' : '#d1d5db'} 0%, 
              ${value >= 2 ? '#f97316' : '#d1d5db'} 11%, 
              ${value >= 3 ? '#eab308' : '#d1d5db'} 22%,
              ${value >= 4 ? '#84cc16' : '#d1d5db'} 33%,
              ${value >= 5 ? '#22c55e' : '#d1d5db'} 44%,
              ${value >= 6 ? '#10b981' : '#d1d5db'} 55%,
              ${value >= 7 ? '#06b6d4' : '#d1d5db'} 66%,
              ${value >= 8 ? '#3b82f6' : '#d1d5db'} 77%,
              ${value >= 9 ? '#8b5cf6' : '#d1d5db'} 88%,
              ${value >= 10 ? '#a855f7' : '#d1d5db'} 100%)` : undefined
          }}
        />
        
        {/* Scale Markers */}
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
          {Array.from({ length: 10 }, (_, i) => (
            <span 
              key={i + 1} 
              className={`transition-colors duration-200 ${
                value && value >= i + 1 ? 'text-gray-700 font-medium' : ''
              }`}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>

      {/* Helper Text */}
      <div className="flex justify-between text-sm text-gray-500 mt-4 px-4">
        <span>Strongly Disagree</span>
        <span>Strongly Agree</span>
      </div>
    </div>
  )
}