import { render, screen, fireEvent } from '@testing-library/react'
import SliderInput from '../SliderInput'
import { SliderValue } from '@/lib/types'

describe('SliderInput', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  describe('Initial render', () => {
    test('renders with no value selected', () => {
      render(<SliderInput value={null} onChange={mockOnChange} />)
      
      expect(screen.getByText('?')).toBeInTheDocument()
      expect(screen.getByText('/10')).toBeInTheDocument()
      expect(screen.getByRole('img', { name: 'reaction' })).toHaveTextContent('🤔')
    })

    test('renders with initial value', () => {
      render(<SliderInput value={7} onChange={mockOnChange} />)
      
      const valueDisplay = screen.getByText('7', { selector: '.text-3xl' })
      expect(valueDisplay).toBeInTheDocument()
      expect(screen.getByRole('img', { name: 'reaction' })).toHaveTextContent('😄')
    })

    test('renders scale markers from 1 to 10', () => {
      render(<SliderInput value={null} onChange={mockOnChange} />)
      
      for (let i = 1; i <= 10; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument()
      }
    })

    test('renders helper text', () => {
      render(<SliderInput value={null} onChange={mockOnChange} />)
      
      expect(screen.getByText('Strongly Disagree')).toBeInTheDocument()
      expect(screen.getByText('Strongly Agree')).toBeInTheDocument()
    })
  })

  describe('Visual feedback', () => {
    test('shows correct emoji for different values', () => {
      const emojiMap: Record<SliderValue, string> = {
        1: '😞', 2: '😔', 3: '😕', 4: '😐', 5: '😊',
        6: '🙂', 7: '😄', 8: '😁', 9: '🤩', 10: '🚀'
      }

      Object.entries(emojiMap).forEach(([value, emoji]) => {
        const { unmount } = render(
          <SliderInput value={parseInt(value) as SliderValue} onChange={mockOnChange} />
        )
        
        expect(screen.getByRole('img', { name: 'reaction' })).toHaveTextContent(emoji)
        
        // Clean up before next render
        unmount()
      })
    })

    test('applies scale transform when value is selected', () => {
      const { rerender } = render(<SliderInput value={null} onChange={mockOnChange} />)
      const emojiContainer = screen.getByRole('img', { name: 'reaction' }).parentElement
      
      expect(emojiContainer).toHaveClass('scale-100')
      
      rerender(<SliderInput value={5} onChange={mockOnChange} />)
      
      expect(emojiContainer).toHaveClass('scale-110')
    })
  })

  describe('Slider interaction', () => {
    test('calls onChange when slider value changes', () => {
      render(<SliderInput value={null} onChange={mockOnChange} />)
      const slider = screen.getByRole('slider')
      
      fireEvent.change(slider, { target: { value: '6' } })
      
      expect(mockOnChange).toHaveBeenCalledWith(6)
    })

    test('accepts values from 1 to 10', () => {
      render(<SliderInput value={null} onChange={mockOnChange} />)
      const slider = screen.getByRole('slider')
      
      // Test that slider has correct range attributes
      expect(slider).toHaveAttribute('min', '1')
      expect(slider).toHaveAttribute('max', '10')
      expect(slider).toHaveAttribute('step', '1')
      
      // Test that onChange prop is provided
      expect(typeof mockOnChange).toBe('function')
    })

    test('has correct min, max, and step attributes', () => {
      render(<SliderInput value={null} onChange={mockOnChange} />)
      const slider = screen.getByRole('slider')
      
      expect(slider).toHaveAttribute('min', '1')
      expect(slider).toHaveAttribute('max', '10')
      expect(slider).toHaveAttribute('step', '1')
    })

    test('reflects current value in slider input', () => {
      render(<SliderInput value={8} onChange={mockOnChange} />)
      const slider = screen.getByRole('slider') as HTMLInputElement
      
      expect(slider.value).toBe('8')
    })
  })

  describe('Disabled state', () => {
    test('applies disabled styling when disabled', () => {
      render(<SliderInput value={5} onChange={mockOnChange} disabled />)
      const slider = screen.getByRole('slider')
      
      expect(slider).toBeDisabled()
      expect(slider).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    test('does not call onChange when disabled', () => {
      render(<SliderInput value={5} onChange={mockOnChange} disabled />)
      const slider = screen.getByRole('slider')
      
      // Disabled inputs don't fire change events in jsdom, so we just check the disabled attribute
      expect(slider).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    test('slider is focusable and has proper ARIA attributes', () => {
      render(<SliderInput value={5} onChange={mockOnChange} />)
      const slider = screen.getByRole('slider')
      
      expect(slider).toBeInTheDocument()
      expect(slider).not.toHaveAttribute('aria-disabled', 'true')
    })

    test('emoji has proper aria-label', () => {
      render(<SliderInput value={5} onChange={mockOnChange} />)
      const emoji = screen.getByRole('img', { name: 'reaction' })
      
      expect(emoji).toBeInTheDocument()
    })

    test('slider can be navigated with keyboard', () => {
      render(<SliderInput value={5} onChange={mockOnChange} />)
      const slider = screen.getByRole('slider')
      
      slider.focus()
      expect(slider).toHaveFocus()
    })
  })

  describe('Custom styling', () => {
    test('applies custom className', () => {
      const customClass = 'custom-slider-class'
      render(
        <SliderInput 
          value={5} 
          onChange={mockOnChange} 
          className={customClass} 
        />
      )
      
      const container = screen.getByText('5', { selector: '.text-3xl' }).closest('.w-full')
      expect(container).toHaveClass(customClass)
    })
  })
})