/**
 * Test Suite for Privacy Enhanced Models
 * Validates GDPR integration with existing survey platform data models
 */

import { PrivacyEnhancementService } from '../privacy-enhanced-models'
import {
  Survey,
  ParticipantSession,
  SurveyResponse,
  OrganizationalAssessment,
  Question,
  SliderValue
} from '../types'

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

describe('Privacy Enhancement Service', () => {
  let privacyService: PrivacyEnhancementService

  // Test data
  const mockSurvey: Survey = {
    id: 'test-survey-001',
    name: 'Test Organizational Assessment',
    questions: [
      { id: 'q1', text: 'Test question 1', category: 'strategic-alignment', order: 1 },
      { id: 'q2', text: 'Test question 2', category: 'communication', order: 2 }
    ],
    branding: {
      name: 'Test Organization',
      primaryColor: '#FF6B9D',
      logoUrl: '/assets/images/logo.svg'
    },
    createdAt: new Date()
  }

  const mockParticipantSession: ParticipantSession = {
    surveyId: 'test-survey-001',
    participantId: 'participant-001',
    department: 'Engineering',
    responses: [],
    currentQuestionIndex: 0,
    startedAt: new Date()
  }

  const mockSurveyResponse: SurveyResponse = {
    questionId: 'q1',
    score: 8 as SliderValue
  }

  const mockQuestion: Question = {
    id: 'q1',
    text: 'How well does leadership communicate strategic vision?',
    category: 'strategic-alignment',
    order: 1
  }

  const mockOrganizationalAssessment: OrganizationalAssessment = {
    id: 'test-assessment-001',
    organizationName: 'Test Organization',
    consultantId: 'consultant@inbound.com',
    status: 'collecting',
    created: new Date(),
    accessCode: 'TEST-2025-STRATEGY',
    managementResponses: {
      categoryAverages: [{ category: 'strategic-alignment', average: 7.5, responses: 5 }],
      overallAverage: 7.5,
      responseCount: 5
    },
    employeeResponses: {
      categoryAverages: [{ category: 'strategic-alignment', average: 6.2, responses: 15 }],
      overallAverage: 6.2,
      responseCount: 15
    },
    responseCount: { management: 5, employee: 15 }
  }

  beforeEach(() => {
    privacyService = new PrivacyEnhancementService()
    // Clear the legal basis tracker instance data
    const tracker = require('../legal-basis-tracker').LegalBasisTrackingManager.getInstance()
    if (tracker && typeof tracker.clearAllData === 'function') {
      tracker.clearAllData()
    }
    localStorageMock.clear()
  })

  describe('Survey Enhancement', () => {
    it('should enhance survey with comprehensive privacy metadata', () => {
      const enhancedSurvey = privacyService.enhanceSurvey(mockSurvey, 'Test Organization')

      expect(enhancedSurvey.id).toBe(mockSurvey.id)
      expect(enhancedSurvey.name).toBe(mockSurvey.name)
      expect(enhancedSurvey.privacyMetadata).toBeDefined()
      expect(enhancedSurvey.privacyMetadata.classification.category).toBe(DataCategory.SURVEY_RESPONSES)
      expect(enhancedSurvey.privacyMetadata.encrypted).toBe(true)
      expect(enhancedSurvey.privacyMetadata.pseudonymized).toBe(true)
      expect(enhancedSurvey.dataProcessingRecord).toBeDefined()
      expect(enhancedSurvey.jointControllerAgreement).toBeDefined()
    })

    it('should generate appropriate privacy notice for survey', () => {
      const enhancedSurvey = privacyService.enhanceSurvey(mockSurvey, 'Test Organization')

      expect(enhancedSurvey.privacyNotice.title).toContain('Test Organizational Assessment')
      expect(enhancedSurvey.privacyNotice.controller).toContain('Test Organization')
      expect(enhancedSurvey.privacyNotice.controller).toContain('Inbound Consulting AS')
      expect(enhancedSurvey.privacyNotice.legalBasis).toBe('Legitimate business interest')
      expect(enhancedSurvey.privacyNotice.purposes).toContain('Organizational strategic assessment')
    })

    it('should include comprehensive data subject rights information', () => {
      const enhancedSurvey = privacyService.enhanceSurvey(mockSurvey)

      expect(enhancedSurvey.dataSubjectRights.access.available).toBe(true)
      expect(enhancedSurvey.dataSubjectRights.rectification.available).toBe(true)
      expect(enhancedSurvey.dataSubjectRights.erasure.available).toBe(true)
      expect(enhancedSurvey.dataSubjectRights.objection.available).toBe(true)
      expect(enhancedSurvey.dataSubjectRights.access.timeframe).toBe('30 days')
    })

    it('should create retention policy for survey data', () => {
      const enhancedSurvey = privacyService.enhanceSurvey(mockSurvey)

      expect(enhancedSurvey.retentionPolicy.category).toBe(DataCategory.SURVEY_RESPONSES)
      expect(enhancedSurvey.retentionPolicy.retentionPeriod).toBe(730) // 2 years
      expect(enhancedSurvey.retentionPolicy.automaticDeletion).toBe(true)
    })
  })

  describe('Participant Session Enhancement', () => {
    it('should enhance employee session with legitimate interest basis', () => {
      const enhancedSession = privacyService.enhanceParticipantSession(mockParticipantSession, 'employee')

      expect(enhancedSession.participantId).toBe(mockParticipantSession.participantId)
      expect(enhancedSession.participantRole).toBe('employee')
      expect(enhancedSession.legalBasisTracker.primaryLegalBasis).toBe(LegalBasis.LEGITIMATE_INTEREST)
      expect(enhancedSession.legalBasisTracker.basisJustification).toContain('employment relationship constraints')
      expect(enhancedSession.privacyMetadata).toBeDefined()
      expect(enhancedSession.consentRecord).toBeUndefined() // Should not require consent for employees
    })

    it('should enhance management session appropriately', () => {
      const managementSession = { ...mockParticipantSession, participantId: 'management-001' }
      const enhancedSession = privacyService.enhanceParticipantSession(managementSession, 'management')

      expect(enhancedSession.participantRole).toBe('management')
      expect(enhancedSession.legalBasisTracker.primaryLegalBasis).toBe(LegalBasis.LEGITIMATE_INTEREST)
      expect(enhancedSession.dataSubjectRights.informationProvided).toBe(true)
      expect(enhancedSession.dataSubjectRights.anonymityGuaranteed).toBe(true)
    })

    it('should track session start event', () => {
      const enhancedSession = privacyService.enhanceParticipantSession(mockParticipantSession, 'employee')

      const trackedEvents = JSON.parse(
        localStorageMock.getItem(`gdpr-legal-basis-events-${mockParticipantSession.participantId}`) || '[]'
      )

      expect(trackedEvents).toHaveLength(1)
      expect(trackedEvents[0].eventType).toBe('data_collection')
      expect(trackedEvents[0].details).toContain('Survey session started')
    })

    it('should include necessary data categories and purposes', () => {
      const enhancedSession = privacyService.enhanceParticipantSession(mockParticipantSession, 'employee')

      expect(enhancedSession.legalBasisTracker.dataCategories).toContain(DataCategory.SURVEY_RESPONSES)
      expect(enhancedSession.legalBasisTracker.dataCategories).toContain(DataCategory.PARTICIPANT_IDENTIFIERS)
      expect(enhancedSession.legalBasisTracker.purposes).toContain(ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT)
    })
  })

  describe('Survey Response Enhancement', () => {
    it('should enhance survey response with privacy classification', () => {
      const enhancedResponse = privacyService.enhanceSurveyResponse(
        mockSurveyResponse,
        mockQuestion,
        'participant-001',
        'employee'
      )

      expect(enhancedResponse.questionId).toBe(mockSurveyResponse.questionId)
      expect(enhancedResponse.score).toBe(mockSurveyResponse.score)
      expect(enhancedResponse.privacyClassification).toBeDefined()
      expect(enhancedResponse.privacyClassification.category).toBe(DataCategory.SURVEY_RESPONSES)
      expect(enhancedResponse.processingLegalBasis).toBe(LegalBasis.LEGITIMATE_INTEREST)
      expect(enhancedResponse.minimizationApplied).toBe(true)
    })

    it('should apply advanced pseudonymization for employees', () => {
      const enhancedResponse = privacyService.enhanceSurveyResponse(
        mockSurveyResponse,
        mockQuestion,
        'employee-001',
        'employee'
      )

      expect(enhancedResponse.pseudonymizationLevel).toBe('advanced')
    })

    it('should apply basic pseudonymization for management', () => {
      const enhancedResponse = privacyService.enhanceSurveyResponse(
        mockSurveyResponse,
        mockQuestion,
        'mgmt-001',
        'management'
      )

      expect(enhancedResponse.pseudonymizationLevel).toBe('basic')
    })

    it('should track response collection event', () => {
      privacyService.enhanceSurveyResponse(
        mockSurveyResponse,
        mockQuestion,
        'participant-002',
        'employee'
      )

      const trackedEvents = JSON.parse(
        localStorageMock.getItem('gdpr-legal-basis-events-participant-002') || '[]'
      )

      expect(trackedEvents).toHaveLength(1)
      expect(trackedEvents[0].eventType).toBe('data_collection')
      expect(trackedEvents[0].details).toContain('Response collected')
    })
  })

  describe('Organizational Assessment Enhancement', () => {
    it('should enhance assessment with comprehensive GDPR integration', () => {
      const enhancedAssessment = privacyService.enhanceOrganizationalAssessment(mockOrganizationalAssessment)

      expect(enhancedAssessment.id).toBe(mockOrganizationalAssessment.id)
      expect(enhancedAssessment.legalBasisMatrix).toBeDefined()
      expect(enhancedAssessment.dataProcessingAgreements).toHaveLength(2) // Inbound + OpenAI
      expect(enhancedAssessment.jointControllerAgreement).toBeDefined()
      expect(enhancedAssessment.privacyConfiguration).toBeDefined()
    })

    it('should create proper legal basis matrix', () => {
      const enhancedAssessment = privacyService.enhanceOrganizationalAssessment(mockOrganizationalAssessment)

      expect(enhancedAssessment.legalBasisMatrix.participantRoles).toHaveLength(2)
      
      const employeeRole = enhancedAssessment.legalBasisMatrix.participantRoles.find(r => r.role === 'employee')
      const managementRole = enhancedAssessment.legalBasisMatrix.participantRoles.find(r => r.role === 'management')

      expect(employeeRole?.legalBasis).toBe(LegalBasis.LEGITIMATE_INTEREST)
      expect(managementRole?.legalBasis).toBe(LegalBasis.LEGITIMATE_INTEREST)
    })

    it('should include data processing activities', () => {
      const enhancedAssessment = privacyService.enhanceOrganizationalAssessment(mockOrganizationalAssessment)

      const activities = enhancedAssessment.legalBasisMatrix.dataProcessingActivities
      expect(activities.length).toBeGreaterThanOrEqual(2)
      
      const responseCollection = activities.find(a => a.activity === 'Survey Response Collection')
      const insightsGeneration = activities.find(a => a.activity === 'Strategic Insights Generation')

      expect(responseCollection).toBeDefined()
      expect(insightsGeneration).toBeDefined()
    })

    it('should handle cross-border transfers', () => {
      const enhancedAssessment = privacyService.enhanceOrganizationalAssessment(mockOrganizationalAssessment)

      const transfers = enhancedAssessment.legalBasisMatrix.crossBorderTransfers
      const openaiTransfer = transfers.find(t => t.recipient === 'OpenAI Inc.')

      expect(openaiTransfer).toBeDefined()
      expect(openaiTransfer?.country).toBe('United States')
      expect(openaiTransfer?.adequacyDecision).toBe(false)
      expect(openaiTransfer?.safeguards).toContain('Standard Contractual Clauses')
    })

    it('should include privacy configuration', () => {
      const enhancedAssessment = privacyService.enhanceOrganizationalAssessment(mockOrganizationalAssessment)

      const config = enhancedAssessment.privacyConfiguration
      expect(config.jointControllerArrangement).toBe(true)
      expect(config.internationalTransfers).toBe(true)
      expect(config.consentRequired).toBe(false)
      expect(config.legitimateInterestAssessment.status).toBe('valid')
    })
  })

  describe('Data Subject Request Handling', () => {
    it('should handle access requests properly', () => {
      const response = privacyService.handleDataSubjectRequest(
        'participant-001',
        'access',
        'I would like to access my personal data from the organizational assessment'
      )

      expect(response.requestId).toBeDefined()
      expect(response.participantId).toBe('participant-001')
      expect(response.requestType).toBe('access')
      expect(response.status).toBe('received')
      expect(response.estimatedResponseTime).toBe('30 days')
      expect(response.contactInformation).toBe('privacy@inbound.com')
    })

    it('should handle erasure requests properly', () => {
      const response = privacyService.handleDataSubjectRequest(
        'participant-002',
        'erasure',
        'Please delete all my personal data from the assessment'
      )

      expect(response.requestType).toBe('erasure')
      expect(response.deadlineDate).toBeInstanceOf(Date)
      expect(response.trackingReference).toBeDefined()
    })

    it('should track data subject request events', () => {
      privacyService.handleDataSubjectRequest('participant-003', 'objection', 'I object to processing')

      const trackedEvents = JSON.parse(
        localStorageMock.getItem('gdpr-legal-basis-events-participant-003') || '[]'
      )

      expect(trackedEvents).toHaveLength(1)
      expect(trackedEvents[0].eventType).toBe('purpose_change')
      expect(trackedEvents[0].details).toContain('Data subject request: objection')
    })
  })

  describe('Privacy Impact Assessment', () => {
    it('should generate comprehensive PIA', () => {
      // First create some tracking data
      const enhancedAssessment = privacyService.enhanceOrganizationalAssessment(mockOrganizationalAssessment)
      
      const pia = privacyService.generatePrivacyImpactAssessment(enhancedAssessment.id)

      expect(pia.assessmentId).toBe(enhancedAssessment.id)
      expect(pia.conductedDate).toBeInstanceOf(Date)
      expect(pia.riskLevel).toBe('low')
      expect(pia.dataTypes.length).toBeGreaterThan(0)
      expect(pia.processingPurposes.length).toBeGreaterThan(0)
      expect(pia.legalBasis).toContain('Legitimate business interest')
    })

    it('should identify appropriate risks and mitigations', () => {
      const enhancedAssessment = privacyService.enhanceOrganizationalAssessment(mockOrganizationalAssessment)
      const pia = privacyService.generatePrivacyImpactAssessment(enhancedAssessment.id)

      expect(pia.risks.length).toBeGreaterThanOrEqual(2)
      
      const identificationRisk = pia.risks.find(r => r.risk.includes('identification'))
      const transferRisk = pia.risks.find(r => r.risk.includes('Cross-border'))

      expect(identificationRisk).toBeDefined()
      expect(transferRisk).toBeDefined()
    })

    it('should include comprehensive safeguards', () => {
      const enhancedAssessment = privacyService.enhanceOrganizationalAssessment(mockOrganizationalAssessment)
      const pia = privacyService.generatePrivacyImpactAssessment(enhancedAssessment.id)

      expect(pia.safeguards).toContain('Data pseudonymization')
      expect(pia.safeguards).toContain('Response aggregation')
      expect(pia.safeguards).toContain('Employee anonymity protection')
      expect(pia.safeguards).toContain('Encrypted data transmission')
    })

    it('should set appropriate review dates', () => {
      const enhancedAssessment = privacyService.enhanceOrganizationalAssessment(mockOrganizationalAssessment)
      const pia = privacyService.generatePrivacyImpactAssessment(enhancedAssessment.id)

      expect(pia.reviewDate).toBeInstanceOf(Date)
      expect(pia.reviewDate.getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe('Integration Testing', () => {
    it('should handle complete survey workflow with privacy enhancement', () => {
      // 1. Enhance survey
      const enhancedSurvey = privacyService.enhanceSurvey(mockSurvey, 'Integration Test Org')
      
      // 2. Enhance participant session
      const enhancedSession = privacyService.enhanceParticipantSession(mockParticipantSession, 'employee')
      
      // 3. Enhance survey response
      const enhancedResponse = privacyService.enhanceSurveyResponse(
        mockSurveyResponse,
        mockQuestion,
        mockParticipantSession.participantId,
        'employee'
      )
      
      // 4. Enhance organizational assessment
      const enhancedAssessment = privacyService.enhanceOrganizationalAssessment(mockOrganizationalAssessment)

      // Verify complete integration
      expect(enhancedSurvey.privacyMetadata).toBeDefined()
      expect(enhancedSession.legalBasisTracker).toBeDefined()
      expect(enhancedResponse.privacyClassification).toBeDefined()
      expect(enhancedAssessment.legalBasisMatrix).toBeDefined()

      // Verify legal basis tracking events were created
      const trackedEvents = JSON.parse(
        localStorageMock.getItem(`gdpr-legal-basis-events-${mockParticipantSession.participantId}`) || '[]'
      )
      expect(trackedEvents.length).toBeGreaterThanOrEqual(2) // Session start + response
    })

    it('should maintain data consistency across enhancements', () => {
      const enhancedSurvey = privacyService.enhanceSurvey(mockSurvey, 'Consistency Test Org')
      const enhancedSession = privacyService.enhanceParticipantSession(mockParticipantSession, 'employee')
      const enhancedAssessment = privacyService.enhanceOrganizationalAssessment(mockOrganizationalAssessment)

      // Verify consistent legal basis
      expect(enhancedSession.legalBasisTracker.primaryLegalBasis).toBe(LegalBasis.LEGITIMATE_INTEREST)
      const employeeRole = enhancedAssessment.legalBasisMatrix.participantRoles.find(r => r.role === 'employee')
      expect(employeeRole?.legalBasis).toBe(LegalBasis.LEGITIMATE_INTEREST)

      // Verify consistent data categories
      expect(enhancedSession.legalBasisTracker.dataCategories).toContain(DataCategory.SURVEY_RESPONSES)
      expect(enhancedSurvey.privacyMetadata.classification.category).toBe(DataCategory.SURVEY_RESPONSES)
    })
  })
})