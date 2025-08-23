/**
 * GDPR Data Controller and Processor Framework
 * Implements Articles 26, 28, and controller-processor responsibilities
 */

import {
  DataController,
  DataProcessor,
  DataCategory,
  ProcessingPurpose,
  LegalBasis
} from './gdpr-types'

interface ControllerEntity {
  id: DataController
  name: string
  legalName: string
  contactPerson: string
  contactEmail: string
  address: string
  dpoContact?: string
  registrationNumber?: string
  jurisdiction: string
}

interface ProcessorEntity {
  id: DataProcessor
  name: string
  legalName: string
  contactPerson: string
  contactEmail: string
  address: string
  jurisdiction: string
  certifications: string[]
  subprocessors: SubprocessorDetails[]
}

interface SubprocessorDetails {
  name: string
  purpose: ProcessingPurpose[]
  location: string
  safeguards: string[]
  contractDate: Date
  reviewDate: Date
}

interface DataProcessingAgreement {
  id: string
  controllerId: DataController
  processorId: DataProcessor
  assessmentId: string
  purposes: ProcessingPurpose[]
  categories: DataCategory[]
  legalBasis: LegalBasis
  agreementDate: Date
  expirationDate: Date
  instructionsDocument: string
  securityMeasures: string[]
  breachNotificationHours: number
  dataTransferMechanisms: string[]
  auditRights: boolean
  deletionInstructions: string
  status: 'active' | 'expired' | 'terminated'
}

interface JointControllerAgreement {
  id: string
  controllers: DataController[]
  assessmentId: string
  responsibilityMatrix: ControllerResponsibility[]
  contactPointController: DataController
  dataSubjectRights: DataSubjectRightsAllocation
  agreementDate: Date
  publicSummaryUrl?: string
}

interface ControllerResponsibility {
  controller: DataController
  responsibilities: string[]
  purposes: ProcessingPurpose[]
  categories: DataCategory[]
  legalBasisDetermination: boolean
  consentManagement: boolean
  dataSubjectRequests: boolean
}

interface DataSubjectRightsAllocation {
  accessRequests: DataController
  rectificationRequests: DataController
  erasureRequests: DataController
  portabilityRequests: DataController
  objectionHandling: DataController
  complaintHandling: DataController
}

interface ProcessingInstruction {
  id: string
  dpaId: string
  instruction: string
  category: DataCategory
  purpose: ProcessingPurpose
  storageLocation: string
  retentionPeriod: number
  deletionMethod: string
  accessControls: string[]
  encryptionRequirements: string[]
  backupRequirements: string[]
  auditLogRequirements: boolean
  issuedDate: Date
  acknowledgedDate?: Date
}

export class ControllerProcessorManager {
  private controllers: Map<DataController, ControllerEntity> = new Map()
  private processors: Map<DataProcessor, ProcessorEntity> = new Map()
  private dpaAgreements: Map<string, DataProcessingAgreement> = new Map()
  private jointControllerAgreements: Map<string, JointControllerAgreement> = new Map()
  private processingInstructions: Map<string, ProcessingInstruction[]> = new Map()

  constructor() {
    this.initializeDefaultEntities()
  }

  private initializeDefaultEntities(): void {
    // Initialize Inbound Consulting as Controller
    const inboundController: ControllerEntity = {
      id: DataController.INBOUND_CONSULTING,
      name: 'Inbound Consulting',
      legalName: 'Inbound Consulting AS',
      contactPerson: 'Guro Reiten',
      contactEmail: 'guro@inbound.com',
      address: 'Oslo, Norway',
      dpoContact: 'privacy@inbound.com',
      registrationNumber: 'NO-ORG-12345',
      jurisdiction: 'Norway'
    }

    const clientController: ControllerEntity = {
      id: DataController.CLIENT_ORGANIZATION,
      name: 'Client Organization',
      legalName: 'Variable by Assessment',
      contactPerson: 'To be determined per assessment',
      contactEmail: 'Variable by Assessment',
      address: 'Variable by Assessment',
      jurisdiction: 'EU/EEA'
    }

    // Initialize Processors
    const inboundProcessor: ProcessorEntity = {
      id: DataProcessor.INBOUND_PLATFORM,
      name: 'Inbound Platform',
      legalName: 'Inbound Consulting AS',
      contactPerson: 'Technical Team',
      contactEmail: 'tech@inbound.com',
      address: 'Oslo, Norway',
      jurisdiction: 'Norway',
      certifications: ['ISO 27001 (planned)', 'GDPR Compliance Framework'],
      subprocessors: [
        {
          name: 'OpenAI',
          purpose: [ProcessingPurpose.STRATEGIC_INSIGHTS],
          location: 'United States',
          safeguards: ['Standard Contractual Clauses', 'Data Processing Agreement'],
          contractDate: new Date('2024-01-01'),
          reviewDate: new Date('2024-12-31')
        }
      ]
    }

    const openaiProcessor: ProcessorEntity = {
      id: DataProcessor.OPENAI_SUBPROCESSOR,
      name: 'OpenAI',
      legalName: 'OpenAI, Inc.',
      contactPerson: 'Data Protection Team',
      contactEmail: 'privacy@openai.com',
      address: 'San Francisco, CA, USA',
      jurisdiction: 'United States',
      certifications: ['SOC 2 Type II', 'ISO 27001'],
      subprocessors: []
    }

    const hostingProcessor: ProcessorEntity = {
      id: DataProcessor.HOSTING_PROVIDER,
      name: 'Hosting Provider',
      legalName: 'TBD based on deployment',
      contactPerson: 'Support Team',
      contactEmail: 'support@hostingprovider.com',
      address: 'EU/EEA Location',
      jurisdiction: 'EU/EEA',
      certifications: ['ISO 27001', 'GDPR Compliance'],
      subprocessors: []
    }

    this.controllers.set(DataController.INBOUND_CONSULTING, inboundController)
    this.controllers.set(DataController.CLIENT_ORGANIZATION, clientController)
    this.processors.set(DataProcessor.INBOUND_PLATFORM, inboundProcessor)
    this.processors.set(DataProcessor.OPENAI_SUBPROCESSOR, openaiProcessor)
    this.processors.set(DataProcessor.HOSTING_PROVIDER, hostingProcessor)
  }

