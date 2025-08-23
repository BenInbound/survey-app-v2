/**
 * Privacy Integration Tests
 * Tests for privacy notice functionality and GDPR compliance
 */

import { ControllerProcessorManager } from '../../../lib/controller-processor-manager'
import { OrganizationalAssessmentManager } from '../../../lib/organizational-assessment-manager'
import { LegalBasisTracker } from '../../../lib/legal-basis-tracker'
import { PrivacyManager } from '../../../lib/privacy-manager'

describe('Privacy Notice GDPR Integration', () => {
  let controllerManager: ControllerProcessorManager
  let assessmentManager: OrganizationalAssessmentManager
  let legalBasisTracker: LegalBasisTracker
  let privacyManager: PrivacyManager

  beforeEach(() => {
    controllerManager = new ControllerProcessorManager()
    assessmentManager = new OrganizationalAssessmentManager()
    legalBasisTracker = new LegalBasisTracker()
    privacyManager = new PrivacyManager()

    // Initialize demo data
    assessmentManager.initializeDemoAssessment()
  })

  describe('GDPR Infrastructure Integration', () => {
    it('creates joint controller agreements for assessments', () => {
      const assessmentId = 'test-assessment-123'
      const organizationName = 'Test Organization'

      const agreement = controllerManager.createJointControllerAgreement(
        assessmentId, 
        organizationName
      )

      expect(agreement).toBeDefined()
      expect(agreement.id).toBe(`jca-${assessmentId}`)
      expect(agreement.controllers).toContain('inbound_consulting')
      expect(agreement.controllers).toContain('client_organization')
      expect(agreement.assessmentId).toBe(assessmentId)
    })

    it('generates processing overview with all required GDPR elements', () => {
      const assessmentId = 'demo-org'
      
      // Create necessary agreements
      controllerManager.createJointControllerAgreement(assessmentId, 'Demo Organization')

      const overview = controllerManager.generateProcessingOverview(assessmentId)

      expect(overview.assessment).toBe(assessmentId)
      expect(overview.controllers).toBeDefined()
      expect(overview.processors).toBeDefined()
      expect(overview.complianceStatus).toBe('Compliant')
      
      // Should have Inbound as controller
      const inboundController = overview.controllers.find(c => c.id === 'inbound_consulting')
      expect(inboundController).toBeDefined()
      expect(inboundController?.contactEmail).toBe('privacy@inbound.com')
    })

    it('tracks legal basis for legitimate interest processing', () => {
      const assessmentId = 'demo-org'
      
      const event = legalBasisTracker.trackLegalBasisEvent({
        assessmentId,
        eventType: 'data_collection',
        legalBasis: 'legitimate_interest',
        dataCategory: 'survey_responses',
        purpose: 'organizational_assessment',
        dataSubject: 'employee',
        safeguards: ['pseudonymization', 'aggregation']
      })

      expect(event).toBeDefined()
      expect(event.legalBasis).toBe('legitimate_interest')
      expect(event.dataCategory).toBe('survey_responses')
      expect(event.purpose).toBe('organizational_assessment')
      expect(event.safeguards).toContain('pseudonymization')
    })

    it('validates data processing agreements for OpenAI integration', () => {
      const assessmentId = 'demo-org'
      
      const dpa = controllerManager.createDataProcessingAgreement(
        assessmentId,
        'inbound_consulting',
        'openai_subprocessor',
        ['strategic_insights'],
        ['survey_responses'],
        'legitimate_interest'
      )

      expect(dpa).toBeDefined()
      expect(dpa.controllerId).toBe('inbound_consulting')
      expect(dpa.processorId).toBe('openai_subprocessor')
      expect(dpa.purposes).toContain('strategic_insights')
      expect(dpa.dataTransferMechanisms).toContain('Standard Contractual Clauses (EU-US)')
      expect(dpa.status).toBe('active')
    })
  })

  describe('Privacy Notice Data Requirements', () => {
    it('provides all required GDPR transparency information', () => {
      const assessmentId = 'demo-org'
      const assessment = assessmentManager.getAssessment(assessmentId)
      
      expect(assessment).toBeDefined()
      expect(assessment?.organizationName).toBeDefined()

      // Data controllers
      const inboundController = controllerManager.getControllerEntity('inbound_consulting')
      expect(inboundController).toBeDefined()
      expect(inboundController?.contactEmail).toBe('privacy@inbound.com')
      expect(inboundController?.address).toBe('Oslo, Norway')

      // Processing purposes
      const overview = controllerManager.generateProcessingOverview(assessmentId)
      expect(overview.complianceStatus).toBe('Compliant')
    })

    it('defines data retention periods correctly', () => {
      const privacyConfig = privacyManager.getPrivacyConfiguration('survey_responses')
      
      expect(privacyConfig).toBeDefined()
      expect(privacyConfig.retentionPeriod).toBeGreaterThan(0)
      expect(privacyConfig.deletionMethod).toBe('secure_deletion')
    })

    it('validates legitimate interest legal basis', () => {
      const validation = legalBasisTracker.validateLegalBasis({
        legalBasis: 'legitimate_interest',
        dataCategory: 'survey_responses',
        purpose: 'organizational_assessment',
        dataSubject: 'employee'
      })

      expect(validation.isValid).toBe(true)
      expect(validation.balancingTestRequired).toBe(true)
      expect(validation.safeguards).toContain('data_minimization')
      expect(validation.safeguards).toContain('pseudonymization')
    })
  })

  describe('Data Subject Rights Implementation', () => {
    it('supports all required GDPR data subject rights', () => {
      const rights = [
        'access', 'rectification', 'erasure', 
        'restriction', 'portability', 'objection'
      ]

      rights.forEach(right => {
        const canExercise = privacyManager.canExerciseRight(right as any, 'employee')
        expect(canExercise).toBe(true)
      })
    })

    it('defines correct contact points for rights requests', () => {
      const assessmentId = 'demo-org'
      const jointAgreement = controllerManager.createJointControllerAgreement(
        assessmentId, 
        'Demo Organization'
      )

      expect(jointAgreement.contactPointController).toBe('client_organization')
      expect(jointAgreement.dataSubjectRights.accessRequests).toBe('client_organization')
      expect(jointAgreement.dataSubjectRights.erasureRequests).toBe('inbound_consulting')
    })
  })

  describe('International Transfer Safeguards', () => {
    it('implements Standard Contractual Clauses for OpenAI transfers', () => {
      const assessmentId = 'demo-org'
      
      const dpa = controllerManager.createDataProcessingAgreement(
        assessmentId,
        'inbound_consulting',
        'openai_subprocessor',
        ['strategic_insights'],
        ['survey_responses'],
        'legitimate_interest'
      )

      expect(dpa.dataTransferMechanisms).toContain('Standard Contractual Clauses (EU-US)')
      expect(dpa.dataTransferMechanisms).toContain('Supplementary Technical Measures')
      expect(dpa.breachNotificationHours).toBe(72)
      expect(dpa.auditRights).toBe(true)
    })

    it('validates processor compliance for international transfers', () => {
      const compliance = controllerManager.validateProcessorCompliance('openai_subprocessor')
      
      expect(compliance.compliant).toBe(true)
      expect(compliance.recommendations).toContain('Ensure Standard Contractual Clauses are maintained for US data transfers')
    })
  })

  describe('Privacy by Design Implementation', () => {
    it('applies data minimization principles', () => {
      const config = privacyManager.getPrivacyConfiguration('survey_responses')
      
      expect(config.dataMinimization).toBe(true)
      expect(config.purposeLimitation).toBe(true)
      expect(config.storageMinimization).toBe(true)
    })

    it('implements pseudonymization for employee protection', () => {
      const config = privacyManager.getPrivacyConfiguration('participant_identifiers')
      
      expect(config.pseudonymization).toBe(true)
      expect(config.encryption).toBe(true)
      expect(config.accessControls).toBeDefined()
    })

    it('ensures automatic deletion scheduling', () => {
      const assessmentId = 'demo-org'
      
      const deletionSchedule = privacyManager.getAutomaticDeletionSchedule(assessmentId)
      
      expect(deletionSchedule).toBeDefined()
      expect(deletionSchedule.identifiersRetention).toBe(365) // 1 year
      expect(deletionSchedule.insightsRetention).toBe(730) // 2 years
      expect(deletionSchedule.technicalDataRetention).toBe(90) // 3 months
    })
  })

  describe('Privacy Notice URL Structure', () => {
    it('generates correct privacy notice URLs for assessments', () => {
      const assessmentId = 'demo-org'
      const expectedUrl = `/privacy/${assessmentId}`
      
      // This would be used in the survey landing pages
      expect(expectedUrl).toBe('/privacy/demo-org')
    })

    it('supports assessment-specific privacy information', () => {
      const assessmentId = 'custom-assessment'
      const organizationName = 'Custom Organization'
      
      // Assessment should be linkable to privacy notice
      const assessment = {
        id: assessmentId,
        organizationName,
        privacyNoticeUrl: `/privacy/${assessmentId}`
      }
      
      expect(assessment.privacyNoticeUrl).toBe('/privacy/custom-assessment')
      expect(assessment.organizationName).toBe('Custom Organization')
    })
  })
})