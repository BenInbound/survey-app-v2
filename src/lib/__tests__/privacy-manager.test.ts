/**
 * Test Suite for GDPR Privacy Manager
 * Validates privacy-by-design implementation and GDPR compliance
 */

import { PrivacyManager } from '../privacy-manager'
import {
  DataCategory,
  LegalBasis,
  DataSensitivity,
  ProcessingPurpose,
  DataController,
  DataProcessor
} from '../gdpr-types'

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Privacy Manager', () => {
  let privacyManager: PrivacyManager

  beforeEach(() => {
    privacyManager = new PrivacyManager()
    localStorageMock.clear()
  })

  describe('Configuration Management', () => {
    it('should initialize with default organizational assessment configuration', () => {
      const config = privacyManager.getPrivacyConfiguration('organizational-assessment')
      
      expect(config).toBeDefined()
      expect(config?.name).toBe('Organizational Strategic Assessment')
      expect(config?.defaultLegalBasis).toBe(LegalBasis.LEGITIMATE_INTEREST)
      expect(config?.consentRequired).toBe(false)
      expect(config?.encryptionRequired).toBe(true)
      expect(config?.pseudonymizationRequired).toBe(true)
    })

    it('should return null for non-existent configuration', () => {
      const config = privacyManager.getPrivacyConfiguration('non-existent')
      expect(config).toBeNull()
    })

    it('should have proper data classifications in organizational config', () => {
      const config = privacyManager.getPrivacyConfiguration('organizational-assessment')
      
      expect(config?.dataClassifications).toHaveLength(3)
      
      const surveyResponsesClassification = config?.dataClassifications.find(
        c => c.category === DataCategory.SURVEY_RESPONSES
      )
      expect(surveyResponsesClassification).toBeDefined()
      expect(surveyResponsesClassification?.sensitivity).toBe(DataSensitivity.PERSONAL)
      expect(surveyResponsesClassification?.legalBasis).toBe(LegalBasis.LEGITIMATE_INTEREST)
      expect(surveyResponsesClassification?.retentionPeriod).toBe(730) // 2 years
    })
  })

  describe('Data Classification', () => {
    it('should classify survey responses correctly', () => {
      const classification = privacyManager.classifyData(
        'organizational-assessment',
        DataCategory.SURVEY_RESPONSES
      )

      expect(classification).toBeDefined()
      expect(classification?.category).toBe(DataCategory.SURVEY_RESPONSES)
      expect(classification?.sensitivity).toBe(DataSensitivity.PERSONAL)
      expect(classification?.controller).toBe(DataController.JOINT_CONTROLLERS)
      expect(classification?.processors).toContain(DataProcessor.INBOUND_PLATFORM)
    })

    it('should classify participant identifiers correctly', () => {
      const classification = privacyManager.classifyData(
        'organizational-assessment',
        DataCategory.PARTICIPANT_IDENTIFIERS
      )

      expect(classification).toBeDefined()
      expect(classification?.category).toBe(DataCategory.PARTICIPANT_IDENTIFIERS)
      expect(classification?.controller).toBe(DataController.CLIENT_ORGANIZATION)
      expect(classification?.retentionPeriod).toBe(365) // 1 year
    })

    it('should return null for non-existent data category', () => {
      const classification = privacyManager.classifyData(
        'organizational-assessment',
        DataCategory.TECHNICAL_DATA // Not in default classifications
      )

      expect(classification).toBeNull()
    })
  })

  describe('Legal Basis Validation', () => {
    it('should validate legitimate interest for organizational assessments', () => {
      const validation = privacyManager.validateLegalBasis(
        LegalBasis.LEGITIMATE_INTEREST,
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        DataCategory.SURVEY_RESPONSES,
        'employee'
      )

      expect(validation.valid).toBe(true)
      expect(validation.reason).toBeUndefined()
    })

    it('should reject employee consent for organizational assessments', () => {
      const validation = privacyManager.validateLegalBasis(
        LegalBasis.CONSENT,
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        DataCategory.SURVEY_RESPONSES,
        'employee'
      )

      expect(validation.valid).toBe(false)
      expect(validation.reason).toContain('Employee consent may not be freely given')
      expect(validation.reason).toContain('GDPR Recital 43')
    })

    it('should allow consent for management participants', () => {
      const validation = privacyManager.validateLegalBasis(
        LegalBasis.CONSENT,
        [ProcessingPurpose.STRATEGIC_INSIGHTS],
        DataCategory.ORGANIZATIONAL_DATA,
        'management'
      )

      expect(validation.valid).toBe(true)
    })

    it('should validate contract basis for employee performance analytics', () => {
      const validation = privacyManager.validateLegalBasis(
        LegalBasis.CONTRACT,
        [ProcessingPurpose.PERFORMANCE_ANALYTICS],
        DataCategory.SURVEY_RESPONSES,
        'employee'
      )

      expect(validation.valid).toBe(true)
    })

    it('should reject inappropriate legal basis combinations', () => {
      const validation = privacyManager.validateLegalBasis(
        LegalBasis.VITAL_INTERESTS,
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        DataCategory.SURVEY_RESPONSES,
        'employee'
      )

      expect(validation.valid).toBe(false)
      expect(validation.reason).toContain('Legal basis not applicable')
    })
  })

  describe('Privacy Metadata Creation', () => {
    it('should create valid privacy metadata for survey responses', () => {
      const metadata = privacyManager.createPrivacyMetadata(
        'organizational-assessment',
        DataCategory.SURVEY_RESPONSES,
        'participant-123'
      )

      expect(metadata).toBeDefined()
      expect(metadata?.classification.category).toBe(DataCategory.SURVEY_RESPONSES)
      expect(metadata?.consentRequired).toBe(false)
      expect(metadata?.pseudonymized).toBe(true)
      expect(metadata?.encrypted).toBe(true)
      expect(metadata?.minimized).toBe(true)
      expect(metadata?.createdAt).toBeInstanceOf(Date)
      expect(metadata?.scheduledDeletion).toBeInstanceOf(Date)
    })

    it('should calculate correct deletion schedule based on retention policy', () => {
      const metadata = privacyManager.createPrivacyMetadata(
        'organizational-assessment',
        DataCategory.SURVEY_RESPONSES
      )

      expect(metadata?.scheduledDeletion).toBeInstanceOf(Date)
      
      if (metadata?.scheduledDeletion && metadata?.createdAt) {
        const daysDifference = Math.floor(
          (metadata.scheduledDeletion.getTime() - metadata.createdAt.getTime()) / 
          (1000 * 60 * 60 * 24)
        )
        expect(daysDifference).toBe(730) // 2 years for survey responses
      }
    })

    it('should return null for invalid configuration', () => {
      const metadata = privacyManager.createPrivacyMetadata(
        'non-existent',
        DataCategory.SURVEY_RESPONSES
      )

      expect(metadata).toBeNull()
    })
  })

  describe('Data Processing Record Creation', () => {
    it('should create valid processing record for assessment', () => {
      const record = privacyManager.recordDataProcessing(
        'demo-org',
        'Stork Organization',
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT, ProcessingPurpose.STRATEGIC_INSIGHTS],
        [DataCategory.SURVEY_RESPONSES, DataCategory.ORGANIZATIONAL_DATA]
      )

      expect(record.id).toContain('proc-demo-org')
      expect(record.purpose).toContain(ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT)
      expect(record.categories).toContain(DataCategory.SURVEY_RESPONSES)
      expect(record.dataSubjects).toContain('Employees')
      expect(record.recipients).toContain('Inbound Consulting Team')
      expect(record.internationalTransfers).toBe(false)
      expect(record.safeguards).toContain('Data pseudonymization before processing')
      expect(record.retentionPeriod).toBe(730)
    })

    it('should store and retrieve processing records', () => {
      privacyManager.recordDataProcessing(
        'test-assessment',
        'Test Organization',
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        [DataCategory.SURVEY_RESPONSES]
      )

      const records = privacyManager.getProcessingRecords()
      expect(records).toHaveLength(1)
      expect(records[0].id).toContain('proc-test-assessment')
    })
  })

  describe('Data Minimization Validation', () => {
    it('should validate compliant data minimization', () => {
      const validation = privacyManager.validateDataMinimization(
        'organizational-assessment',
        [DataCategory.SURVEY_RESPONSES],
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT]
      )

      expect(validation.compliant).toBe(true)
      expect(validation.violations).toHaveLength(0)
    })

    it('should detect unauthorized purpose violations', () => {
      const validation = privacyManager.validateDataMinimization(
        'organizational-assessment',
        [DataCategory.SURVEY_RESPONSES],
        [ProcessingPurpose.LEGAL_COMPLIANCE] // Not authorized for survey responses
      )

      expect(validation.compliant).toBe(false)
      expect(validation.violations).toHaveLength(1)
      expect(validation.violations[0]).toContain('not authorized for purposes')
    })

    it('should detect missing minimization rules', () => {
      const validation = privacyManager.validateDataMinimization(
        'organizational-assessment',
        [DataCategory.USAGE_ANALYTICS], // No specific rule defined
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT]
      )

      expect(validation.compliant).toBe(false)
      expect(validation.violations[0]).toContain('No minimization rule found')
    })
  })

  describe('Data Deletion Scheduling', () => {
    it('should schedule data deletion correctly', () => {
      const metadata = privacyManager.createPrivacyMetadata(
        'organizational-assessment',
        DataCategory.SURVEY_RESPONSES
      )

      if (metadata) {
        privacyManager.scheduleDataDeletion(metadata)

        const scheduledJobs = JSON.parse(
          localStorageMock.getItem('gdpr-deletion-schedule') || '[]'
        )
        expect(scheduledJobs).toHaveLength(1)
        expect(scheduledJobs[0].dataIdentifier).toBe(DataCategory.SURVEY_RESPONSES)
      }
    })

    it('should not schedule deletion for metadata without deletion date', () => {
      const metadata = privacyManager.createPrivacyMetadata(
        'organizational-assessment',
        DataCategory.SURVEY_RESPONSES
      )

      if (metadata) {
        metadata.scheduledDeletion = undefined
        privacyManager.scheduleDataDeletion(metadata)

        const scheduledJobs = JSON.parse(
          localStorageMock.getItem('gdpr-deletion-schedule') || '[]'
        )
        expect(scheduledJobs).toHaveLength(0)
      }
    })
  })

  describe('Processing Record Export', () => {
    it('should export processing record in Article 30 format', () => {
      const record = privacyManager.recordDataProcessing(
        'export-test',
        'Export Test Org',
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        [DataCategory.SURVEY_RESPONSES]
      )

      const exported = privacyManager.exportProcessingRecord(record.id)
      expect(exported).toBeDefined()

      const parsedRecord = JSON.parse(exported!)
      expect(parsedRecord.controller).toBe('Inbound Consulting AS')
      expect(parsedRecord.jointController).toBe('Client Organization')
      expect(parsedRecord.processingPurposes).toContain(ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT)
      expect(parsedRecord.retentionPeriod).toBe('730 days')
    })

    it('should return null for non-existent record', () => {
      const exported = privacyManager.exportProcessingRecord('non-existent')
      expect(exported).toBeNull()
    })
  })

  describe('Retention Policy', () => {
    it('should have category-specific retention periods', () => {
      const config = privacyManager.getPrivacyConfiguration('organizational-assessment')
      
      expect(config?.retentionPolicy.categorySpecific[DataCategory.SURVEY_RESPONSES]).toBe(730)
      expect(config?.retentionPolicy.categorySpecific[DataCategory.PARTICIPANT_IDENTIFIERS]).toBe(365)
      expect(config?.retentionPolicy.categorySpecific[DataCategory.ORGANIZATIONAL_DATA]).toBe(1095)
      expect(config?.retentionPolicy.automaticDeletion).toBe(true)
    })

    it('should have archival rules configured', () => {
      const config = privacyManager.getPrivacyConfiguration('organizational-assessment')
      
      expect(config?.retentionPolicy.archivalRules?.enabled).toBe(true)
      expect(config?.retentionPolicy.archivalRules?.period).toBe(2555) // 7 years
      expect(config?.retentionPolicy.archivalRules?.location).toBe('encrypted_archive')
    })
  })
})