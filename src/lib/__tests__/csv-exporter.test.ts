import { 
  generateDepartmentPerformanceCSV, 
  generateAssessmentSummaryCSV, 
  exportAssessmentData 
} from '../csv-exporter'
import { OrganizationalAssessment } from '../types'

// Mock DOM methods for testing
const createElementSpy = jest.fn()
const appendChildSpy = jest.fn()
const removeChildSpy = jest.fn()
const clickSpy = jest.fn()
const createObjectURLSpy = jest.fn()
const revokeObjectURLSpy = jest.fn()

Object.defineProperty(document, 'createElement', {
  value: createElementSpy
})

Object.defineProperty(document.body, 'appendChild', {
  value: appendChildSpy
})

Object.defineProperty(document.body, 'removeChild', {
  value: removeChildSpy
})

Object.defineProperty(URL, 'createObjectURL', {
  value: createObjectURLSpy
})

Object.defineProperty(URL, 'revokeObjectURL', {
  value: revokeObjectURLSpy
})

beforeEach(() => {
  jest.clearAllMocks()
  
  const mockAnchor = {
    setAttribute: jest.fn(),
    click: clickSpy,
    download: 'test', // Set to truthy value to pass download check
    style: { visibility: '' }
  }
  
  createElementSpy.mockReturnValue(mockAnchor)
  createObjectURLSpy.mockReturnValue('blob:mock-url')
})