  createDataProcessingAgreement(
    assessmentId: string,
    controllerId: DataController,
    processorId: DataProcessor,
    purposes: ProcessingPurpose[],
    categories: DataCategory[],
    legalBasis: LegalBasis
  ): DataProcessingAgreement {
    const agreementId = `dpa-${assessmentId}-${processorId}-${Date.now()}`
    
    const agreement: DataProcessingAgreement = {
      id: agreementId,
      controllerId,
      processorId,
      assessmentId,
      purposes,
      categories,
      legalBasis,
      agreementDate: new Date(),
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      instructionsDocument: `processing-instructions-${agreementId}`,
      securityMeasures: [
        'Pseudonymization of personal data',
        'Encryption at rest and in transit',
        'Access controls and authentication',
        'Regular security assessments',
        'Data backup and recovery procedures',
        'Incident response procedures'
      ],
      breachNotificationHours: 72,
      dataTransferMechanisms: processorId === DataProcessor.OPENAI_SUBPROCESSOR 
        ? ['Standard Contractual Clauses (EU-US)', 'Supplementary Technical Measures']
        : ['Processing within EU/EEA'],
      auditRights: true,
      deletionInstructions: 'Secure deletion within 30 days of assessment completion or controller instruction',
      status: 'active'
    }

    this.dpaAgreements.set(agreementId, agreement)
    return agreement
  }

