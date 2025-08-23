import { render, screen } from '@testing-library/react'
import ProgressBar from '../ProgressBar'
import { SurveyProgress } from '@/lib/types'

describe('ProgressBar', () => {
  const createProgress = (currentIndex: number, totalQuestions: number): SurveyProgress => ({
    currentIndex,
    totalQuestions,
    percentage: Math.round(((currentIndex + 1) / totalQuestions) * 100)
  })

  describe('Progress display', () => {
    test('shows correct question count and percentage', () => {
      const progress = createProgress(2, 8) // Question 3 of 8
      render(<ProgressBar progress={progress} />)
      
      expect(screen.getByText('Question 3 of 8')).toBeInTheDocument()
      expect(screen.getByText('38%')).toBeInTheDocument()
    })

    test('displays progress for first question', () => {
      const progress = createProgress(0, 5) // Question 1 of 5  
      render(<ProgressBar progress={progress} />)
      
      expect(screen.getByText('Question 1 of 5')).toBeInTheDocument()
      expect(screen.getByText('20%')).toBeInTheDocument()
    })

    test('displays progress for last question', () => {
      const progress = createProgress(4, 5) // Question 5 of 5
      render(<ProgressBar progress={progress} />)
      
      expect(screen.getByText('Question 5 of 5')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  describe('Visual progress bar', () => {
    test('renders progress bar with correct width', () => {
      const progress = createProgress(3, 10) // 40%
      render(<ProgressBar progress={progress} />)
      
      const progressBar = document.querySelector('.bg-gradient-to-r.from-blue-500')
      expect(progressBar).toHaveStyle({ width: '40%' })
    })

    test('renders progress bar at 0% for first question not started', () => {
      const progress = { currentIndex: 0, totalQuestions: 8, percentage: 0 }
      render(<ProgressBar progress={progress} />)
      
      const progressBar = document.querySelector('.bg-gradient-to-r.from-blue-500')
      expect(progressBar).toHaveStyle({ width: '0%' })
    })

    test('renders progress bar at 100% when complete', () => {
      const progress = createProgress(7, 8) // 100%
      render(<ProgressBar progress={progress} />)
      
      const progressBar = document.querySelector('.bg-gradient-to-r.from-blue-500')
      expect(progressBar).toHaveStyle({ width: '100%' })
    })
  })

  describe('Step indicators', () => {
    test('renders correct number of step indicators', () => {
      const progress = createProgress(2, 6)
      render(<ProgressBar progress={progress} />)
      
      const indicators = document.querySelectorAll('.w-2.h-2.rounded-full')
      expect(indicators).toHaveLength(6)
    })

    test('highlights completed steps correctly', () => {
      const progress = createProgress(2, 5) // On question 3, so steps 0, 1, 2 are complete
      render(<ProgressBar progress={progress} />)
      
      const indicators = document.querySelectorAll('.w-2.h-2.rounded-full')
      
      // First 3 indicators should be blue (completed up to current index)
      expect(indicators[0]).toHaveClass('bg-blue-500')
      expect(indicators[1]).toHaveClass('bg-blue-500')  
      expect(indicators[2]).toHaveClass('bg-blue-500')
      
      // Remaining should be gray (not completed)
      expect(indicators[3]).toHaveClass('bg-gray-300')
      expect(indicators[4]).toHaveClass('bg-gray-300')
    })

    test('shows current step indicator correctly', () => {
      const progress = createProgress(1, 4) // On question 2 (index 1)
      render(<ProgressBar progress={progress} />)
      
      const indicators = document.querySelectorAll('.w-2.h-2.rounded-full')
      
      // First two indicators completed (index 0 and 1)
      expect(indicators[0]).toHaveClass('bg-blue-500')
      expect(indicators[1]).toHaveClass('bg-blue-500')
      // Remaining indicators are not completed
      expect(indicators[2]).toHaveClass('bg-gray-300')
      expect(indicators[3]).toHaveClass('bg-gray-300')
    })
  })

  describe('Completion state', () => {
    test('shows completion message when 100% complete', () => {
      const progress = { currentIndex: 4, totalQuestions: 5, percentage: 100 }
      render(<ProgressBar progress={progress} />)
      
      expect(screen.getByText('Complete!')).toBeInTheDocument()
    })

    test('does not show completion message when not complete', () => {
      const progress = createProgress(3, 5) // 80%
      render(<ProgressBar progress={progress} />)
      
      expect(screen.queryByText('Complete!')).not.toBeInTheDocument()
    })

    test('completion message has correct styling', () => {
      const progress = { currentIndex: 2, totalQuestions: 3, percentage: 100 }
      render(<ProgressBar progress={progress} />)
      
      const completionMessage = screen.getByText('Complete!')
      const styledElement = completionMessage.closest('.bg-green-100')
      expect(styledElement).toHaveClass('bg-green-100', 'text-green-800')
    })
  })

  describe('Animation props', () => {
    test('applies animation classes when animated=true', () => {
      const progress = createProgress(1, 4)
      render(<ProgressBar progress={progress} animated={true} />)
      
      const progressBar = document.querySelector('.bg-gradient-to-r.from-blue-500')
      expect(progressBar).toHaveClass('transition-all', 'duration-500', 'transform-gpu')
    })

    test('works without animation when animated=false', () => {
      const progress = createProgress(1, 4)
      render(<ProgressBar progress={progress} animated={false} />)
      
      const progressBar = document.querySelector('.bg-gradient-to-r.from-blue-500')
      expect(progressBar).toHaveClass('transition-all', 'duration-500')
      expect(progressBar).not.toHaveStyle({ transform: 'translateZ(0)' })
    })

    test('defaults to animated=true', () => {
      const progress = createProgress(1, 4)
      render(<ProgressBar progress={progress} />)
      
      const progressBar = document.querySelector('.bg-gradient-to-r.from-blue-500')
      expect(progressBar).toHaveClass('transform-gpu')
    })
  })

  describe('Custom styling', () => {
    test('applies custom className', () => {
      const progress = createProgress(1, 4)
      const customClass = 'custom-progress-class'
      
      render(<ProgressBar progress={progress} className={customClass} />)
      
      const container = document.querySelector('.w-full')
      expect(container).toHaveClass(customClass)
    })
  })

  describe('Accessibility', () => {
    test('provides clear text indication of progress', () => {
      const progress = createProgress(3, 8)
      render(<ProgressBar progress={progress} />)
      
      // Text should be clear for screen readers
      expect(screen.getByText('Question 4 of 8')).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    test('completion state is clearly indicated', () => {
      const progress = { currentIndex: 4, totalQuestions: 5, percentage: 100 }
      render(<ProgressBar progress={progress} />)
      
      const icon = document.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(screen.getByText('Complete!')).toBeInTheDocument()
    })
  })
})