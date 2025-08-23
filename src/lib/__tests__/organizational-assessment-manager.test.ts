import { OrganizationalAssessmentManager } from '../organizational-assessment-manager'

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

describe('OrganizationalAssessmentManager', () => {
  let manager: OrganizationalAssessmentManager

  beforeEach(() => {
    manager = new OrganizationalAssessmentManager()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  describe('createAssessment', () => {
    it('creates a new assessment with correct properties', () => {
      const organizationName = 'Stork'
      const consultantId = 'guro@inbound.com'

      const assessment = manager.createAssessment(organizationName, consultantId)

      expect(assessment.organizationName).toBe(organizationName)
      expect(assessment.consultantId).toBe(consultantId)
      expect(assessment.status).toBe('collecting')
      expect(assessment.responseCount.management).toBe(0)
      expect(assessment.responseCount.employee).toBe(0)
      expect(assessment.id).toBeDefined()
      expect(assessment.created).toBeInstanceOf(Date)
    })

    it('saves assessment to localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      manager.createAssessment('Stork', 'guro@inbound.com')

      expect(localStorageMock.setItem).toHaveBeenCalled()
      const [key, value] = localStorageMock.setItem.mock.calls[0]
      expect(key).toBe('organizational-assessments')
      
      const savedData = JSON.parse(value)
      expect(Array.isArray(savedData)).toBe(true)
      expect(savedData).toHaveLength(1)
      expect(savedData[0].organizationName).toBe('Stork')
    })
  })

  describe('getAllAssessments', () => {
    it('returns empty array when no assessments exist', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const assessments = manager.getAllAssessments()

      expect(assessments).toEqual([])
    })

    it('parses and returns stored assessments with date objects', () => {
      const mockAssessment = {
        id: 'test-id',
        organizationName: 'Stork',
        consultantId: 'guro@inbound.com',
        status: 'collecting',
        created: '2023-08-01T00:00:00.000Z',
        managementResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
        employeeResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
        responseCount: { management: 0, employee: 0 }
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockAssessment]))

      const assessments = manager.getAllAssessments()

      expect(assessments).toHaveLength(1)
      expect(assessments[0].created).toBeInstanceOf(Date)
      expect(assessments[0].organizationName).toBe('Stork')
    })
  })

  describe('getAssessment', () => {
    it('returns specific assessment by id', () => {
      const mockAssessment = {
        id: 'test-id',
        organizationName: 'Stork',
        consultantId: 'guro@inbound.com',
        status: 'collecting' as const,
        created: '2023-08-01T00:00:00.000Z',
        managementResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
        employeeResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
        responseCount: { management: 0, employee: 0 }
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockAssessment]))

      const assessment = manager.getAssessment('test-id')

      expect(assessment).toBeTruthy()
      expect(assessment?.id).toBe('test-id')
      expect(assessment?.organizationName).toBe('Stork')
    })

    it('returns null for non-existent assessment', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

      const assessment = manager.getAssessment('non-existent-id')

      expect(assessment).toBeNull()
    })
  })

  describe('updateAssessmentStatus', () => {
    it('updates assessment status and saves to localStorage', () => {
      const mockAssessment = {
        id: 'test-id',
        organizationName: 'Stork',
        consultantId: 'guro@inbound.com',
        status: 'collecting' as const,
        created: '2023-08-01T00:00:00.000Z',
        managementResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
        employeeResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
        responseCount: { management: 0, employee: 0 }
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockAssessment]))

      manager.updateAssessmentStatus('test-id', 'ready')

      expect(localStorageMock.setItem).toHaveBeenCalled()
      const [, value] = localStorageMock.setItem.mock.calls[0]
      const savedData = JSON.parse(value)
      expect(savedData[0].status).toBe('ready')
    })

    it('sets lockedAt date when status is locked', () => {
      const mockAssessment = {
        id: 'test-id',
        organizationName: 'Stork',
        consultantId: 'guro@inbound.com',
        status: 'collecting' as const,
        created: '2023-08-01T00:00:00.000Z',
        managementResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
        employeeResponses: { categoryAverages: [], overallAverage: 0, responseCount: 0 },
        responseCount: { management: 0, employee: 0 }
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockAssessment]))

      manager.updateAssessmentStatus('test-id', 'locked')

      const [, value] = localStorageMock.setItem.mock.calls[0]
      const savedData = JSON.parse(value)
      expect(savedData[0].status).toBe('locked')
      expect(savedData[0].lockedAt).toBeDefined()
    })
  })

  describe('clearAllAssessments', () => {
    it('removes assessment data from localStorage', () => {
      manager.clearAllAssessments()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('organizational-assessments')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('organizational-responses')
    })
  })
})