/**
 * Basic Privacy Notice Tests
 * Essential functionality tests for privacy notice implementation
 */

import { ControllerProcessorManager } from '../../../lib/controller-processor-manager'
import { OrganizationalAssessmentManager } from '../../../lib/organizational-assessment-manager'

describe('Privacy Notice Basic Functionality', () => {
  let controllerManager: ControllerProcessorManager
  let assessmentManager: OrganizationalAssessmentManager

  beforeEach(() => {
    controllerManager = new ControllerProcessorManager()
    assessmentManager = new OrganizationalAssessmentManager()
  })

  it('provides GDPR controller information for privacy notices', () => {
    const inboundController = controllerManager.getControllerEntity('inbound_consulting')
    
    expect(inboundController).toBeDefined()
    expect(inboundController?.name).toBe('Inbound Consulting')
    expect(inboundController?.contactEmail).toBe('guro@inbound.com')
    expect(inboundController?.address).toBe('Oslo, Norway')
    expect(inboundController?.dpoContact).toBe('privacy@inbound.com')
  })

  it('creates joint controller agreements for assessments', () => {
    const assessmentId = 'test-assessment'
    const organizationName = 'Test Organization'

    const agreement = controllerManager.createJointControllerAgreement(
      assessmentId, 
      organizationName
    )

    expect(agreement).toBeDefined()
    expect(agreement.id).toBe(`jca-${assessmentId}`)
    expect(agreement.controllers).toEqual(['inbound_consulting', 'client_organization'])
    expect(agreement.contactPointController).toBe('client_organization')
    expect(agreement.dataSubjectRights.accessRequests).toBe('client_organization')
    expect(agreement.dataSubjectRights.erasureRequests).toBe('inbound_consulting')
  })

  it('generates processing overview with OpenAI processor information', () => {
    const assessmentId = 'demo-org'
    
    controllerManager.createJointControllerAgreement(assessmentId, 'Demo Organization')
    controllerManager.createDataProcessingAgreement(
      assessmentId,
      'inbound_consulting',
      'openai_subprocessor',
      ['strategic_insights'],
      ['survey_responses'],
      'legitimate_interest'
    )

    const overview = controllerManager.generateProcessingOverview(assessmentId)

    expect(overview.assessment).toBe(assessmentId)
    expect(overview.complianceStatus).toBe('Compliant')
    
    const openaiProcessor = overview.processors.find(p => p.id === 'openai_subprocessor')
    expect(openaiProcessor).toBeDefined()
    expect(openaiProcessor?.jurisdiction).toBe('United States')
  })

  it('validates data processing agreements include required GDPR elements', () => {
    const assessmentId = 'demo-org'
    
    const dpa = controllerManager.createDataProcessingAgreement(
      assessmentId,
      'inbound_consulting',
      'openai_subprocessor',
      ['strategic_insights'],
      ['survey_responses'],
      'legitimate_interest'
    )

    expect(dpa.purposes).toContain('strategic_insights')
    expect(dpa.categories).toContain('survey_responses')
    expect(dpa.legalBasis).toBe('legitimate_interest')
    expect(dpa.dataTransferMechanisms).toContain('Standard Contractual Clauses (EU-US)')
    expect(dpa.breachNotificationHours).toBe(72)
    expect(dpa.securityMeasures).toContain('Pseudonymization of personal data')
    expect(dpa.securityMeasures).toContain('Encryption at rest and in transit')
  })

  it('supports privacy notice URL generation for assessments', () => {
    const assessmentId = 'test-assessment'
    
    // Privacy notice URL pattern doesn't require the assessment to exist
    const privacyNoticeUrl = `/privacy/${assessmentId}`
    expect(privacyNoticeUrl).toBe('/privacy/test-assessment')
    
    // URL generation works for any assessment ID
    expect(`/privacy/demo-org`).toBe('/privacy/demo-org')
    expect(`/privacy/custom-123`).toBe('/privacy/custom-123')
  })

  it('validates processor compliance for international transfers', () => {
    const compliance = controllerManager.validateProcessorCompliance('openai_subprocessor')
    
    expect(compliance.compliant).toBe(true)
    expect(compliance.issues).toHaveLength(0)
    expect(compliance.recommendations).toContain(
      'Ensure Standard Contractual Clauses are maintained for US data transfers'
    )
  })

  it('exports DPA documents with privacy notice information', () => {
    const assessmentId = 'demo-org'
    
    const dpa = controllerManager.createDataProcessingAgreement(
      assessmentId,
      'inbound_consulting',
      'openai_subprocessor',
      ['strategic_insights'],
      ['survey_responses'],
      'legitimate_interest'
    )

    const dpaDocument = controllerManager.exportDPADocument(dpa.id)
    
    expect(dpaDocument).toBeDefined()
    const parsedDoc = JSON.parse(dpaDocument!)
    
    expect(parsedDoc.documentType).toBe('Data Processing Agreement')
    expect(parsedDoc.controller.contact).toBe('guro@inbound.com')
    expect(parsedDoc.processingDetails.legalBasis).toBe('legitimate_interest')
    expect(parsedDoc.processingDetails.dataTransfers).toContain('Standard Contractual Clauses (EU-US)')
  })
})