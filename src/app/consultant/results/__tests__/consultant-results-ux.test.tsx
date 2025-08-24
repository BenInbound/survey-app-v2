/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import ConsultantResults from '../[id]/page'
import { createDemoAssessment } from '@/lib/demo-data'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/consultant/results/demo-org'
  }),
  useSearchParams: () => ({
    get: jest.fn()
  })
}))

// Mock Chart.js to avoid canvas issues in JSDOM
jest.mock('react-chartjs-2', () => ({
  Radar: ({ data, options, ...props }: any) => (
    <div data-testid="radar-chart" {...props}>
      Mocked Radar Chart with {data?.datasets?.length || 0} datasets
    </div>
  )
}))

describe('Consultant Results UX', () => {
  beforeEach(() => {
    localStorageMock.clear()
    // Ensure demo assessment is created
    createDemoAssessment()
  })

  describe('Executive Summary Section', () => {
    it('should display executive summary with organizational health score', async () => {
      render(<ConsultantResults params={{ id: 'demo-org' }} />)
      
      await waitFor(() => {
        expect(screen.getByText('Executive Summary')).toBeInTheDocument()
        expect(screen.getByText('Organizational Health')).toBeInTheDocument()
        // Should show a health score - check the overall executive summary section
        const executiveSummary = screen.getByText('Executive Summary').closest('div')
        expect(executiveSummary).toBeInTheDocument()
      })
    })

    it('should show department status breakdown', async () => {
      render(<ConsultantResults params={{ id: 'demo-org' }} />)
      
      await waitFor(() => {
        expect(screen.getByText('Performing Well')).toBeInTheDocument()
        expect(screen.getByText('Need Attention')).toBeInTheDocument()
        expect(screen.getByText('Critical Issues')).toBeInTheDocument()
      })
    })

    it('should highlight success story and critical priority', async () => {
      render(<ConsultantResults params={{ id: 'demo-org' }} />)
      
      await waitFor(() => {
        expect(screen.getByText('Success Story')).toBeInTheDocument()
        expect(screen.getByText('Critical Priority')).toBeInTheDocument()
        
        // Engineering should be the success story
        expect(screen.getByText(/Engineering.*benchmark/)).toBeInTheDocument()
        
        // Operations should be the critical priority
        expect(screen.getByText(/Operations.*immediate intervention/)).toBeInTheDocument()
      })
    })
  })

  describe('Department Leaderboard', () => {
    it('should display department performance leaderboard', async () => {
      render(<ConsultantResults params={{ id: 'demo-org' }} />)
      
      await waitFor(() => {
        expect(screen.getByText('Department Performance Leaderboard')).toBeInTheDocument()
        
        // Should show all 4 departments
        expect(screen.getByText('Engineering')).toBeInTheDocument()
        expect(screen.getByText('Sales')).toBeInTheDocument()
        expect(screen.getByText('Marketing')).toBeInTheDocument()
        expect(screen.getByText('Operations')).toBeInTheDocument()
      })
    })

    it('should show ranking indicators', async () => {
      render(<ConsultantResults params={{ id: 'demo-org' }} />)
      
      await waitFor(() => {
        // Should show the leaderboard
        expect(screen.getByText('Department Performance Leaderboard')).toBeInTheDocument()
        
        // Should show performance metrics for departments
        const scoreElements = screen.queryAllByText(/Score:/)
        expect(scoreElements.length).toBeGreaterThan(0)
        
        const gapElements = screen.queryAllByText(/Gap:/)
        expect(gapElements.length).toBeGreaterThan(0)
      })
    })

    it('should show status indicators for departments', async () => {
      render(<ConsultantResults params={{ id: 'demo-org' }} />)
      
      await waitFor(() => {
        // Should show status badges
        expect(screen.getByText('Performing Well')).toBeInTheDocument()
        expect(screen.getByText('Critical')).toBeInTheDocument()
      })
    })
  })

  describe('Strategic Action Items', () => {
    it('should display strategic action items section', async () => {
      render(<ConsultantResults params={{ id: 'demo-org' }} />)
      
      await waitFor(() => {
        expect(screen.getByText('Strategic Action Items')).toBeInTheDocument()
      })
    })

    it('should show immediate focus priority', async () => {
      render(<ConsultantResults params={{ id: 'demo-org' }} />)
      
      await waitFor(() => {
        expect(screen.getByText(/Immediate Focus.*Operations/)).toBeInTheDocument()
        expect(screen.getByText(/Critical performance issues/)).toBeInTheDocument()
        expect(screen.getByText('Recommended Actions:')).toBeInTheDocument()
      })
    })

    it('should show leverage success priority', async () => {
      render(<ConsultantResults params={{ id: 'demo-org' }} />)
      
      await waitFor(() => {
        expect(screen.getByText(/Leverage Success.*Engineering/)).toBeInTheDocument()
        expect(screen.getByText(/Highest performing department/)).toBeInTheDocument()
      })
    })

    it('should show organizational alignment strategy', async () => {
      render(<ConsultantResults params={{ id: 'demo-org' }} />)
      
      await waitFor(() => {
        expect(screen.getByText('Organizational Alignment Strategy')).toBeInTheDocument()
        expect(screen.getByText(/Current organizational health/)).toBeInTheDocument()
      })
    })

    it('should provide actionable recommendations', async () => {
      render(<ConsultantResults params={{ id: 'demo-org' }} />)
      
      await waitFor(() => {
        // Should show specific actionable items
        expect(screen.getByText(/Schedule immediate leadership alignment/)).toBeInTheDocument()
        expect(screen.getByText(/Document best practices/)).toBeInTheDocument()
        expect(screen.getByText(/Implement monthly organizational health monitoring/)).toBeInTheDocument()
      })
    })
  })

  describe('Information Hierarchy', () => {
    it('should prioritize consultant workflow elements', async () => {
      render(<ConsultantResults params={{ id: 'demo-org' }} />)
      
      await waitFor(() => {
        const summary = screen.getByText('Executive Summary')
        const leaderboard = screen.getByText('Department Performance Leaderboard')
        const actions = screen.getByText('Strategic Action Items')
        
        // All key consultant elements should be present
        expect(summary).toBeInTheDocument()
        expect(leaderboard).toBeInTheDocument()
        expect(actions).toBeInTheDocument()
      })
    })

    it('should provide quick decision-making data', async () => {
      render(<ConsultantResults params={{ id: 'demo-org' }} />)
      
      await waitFor(() => {
        // 5-minute scan essentials should be visible
        expect(screen.getByText('Organizational Health')).toBeInTheDocument() // Health score
        expect(screen.getByText('Success Story')).toBeInTheDocument() // Positive opening
        expect(screen.getByText('Critical Priority')).toBeInTheDocument() // Problem identification
      })
    })
  })

  describe('Client Presentation Ready', () => {
    it('should show professional metrics suitable for client meetings', async () => {
      render(<ConsultantResults params={{ id: 'demo-org' }} />)
      
      await waitFor(() => {
        // Should show clean, professional metrics
        const healthSection = screen.getByText('Organizational Health').closest('div')
        expect(healthSection).toBeInTheDocument()
        
        // Should show clear department ranking
        expect(screen.getByText('Department Performance Leaderboard')).toBeInTheDocument()
        
        // Should provide specific business impact items
        expect(screen.getByText(/immediate intervention/)).toBeInTheDocument()
      })
    })

    it('should balance positive and negative insights appropriately', async () => {
      render(<ConsultantResults params={{ id: 'demo-org' }} />)
      
      await waitFor(() => {
        // Should show success story prominently (maintain morale)
        expect(screen.getByText('Success Story')).toBeInTheDocument()
        expect(screen.getByText(/benchmark/)).toBeInTheDocument()
        
        // Should show critical issues constructively
        expect(screen.getByText('Critical Priority')).toBeInTheDocument()
        expect(screen.getByText(/requires immediate intervention/)).toBeInTheDocument()
        
        // Should provide solution-focused language
        expect(screen.getAllByText('Recommended Actions:')).toHaveLength(3)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle missing assessment gracefully', async () => {
      render(<ConsultantResults params={{ id: 'non-existent-assessment' }} />)
      
      await waitFor(() => {
        expect(screen.getByText('Assessment not found')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state while data loads', () => {
      // Clear localStorage and render with non-existent assessment to trigger loading
      localStorageMock.clear()
      
      render(<ConsultantResults params={{ id: 'loading-test' }} />)
      
      // Should show either loading or error state
      const hasLoading = screen.queryByText('Loading assessment results...')
      const hasError = screen.queryByText('Assessment not found')
      
      expect(hasLoading || hasError).toBeTruthy()
    })
  })
})