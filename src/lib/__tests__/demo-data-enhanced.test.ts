/**
 * @jest-environment jsdom
 */

import { createDemoAssessment, restoreDemoAssessment } from '../demo-data'
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

describe('Enhanced Demo Data', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('createDemoAssessment', () => {
    it('should create demo assessment with proper department structure', () => {
      const assessment = createDemoAssessment()
      
      expect(assessment).toBeTruthy()
      expect(assessment!.id).toBe('demo-org')
      expect(assessment!.organizationName).toBe('Demo Organization')
      expect(assessment!.consultantId).toBe('demo@consultant.com')
      expect(assessment!.accessCode).toBe('DEMO-2025-STRATEGY')
    })

    it('should create all four departments with proper configuration', () => {
      const assessment = createDemoAssessment()
      
      expect(assessment!.departments).toHaveLength(4)
      
      const departmentNames = assessment!.departments.map(d => d.name)
      expect(departmentNames).toEqual(['Engineering', 'Sales', 'Marketing', 'Operations'])
      
      // Check department IDs
      const departmentIds = assessment!.departments.map(d => d.id)
      expect(departmentIds).toEqual(['engineering', 'sales', 'marketing', 'operations'])
      
      // Check access codes are generated
      assessment!.departments.forEach(dept => {
        expect(dept.managementCode).toMatch(/^DEMOORGA-MGMT-/)
        expect(dept.employeeCode).toMatch(/^DEMOORGA-EMP-/)
      })
    })

    it('should populate realistic response data across all departments', () => {
      const assessment = createDemoAssessment()
      const assessmentManager = new OrganizationalAssessmentManager()
      
      // Check that responses exist for all departments
      const allResponses = assessmentManager.getParticipantResponses('demo-org')
      const demoResponses = allResponses
      
      expect(demoResponses.length).toBeGreaterThan(0)
      
      // Check we have responses for all 4 departments
      const responsesByDept = demoResponses.reduce((acc, response) => {
        if (!acc[response.department]) {
          acc[response.department] = { management: 0, employee: 0 }
        }
        acc[response.department][response.role]++
        return acc
      }, {} as Record<string, { management: number, employee: number }>)
      
      expect(Object.keys(responsesByDept)).toEqual(['engineering', 'sales', 'marketing', 'operations'])
      
      // Each department should have both management and employee responses
      Object.values(responsesByDept).forEach(counts => {
        expect(counts.management).toBeGreaterThan(0)
        expect(counts.employee).toBeGreaterThan(0)
      })
    })

    it('should create department data with proper aggregation', () => {
      const assessment = createDemoAssessment()
      
      expect(assessment!.departmentData).toBeDefined()
      expect(assessment!.departmentData.length).toBeGreaterThan(0)
      
      // Check each department has aggregated data
      assessment!.departmentData.forEach(deptData => {
        expect(deptData.department).toBeTruthy()
        expect(deptData.departmentName).toBeTruthy()
        expect(deptData.managementResponses).toBeDefined()
        expect(deptData.employeeResponses).toBeDefined()
        expect(deptData.responseCount).toBeDefined()
        expect(deptData.perceptionGaps).toBeDefined()
        
        // Should have some category averages
        expect(deptData.managementResponses.categoryAverages.length).toBeGreaterThan(0)
        expect(deptData.employeeResponses.categoryAverages.length).toBeGreaterThan(0)
      })
    })

    it('should create varying performance levels across departments', () => {
      const assessment = createDemoAssessment()
      
      // Engineering should be the best performing (scores around 7-8)
      const engineering = assessment!.departmentData.find(d => d.department === 'engineering')
      expect(engineering).toBeTruthy()
      expect(engineering!.managementResponses.overallAverage).toBeGreaterThan(7)
      expect(engineering!.employeeResponses.overallAverage).toBeGreaterThan(6.5)
      
      // Operations should be the worst performing (scores around 3-6)  
      const operations = assessment!.departmentData.find(d => d.department === 'operations')
      expect(operations).toBeTruthy()
      expect(operations!.managementResponses.overallAverage).toBeLessThan(7)
      expect(operations!.employeeResponses.overallAverage).toBeLessThan(4)
      
      // Operations should have significant perception gaps
      const opsGaps = operations!.perceptionGaps.filter(gap => gap.significance === 'high')
      expect(opsGaps.length).toBeGreaterThan(0)
    })

    it('should return existing assessment if already created', () => {
      const assessment1 = createDemoAssessment()
      const assessment2 = createDemoAssessment()
      
      expect(assessment1!.id).toBe(assessment2!.id)
      expect(assessment1!.created.getTime()).toBe(assessment2!.created.getTime())
    })

    it('should not recreate if demo was deleted', () => {
      localStorageMock.setItem('demo-assessment-deleted', 'true')
      
      const assessment = createDemoAssessment()
      
      expect(assessment).toBeNull()
    })

    it('should aggregate overall response counts correctly', () => {
      const assessment = createDemoAssessment()
      
      // Should have management and employee response counts
      expect(assessment!.responseCount.management).toBeGreaterThan(0)
      expect(assessment!.responseCount.employee).toBeGreaterThan(0)
      
      // Counts should match the department data
      const totalMgmtFromDepts = assessment!.departmentData.reduce(
        (sum, dept) => sum + dept.responseCount.management, 0
      )
      const totalEmpFromDepts = assessment!.departmentData.reduce(
        (sum, dept) => sum + dept.responseCount.employee, 0
      )
      
      expect(assessment!.responseCount.management).toBe(totalMgmtFromDepts)
      expect(assessment!.responseCount.employee).toBe(totalEmpFromDepts)
    })
  })

  describe('restoreDemoAssessment', () => {
    it('should remove deletion flag and recreate demo', () => {
      // Mark demo as deleted
      localStorageMock.setItem('demo-assessment-deleted', 'true')
      
      // Restore should work
      const assessment = restoreDemoAssessment()
      
      expect(assessment).toBeTruthy()
      expect(assessment!.id).toBe('demo-org')
      expect(localStorageMock.getItem('demo-assessment-deleted')).toBeNull()
    })
  })

  describe('Consultant Story Validation', () => {
    it('should create realistic consultant scenario', () => {
      const assessment = createDemoAssessment()
      
      // Consultant should see clear department hierarchy
      const deptScores = assessment!.departmentData.map(dept => ({
        name: dept.departmentName,
        score: (dept.managementResponses.overallAverage + dept.employeeResponses.overallAverage) / 2,
        gap: Math.abs(dept.managementResponses.overallAverage - dept.employeeResponses.overallAverage),
        criticalGaps: dept.perceptionGaps.filter(g => g.significance === 'high').length
      })).sort((a, b) => b.score - a.score)
      
      // Should have clear best and worst performers
      expect(deptScores[0].name).toBe('Engineering') // Best
      expect(deptScores[deptScores.length - 1].name).toBe('Operations') // Worst
      
      // Should have varying gap levels
      const hasLowGaps = deptScores.some(d => d.gap < 1)
      const hasHighGaps = deptScores.some(d => d.gap > 2)
      expect(hasLowGaps).toBe(true)
      expect(hasHighGaps).toBe(true)
      
      // Should have some departments with critical issues
      const hasCriticalIssues = deptScores.some(d => d.criticalGaps > 0)
      expect(hasCriticalIssues).toBe(true)
    })
  })
})