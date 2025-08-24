'use client'

import { SliderProps, SliderValue } from '@/lib/types'

const SLIDER_EMOJIS = {
  1: '😞', 2: '😔', 3: '😕', 4: '😐', 5: '😊',
  6: '🙂', 7: '😄', 8: '😁', 9: '🤩', 10: '🚀'
} as const

const SLIDER_COLORS = {
  1: 'from-error to-red-600',
  2: 'from-red-400 to-error', 
  3: 'from-secondary-500 to-secondary-600',
  4: 'from-secondary-400 to-secondary-500',
  5: 'from-secondary-400 to-secondary-500',
  6: 'from-secondary-300 to-primary-400',
  7: 'from-primary-400 to-primary-500',
  8: 'from-primary-500 to-primary-600',
  9: 'from-primary-500 to-primary-600',
  10: 'from-primary-600 to-primary-700'
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
  const currentColor = value ? SLIDER_COLORS[value] : 'from-neutral-300 to-neutral-400'

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
          <span className="text-3xl font-bold text-neutral-800">
            {value || '?'}
          </span>
          <span className="text-lg text-neutral-600 ml-1">/10</span>
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
            w-full h-3 bg-neutral-200 rounded-lg appearance-none cursor-pointer
            disabled:cursor-not-allowed disabled:opacity-50
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            ${value ? `bg-gradient-to-r ${currentColor}` : 'bg-neutral-200'}
          `}
          style={{
            background: value ? `linear-gradient(to right, 
              ${value >= 1 ? '#DC2626' : '#D6D3D1'} 0%, 
              ${value >= 2 ? '#EA580C' : '#D6D3D1'} 11%, 
              ${value >= 3 ? '#D97706' : '#D6D3D1'} 22%,
              ${value >= 4 ? '#CA8A04' : '#D6D3D1'} 33%,
              ${value >= 5 ? '#F59E0B' : '#D6D3D1'} 44%,
              ${value >= 6 ? '#FF5590' : '#D6D3D1'} 55%,
              ${value >= 7 ? '#ff0056' : '#D6D3D1'} 66%,
              ${value >= 8 ? '#E6004D' : '#D6D3D1'} 77%,
              ${value >= 9 ? '#CC0044' : '#D6D3D1'} 88%,
              ${value >= 10 ? '#B3003B' : '#D6D3D1'} 100%)` : undefined
          }}
        />
        
        {/* Scale Markers */}
        <div className="flex justify-between text-xs text-neutral-500 mt-2 px-1">
          {Array.from({ length: 10 }, (_, i) => (
            <span 
              key={i + 1} 
              className={`transition-colors duration-200 ${
                value && value >= i + 1 ? 'text-neutral-700 font-medium' : ''
              }`}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>

      {/* Helper Text */}
      <div className="flex justify-between text-sm text-neutral-500 mt-4 px-4">
        <span>Strongly Disagree</span>
        <span>Strongly Agree</span>
      </div>
    </div>
  )
}