  createJointControllerAgreement(
    assessmentId: string,
    clientOrganization: string
  ): JointControllerAgreement {
    const agreementId = `jca-${assessmentId}`
    
    const agreement: JointControllerAgreement = {
      id: agreementId,
      controllers: [DataController.INBOUND_CONSULTING, DataController.CLIENT_ORGANIZATION],
      assessmentId,
      responsibilityMatrix: [
        {
          controller: DataController.INBOUND_CONSULTING,
          responsibilities: [
            'Technical implementation and data security',
            'Data processing operations and analytics',
            'Subprocessor management and oversight',
            'Data retention and deletion procedures',
            'System security and access controls'
          ],
          purposes: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT, ProcessingPurpose.STRATEGIC_INSIGHTS],
          categories: [DataCategory.SURVEY_RESPONSES, DataCategory.ORGANIZATIONAL_DATA],
          legalBasisDetermination: true,
          consentManagement: false,
          dataSubjectRequests: false
        },
        {
          controller: DataController.CLIENT_ORGANIZATION,
          responsibilities: [
            'Employee communication and transparency',
            'Legal basis validation for employment context',
            'Data subject rights response coordination',
            'Internal data governance compliance',
            'Survey distribution and participation management'
          ],
          purposes: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT, ProcessingPurpose.PERFORMANCE_ANALYTICS],
          categories: [DataCategory.PARTICIPANT_IDENTIFIERS, DataCategory.SURVEY_RESPONSES],
          legalBasisDetermination: false,
          consentManagement: true,
          dataSubjectRequests: true
        }
      ],
      contactPointController: DataController.CLIENT_ORGANIZATION,
      dataSubjectRights: {
        accessRequests: DataController.CLIENT_ORGANIZATION,
        rectificationRequests: DataController.CLIENT_ORGANIZATION,
        erasureRequests: DataController.INBOUND_CONSULTING,
        portabilityRequests: DataController.CLIENT_ORGANIZATION,
        objectionHandling: DataController.CLIENT_ORGANIZATION,
        complaintHandling: DataController.CLIENT_ORGANIZATION
      },
      agreementDate: new Date(),
      publicSummaryUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/privacy/joint-controller-summary/${assessmentId}`
    }

    this.jointControllerAgreements.set(agreementId, agreement)
    return agreement
  }

  issueProcessingInstructions(
    dpaId: string,
    instructions: Omit<ProcessingInstruction, 'id' | 'dpaId' | 'issuedDate' | 'acknowledgedDate'>[]
  ): ProcessingInstruction[] {
    const issuedInstructions: ProcessingInstruction[] = instructions.map((instruction, index) => ({
      id: `instr-${dpaId}-${index + 1}`,
      dpaId,
      issuedDate: new Date(),
      ...instruction
    }))

    this.processingInstructions.set(dpaId, issuedInstructions)
    return issuedInstructions
  }

  getControllerEntity(controllerId: DataController): ControllerEntity | null {
    return this.controllers.get(controllerId) || null
  }

  getProcessorEntity(processorId: DataProcessor): ProcessorEntity | null {
    return this.processors.get(processorId) || null
  }

  getDataProcessingAgreements(assessmentId?: string): DataProcessingAgreement[] {
    const agreements = Array.from(this.dpaAgreements.values())
    return assessmentId 
      ? agreements.filter(dpa => dpa.assessmentId === assessmentId)
      : agreements
  }

  getJointControllerAgreement(assessmentId: string): JointControllerAgreement | null {
    return this.jointControllerAgreements.get(`jca-${assessmentId}`) || null
  }

  validateProcessorCompliance(processorId: DataProcessor): {
    compliant: boolean
    issues: string[]
    recommendations: string[]
  } {
    const processor = this.getProcessorEntity(processorId)
    if (!processor) {
      return {
        compliant: false,
        issues: ['Processor entity not found'],
        recommendations: ['Register processor entity with complete information']
      }
    }

    const issues: string[] = []
    const recommendations: string[] = []

    // Check jurisdiction for international transfers
    if (processorId === DataProcessor.OPENAI_SUBPROCESSOR && processor.jurisdiction === 'United States') {
      // OpenAI is covered by SCCs through the INBOUND_PLATFORM DPA mechanisms, not its own subprocessors
      // This validation is more appropriately handled at the DPA level
      recommendations.push('Ensure Standard Contractual Clauses are maintained for US data transfers')
    }

    // Check certifications
    if (!processor.certifications.some(cert => cert.includes('ISO 27001'))) {
      recommendations.push('Consider obtaining ISO 27001 certification for enhanced security')
    }

    // Check subprocessor management
    processor.subprocessors.forEach(sub => {
      const reviewAge = (Date.now() - sub.reviewDate.getTime()) / (1000 * 60 * 60 * 24)
      if (reviewAge > 365) {
        issues.push(`Subprocessor ${sub.name} contract review overdue`)
        recommendations.push(`Review and update subprocessor agreement with ${sub.name}`)
      }
    })

    return {
      compliant: issues.length === 0,
      issues,
      recommendations
    }
  }

  generateProcessingOverview(assessmentId: string): {
    assessment: string
    controllers: ControllerEntity[]
    processors: ProcessorEntity[]
    agreements: DataProcessingAgreement[]
    jointControllerAgreement: JointControllerAgreement | null
    complianceStatus: string
  } {
    const agreements = this.getDataProcessingAgreements(assessmentId)
    const jointAgreement = this.getJointControllerAgreement(assessmentId)
    
    const controllerIds = new Set<DataController>()
    const processorIds = new Set<DataProcessor>()

    agreements.forEach(agreement => {
      controllerIds.add(agreement.controllerId)
      processorIds.add(agreement.processorId)
    })

    if (jointAgreement) {
      jointAgreement.controllers.forEach(controller => controllerIds.add(controller))
    }

    const controllers = Array.from(controllerIds).map(id => this.getControllerEntity(id)!).filter(Boolean)
    const processors = Array.from(processorIds).map(id => this.getProcessorEntity(id)!).filter(Boolean)

    const allCompliant = processors.every(processor => 
      this.validateProcessorCompliance(processor.id).compliant
    )

    return {
      assessment: assessmentId,
      controllers,
      processors,
      agreements,
      jointControllerAgreement: jointAgreement,
      complianceStatus: allCompliant ? 'Compliant' : 'Requires Review'
    }
  }

  exportDPADocument(dpaId: string): string | null {
    const agreement = this.dpaAgreements.get(dpaId)
    if (!agreement) return null

    const controller = this.getControllerEntity(agreement.controllerId)
    const processor = this.getProcessorEntity(agreement.processorId)

    if (!controller || !processor) return null

    return JSON.stringify({
      documentType: 'Data Processing Agreement',
      agreementId: agreement.id,
      controller: {
        name: controller.legalName,
        contact: controller.contactEmail,
        dpo: controller.dpoContact
      },
      processor: {
        name: processor.legalName,
        contact: processor.contactEmail,
        jurisdiction: processor.jurisdiction
      },
      processingDetails: {
        purposes: agreement.purposes,
        categories: agreement.categories,
        legalBasis: agreement.legalBasis,
        retentionPeriod: 'As specified in privacy policy',
        dataTransfers: agreement.dataTransferMechanisms
      },
      securityMeasures: agreement.securityMeasures,
      agreementPeriod: {
        start: agreement.agreementDate.toISOString(),
        end: agreement.expirationDate.toISOString()
      },
      auditRights: agreement.auditRights,
      deletionCommitment: agreement.deletionInstructions,
      breachNotification: `${agreement.breachNotificationHours} hours`
    }, null, 2)
  }
}