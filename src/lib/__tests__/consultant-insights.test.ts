/**
 * @jest-environment jsdom
 */

import { createDemoAssessment } from '../demo-data'
import { OrganizationalAssessmentManager } from '../organizational-assessment-manager'

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

// Helper function to replicate consultant insights logic from the component
const generateConsultantInsights = (assessment: any) => {
  if (!assessment.departmentData || assessment.departmentData.length === 0) {
    return null
  }

  // Calculate department performance ranking
  const departmentRanking = assessment.departmentData
    .map((dept: any) => {
      const overallScore = (dept.managementResponses.overallAverage + dept.employeeResponses.overallAverage) / 2
      const alignmentGap = Math.abs(dept.managementResponses.overallAverage - dept.employeeResponses.overallAverage)
      const criticalGaps = dept.perceptionGaps.filter((gap: any) => gap.significance === 'high').length
      
      return {
        department: dept.department,
        departmentName: dept.departmentName,
        overallScore,
        alignmentGap,
        criticalGaps,
        status: criticalGaps > 2 || overallScore < 6 ? 'critical' : 
               criticalGaps > 0 || alignmentGap > 1.5 ? 'needs-attention' : 'performing-well'
      }
    })
    .sort((a: any, b: any) => b.overallScore - a.overallScore)

  // Calculate organizational health score
  const organizationalHealth = Math.round(
    departmentRanking.reduce((sum: number, dept: any) => sum + dept.overallScore, 0) / departmentRanking.length
  )

  // Identify success story and critical priority
  const successStory = departmentRanking.find((d: any) => d.status === 'performing-well') || departmentRanking[0]
  const criticalPriority = departmentRanking.find((d: any) => d.status === 'critical')
  
  // Count issues
  const criticalDepartments = departmentRanking.filter((d: any) => d.status === 'critical').length
  const needsAttentionDepartments = departmentRanking.filter((d: any) => d.status === 'needs-attention').length

  return {
    departmentRanking,
    organizationalHealth,
    successStory,
    criticalPriority,
    criticalDepartments,
    needsAttentionDepartments,
    totalDepartments: departmentRanking.length
  }
}