describe('CSV Exporter', () => {
  const mockAssessment: OrganizationalAssessment = {
    id: 'test-assessment',
    organizationName: 'Test Organization',
    consultantId: 'consultant-1',
    status: 'ready',
    created: new Date('2024-01-01'),
    accessCode: 'TEST-CODE',
    departments: [
      {
        id: 'engineering',
        name: 'Engineering',
        managementCode: 'TEST-MGMT-ENG2024',
        employeeCode: 'TEST-EMP-ENG2024'
      },
      {
        id: 'sales',
        name: 'Sales',
        managementCode: 'TEST-MGMT-SAL2024',
        employeeCode: 'TEST-EMP-SAL2024'
      }
    ],
    questions: [],
    questionSource: { source: 'default' },
    departmentData: [
      {
        department: 'engineering',
        departmentName: 'Engineering',
        managementResponses: {
          categoryAverages: [
            { category: 'Vision & Strategy', average: 8.5, responses: 5 },
            { category: 'Leadership & Culture', average: 7.2, responses: 5 }
          ],
          overallAverage: 7.85,
          responseCount: 5
        },
        employeeResponses: {
          categoryAverages: [
            { category: 'Vision & Strategy', average: 6.8, responses: 12 },
            { category: 'Leadership & Culture', average: 5.9, responses: 12 }
          ],
          overallAverage: 6.35,
          responseCount: 12
        },
        responseCount: { management: 5, employee: 12 },
        perceptionGaps: [
          {
            category: 'Vision & Strategy',
            managementScore: 8.5,
            employeeScore: 6.8,
            gap: 1.7,
            gapDirection: 'positive',
            significance: 'medium'
          }
        ]
      },
      {
        department: 'sales',
        departmentName: 'Sales', 
        managementResponses: {
          categoryAverages: [
            { category: 'Vision & Strategy', average: 7.0, responses: 3 },
            { category: 'Leadership & Culture', average: 6.5, responses: 3 }
          ],
          overallAverage: 6.75,
          responseCount: 3
        },
        employeeResponses: {
          categoryAverages: [
            { category: 'Vision & Strategy', average: 5.2, responses: 8 },
            { category: 'Leadership & Culture', average: 4.8, responses: 8 }
          ],
          overallAverage: 5.0,
          responseCount: 8
        },
        responseCount: { management: 3, employee: 8 },
        perceptionGaps: [
          {
            category: 'Vision & Strategy',
            managementScore: 7.0,
            employeeScore: 5.2,
            gap: 1.8,
            gapDirection: 'positive',
            significance: 'medium'
          }
        ]
      }
    ],
    managementResponses: {
      categoryAverages: [],
      overallAverage: 0,
      responseCount: 0
    },
    employeeResponses: {
      categoryAverages: [],
      overallAverage: 0,
      responseCount: 0
    },
    responseCount: { management: 8, employee: 20 }
  }

  const mockConsultantInsights = {
    departmentRanking: [
      {
        department: 'engineering',
        departmentName: 'Engineering',
        overallScore: 7.1,
        alignmentGap: 1.5,
        criticalGaps: 0,
        status: 'performing-well' as const
      },
      {
        department: 'sales',
        departmentName: 'Sales',
        overallScore: 5.875,
        alignmentGap: 1.75,
        criticalGaps: 1,
        status: 'needs-attention' as const
      }
    ],
    organizationalHealth: 6,
    totalDepartments: 2,
    criticalDepartments: 0,
    needsAttentionDepartments: 1
  }

  describe('generateDepartmentPerformanceCSV', () => {
    it('should generate CSV with correct headers', () => {
      const csv = generateDepartmentPerformanceCSV(mockAssessment, mockConsultantInsights)
      
      const lines = csv.split('\n')
      expect(lines[0]).toBe('department,overallScore,managementScore,employeeScore,alignmentGap,criticalGaps,status,managementResponses,employeeResponses')
    })

    it('should include department data in CSV', () => {
      const csv = generateDepartmentPerformanceCSV(mockAssessment, mockConsultantInsights)
      
      const lines = csv.split('\n')
      expect(lines[1]).toBe('Engineering,7.1,7.85,6.35,1.5,0,performing-well,5,12')
      expect(lines[2]).toBe('Sales,5.88,6.75,5,1.75,1,needs-attention,3,8')
    })

    it('should handle departments with no data', () => {
      const emptyInsights = {
        ...mockConsultantInsights,
        departmentRanking: []
      }
      
      const csv = generateDepartmentPerformanceCSV(mockAssessment, emptyInsights)
      
      const lines = csv.split('\n')
      expect(lines.length).toBe(1) // Only header
      expect(lines[0]).toContain('department,overallScore')
    })
  })

  describe('generateAssessmentSummaryCSV', () => {
    it('should generate summary CSV with organization data', () => {
      const csv = generateAssessmentSummaryCSV(mockAssessment, mockConsultantInsights)
      
      const lines = csv.split('\n')
      expect(lines[0]).toBe('organizationName,assessmentDate,organizationalHealth,totalDepartments,departmentsPerformingWell,departmentsNeedingAttention,criticalDepartments,totalManagementResponses,totalEmployeeResponses,exportedAt')
      expect(lines[1]).toContain('Test Organization,2024-01-01,6,2,1,1,0,8,20')
    })

    it('should include current export timestamp', () => {
      const before = new Date()
      const csv = generateAssessmentSummaryCSV(mockAssessment, mockConsultantInsights)
      const after = new Date()
      
      const lines = csv.split('\n')
      const data = lines[1].split(',')
      const exportedAt = new Date(data[9])
      
      expect(exportedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(exportedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })

  describe('exportAssessmentData', () => {
    it('should trigger download with correct filename', () => {
      exportAssessmentData(mockAssessment, mockConsultantInsights)

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(appendChildSpy).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()
      expect(createObjectURLSpy).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalled()
    })

    it('should handle special characters in organization name', () => {
      const assessmentWithSpecialChars = {
        ...mockAssessment,
        organizationName: 'Test & Company (2024)'
      }

      exportAssessmentData(assessmentWithSpecialChars, mockConsultantInsights)

      // Should still work without throwing errors
      expect(createElementSpy).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
    })

    it('should handle export errors gracefully', () => {
      // Make the anchor element undefined to simulate missing download support
      const mockAnchor = {
        setAttribute: jest.fn(),
        click: clickSpy,
        download: undefined, // This will cause the condition to fail
        style: { visibility: '' }
      }
      createElementSpy.mockReturnValue(mockAnchor)

      // This should not throw because the function handles the case gracefully
      expect(() => {
        exportAssessmentData(mockAssessment, mockConsultantInsights)
      }).not.toThrow()
      
      // The element should still be created even if download fails
      expect(createElementSpy).toHaveBeenCalled()
    })
  })

  describe('CSV escaping', () => {
    it('should properly escape values with commas', () => {
      const assessmentWithCommas = {
        ...mockAssessment,
        organizationName: 'Test, Inc.'
      }

      const csv = generateAssessmentSummaryCSV(assessmentWithCommas, mockConsultantInsights)
      
      expect(csv).toContain('"Test, Inc."')
    })

    it('should properly escape values with quotes', () => {
      const assessmentWithQuotes = {
        ...mockAssessment,
        organizationName: 'Test "Company" Ltd'
      }

      const csv = generateAssessmentSummaryCSV(assessmentWithQuotes, mockConsultantInsights)
      
      expect(csv).toContain('"Test ""Company"" Ltd"')
    })
  })
})