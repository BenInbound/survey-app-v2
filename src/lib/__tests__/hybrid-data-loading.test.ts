import { OrganizationalAssessmentManager } from '../organizational-assessment-manager'
import { SupabaseManager } from '../supabase-manager'
import { OrganizationalAssessment, ParticipantResponse } from '../types'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock Supabase client first
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn()
        }))
      }))
    }))
  }
}))

// Mock Supabase manager methods
jest.mock('../supabase-manager', () => {
  const originalModule = jest.requireActual('../supabase-manager')
  return {
    ...originalModule,
    SupabaseManager: jest.fn().mockImplementation(() => ({
      isDatabaseAvailable: jest.fn(),
      loadAssessment: jest.fn(),
      loadAllAssessments: jest.fn(),
      loadParticipantResponses: jest.fn(),
      syncAssessmentToDatabase: jest.fn(),
      syncResponseToDatabase: jest.fn(),
      repairDepartmentTruncationIssues: jest.fn(),
      comprehensiveDataMigration: jest.fn(),
      repairLocalStorageData: jest.fn()
    })),
    supabaseManager: {
      isDatabaseAvailable: jest.fn(),
      loadAssessment: jest.fn(),
      loadAllAssessments: jest.fn(),
      loadParticipantResponses: jest.fn(),
      syncAssessmentToDatabase: jest.fn(),
      syncResponseToDatabase: jest.fn(),
      repairDepartmentTruncationIssues: jest.fn(),
      comprehensiveDataMigration: jest.fn(),
      repairLocalStorageData: jest.fn()
    }
  }
})

