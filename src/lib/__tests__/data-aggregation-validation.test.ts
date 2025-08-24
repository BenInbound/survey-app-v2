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

describe('Data Aggregation Validation', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('Department Data Aggregation', () => {
    it('should correctly aggregate responses by department and category', () => {
      const assessment = createDemoAssessment()
      
      expect(assessment).toBeTruthy()
      expect(assessment!.departmentData).toBeDefined()
      expect(assessment!.departmentData.length).toBe(4)

      // Validate each department has proper data
      const departments = ['engineering', 'sales', 'marketing', 'operations']
      departments.forEach(deptId => {
        const deptData = assessment!.departmentData.find(d => d.department === deptId)
        expect(deptData).toBeTruthy()
        
        // Should have category averages for both management and employees
        expect(deptData!.managementResponses.categoryAverages.length).toBeGreaterThan(0)
        expect(deptData!.employeeResponses.categoryAverages.length).toBeGreaterThan(0)
        
        // Should have response counts
        expect(deptData!.responseCount.management).toBeGreaterThan(0)
        expect(deptData!.responseCount.employee).toBeGreaterThan(0)
        
        // Should have perception gaps
        expect(deptData!.perceptionGaps).toBeDefined()
        expect(deptData!.perceptionGaps.length).toBeGreaterThan(0)
      })
    })

    it('should show Engineering as best performing department', () => {
      const assessment = createDemoAssessment()
      
      const engineering = assessment!.departmentData.find(d => d.department === 'engineering')
      const operations = assessment!.departmentData.find(d => d.department === 'operations')
      
      expect(engineering).toBeTruthy()
      expect(operations).toBeTruthy()
      
      // Engineering should have higher overall scores than Operations
      expect(engineering!.managementResponses.overallAverage).toBeGreaterThan(
        operations!.managementResponses.overallAverage
      )
      expect(engineering!.employeeResponses.overallAverage).toBeGreaterThan(
        operations!.employeeResponses.overallAverage
      )
    })

    it('should show Operations as having critical perception gaps', () => {
      const assessment = createDemoAssessment()
      
      const operations = assessment!.departmentData.find(d => d.department === 'operations')
      expect(operations).toBeTruthy()
      
      // Operations should have significant gaps
      const criticalGaps = operations!.perceptionGaps.filter(gap => gap.significance === 'high')
      expect(criticalGaps.length).toBeGreaterThan(2)
      
      // Should have large overall gap
      const overallGap = Math.abs(
        operations!.managementResponses.overallAverage - 
        operations!.employeeResponses.overallAverage
      )
      expect(overallGap).toBeGreaterThan(2)
    })

    it('should categorize responses correctly', () => {
      const assessment = createDemoAssessment()
      
      // Check that all departments have consistent categories
      const allCategories = new Set<string>()
      assessment!.departmentData.forEach(dept => {
        dept.managementResponses.categoryAverages.forEach(cat => {
          allCategories.add(cat.category)
        })
        dept.employeeResponses.categoryAverages.forEach(cat => {
          allCategories.add(cat.category)
        })
      })
      
      // Should have the expected categories from the Strategic Alignment template
      const expectedCategories = [
        'Vision & Strategy', 'Leadership & Culture', 
        'Operations & Performance', 'Innovation & Agility'
      ]
      
      expectedCategories.forEach(category => {
        expect(allCategories.has(category)).toBe(true)
      })
    })

    it('should calculate perception gap directions correctly', () => {
      const assessment = createDemoAssessment()
      
      const operations = assessment!.departmentData.find(d => d.department === 'operations')
      expect(operations).toBeTruthy()
      
      // Operations should have positive gaps (management overconfidence)
      const positiveGaps = operations!.perceptionGaps.filter(gap => gap.gapDirection === 'positive')
      expect(positiveGaps.length).toBeGreaterThan(0)
      
      // Verify gap calculation logic
      positiveGaps.forEach(gap => {
        expect(gap.managementScore).toBeGreaterThan(gap.employeeScore)
        expect(gap.gap).toBeGreaterThan(0)
      })
    })

    it('should aggregate overall organization data correctly', () => {
      const assessment = createDemoAssessment()
      
      // Overall counts should match sum of department counts
      const totalMgmtFromDepts = assessment!.departmentData.reduce(
        (sum, dept) => sum + dept.responseCount.management, 0
      )
      const totalEmpFromDepts = assessment!.departmentData.reduce(
        (sum, dept) => sum + dept.responseCount.employee, 0
      )
      
      expect(assessment!.responseCount.management).toBe(totalMgmtFromDepts)
      expect(assessment!.responseCount.employee).toBe(totalEmpFromDepts)
      
      // Should have both management and employee responses
      expect(assessment!.responseCount.management).toBeGreaterThan(0)
      expect(assessment!.responseCount.employee).toBeGreaterThan(0)
    })
  })

  describe('Question Category Mapping', () => {
    it('should use assessment-specific questions for category mapping', () => {
      const assessment = createDemoAssessment()
      const assessmentManager = new OrganizationalAssessmentManager()
      
      // Get the assessment questions
      const questions = assessmentManager.getAssessmentQuestions('demo-org')
      expect(questions.length).toBeGreaterThan(0)
      
      // Verify that categories in aggregated data match question categories
      assessment!.departmentData.forEach(dept => {
        dept.managementResponses.categoryAverages.forEach(catAvg => {
          const questionWithCategory = questions.find(q => q.category === catAvg.category)
          expect(questionWithCategory).toBeTruthy()
        })
      })
    })

    it('should handle all question categories from demo data', () => {
      const assessment = createDemoAssessment()
      
      // All departments should have data for each category
      const expectedQuestionIds = [
        'vision-clarity', 'strategy-execution', 'leadership-alignment',
        'stakeholder-buyin', 'strategic-communication', 'resource-allocation',
        'strategic-metrics', 'strategic-agility'
      ]
      
      assessment!.departmentData.forEach(dept => {
        // Should have 4 categories (Strategic Alignment template categories)
        expect(dept.managementResponses.categoryAverages.length).toBe(4)
        expect(dept.employeeResponses.categoryAverages.length).toBe(4)
      })
    })
  })
})