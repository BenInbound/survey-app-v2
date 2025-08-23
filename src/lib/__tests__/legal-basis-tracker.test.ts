/**
 * Test Suite for Legal Basis Tracking System
 * Validates GDPR legal basis compliance and tracking functionality
 */

import {
  LegalBasisTrackingManager,
  LegalBasisEvent,
  ConsentRecord,
  DataSubjectRequest
} from '../legal-basis-tracker'

import {
  LegalBasis,
  DataCategory,
  ProcessingPurpose
} from '../gdpr-types'

// Mock localStorage
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

describe('Legal Basis Tracking Manager', () => {
  let trackingManager: LegalBasisTrackingManager

  beforeEach(() => {
    trackingManager = LegalBasisTrackingManager.getInstance()
    trackingManager.clearAllData() // Clear in-memory data
    localStorageMock.clear()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = LegalBasisTrackingManager.getInstance()
      const instance2 = LegalBasisTrackingManager.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Legal Basis Event Tracking', () => {
    it('should track legal basis events correctly', () => {
      const sessionId = 'test-session-001'
      
      trackingManager.trackLegalBasisEvent(sessionId, {
        eventType: 'data_collection',
        details: 'Survey response collected for organizational assessment',
        legalBasis: LegalBasis.LEGITIMATE_INTEREST,
        dataCategory: DataCategory.SURVEY_RESPONSES,
        purpose: ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT
      })

      const storedEvents = JSON.parse(
        localStorageMock.getItem(`gdpr-legal-basis-events-${sessionId}`) || '[]'
      )
      
      expect(storedEvents).toHaveLength(1)
      expect(storedEvents[0].eventType).toBe('data_collection')
      expect(storedEvents[0].legalBasis).toBe(LegalBasis.LEGITIMATE_INTEREST)
      expect(storedEvents[0].dataCategory).toBe(DataCategory.SURVEY_RESPONSES)
      expect(storedEvents[0].timestamp).toBeDefined()
    })

    it('should accumulate multiple events for the same session', () => {
      const sessionId = 'test-session-002'
      
      trackingManager.trackLegalBasisEvent(sessionId, {
        eventType: 'data_collection',
        details: 'Initial data collection',
        legalBasis: LegalBasis.LEGITIMATE_INTEREST,
        dataCategory: DataCategory.SURVEY_RESPONSES,
        purpose: ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT
      })

      trackingManager.trackLegalBasisEvent(sessionId, {
        eventType: 'processing_start',
        details: 'Processing started for analytics',
        legalBasis: LegalBasis.LEGITIMATE_INTEREST,
        dataCategory: DataCategory.ORGANIZATIONAL_DATA,
        purpose: ProcessingPurpose.STRATEGIC_INSIGHTS
      })

      const storedEvents = JSON.parse(
        localStorageMock.getItem(`gdpr-legal-basis-events-${sessionId}`) || '[]'
      )
      
      expect(storedEvents).toHaveLength(2)
      expect(storedEvents[0].eventType).toBe('data_collection')
      expect(storedEvents[1].eventType).toBe('processing_start')
    })
  })

  describe('Consent Recording', () => {
    it('should record consent properly', () => {
      const consentRecord: ConsentRecord = {
        participantId: 'participant-001',
        consentTimestamp: new Date(),
        consentMethod: 'explicit_online',
        consentScope: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        consentVersion: '1.0',
        withdrawalMethod: 'Email privacy@inbound.com or click withdraw button',
        proofOfConsent: {
          type: 'checkbox_log',
          reference: 'checkbox-log-001',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 Test Browser'
        }
      }

      trackingManager.recordConsent(consentRecord)

      const storedConsent = JSON.parse(
        localStorageMock.getItem(`gdpr-consent-${consentRecord.participantId}`) || '{}'
      )
      
      expect(storedConsent.participantId).toBe('participant-001')
      expect(storedConsent.consentMethod).toBe('explicit_online')
      expect(storedConsent.consentScope).toContain(ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT)
      expect(storedConsent.proofOfConsent.type).toBe('checkbox_log')
    })

    it('should track consent as legal basis event', () => {
      const consentRecord: ConsentRecord = {
        participantId: 'participant-002',
        consentTimestamp: new Date(),
        consentMethod: 'explicit_online',
        consentScope: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        consentVersion: '1.0',
        withdrawalMethod: 'Email privacy@inbound.com',
        proofOfConsent: {
          type: 'checkbox_log',
          reference: 'checkbox-log-002'
        }
      }

      trackingManager.recordConsent(consentRecord)

      const storedEvents = JSON.parse(
        localStorageMock.getItem(`gdpr-legal-basis-events-${consentRecord.participantId}`) || '[]'
      )
      
      expect(storedEvents).toHaveLength(1)
      expect(storedEvents[0].eventType).toBe('consent_given')
      expect(storedEvents[0].legalBasis).toBe(LegalBasis.CONSENT)
    })
  })

  describe('Legal Basis Validation', () => {
    it('should recommend legitimate interest for employee organizational assessments', () => {
      const validation = trackingManager.validateLegalBasisForProcessing(
        'employee',
        ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT,
        DataCategory.SURVEY_RESPONSES
      )

      expect(validation.recommendedBasis).toBe(LegalBasis.LEGITIMATE_INTEREST)
      expect(validation.isValid).toBe(true)
      expect(validation.reasoning).toContain('employment relationship constraints')
      expect(validation.requiresBalancingTest).toBe(true)
      expect(validation.additionalSafeguards).toContain('Anonymization of individual responses')
    })

    it('should allow consent for management strategic insights', () => {
      const validation = trackingManager.validateLegalBasisForProcessing(
        'management',
        ProcessingPurpose.STRATEGIC_INSIGHTS,
        DataCategory.ORGANIZATIONAL_DATA
      )

      expect(validation.recommendedBasis).toBe(LegalBasis.CONSENT)
      expect(validation.isValid).toBe(true)
      expect(validation.reasoning).toContain('Management can freely consent')
      expect(validation.requiresBalancingTest).toBe(false)
      expect(validation.additionalSafeguards).toContain('Clear withdrawal mechanism')
    })

    it('should default to legitimate interest for other scenarios', () => {
      const validation = trackingManager.validateLegalBasisForProcessing(
        'employee',
        ProcessingPurpose.PERFORMANCE_ANALYTICS,
        DataCategory.USAGE_ANALYTICS
      )

      expect(validation.recommendedBasis).toBe(LegalBasis.LEGITIMATE_INTEREST)
      expect(validation.isValid).toBe(true)
      expect(validation.reasoning).toContain('Default to legitimate interest')
      expect(validation.requiresBalancingTest).toBe(true)
      expect(validation.additionalSafeguards).toContain('Data minimization')
    })
  })

  describe('Legal Basis Compliance Reporting', () => {
    beforeEach(() => {
      // Set up test data
      trackingManager.trackLegalBasisEvent('session-001', {
        eventType: 'data_collection',
        details: 'demo-org assessment data collection',
        legalBasis: LegalBasis.LEGITIMATE_INTEREST,
        dataCategory: DataCategory.SURVEY_RESPONSES,
        purpose: ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT
      })

      trackingManager.trackLegalBasisEvent('session-002', {
        eventType: 'consent_given',
        details: 'demo-org management consent',
        legalBasis: LegalBasis.CONSENT,
        dataCategory: DataCategory.ORGANIZATIONAL_DATA,
        purpose: ProcessingPurpose.STRATEGIC_INSIGHTS
      })

      trackingManager.recordConsent({
        participantId: 'mgmt-001',
        consentTimestamp: new Date(),
        consentMethod: 'explicit_online',
        consentScope: [ProcessingPurpose.STRATEGIC_INSIGHTS],
        consentVersion: '1.0',
        withdrawalMethod: 'Email',
        proofOfConsent: {
          type: 'checkbox_log',
          reference: 'ref-001'
        }
      })
    })

    it('should generate comprehensive compliance report', () => {
      const report = trackingManager.generateLegalBasisReport('demo-org')

      expect(report.assessmentId).toBe('demo-org')
      expect(report.totalParticipants).toBeGreaterThanOrEqual(2)
      expect(report.legalBasisBreakdown).toBeDefined()
      expect(report.legalBasisBreakdown[LegalBasis.LEGITIMATE_INTEREST]).toBeGreaterThanOrEqual(1)
      expect(report.legalBasisBreakdown[LegalBasis.CONSENT]).toBeGreaterThanOrEqual(1)
      expect(report.consentRecordsCount).toBe(1)
      expect(report.complianceIssues).toBeDefined()
      expect(report.recommendations).toBeDefined()
      expect(report.generatedAt).toBeInstanceOf(Date)
    })

    it('should provide appropriate recommendations', () => {
      const report = trackingManager.generateLegalBasisReport('demo-org')

      expect(report.recommendations).toContain('Implement regular legal basis reviews to ensure ongoing compliance')
      expect(report.recommendations).toContain('Provide clear data subject rights information at point of collection')
    })

    it('should identify high consent withdrawal rates', () => {
      // Add multiple consent withdrawals
      for (let i = 0; i < 5; i++) {
        trackingManager.trackLegalBasisEvent(`session-withdraw-${i}`, {
          eventType: 'consent_withdrawn',
          details: `demo-org consent withdrawal ${i}`,
          legalBasis: LegalBasis.CONSENT,
          dataCategory: DataCategory.SURVEY_RESPONSES,
          purpose: ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT
        })
      }

      const report = trackingManager.generateLegalBasisReport('demo-org')
      const hasWithdrawalIssue = report.complianceIssues.some(issue => 
        issue.includes('High consent withdrawal rate')
      )
      expect(hasWithdrawalIssue).toBe(true)
    })
  })

  describe('Legal Basis Event Types', () => {
    it('should handle all event types correctly', () => {
      const sessionId = 'event-types-test'
      const eventTypes = [
        'data_collection',
        'processing_start', 
        'consent_given',
        'consent_withdrawn',
        'purpose_change',
        'basis_change'
      ] as const

      eventTypes.forEach((eventType, index) => {
        trackingManager.trackLegalBasisEvent(sessionId, {
          eventType,
          details: `Test event ${index}`,
          legalBasis: LegalBasis.LEGITIMATE_INTEREST,
          dataCategory: DataCategory.SURVEY_RESPONSES,
          purpose: ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT
        })
      })

      const storedEvents = JSON.parse(
        localStorageMock.getItem(`gdpr-legal-basis-events-${sessionId}`) || '[]'
      )

      expect(storedEvents).toHaveLength(eventTypes.length)
      eventTypes.forEach((eventType, index) => {
        expect(storedEvents[index].eventType).toBe(eventType)
      })
    })
  })

  describe('Data Categories and Purposes Tracking', () => {
    it('should track different data categories correctly', () => {
      const sessionId = 'categories-test'
      const categories = [
        DataCategory.SURVEY_RESPONSES,
        DataCategory.PARTICIPANT_IDENTIFIERS,
        DataCategory.ORGANIZATIONAL_DATA,
        DataCategory.USAGE_ANALYTICS,
        DataCategory.TECHNICAL_DATA
      ]

      categories.forEach((category, index) => {
        trackingManager.trackLegalBasisEvent(sessionId, {
          eventType: 'data_collection',
          details: `Category test ${index}`,
          legalBasis: LegalBasis.LEGITIMATE_INTEREST,
          dataCategory: category,
          purpose: ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT
        })
      })

      const storedEvents = JSON.parse(
        localStorageMock.getItem(`gdpr-legal-basis-events-${sessionId}`) || '[]'
      )

      expect(storedEvents).toHaveLength(categories.length)
      categories.forEach((category, index) => {
        expect(storedEvents[index].dataCategory).toBe(category)
      })
    })

    it('should track different processing purposes correctly', () => {
      const sessionId = 'purposes-test'
      const purposes = [
        ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT,
        ProcessingPurpose.STRATEGIC_INSIGHTS,
        ProcessingPurpose.PERFORMANCE_ANALYTICS,
        ProcessingPurpose.SYSTEM_ADMINISTRATION,
        ProcessingPurpose.LEGAL_COMPLIANCE
      ]

      purposes.forEach((purpose, index) => {
        trackingManager.trackLegalBasisEvent(sessionId, {
          eventType: 'processing_start',
          details: `Purpose test ${index}`,
          legalBasis: LegalBasis.LEGITIMATE_INTEREST,
          dataCategory: DataCategory.SURVEY_RESPONSES,
          purpose
        })
      })

      const storedEvents = JSON.parse(
        localStorageMock.getItem(`gdpr-legal-basis-events-${sessionId}`) || '[]'
      )

      expect(storedEvents).toHaveLength(purposes.length)
      purposes.forEach((purpose, index) => {
        expect(storedEvents[index].purpose).toBe(purpose)
      })
    })
  })

  describe('Consent Record Validation', () => {
    it('should handle different consent methods', () => {
      const consentMethods = [
        'explicit_online',
        'opt_in_form', 
        'verbal_recorded',
        'implicit_participation'
      ] as const

      consentMethods.forEach((method, index) => {
        const consentRecord: ConsentRecord = {
          participantId: `participant-${index}`,
          consentTimestamp: new Date(),
          consentMethod: method,
          consentScope: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
          consentVersion: '1.0',
          withdrawalMethod: 'Email',
          proofOfConsent: {
            type: 'checkbox_log',
            reference: `ref-${index}`
          }
        }

        trackingManager.recordConsent(consentRecord)

        const storedConsent = JSON.parse(
          localStorageMock.getItem(`gdpr-consent-participant-${index}`) || '{}'
        )
        
        expect(storedConsent.consentMethod).toBe(method)
      })
    })

    it('should handle different proof of consent types', () => {
      const proofTypes = [
        'checkbox_log',
        'form_submission',
        'audit_log',
        'email_confirmation'
      ] as const

      proofTypes.forEach((proofType, index) => {
        const consentRecord: ConsentRecord = {
          participantId: `proof-participant-${index}`,
          consentTimestamp: new Date(),
          consentMethod: 'explicit_online',
          consentScope: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
          consentVersion: '1.0',
          withdrawalMethod: 'Email',
          proofOfConsent: {
            type: proofType,
            reference: `proof-ref-${index}`
          }
        }

        trackingManager.recordConsent(consentRecord)

        const storedConsent = JSON.parse(
          localStorageMock.getItem(`gdpr-consent-proof-participant-${index}`) || '{}'
        )
        
        expect(storedConsent.proofOfConsent.type).toBe(proofType)
      })
    })
  })
})