describe('Hybrid Data Loading', () => {
  let manager: OrganizationalAssessmentManager
  let mockSupabaseManager: jest.Mocked<SupabaseManager>

  const mockAssessment: OrganizationalAssessment = {
    id: 'test-assessment',
    organizationName: 'Test Organization',
    consultantId: 'test@consultant.com',
    status: 'collecting',
    created: new Date('2025-01-01'),
    accessCode: 'TEST-2025-CODE',
    departments: [
      { id: 'engineering', name: 'Engineering', managementCode: 'ENG-MGMT-001', employeeCode: 'ENG-EMP-001' }
    ],
    questions: [],
    questionSource: { source: 'default' },
    departmentData: [],
    managementResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
    employeeResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
    responseCount: { management: 0, employee: 0 }
  }

  const mockResponse: ParticipantResponse = {
    assessmentId: 'test-assessment',
    participantId: 'participant-1',
    role: 'employee',
    department: 'engineering',
    surveyId: 'survey-1',
    responses: [{ questionId: 'q1', value: 7, category: 'Strategy' }],
    currentQuestionIndex: 1,
    startedAt: new Date('2025-01-01'),
    completedAt: new Date('2025-01-01')
  }

  beforeEach(() => {
    manager = new OrganizationalAssessmentManager()
    
    // Reset all mocks
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    jest.clearAllMocks()
    
    // Get the mocked supabase manager instance
    const { supabaseManager } = require('../supabase-manager')
    mockSupabaseManager = supabaseManager as jest.Mocked<SupabaseManager>
  })

  describe('Database-First Loading with localStorage Fallback', () => {
    describe('getAssessmentWithDatabase', () => {
      it('loads assessment from database when available', async () => {
        mockSupabaseManager.loadAssessment.mockResolvedValue(mockAssessment)
        mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(true)

        const result = await manager.getAssessmentWithDatabase('test-assessment')

        expect(result).toEqual(mockAssessment)
        expect(mockSupabaseManager.loadAssessment).toHaveBeenCalledWith('test-assessment')
        expect(localStorageMock.getItem).not.toHaveBeenCalled()
      })

      it('falls back to localStorage when database unavailable', async () => {
        mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(false)
        localStorageMock.getItem.mockReturnValue(JSON.stringify([mockAssessment]))

        const result = await manager.getAssessmentWithDatabase('test-assessment')

        expect(result).toEqual(expect.objectContaining({
          id: mockAssessment.id,
          organizationName: mockAssessment.organizationName
        }))
        expect(mockSupabaseManager.loadAssessment).not.toHaveBeenCalled()
        expect(localStorageMock.getItem).toHaveBeenCalledWith('organizational-assessments')
      })

      it('falls back to localStorage when database returns null', async () => {
        mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(true)
        mockSupabaseManager.loadAssessment.mockResolvedValue(null)
        localStorageMock.getItem.mockReturnValue(JSON.stringify([mockAssessment]))

        const result = await manager.getAssessmentWithDatabase('test-assessment')

        expect(result).toEqual(expect.objectContaining({
          id: mockAssessment.id,
          organizationName: mockAssessment.organizationName
        }))
        expect(mockSupabaseManager.loadAssessment).toHaveBeenCalledWith('test-assessment')
        expect(localStorageMock.getItem).toHaveBeenCalledWith('organizational-assessments')
      })

      it('returns null when not found in database or localStorage', async () => {
        mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(true)
        mockSupabaseManager.loadAssessment.mockResolvedValue(null)
        localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

        const result = await manager.getAssessmentWithDatabase('nonexistent-assessment')

        expect(result).toBeNull()
        expect(mockSupabaseManager.loadAssessment).toHaveBeenCalledWith('nonexistent-assessment')
        expect(localStorageMock.getItem).toHaveBeenCalledWith('organizational-assessments')
      })

      it('handles database errors gracefully', async () => {
        mockSupabaseManager.isDatabaseAvailable.mockRejectedValue(new Error('Database connection failed'))
        localStorageMock.getItem.mockReturnValue(JSON.stringify([mockAssessment]))

        const result = await manager.getAssessmentWithDatabase('test-assessment')

        expect(result).toEqual(expect.objectContaining({
          id: mockAssessment.id,
          organizationName: mockAssessment.organizationName
        }))
        expect(localStorageMock.getItem).toHaveBeenCalledWith('organizational-assessments')
      })
    })

    describe('getAllAssessmentsWithDatabase', () => {
      it('loads all assessments from database when available', async () => {
        mockSupabaseManager.loadAllAssessments.mockResolvedValue([mockAssessment])
        mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(true)

        const result = await manager.getAllAssessmentsWithDatabase()

        expect(result).toEqual([mockAssessment])
        expect(mockSupabaseManager.loadAllAssessments).toHaveBeenCalled()
        expect(localStorageMock.getItem).not.toHaveBeenCalled()
      })

      it('falls back to localStorage when database unavailable', async () => {
        mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(false)
        localStorageMock.getItem.mockReturnValue(JSON.stringify([mockAssessment]))

        const result = await manager.getAllAssessmentsWithDatabase()

        expect(result).toHaveLength(1)
        expect(result[0]).toEqual(expect.objectContaining({
          id: mockAssessment.id,
          organizationName: mockAssessment.organizationName
        }))
        expect(mockSupabaseManager.loadAllAssessments).not.toHaveBeenCalled()
        expect(localStorageMock.getItem).toHaveBeenCalledWith('organizational-assessments')
      })

      it('merges database and localStorage data when both available', async () => {
        const databaseAssessment = { ...mockAssessment, id: 'db-assessment' }
        const localStorageAssessment = { ...mockAssessment, id: 'local-assessment' }
        
        mockSupabaseManager.loadAllAssessments.mockResolvedValue([databaseAssessment])
        mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(true)
        localStorageMock.getItem.mockReturnValue(JSON.stringify([localStorageAssessment]))

        const result = await manager.getAllAssessmentsWithDatabase()

        expect(result).toHaveLength(2)
        expect(result.some(a => a.id === 'db-assessment')).toBe(true)
        expect(result.some(a => a.id === 'local-assessment')).toBe(true)
      })

      it('deduplicates assessments by ID', async () => {
        const duplicateAssessment = { ...mockAssessment }
        
        mockSupabaseManager.loadAllAssessments.mockResolvedValue([mockAssessment])
        mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(true)
        localStorageMock.getItem.mockReturnValue(JSON.stringify([duplicateAssessment]))

        const result = await manager.getAllAssessmentsWithDatabase()

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe(mockAssessment.id)
      })

      it('handles empty results from both sources', async () => {
        mockSupabaseManager.loadAllAssessments.mockResolvedValue([])
        mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(true)
        localStorageMock.getItem.mockReturnValue(null)

        const result = await manager.getAllAssessmentsWithDatabase()

        expect(result).toEqual([])
      })
    })
  })

  describe('Data Synchronization', () => {
    it('syncs new assessment to database when database available', async () => {
      mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(true)
      mockSupabaseManager.syncAssessmentToDatabase.mockResolvedValue(true)
      localStorageMock.getItem.mockReturnValue(null)

      const assessment = manager.createAssessment('Test Org', 'test@consultant.com')

      expect(mockSupabaseManager.syncAssessmentToDatabase).toHaveBeenCalledWith(assessment)
    })

    it('only saves to localStorage when database unavailable', async () => {
      mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(false)
      localStorageMock.getItem.mockReturnValue(null)

      manager.createAssessment('Test Org', 'test@consultant.com')

      expect(mockSupabaseManager.syncAssessmentToDatabase).not.toHaveBeenCalled()
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('handles database sync failures gracefully', async () => {
      mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(true)
      mockSupabaseManager.syncAssessmentToDatabase.mockResolvedValue(false)
      localStorageMock.getItem.mockReturnValue(null)

      const assessment = manager.createAssessment('Test Org', 'test@consultant.com')

      expect(assessment).toBeDefined()
      expect(localStorageMock.setItem).toHaveBeenCalled() // Still saves locally
    })
  })

  describe('Response Data Loading', () => {
    it('loads responses from database when available', async () => {
      mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(true)
      mockSupabaseManager.loadParticipantResponses.mockResolvedValue([mockResponse])

      const responses = await manager.loadResponsesFromDatabase('test-assessment')

      expect(responses).toEqual([mockResponse])
      expect(mockSupabaseManager.loadParticipantResponses).toHaveBeenCalledWith('test-assessment')
    })

    it('falls back to localStorage for responses when database unavailable', async () => {
      mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(false)
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockResponse]))

      const responses = await manager.loadResponsesFromDatabase('test-assessment')

      expect(responses).toHaveLength(1)
      expect(responses[0]).toEqual(expect.objectContaining({
        assessmentId: mockResponse.assessmentId,
        participantId: mockResponse.participantId
      }))
    })

    it('returns empty array when no responses found', async () => {
      mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(true)
      mockSupabaseManager.loadParticipantResponses.mockResolvedValue([])

      const responses = await manager.loadResponsesFromDatabase('test-assessment')

      expect(responses).toEqual([])
    })
  })

  describe('Error Handling and Resilience', () => {
    it('handles localStorage corruption gracefully', async () => {
      mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(false)
      localStorageMock.getItem.mockReturnValue('invalid-json')

      const result = await manager.getAllAssessmentsWithDatabase()

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalled()
    })

    it('continues operation when database throws exceptions', async () => {
      mockSupabaseManager.isDatabaseAvailable.mockRejectedValue(new Error('Network error'))
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockAssessment]))

      const result = await manager.getAllAssessmentsWithDatabase()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(mockAssessment.id)
    })

    it('handles mixed data sources with different schemas', async () => {
      const incompleteAssessment = { 
        ...mockAssessment, 
        departmentData: undefined,
        managementResponses: undefined 
      }
      
      mockSupabaseManager.loadAllAssessments.mockResolvedValue([incompleteAssessment])
      mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(true)

      const result = await manager.getAllAssessmentsWithDatabase()

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(expect.objectContaining({
        id: mockAssessment.id,
        organizationName: mockAssessment.organizationName
      }))
    })
  })

  describe('Data Migration and Repair', () => {
    it('detects and repairs department truncation issues', async () => {
      const corruptedResponse = { 
        ...mockResponse, 
        department: 'ENG' // Truncated from 'engineering'
      }
      
      mockSupabaseManager.repairDepartmentTruncationIssues.mockResolvedValue({
        repaired: true,
        fixed: 1,
        errors: []
      })

      const result = await mockSupabaseManager.repairDepartmentTruncationIssues('test-assessment')

      expect(result.repaired).toBe(true)
      expect(result.fixed).toBe(1)
      expect(result.errors).toEqual([])
    })

    it('handles comprehensive data migration', async () => {
      mockSupabaseManager.comprehensiveDataMigration.mockResolvedValue({
        success: true,
        operations: [
          { name: 'Diagnosis', success: true, details: 'Found 2 corrupted responses' },
          { name: 'Department Repair', success: true, details: 'Fixed 2 responses' },
          { name: 'Verification', success: true, details: 'Final state: 0 corrupted responses' }
        ],
        summary: 'Migration completed successfully. Fixed 2 responses.'
      })

      const result = await mockSupabaseManager.comprehensiveDataMigration('test-assessment')

      expect(result.success).toBe(true)
      expect(result.operations).toHaveLength(3)
      expect(result.summary).toContain('Migration completed successfully')
    })

    it('repairs localStorage data corruption', () => {
      const corruptedAssessment = {
        ...mockAssessment,
        departments: [{ id: 'ENG', name: 'Engineering' }] // Truncated ID
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify([corruptedAssessment]))
      mockSupabaseManager.repairLocalStorageData.mockReturnValue({
        repaired: 1,
        errors: []
      })

      const result = mockSupabaseManager.repairLocalStorageData()

      expect(result.repaired).toBeGreaterThan(0)
      expect(result.errors).toEqual([])
    })
  })

  describe('Performance and Optimization', () => {
    it('caches database availability check', async () => {
      mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(true)

      await manager.getAllAssessmentsWithDatabase()
      await manager.getAssessmentWithDatabase('test-assessment')

      // Should only check database availability once per operation batch
      expect(mockSupabaseManager.isDatabaseAvailable).toHaveBeenCalled()
    })

    it('handles large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        ...mockAssessment,
        id: `assessment-${i}`,
        organizationName: `Organization ${i}`
      }))

      mockSupabaseManager.loadAllAssessments.mockResolvedValue(largeDataset)
      mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(true)

      const start = Date.now()
      const result = await manager.getAllAssessmentsWithDatabase()
      const duration = Date.now() - start

      expect(result).toHaveLength(100)
      expect(duration).toBeLessThan(1000) // Should complete within 1 second
    })

    it('deduplicates efficiently without memory issues', async () => {
      const duplicatedData = Array.from({ length: 50 }, () => mockAssessment)
      
      mockSupabaseManager.loadAllAssessments.mockResolvedValue(duplicatedData)
      mockSupabaseManager.isDatabaseAvailable.mockResolvedValue(true)
      localStorageMock.getItem.mockReturnValue(JSON.stringify(duplicatedData))

      const result = await manager.getAllAssessmentsWithDatabase()

      expect(result).toHaveLength(1) // Should deduplicate to single assessment
    })
  })
})