/**
 * Test Suite for GDPR Data Classification Types
 * Validates GDPR compliance type definitions and structures
 */

import {
  DataCategory,
  LegalBasis,
  DataSensitivity,
  ProcessingPurpose,
  DataController,
  DataProcessor,
  DataClassification,
  PrivacyMetadata,
  DataProcessingRecord
} from '../gdpr-types'

describe('GDPR Data Classification Types', () => {
  describe('DataCategory Enum', () => {
    it('should contain all required data categories', () => {
      expect(DataCategory.SURVEY_RESPONSES).toBe('survey_responses')
      expect(DataCategory.PARTICIPANT_IDENTIFIERS).toBe('participant_identifiers')
      expect(DataCategory.TECHNICAL_DATA).toBe('technical_data')
      expect(DataCategory.ORGANIZATIONAL_DATA).toBe('organizational_data')
      expect(DataCategory.USAGE_ANALYTICS).toBe('usage_analytics')
    })
  })

  describe('LegalBasis Enum', () => {
    it('should match GDPR Article 6 legal bases', () => {
      expect(LegalBasis.CONSENT).toBe('consent')
      expect(LegalBasis.LEGITIMATE_INTEREST).toBe('legitimate_interest')
      expect(LegalBasis.CONTRACT).toBe('contract')
      expect(LegalBasis.LEGAL_OBLIGATION).toBe('legal_obligation')
      expect(LegalBasis.VITAL_INTERESTS).toBe('vital_interests')
      expect(LegalBasis.PUBLIC_TASK).toBe('public_task')
    })
  })

  describe('DataSensitivity Classification', () => {
    it('should provide proper sensitivity levels', () => {
      expect(DataSensitivity.PUBLIC).toBe('public')
      expect(DataSensitivity.INTERNAL).toBe('internal')
      expect(DataSensitivity.CONFIDENTIAL).toBe('confidential')
      expect(DataSensitivity.PERSONAL).toBe('personal')
      expect(DataSensitivity.SENSITIVE).toBe('sensitive')
    })
  })

  describe('DataClassification Interface', () => {
    it('should create valid data classification objects', () => {
      const classification: DataClassification = {
        category: DataCategory.SURVEY_RESPONSES,
        sensitivity: DataSensitivity.PERSONAL,
        legalBasis: LegalBasis.LEGITIMATE_INTEREST,
        purpose: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        controller: DataController.INBOUND_CONSULTING,
        processors: [DataProcessor.INBOUND_PLATFORM],
        retentionPeriod: 730, // 2 years
        dataSubjectType: 'employee'
      }

      expect(classification.category).toBe(DataCategory.SURVEY_RESPONSES)
      expect(classification.sensitivity).toBe(DataSensitivity.PERSONAL)
      expect(classification.legalBasis).toBe(LegalBasis.LEGITIMATE_INTEREST)
      expect(classification.purpose).toContain(ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT)
      expect(classification.dataSubjectType).toBe('employee')
    })
  })

  describe('PrivacyMetadata Interface', () => {
    it('should create valid privacy metadata objects', () => {
      const now = new Date()
      const classification: DataClassification = {
        category: DataCategory.PARTICIPANT_IDENTIFIERS,
        sensitivity: DataSensitivity.PERSONAL,
        legalBasis: LegalBasis.CONSENT,
        purpose: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        controller: DataController.JOINT_CONTROLLERS,
        processors: [DataProcessor.INBOUND_PLATFORM],
        retentionPeriod: 365,
        dataSubjectType: 'management'
      }

      const privacyMetadata: PrivacyMetadata = {
        classification,
        consentRequired: true,
        consentTimestamp: now,
        consentVersion: '1.0',
        pseudonymized: false,
        encrypted: true,
        minimized: true,
        createdAt: now,
        lastModified: now,
        scheduledDeletion: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
      }

      expect(privacyMetadata.consentRequired).toBe(true)
      expect(privacyMetadata.encrypted).toBe(true)
      expect(privacyMetadata.minimized).toBe(true)
      expect(privacyMetadata.classification.legalBasis).toBe(LegalBasis.CONSENT)
    })
  })

  describe('DataProcessingRecord Interface', () => {
    it('should create valid processing records for GDPR Article 30', () => {
      const record: DataProcessingRecord = {
        id: 'proc-001',
        purpose: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT, ProcessingPurpose.STRATEGIC_INSIGHTS],
        categories: [DataCategory.SURVEY_RESPONSES, DataCategory.ORGANIZATIONAL_DATA],
        dataSubjects: ['Employees', 'Management'],
        recipients: ['Inbound Consultants', 'Client Management (aggregated only)'],
        retentionPeriod: 730,
        internationalTransfers: true,
        safeguards: ['Standard Contractual Clauses', 'Encryption in transit and at rest'],
        createdAt: new Date()
      }

      expect(record.id).toBe('proc-001')
      expect(record.purpose).toHaveLength(2)
      expect(record.categories).toContain(DataCategory.SURVEY_RESPONSES)
      expect(record.internationalTransfers).toBe(true)
      expect(record.safeguards).toContain('Standard Contractual Clauses')
    })
  })

  describe('Controller and Processor Relationships', () => {
    it('should define proper controller types', () => {
      expect(DataController.INBOUND_CONSULTING).toBe('inbound_consulting')
      expect(DataController.CLIENT_ORGANIZATION).toBe('client_organization')
      expect(DataController.JOINT_CONTROLLERS).toBe('joint_controllers')
    })

    it('should define proper processor types', () => {
      expect(DataProcessor.INBOUND_PLATFORM).toBe('inbound_platform')
      expect(DataProcessor.OPENAI_SUBPROCESSOR).toBe('openai_subprocessor')
      expect(DataProcessor.HOSTING_PROVIDER).toBe('hosting_provider')
    })
  })
})