describe('Consultant Insights Generation', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('generateConsultantInsights', () => {
    it('should generate complete consultant insights from demo data', () => {
      const assessment = createDemoAssessment()
      expect(assessment).toBeTruthy()
      
      const insights = generateConsultantInsights(assessment!)
      expect(insights).toBeTruthy()
      expect(insights!.departmentRanking).toHaveLength(4)
      expect(insights!.organizationalHealth).toBeGreaterThan(0)
      expect(insights!.organizationalHealth).toBeLessThanOrEqual(10)
      expect(insights!.totalDepartments).toBe(4)
    })

    it('should rank departments by performance correctly', () => {
      const assessment = createDemoAssessment()
      const insights = generateConsultantInsights(assessment!)
      
      // Engineering should be first (best performing)
      expect(insights!.departmentRanking[0].department).toBe('engineering')
      expect(insights!.departmentRanking[0].departmentName).toBe('Engineering')
      
      // Operations should be last (worst performing)  
      const lastIndex = insights!.departmentRanking.length - 1
      expect(insights!.departmentRanking[lastIndex].department).toBe('operations')
      expect(insights!.departmentRanking[lastIndex].departmentName).toBe('Operations')
    })

    it('should identify success story correctly', () => {
      const assessment = createDemoAssessment()
      const insights = generateConsultantInsights(assessment!)
      
      expect(insights!.successStory).toBeTruthy()
      // Engineering should be the success story (performing well)
      expect(insights!.successStory!.department).toBe('engineering')
      expect(insights!.successStory!.status).toBe('performing-well')
      expect(insights!.successStory!.overallScore).toBeGreaterThan(7)
    })

    it('should identify critical priority correctly', () => {
      const assessment = createDemoAssessment()
      const insights = generateConsultantInsights(assessment!)
      
      expect(insights!.criticalPriority).toBeTruthy()
      // Operations should be the critical priority
      expect(insights!.criticalPriority!.department).toBe('operations')
      expect(insights!.criticalPriority!.status).toBe('critical')
      expect(insights!.criticalPriority!.overallScore).toBeLessThan(6)
      expect(insights!.criticalPriority!.criticalGaps).toBeGreaterThan(0)
    })

    it('should calculate organizational health score', () => {
      const assessment = createDemoAssessment()
      const insights = generateConsultantInsights(assessment!)
      
      // Should be between 1-10 and reasonable given our demo data
      expect(insights!.organizationalHealth).toBeGreaterThan(5)
      expect(insights!.organizationalHealth).toBeLessThan(9)
      
      // Should be an integer (rounded)
      expect(Number.isInteger(insights!.organizationalHealth)).toBe(true)
    })

    it('should categorize departments by status correctly', () => {
      const assessment = createDemoAssessment()
      const insights = generateConsultantInsights(assessment!)
      
      // Should have at least one performing well (Engineering)
      const performingWell = insights!.departmentRanking.filter(d => d.status === 'performing-well')
      expect(performingWell.length).toBeGreaterThan(0)
      
      // Should have at least one critical (Operations)
      const critical = insights!.departmentRanking.filter(d => d.status === 'critical')
      expect(critical.length).toBeGreaterThan(0)
      
      // Status counts should match
      expect(insights!.criticalDepartments).toBe(critical.length)
    })

    it('should handle edge cases gracefully', () => {
      // Test with assessment without department data
      const emptyAssessment = { departmentData: [] }
      const insights = generateConsultantInsights(emptyAssessment)
      expect(insights).toBeNull()
      
      // Test with assessment without department data property
      const noDataAssessment = {}
      const insightsNone = generateConsultantInsights(noDataAssessment)
      expect(insightsNone).toBeNull()
    })

    it('should provide actionable consultant metrics', () => {
      const assessment = createDemoAssessment()
      const insights = generateConsultantInsights(assessment!)
      
      // Should provide clear counts for consultant decision making
      const totalCounted = insights!.criticalDepartments + 
                          insights!.needsAttentionDepartments + 
                          (insights!.totalDepartments - insights!.criticalDepartments - insights!.needsAttentionDepartments)
      
      expect(totalCounted).toBe(insights!.totalDepartments)
      expect(totalCounted).toBe(4) // Our demo has 4 departments
    })
  })

  describe('Consultant Workflow Integration', () => {
    it('should provide data for 5-minute consultant scan', () => {
      const assessment = createDemoAssessment()
      const insights = generateConsultantInsights(assessment!)
      
      // Quick scan essentials
      expect(insights!.organizationalHealth).toBeDefined() // Overall health
      expect(insights!.successStory).toBeDefined() // Success story for positive opening
      expect(insights!.criticalPriority).toBeDefined() // Problem children identification
      expect(insights!.departmentRanking.length).toBe(4) // Clear ranking
    })

    it('should provide data for client presentation', () => {
      const assessment = createDemoAssessment()
      const insights = generateConsultantInsights(assessment!)
      
      // Client presentation essentials
      expect(insights!.organizationalHealth).toBeGreaterThan(0) // Executive summary number
      expect(insights!.successStory!.overallScore).toBeGreaterThan(insights!.criticalPriority!.overallScore) // Clear contrast
      expect(insights!.departmentRanking[0].overallScore).toBeGreaterThan(insights!.departmentRanking[3].overallScore) // Rankings make sense
    })

    it('should support follow-up planning workflow', () => {
      const assessment = createDemoAssessment()
      const insights = generateConsultantInsights(assessment!)
      
      // Each department should have measurable metrics for follow-up
      insights!.departmentRanking.forEach(dept => {
        expect(dept.overallScore).toBeGreaterThan(0)
        expect(dept.alignmentGap).toBeGreaterThanOrEqual(0)
        expect(dept.criticalGaps).toBeGreaterThanOrEqual(0)
        expect(['critical', 'needs-attention', 'performing-well']).toContain(dept.status)
      })
    })
  })

  describe('Demo Data Validation for Consultant Use', () => {
    it('should create realistic performance distribution', () => {
      const assessment = createDemoAssessment()
      const insights = generateConsultantInsights(assessment!)
      
      const scores = insights!.departmentRanking.map(d => d.overallScore)
      
      // Should have meaningful spread (not all the same)
      const minScore = Math.min(...scores)
      const maxScore = Math.max(...scores)
      expect(maxScore - minScore).toBeGreaterThan(2) // At least 2 point spread
      
      // Should have realistic consultant scenario
      expect(maxScore).toBeLessThan(9) // No perfect departments
      expect(minScore).toBeLessThan(6) // At least one problem department
    })

    it('should provide clear success story vs critical priority contrast', () => {
      const assessment = createDemoAssessment()
      const insights = generateConsultantInsights(assessment!)
      
      const successScore = insights!.successStory!.overallScore
      const criticalScore = insights!.criticalPriority!.overallScore
      
      // Clear performance gap for consultant storytelling
      expect(successScore - criticalScore).toBeGreaterThan(2)
      
      // Meaningful alignment gap differences
      expect(insights!.criticalPriority!.alignmentGap).toBeGreaterThan(insights!.successStory!.alignmentGap)
    })
  })
})