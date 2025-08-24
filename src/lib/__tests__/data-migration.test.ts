import { SupabaseManager, supabaseManager, fixDepartmentTruncationIssues } from '../supabase-manager'
import { OrganizationalAssessment, ParticipantResponse } from '../types'

// Mock the supabase client
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
      })),
      delete: jest.fn(() => ({
        eq: jest.fn()
      }))
    }))
  }
}))

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

// Mock console methods to test logging
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
}

describe('Data Migration Utilities', () => {
  const mockAssessment: OrganizationalAssessment = {
    id: 'test-assessment',
    organizationName: 'Test Organization', 
    consultantId: 'test@consultant.com',
    status: 'collecting',
    created: new Date('2025-01-01'),
    accessCode: 'TEST-2025-CODE',
    departments: [
      { id: 'engineering', name: 'Engineering', managementCode: 'ENG-MGMT-001', employeeCode: 'ENG-EMP-001' },
      { id: 'sales', name: 'Sales', managementCode: 'SAL-MGMT-001', employeeCode: 'SAL-EMP-001' }
    ],
    questions: [],
    questionSource: { source: 'default' },
    departmentData: [],
    managementResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
    employeeResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
    responseCount: { management: 0, employee: 0 }
  }

  const mockCorruptedResponses: ParticipantResponse[] = [
    {
      assessmentId: 'test-assessment',
      participantId: 'participant-1',
      role: 'employee',
      department: 'ENG', // Truncated from 'engineering'
      surveyId: 'survey-1',
      responses: [{ questionId: 'q1', value: 7, category: 'Strategy' }],
      currentQuestionIndex: 1,
      startedAt: new Date('2025-01-01'),
      completedAt: new Date('2025-01-01')
    },
    {
      assessmentId: 'test-assessment', 
      participantId: 'participant-2',
      role: 'management',
      department: 'SAL', // Truncated from 'sales'
      surveyId: 'survey-1',
      responses: [{ questionId: 'q1', value: 8, category: 'Strategy' }],
      currentQuestionIndex: 1,
      startedAt: new Date('2025-01-01'),
      completedAt: new Date('2025-01-01')
    },
    {
      assessmentId: 'test-assessment',
      participantId: 'participant-3', 
      role: 'employee',
      department: 'Management', // Role-based corruption
      surveyId: 'survey-1',
      responses: [{ questionId: 'q1', value: 6, category: 'Strategy' }],
      currentQuestionIndex: 1,
      startedAt: new Date('2025-01-01'),
      completedAt: new Date('2025-01-01')
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
  })

  describe('Department Truncation Issue Detection', () => {
    it('detects truncated department codes', async () => {
      const manager = new SupabaseManager()
      
      // Mock loadAssessment and loadParticipantResponses
      jest.spyOn(manager, 'loadAssessment').mockResolvedValue(mockAssessment)
      jest.spyOn(manager, 'loadParticipantResponses').mockResolvedValue(mockCorruptedResponses)
      
      const result = await manager.diagnoseDatabaseIssues('test-assessment')

      expect(result.corruption.totalResponses).toBe(3)
      expect(result.corruption.corruptedCount).toBe(1) // Only 'Management' counts as corrupted
      expect(result.suggestions).toContain('Found 1 corrupted responses with role-based department values')
    })

    it('identifies valid vs corrupted departments', async () => {
      const manager = new SupabaseManager()
      
      jest.spyOn(manager, 'loadAssessment').mockResolvedValue(mockAssessment)
      jest.spyOn(manager, 'loadParticipantResponses').mockResolvedValue(mockCorruptedResponses)
      
      const result = await manager.diagnoseDatabaseIssues('test-assessment')

      expect(result.corruption.validDepartments).toEqual(['engineering', 'sales'])
      expect(result.corruption.foundDepartments).toEqual(expect.arrayContaining(['ENG', 'SAL', 'Management']))
    })

    it('handles assessment with no department configuration', async () => {
      const manager = new SupabaseManager()
      const assessmentWithNoDepts = { ...mockAssessment, departments: [] }
      
      jest.spyOn(manager, 'loadAssessment').mockResolvedValue(assessmentWithNoDepts)
      jest.spyOn(manager, 'loadParticipantResponses').mockResolvedValue([])
      
      const result = await manager.diagnoseDatabaseIssues('test-assessment')

      expect(result.suggestions).toContain('Assessment has no department configuration')
    })
  })

  describe('Department Truncation Repair', () => {
    it('repairs truncated department codes using mapping', async () => {
      const manager = new SupabaseManager()
      
      jest.spyOn(manager, 'loadAssessment').mockResolvedValue(mockAssessment)
      jest.spyOn(manager, 'loadParticipantResponses').mockResolvedValue(mockCorruptedResponses)
      
      // Mock supabase to simulate successful updates
      const { supabase } = require('../supabase')
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null })
          })
        })
      })

      const result = await manager.repairDepartmentTruncationIssues('test-assessment')

      expect(result.repaired).toBe(true)
      expect(result.fixed).toBeGreaterThan(0)
      expect(result.errors).toHaveLength(0)
    })

    it('handles database update failures gracefully', async () => {
      const manager = new SupabaseManager()
      
      jest.spyOn(manager, 'loadAssessment').mockResolvedValue(mockAssessment)
      jest.spyOn(manager, 'loadParticipantResponses').mockResolvedValue([mockCorruptedResponses[0]])
      
      // Mock database update failure
      const { supabase } = require('../supabase')
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: { message: 'Update failed' } })
          })
        })
      })

      const result = await manager.repairDepartmentTruncationIssues('test-assessment')

      expect(result.repaired).toBe(false)
      expect(result.errors).toContain('Failed to update response participant-1: Update failed')
    })

    it('maps common truncated codes correctly', async () => {
      const manager = new SupabaseManager()
      
      const testCases = [
        { truncated: 'SAL', expected: 'sales' },
        { truncated: 'ENG', expected: 'engineering' },
        { truncated: 'MAR', expected: 'marketing' },
        { truncated: 'HR', expected: 'hr' },
        { truncated: 'FIN', expected: 'finance' }
      ]

      jest.spyOn(manager, 'loadAssessment').mockResolvedValue({
        ...mockAssessment,
        departments: testCases.map(tc => ({ id: tc.expected, name: tc.expected, managementCode: '', employeeCode: '' }))
      })

      for (const testCase of testCases) {
        const response = { ...mockCorruptedResponses[0], department: testCase.truncated }
        jest.spyOn(manager, 'loadParticipantResponses').mockResolvedValue([response])
        
        const { supabase } = require('../supabase')
        supabase.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null })
            })
          })
        })

        await manager.repairDepartmentTruncationIssues('test-assessment')
        
        // Verify the update was called with correct department
        const { supabase } = require('../supabase')
        expect(supabase.from().update).toHaveBeenCalledWith({ department: testCase.expected })
      }
    })
  })

  describe('Comprehensive Data Migration', () => {
    it('performs full migration workflow', async () => {
      const manager = new SupabaseManager()
      
      // Mock all the methods called during comprehensive migration
      jest.spyOn(manager, 'diagnoseDatabaseIssues')
        .mockResolvedValueOnce({
          corruption: { corruptedCount: 3, error: null },
          suggestions: ['Found 3 corrupted responses']
        })
        .mockResolvedValueOnce({
          corruption: { corruptedCount: 0, error: null },
          suggestions: []
        })
      
      jest.spyOn(manager, 'repairDepartmentTruncationIssues').mockResolvedValue({
        repaired: true,
        fixed: 3,
        errors: []
      })

      const result = await manager.comprehensiveDataMigration('test-assessment')

      expect(result.success).toBe(true)
      expect(result.operations).toHaveLength(3) // Diagnosis, Repair, Verification
      expect(result.summary).toContain('Migration completed successfully')
      expect(result.summary).toContain('Fixed 3 responses')
    })

    it('handles migration failures appropriately', async () => {
      const manager = new SupabaseManager()
      
      jest.spyOn(manager, 'diagnoseDatabaseIssues').mockResolvedValue({
        corruption: { corruptedCount: 2, error: null },
        suggestions: ['Found 2 corrupted responses']
      })
      
      jest.spyOn(manager, 'repairDepartmentTruncationIssues').mockResolvedValue({
        repaired: false,
        fixed: 0,
        errors: ['Repair failed due to database connection']
      })
      
      jest.spyOn(manager, 'cleanCorruptedDepartmentData').mockResolvedValue({
        cleaned: false,
        errors: ['Cleanup failed']
      })

      const result = await manager.comprehensiveDataMigration('test-assessment')

      expect(result.success).toBe(false)
      expect(result.summary).toContain('Migration completed with errors')
      expect(result.operations.some(op => !op.success)).toBe(true)
    })

    it('falls back to data cleanup when repair fails', async () => {
      const manager = new SupabaseManager()
      
      jest.spyOn(manager, 'diagnoseDatabaseIssues')
        .mockResolvedValueOnce({
          corruption: { corruptedCount: 2, error: null },
          suggestions: []
        })
        .mockResolvedValueOnce({
          corruption: { corruptedCount: 0, error: null },
          suggestions: []
        })
      
      jest.spyOn(manager, 'repairDepartmentTruncationIssues').mockResolvedValue({
        repaired: false,
        fixed: 0,
        errors: []
      })
      
      jest.spyOn(manager, 'cleanCorruptedDepartmentData').mockResolvedValue({
        cleaned: true,
        errors: []
      })

      const result = await manager.comprehensiveDataMigration('test-assessment')

      expect(result.operations.some(op => op.name === 'Data Cleanup')).toBe(true)
      expect(result.operations.find(op => op.name === 'Data Cleanup')?.success).toBe(true)
    })
  })

  describe('localStorage Data Repair', () => {
    it('repairs truncated department IDs in localStorage assessments', () => {
      const corruptedAssessment = {
        ...mockAssessment,
        departments: [
          { id: 'ENG', name: 'Engineering Team', managementCode: '', employeeCode: '' },
          { id: 'SAL', name: 'Sales Department', managementCode: '', employeeCode: '' }
        ]
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify([corruptedAssessment]))

      const result = supabaseManager.repairLocalStorageData()

      expect(result.repaired).toBeGreaterThan(0)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'organizational-assessments',
        expect.stringContaining('"engineerin"') // Should be repaired to 'engineerin' (8 chars max)
      )
    })

    it('repairs corrupted department IDs in localStorage responses', () => {
      const corruptedResponses = [
        { ...mockCorruptedResponses[0], department: 'Management' },
        { ...mockCorruptedResponses[1], department: 'Employee' },
        { ...mockCorruptedResponses[2], department: 'SAL' }
      ]

      localStorageMock.getItem
        .mockReturnValueOnce(null) // No assessments
        .mockReturnValueOnce(JSON.stringify(corruptedResponses)) // Corrupted responses

      const result = supabaseManager.repairLocalStorageData()

      expect(result.repaired).toBeGreaterThan(0)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'organizational-responses',
        expect.stringContaining('"sales"') // Should map 'SAL', 'Management', 'Employee' to 'sales'
      )
    })

    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage access denied')
      })

      const result = supabaseManager.repairLocalStorageData()

      expect(result.repaired).toBe(0)
      expect(result.errors).toContain('localStorage repair failed: Error: localStorage access denied')
    })

    it('skips repair when not in browser environment', () => {
      // Mock window as undefined
      const originalWindow = global.window
      delete (global as any).window

      const result = supabaseManager.repairLocalStorageData()

      expect(result.repaired).toBe(0)
      expect(result.errors).toContain('Not in browser environment')

      // Restore window
      global.window = originalWindow
    })
  })

  describe('Quick Migration Utility', () => {
    it('fixes issues across all assessments when no specific ID provided', async () => {
      const manager = new SupabaseManager()
      
      jest.spyOn(manager, 'loadAllAssessments').mockResolvedValue([
        { ...mockAssessment, id: 'assessment-1' },
        { ...mockAssessment, id: 'assessment-2' }
      ])
      
      jest.spyOn(manager, 'comprehensiveDataMigration')
        .mockResolvedValueOnce({
          success: true,
          operations: [],
          summary: 'Migration completed successfully. Fixed 2 responses.'
        })
        .mockResolvedValueOnce({
          success: false,
          operations: [],
          summary: 'Migration completed with errors.'
        })

      jest.spyOn(supabaseManager, 'repairLocalStorageData').mockReturnValue({
        repaired: 1,
        errors: []
      })

      await fixDepartmentTruncationIssues()

      expect(console.log).toHaveBeenCalledWith('🔧 Starting department truncation repair...')
      expect(console.log).toHaveBeenCalledWith('📱 localStorage: Fixed 1 items. Errors: None')
      expect(console.log).toHaveBeenCalledWith('🔍 Scanning all assessments for issues...')
      expect(console.log).toHaveBeenCalledWith('🎉 Department truncation repair completed!')
    })

    it('fixes specific assessment when ID provided', async () => {
      const mockMigration = {
        success: true,
        operations: [
          { name: 'Diagnosis', success: true, details: 'Found 2 corrupted responses' },
          { name: 'Department Repair', success: true, details: 'Fixed 2 responses' }
        ],
        summary: 'Migration completed successfully. Fixed 2 responses.'
      }

      jest.spyOn(supabaseManager, 'repairLocalStorageData').mockReturnValue({
        repaired: 0,
        errors: []
      })
      
      jest.spyOn(supabaseManager, 'comprehensiveDataMigration').mockResolvedValue(mockMigration)

      const result = await fixDepartmentTruncationIssues('specific-assessment')

      expect(result).toEqual(mockMigration)
      expect(console.log).toHaveBeenCalledWith(
        '🗄️  Database migration for specific-assessment:',
        'Migration completed successfully. Fixed 2 responses.'
      )
      expect(console.log).toHaveBeenCalledWith('  ✅ Diagnosis: Found 2 corrupted responses')
      expect(console.log).toHaveBeenCalledWith('  ✅ Department Repair: Fixed 2 responses')
    })

    it('handles console logging properly for failed operations', async () => {
      const mockMigration = {
        success: false,
        operations: [
          { name: 'Diagnosis', success: true, details: 'Found issues' },
          { name: 'Repair', success: false, details: 'Repair failed' }
        ],
        summary: 'Migration failed'
      }

      jest.spyOn(supabaseManager, 'repairLocalStorageData').mockReturnValue({
        repaired: 0,
        errors: []
      })
      
      jest.spyOn(supabaseManager, 'comprehensiveDataMigration').mockResolvedValue(mockMigration)

      await fixDepartmentTruncationIssues('test-assessment')

      expect(console.log).toHaveBeenCalledWith('  ✅ Diagnosis: Found issues')
      expect(console.log).toHaveBeenCalledWith('  ❌ Repair: Repair failed')
    })
  })
})