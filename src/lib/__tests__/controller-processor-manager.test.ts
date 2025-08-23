/**
 * Test Suite for GDPR Controller-Processor Manager
 * Validates controller-processor relationships and GDPR Articles 26, 28 compliance
 */

import { ControllerProcessorManager } from '../controller-processor-manager'
import {
  DataController,
  DataProcessor,
  DataCategory,
  ProcessingPurpose,
  LegalBasis
} from '../gdpr-types'

// Mock process.env for public URL
const originalEnv = process.env
beforeEach(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_BASE_URL: 'https://example.com'
  }
})

afterEach(() => {
  process.env = originalEnv
})

describe('Controller Processor Manager', () => {
  let manager: ControllerProcessorManager

  beforeEach(() => {
    manager = new ControllerProcessorManager()
  })

  describe('Entity Management', () => {
    it('should initialize with default controller entities', () => {
      const inboundController = manager.getControllerEntity(DataController.INBOUND_CONSULTING)
      const clientController = manager.getControllerEntity(DataController.CLIENT_ORGANIZATION)

      expect(inboundController).toBeDefined()
      expect(inboundController?.legalName).toBe('Inbound Consulting AS')
      expect(inboundController?.contactEmail).toBe('guro@inbound.com')
      expect(inboundController?.jurisdiction).toBe('Norway')
      expect(inboundController?.dpoContact).toBe('privacy@inbound.com')

      expect(clientController).toBeDefined()
      expect(clientController?.id).toBe(DataController.CLIENT_ORGANIZATION)
    })

    it('should initialize with default processor entities', () => {
      const inboundProcessor = manager.getProcessorEntity(DataProcessor.INBOUND_PLATFORM)
      const openaiProcessor = manager.getProcessorEntity(DataProcessor.OPENAI_SUBPROCESSOR)
      const hostingProcessor = manager.getProcessorEntity(DataProcessor.HOSTING_PROVIDER)

      expect(inboundProcessor).toBeDefined()
      expect(inboundProcessor?.legalName).toBe('Inbound Consulting AS')
      expect(inboundProcessor?.jurisdiction).toBe('Norway')

      expect(openaiProcessor).toBeDefined()
      expect(openaiProcessor?.legalName).toBe('OpenAI, Inc.')
      expect(openaiProcessor?.jurisdiction).toBe('United States')
      expect(openaiProcessor?.certifications).toContain('SOC 2 Type II')

      expect(hostingProcessor).toBeDefined()
      expect(hostingProcessor?.jurisdiction).toBe('EU/EEA')
    })

    it('should return null for non-existent entities', () => {
      const nonExistentController = manager.getControllerEntity('non-existent' as DataController)
      const nonExistentProcessor = manager.getProcessorEntity('non-existent' as DataProcessor)

      expect(nonExistentController).toBeNull()
      expect(nonExistentProcessor).toBeNull()
    })
  })

  describe('Data Processing Agreements', () => {
    it('should create valid DPA between controller and processor', () => {
      const agreement = manager.createDataProcessingAgreement(
        'test-assessment',
        DataController.INBOUND_CONSULTING,
        DataProcessor.INBOUND_PLATFORM,
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        [DataCategory.SURVEY_RESPONSES],
        LegalBasis.LEGITIMATE_INTEREST
      )

      expect(agreement.id).toContain('dpa-test-assessment')
      expect(agreement.controllerId).toBe(DataController.INBOUND_CONSULTING)
      expect(agreement.processorId).toBe(DataProcessor.INBOUND_PLATFORM)
      expect(agreement.purposes).toContain(ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT)
      expect(agreement.categories).toContain(DataCategory.SURVEY_RESPONSES)
      expect(agreement.legalBasis).toBe(LegalBasis.LEGITIMATE_INTEREST)
      expect(agreement.status).toBe('active')
      expect(agreement.breachNotificationHours).toBe(72)
      expect(agreement.auditRights).toBe(true)
    })

    it('should include appropriate security measures in DPA', () => {
      const agreement = manager.createDataProcessingAgreement(
        'security-test',
        DataController.INBOUND_CONSULTING,
        DataProcessor.INBOUND_PLATFORM,
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        [DataCategory.SURVEY_RESPONSES],
        LegalBasis.LEGITIMATE_INTEREST
      )

      expect(agreement.securityMeasures).toContain('Pseudonymization of personal data')
      expect(agreement.securityMeasures).toContain('Encryption at rest and in transit')
      expect(agreement.securityMeasures).toContain('Access controls and authentication')
      expect(agreement.securityMeasures).toContain('Regular security assessments')
      expect(agreement.securityMeasures).toContain('Data backup and recovery procedures')
      expect(agreement.securityMeasures).toContain('Incident response procedures')
    })

    it('should handle international transfer mechanisms for OpenAI', () => {
      const agreement = manager.createDataProcessingAgreement(
        'openai-test',
        DataController.INBOUND_CONSULTING,
        DataProcessor.OPENAI_SUBPROCESSOR,
        [ProcessingPurpose.STRATEGIC_INSIGHTS],
        [DataCategory.ORGANIZATIONAL_DATA],
        LegalBasis.LEGITIMATE_INTEREST
      )

      expect(agreement.dataTransferMechanisms).toContain('Standard Contractual Clauses (EU-US)')
      expect(agreement.dataTransferMechanisms).toContain('Supplementary Technical Measures')
    })

    it('should handle EU/EEA processing for other processors', () => {
      const agreement = manager.createDataProcessingAgreement(
        'eu-test',
        DataController.CLIENT_ORGANIZATION,
        DataProcessor.HOSTING_PROVIDER,
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        [DataCategory.SURVEY_RESPONSES],
        LegalBasis.LEGITIMATE_INTEREST
      )

      expect(agreement.dataTransferMechanisms).toContain('Processing within EU/EEA')
    })

    it('should retrieve DPAs by assessment ID', () => {
      manager.createDataProcessingAgreement(
        'retrieve-test',
        DataController.INBOUND_CONSULTING,
        DataProcessor.INBOUND_PLATFORM,
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        [DataCategory.SURVEY_RESPONSES],
        LegalBasis.LEGITIMATE_INTEREST
      )

      const agreements = manager.getDataProcessingAgreements('retrieve-test')
      expect(agreements).toHaveLength(1)
      expect(agreements[0].assessmentId).toBe('retrieve-test')
    })

    it('should retrieve all DPAs when no assessment ID provided', () => {
      manager.createDataProcessingAgreement(
        'all-test-1',
        DataController.INBOUND_CONSULTING,
        DataProcessor.INBOUND_PLATFORM,
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        [DataCategory.SURVEY_RESPONSES],
        LegalBasis.LEGITIMATE_INTEREST
      )

      manager.createDataProcessingAgreement(
        'all-test-2',
        DataController.CLIENT_ORGANIZATION,
        DataProcessor.HOSTING_PROVIDER,
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        [DataCategory.SURVEY_RESPONSES],
        LegalBasis.LEGITIMATE_INTEREST
      )

      const allAgreements = manager.getDataProcessingAgreements()
      expect(allAgreements.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Joint Controller Agreements', () => {
    it('should create valid joint controller agreement', () => {
      const agreement = manager.createJointControllerAgreement('joint-test', 'Test Organization')

      expect(agreement.id).toBe('jca-joint-test')
      expect(agreement.controllers).toContain(DataController.INBOUND_CONSULTING)
      expect(agreement.controllers).toContain(DataController.CLIENT_ORGANIZATION)
      expect(agreement.contactPointController).toBe(DataController.CLIENT_ORGANIZATION)
      expect(agreement.publicSummaryUrl).toContain('privacy/joint-controller-summary/joint-test')
    })

    it('should define proper responsibility matrix', () => {
      const agreement = manager.createJointControllerAgreement('responsibility-test', 'Test Org')

      const inboundResponsibilities = agreement.responsibilityMatrix.find(
        r => r.controller === DataController.INBOUND_CONSULTING
      )
      const clientResponsibilities = agreement.responsibilityMatrix.find(
        r => r.controller === DataController.CLIENT_ORGANIZATION
      )

      expect(inboundResponsibilities).toBeDefined()
      expect(inboundResponsibilities?.legalBasisDetermination).toBe(true)
      expect(inboundResponsibilities?.dataSubjectRequests).toBe(false)
      expect(inboundResponsibilities?.responsibilities).toContain('Technical implementation and data security')

      expect(clientResponsibilities).toBeDefined()
      expect(clientResponsibilities?.consentManagement).toBe(true)
      expect(clientResponsibilities?.dataSubjectRequests).toBe(true)
      expect(clientResponsibilities?.responsibilities).toContain('Employee communication and transparency')
    })

    it('should allocate data subject rights properly', () => {
      const agreement = manager.createJointControllerAgreement('rights-test', 'Rights Test Org')

      expect(agreement.dataSubjectRights.accessRequests).toBe(DataController.CLIENT_ORGANIZATION)
      expect(agreement.dataSubjectRights.rectificationRequests).toBe(DataController.CLIENT_ORGANIZATION)
      expect(agreement.dataSubjectRights.erasureRequests).toBe(DataController.INBOUND_CONSULTING)
      expect(agreement.dataSubjectRights.portabilityRequests).toBe(DataController.CLIENT_ORGANIZATION)
      expect(agreement.dataSubjectRights.objectionHandling).toBe(DataController.CLIENT_ORGANIZATION)
      expect(agreement.dataSubjectRights.complaintHandling).toBe(DataController.CLIENT_ORGANIZATION)
    })

    it('should retrieve joint controller agreement by assessment ID', () => {
      manager.createJointControllerAgreement('retrieve-joint', 'Retrieve Test Org')

      const agreement = manager.getJointControllerAgreement('retrieve-joint')
      expect(agreement).toBeDefined()
      expect(agreement?.id).toBe('jca-retrieve-joint')
    })

    it('should return null for non-existent joint controller agreement', () => {
      const agreement = manager.getJointControllerAgreement('non-existent')
      expect(agreement).toBeNull()
    })
  })

  describe('Processing Instructions', () => {
    it('should issue processing instructions for DPA', () => {
      const agreement = manager.createDataProcessingAgreement(
        'instructions-test',
        DataController.INBOUND_CONSULTING,
        DataProcessor.INBOUND_PLATFORM,
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        [DataCategory.SURVEY_RESPONSES],
        LegalBasis.LEGITIMATE_INTEREST
      )

      const instructions = manager.issueProcessingInstructions(agreement.id, [
        {
          instruction: 'Process survey responses with pseudonymization',
          category: DataCategory.SURVEY_RESPONSES,
          purpose: ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT,
          storageLocation: 'EU server cluster',
          retentionPeriod: 730,
          deletionMethod: 'Secure erasure with verification',
          accessControls: ['Role-based access', 'Two-factor authentication'],
          encryptionRequirements: ['AES-256 at rest', 'TLS 1.3 in transit'],
          backupRequirements: ['Encrypted daily backups', '90-day retention'],
          auditLogRequirements: true
        }
      ])

      expect(instructions).toHaveLength(1)
      expect(instructions[0].id).toContain(`instr-${agreement.id}`)
      expect(instructions[0].instruction).toBe('Process survey responses with pseudonymization')
      expect(instructions[0].category).toBe(DataCategory.SURVEY_RESPONSES)
      expect(instructions[0].auditLogRequirements).toBe(true)
      expect(instructions[0].issuedDate).toBeInstanceOf(Date)
      expect(instructions[0].acknowledgedDate).toBeUndefined()
    })
  })

  describe('Processor Compliance Validation', () => {
    it('should validate compliant EU processor', () => {
      const validation = manager.validateProcessorCompliance(DataProcessor.HOSTING_PROVIDER)

      expect(validation.compliant).toBe(true)
      expect(validation.issues).toHaveLength(0)
    })

    it('should provide recommendations for OpenAI subprocessor', () => {
      const validation = manager.validateProcessorCompliance(DataProcessor.OPENAI_SUBPROCESSOR)

      // Should be compliant with no issues, but may have recommendations
      expect(validation.compliant).toBe(true)
      expect(validation.issues).toHaveLength(0)
      expect(validation.recommendations.length).toBeGreaterThanOrEqual(1)
      expect(validation.recommendations[0]).toContain('Standard Contractual Clauses')
    })

    it('should not recommend ISO 27001 when already present', () => {
      const validation = manager.validateProcessorCompliance(DataProcessor.INBOUND_PLATFORM)

      // INBOUND_PLATFORM has "ISO 27001 (planned)" so should not trigger recommendation
      const hasISORecommendation = validation.recommendations.some(rec => 
        rec.includes('ISO 27001')
      )
      expect(hasISORecommendation).toBe(false)
    })

    it('should return non-compliant for non-existent processor', () => {
      const validation = manager.validateProcessorCompliance('non-existent' as DataProcessor)

      expect(validation.compliant).toBe(false)
      expect(validation.issues).toContain('Processor entity not found')
      expect(validation.recommendations).toContain('Register processor entity with complete information')
    })
  })

  describe('Processing Overview Generation', () => {
    it('should generate comprehensive processing overview', () => {
      // Create some agreements first
      manager.createDataProcessingAgreement(
        'overview-test',
        DataController.INBOUND_CONSULTING,
        DataProcessor.INBOUND_PLATFORM,
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        [DataCategory.SURVEY_RESPONSES],
        LegalBasis.LEGITIMATE_INTEREST
      )

      manager.createJointControllerAgreement('overview-test', 'Overview Test Org')

      const overview = manager.generateProcessingOverview('overview-test')

      expect(overview.assessment).toBe('overview-test')
      expect(overview.controllers.length).toBeGreaterThanOrEqual(1)
      expect(overview.processors.length).toBeGreaterThanOrEqual(1)
      expect(overview.agreements).toHaveLength(1)
      expect(overview.jointControllerAgreement).toBeDefined()
      expect(['Compliant', 'Requires Review']).toContain(overview.complianceStatus)
    })

    it('should show compliant status when no processors have issues', () => {
      manager.createDataProcessingAgreement(
        'compliance-test',
        DataController.INBOUND_CONSULTING,
        DataProcessor.INBOUND_PLATFORM,
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        [DataCategory.SURVEY_RESPONSES],
        LegalBasis.LEGITIMATE_INTEREST
      )

      const overview = manager.generateProcessingOverview('compliance-test')
      
      // Should be "Compliant" as INBOUND_PLATFORM has proper certifications
      expect(overview.complianceStatus).toBe('Compliant')
    })
  })

  describe('DPA Document Export', () => {
    it('should export complete DPA document in JSON format', () => {
      const agreement = manager.createDataProcessingAgreement(
        'export-test',
        DataController.INBOUND_CONSULTING,
        DataProcessor.INBOUND_PLATFORM,
        [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        [DataCategory.SURVEY_RESPONSES],
        LegalBasis.LEGITIMATE_INTEREST
      )

      const exported = manager.exportDPADocument(agreement.id)
      expect(exported).toBeDefined()

      const parsedDoc = JSON.parse(exported!)
      expect(parsedDoc.documentType).toBe('Data Processing Agreement')
      expect(parsedDoc.agreementId).toBe(agreement.id)
      expect(parsedDoc.controller.name).toBe('Inbound Consulting AS')
      expect(parsedDoc.processor.name).toBe('Inbound Consulting AS')
      expect(parsedDoc.processingDetails.purposes).toContain(ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT)
      expect(parsedDoc.processingDetails.legalBasis).toBe(LegalBasis.LEGITIMATE_INTEREST)
      expect(parsedDoc.securityMeasures).toContain('Pseudonymization of personal data')
      expect(parsedDoc.auditRights).toBe(true)
      expect(parsedDoc.breachNotification).toBe('72 hours')
    })

    it('should return null for non-existent DPA', () => {
      const exported = manager.exportDPADocument('non-existent')
      expect(exported).toBeNull()
    })
  })

  describe('Subprocessor Management', () => {
    it('should track OpenAI as subprocessor with proper safeguards', () => {
      const inboundProcessor = manager.getProcessorEntity(DataProcessor.INBOUND_PLATFORM)
      
      expect(inboundProcessor?.subprocessors).toHaveLength(1)
      
      const openaiSubprocessor = inboundProcessor?.subprocessors[0]
      expect(openaiSubprocessor?.name).toBe('OpenAI')
      expect(openaiSubprocessor?.purpose).toContain(ProcessingPurpose.STRATEGIC_INSIGHTS)
      expect(openaiSubprocessor?.location).toBe('United States')
      expect(openaiSubprocessor?.safeguards).toContain('Standard Contractual Clauses')
      expect(openaiSubprocessor?.safeguards).toContain('Data Processing Agreement')
    })

    it('should have proper contract dates for subprocessors', () => {
      const inboundProcessor = manager.getProcessorEntity(DataProcessor.INBOUND_PLATFORM)
      const openaiSubprocessor = inboundProcessor?.subprocessors[0]
      
      expect(openaiSubprocessor?.contractDate).toBeInstanceOf(Date)
      expect(openaiSubprocessor?.reviewDate).toBeInstanceOf(Date)
    })
  })
})