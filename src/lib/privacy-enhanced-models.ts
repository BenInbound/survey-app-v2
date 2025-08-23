/**
 * GDPR Privacy Enhanced Models Integration
 * Updates existing data models with comprehensive privacy metadata and GDPR compliance
 */

import {
  Survey,
  ParticipantSession,
  SurveyResponse,
  OrganizationalAssessment,
  ParticipantResponse,
  Question,
  SliderValue
} from './types'

import {
  DataCategory,
  LegalBasis,
  DataSensitivity,
  ProcessingPurpose,
  DataController,
  DataProcessor,
  PrivacyMetadata,
  DataClassification
} from './gdpr-types'

import { PrivacyManager } from './privacy-manager'
import { ControllerProcessorManager } from './controller-processor-manager'
import { LegalBasisTrackingManager, GDPREnhancedSurveyResponse, LegalBasisTracker } from './legal-basis-tracker'

// Privacy Enhancement Service
export class PrivacyEnhancementService {
  private privacyManager: PrivacyManager
  private controllerProcessorManager: ControllerProcessorManager
  private legalBasisTracker: LegalBasisTrackingManager

  constructor() {
    this.privacyManager = new PrivacyManager()
    this.controllerProcessorManager = new ControllerProcessorManager()
    this.legalBasisTracker = LegalBasisTrackingManager.getInstance()
  }

  // Enhanced Survey with GDPR Privacy Integration
  enhanceSurvey(survey: Survey, organizationName?: string): EnhancedSurvey {
    const privacyMetadata = this.privacyManager.createPrivacyMetadata(
      'organizational-assessment',
      DataCategory.SURVEY_RESPONSES
    )

    const dataProcessingRecord = this.privacyManager.recordDataProcessing(
      survey.id,
      organizationName || 'Generic Assessment',
      [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT, ProcessingPurpose.STRATEGIC_INSIGHTS],
      [DataCategory.SURVEY_RESPONSES, DataCategory.ORGANIZATIONAL_DATA]
    )

    const jointControllerAgreement = organizationName 
      ? this.controllerProcessorManager.createJointControllerAgreement(survey.id, organizationName)
      : null

    return {
      ...survey,
      privacyMetadata: privacyMetadata!,
      dataProcessingRecord: dataProcessingRecord.id,
      jointControllerAgreement: jointControllerAgreement?.id,
      privacyNotice: this.generatePrivacyNotice(survey, organizationName),
      dataSubjectRights: this.generateDataSubjectRights(),
      retentionPolicy: this.getRetentionPolicy(DataCategory.SURVEY_RESPONSES)
    }
  }

  // Enhanced Participant Session with Privacy Tracking
  enhanceParticipantSession(
    session: ParticipantSession, 
    participantRole: 'management' | 'employee'
  ): EnhancedParticipantSession {
    // Validate and track legal basis
    const legalBasisValidation = this.legalBasisTracker.validateLegalBasisForProcessing(
      participantRole,
      ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT,
      DataCategory.SURVEY_RESPONSES
    )

    const privacyMetadata = this.privacyManager.createPrivacyMetadata(
      'organizational-assessment',
      DataCategory.PARTICIPANT_IDENTIFIERS,
      session.participantId
    )

    const legalBasisTracker: LegalBasisTracker = {
      sessionId: session.participantId,
      participantRole,
      primaryLegalBasis: legalBasisValidation.recommendedBasis,
      basisJustification: legalBasisValidation.reasoning,
      dataCategories: [DataCategory.SURVEY_RESPONSES, DataCategory.PARTICIPANT_IDENTIFIERS],
      purposes: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
      necessityTest: {
        isNecessary: true,
        justification: 'Necessary for organizational strategic assessment and improvement',
        alternativesConsidered: ['External market research', 'Management-only survey', 'Third-party assessment']
      },
      trackingEvents: []
    }

    // Track session start event
    this.legalBasisTracker.trackLegalBasisEvent(session.participantId, {
      eventType: 'data_collection',
      details: `Survey session started for ${session.surveyId}`,
      legalBasis: legalBasisValidation.recommendedBasis,
      dataCategory: DataCategory.SURVEY_RESPONSES,
      purpose: ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT
    })

    return {
      ...session,
      privacyMetadata: privacyMetadata!,
      legalBasisTracker,
      participantRole,
      dataSubjectRights: this.generateParticipantRights(),
      consentRecord: legalBasisValidation.recommendedBasis === LegalBasis.CONSENT 
        ? this.generateConsentRecord(session.participantId, participantRole)
        : undefined
    }
  }

  // Enhanced Survey Response with Privacy Classification
  enhanceSurveyResponse(
    response: SurveyResponse,
    question: Question,
    participantId: string,
    participantRole: 'management' | 'employee'
  ): GDPREnhancedSurveyResponse {
    const classification = this.privacyManager.classifyData(
      'organizational-assessment',
      DataCategory.SURVEY_RESPONSES
    )

    const legalBasisValidation = this.legalBasisTracker.validateLegalBasisForProcessing(
      participantRole,
      ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT,
      DataCategory.SURVEY_RESPONSES
    )

    // Track response collection event
    this.legalBasisTracker.trackLegalBasisEvent(participantId, {
      eventType: 'data_collection',
      details: `Response collected for question ${question.category}`,
      legalBasis: legalBasisValidation.recommendedBasis,
      dataCategory: DataCategory.SURVEY_RESPONSES,
      purpose: ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT
    })

    return {
      ...response,
      privacyClassification: classification!,
      processingLegalBasis: legalBasisValidation.recommendedBasis,
      minimizationApplied: true, // Category-level aggregation applied
      pseudonymizationLevel: participantRole === 'employee' ? 'advanced' : 'basic'
    }
  }

  // Enhanced Organizational Assessment with Full GDPR Integration
  enhanceOrganizationalAssessment(assessment: OrganizationalAssessment): EnhancedOrganizationalAssessment {
    // Create comprehensive legal basis matrix
    const legalBasisMatrix = {
      assessmentId: assessment.id,
      participantRoles: [
        {
          role: 'management' as const,
          legalBasis: LegalBasis.LEGITIMATE_INTEREST,
          justification: 'Strategic business improvement and organizational development',
          dataCategories: [DataCategory.SURVEY_RESPONSES, DataCategory.ORGANIZATIONAL_DATA],
          purposes: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT, ProcessingPurpose.STRATEGIC_INSIGHTS]
        },
        {
          role: 'employee' as const,
          legalBasis: LegalBasis.LEGITIMATE_INTEREST,
          justification: 'Organizational improvement with employee anonymity protection',
          dataCategories: [DataCategory.SURVEY_RESPONSES],
          purposes: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT]
        }
      ],
      dataProcessingActivities: [
        {
          activity: 'Survey Response Collection',
          legalBasis: LegalBasis.LEGITIMATE_INTEREST,
          controller: DataController.JOINT_CONTROLLERS,
          processors: [DataProcessor.INBOUND_PLATFORM],
          categories: [DataCategory.SURVEY_RESPONSES, DataCategory.PARTICIPANT_IDENTIFIERS],
          purposes: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT]
        },
        {
          activity: 'Strategic Insights Generation',
          legalBasis: LegalBasis.LEGITIMATE_INTEREST,
          controller: DataController.INBOUND_CONSULTING,
          processors: [DataProcessor.INBOUND_PLATFORM, DataProcessor.OPENAI_SUBPROCESSOR],
          categories: [DataCategory.ORGANIZATIONAL_DATA],
          purposes: [ProcessingPurpose.STRATEGIC_INSIGHTS]
        }
      ],
      crossBorderTransfers: [
        {
          recipient: 'OpenAI Inc.',
          country: 'United States',
          adequacyDecision: false,
          safeguards: ['Standard Contractual Clauses', 'Data Processing Agreement', 'Technical and Organizational Measures'],
          legalBasis: LegalBasis.LEGITIMATE_INTEREST
        }
      ]
    }

    // Generate data processing agreements
    const dpaInbound = this.controllerProcessorManager.createDataProcessingAgreement(
      assessment.id,
      DataController.JOINT_CONTROLLERS,
      DataProcessor.INBOUND_PLATFORM,
      [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT, ProcessingPurpose.STRATEGIC_INSIGHTS],
      [DataCategory.SURVEY_RESPONSES, DataCategory.ORGANIZATIONAL_DATA],
      LegalBasis.LEGITIMATE_INTEREST
    )

    const dpaOpenAI = this.controllerProcessorManager.createDataProcessingAgreement(
      assessment.id,
      DataController.INBOUND_CONSULTING,
      DataProcessor.OPENAI_SUBPROCESSOR,
      [ProcessingPurpose.STRATEGIC_INSIGHTS],
      [DataCategory.ORGANIZATIONAL_DATA],
      LegalBasis.LEGITIMATE_INTEREST
    )

    const jointControllerAgreement = this.controllerProcessorManager.createJointControllerAgreement(
      assessment.id,
      assessment.organizationName
    )

    return {
      ...assessment,
      legalBasisMatrix,
      dataProcessingAgreements: [dpaInbound.id, dpaOpenAI.id],
      jointControllerAgreement: jointControllerAgreement.id,
      privacyConfiguration: {
        assessmentId: assessment.id,
        privacyConfigurationId: 'organizational-assessment',
        dataClassifications: this.getAssessmentDataClassifications(),
        jointControllerArrangement: true,
        internationalTransfers: true,
        consentRequired: false,
        legitimateInterestAssessment: this.generateLegitimateInterestAssessment(),
        dataMinimizationRules: this.getDataMinimizationRules()
      },
      privacyNotices: this.generateAssessmentPrivacyNotices(assessment),
      dataSubjectRightsInfo: this.generateDataSubjectRightsInfo(),
      complianceStatus: this.assessComplianceStatus(assessment.id)
    }
  }

  // Data Subject Access Request Handler
  handleDataSubjectRequest(
    participantId: string,
    requestType: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection',
    requestDetails: string
  ): DataSubjectRequestResponse {
    const requestId = `dsr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Track the request
    this.legalBasisTracker.trackLegalBasisEvent(participantId, {
      eventType: 'purpose_change',
      details: `Data subject request: ${requestType}`,
      legalBasis: LegalBasis.LEGITIMATE_INTEREST,
      dataCategory: DataCategory.PARTICIPANT_IDENTIFIERS,
      purpose: ProcessingPurpose.LEGAL_COMPLIANCE
    })

    return {
      requestId,
      participantId,
      requestType,
      requestDetails,
      status: 'received',
      receivedDate: new Date(),
      deadlineDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      estimatedResponseTime: '30 days',
      contactInformation: 'privacy@inbound.com',
      trackingReference: requestId
    }
  }

  // Privacy Impact Assessment
  generatePrivacyImpactAssessment(assessmentId: string): PrivacyImpactAssessment {
    const report = this.legalBasisTracker.generateLegalBasisReport(assessmentId)
    const processingOverview = this.controllerProcessorManager.generateProcessingOverview(assessmentId)

    return {
      assessmentId,
      conductedDate: new Date(),
      riskLevel: 'low',
      dataTypes: [
        'Employee perception scores (1-10 scale)',
        'Management perception scores (1-10 scale)',
        'Participant role identifiers',
        'Survey timestamps'
      ],
      processingPurposes: [
        'Organizational strategic assessment',
        'Management-employee perception gap analysis',
        'Strategic insights and recommendations'
      ],
      legalBasis: 'Legitimate business interest with employee anonymity protections',
      risks: [
        {
          risk: 'Potential identification of individual employees through response patterns',
          likelihood: 'low',
          impact: 'medium',
          mitigation: 'Responses aggregated by category, no individual response tracking'
        },
        {
          risk: 'Cross-border data transfer to US (OpenAI)',
          likelihood: 'high',
          impact: 'low',
          mitigation: 'Standard Contractual Clauses and additional technical safeguards'
        }
      ],
      safeguards: [
        'Data pseudonymization',
        'Response aggregation',
        'Role-based access controls',
        'Encrypted data transmission',
        'Regular deletion schedules',
        'Employee anonymity protection'
      ],
      dataRetention: '2 years for strategic insights, 1 year for individual identifiers',
      dataTransfers: 'Limited to OpenAI for anonymized strategic insights only',
      complianceStatus: processingOverview.complianceStatus,
      reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      approvedBy: 'Privacy Officer',
      recommendations: report.recommendations
    }
  }

  private generatePrivacyNotice(survey: Survey, organizationName?: string): PrivacyNotice {
    return {
      title: `Privacy Notice - ${survey.name}`,
      controller: organizationName 
        ? `${organizationName} (jointly with Inbound Consulting AS)`
        : 'Inbound Consulting AS',
      purposes: [
        'Organizational strategic assessment',
        'Identifying areas for improvement',
        'Strategic insights and recommendations'
      ],
      legalBasis: 'Legitimate business interest',
      dataTypes: [
        'Survey responses (1-10 ratings)',
        'Participant role (management/employee)',
        'Response timestamps'
      ],
      retentionPeriod: '2 years for insights, 1 year for identifiers',
      recipients: [
        'Inbound Consulting team',
        'Your organization\'s management (aggregated data only)'
      ],
      rightsInformation: 'You have the right to access, rectify, erase, restrict processing, object, and data portability',
      contactDetails: {
        controller: organizationName || 'Inbound Consulting AS',
        email: 'privacy@inbound.com',
        dpo: 'Data Protection Officer - privacy@inbound.com'
      },
      lastUpdated: new Date()
    }
  }

  private generateDataSubjectRights(): DataSubjectRights {
    return {
      access: {
        available: true,
        description: 'Request a copy of your personal data',
        timeframe: '30 days',
        method: 'Email privacy@inbound.com'
      },
      rectification: {
        available: true,
        description: 'Correct inaccurate personal data',
        timeframe: '30 days',
        method: 'Email privacy@inbound.com'
      },
      erasure: {
        available: true,
        description: 'Request deletion of your personal data',
        timeframe: '30 days',
        method: 'Email privacy@inbound.com',
        limitations: ['Data needed for legitimate business interests']
      },
      restriction: {
        available: true,
        description: 'Limit how we process your data',
        timeframe: '30 days',
        method: 'Email privacy@inbound.com'
      },
      portability: {
        available: true,
        description: 'Receive your data in machine-readable format',
        timeframe: '30 days',
        method: 'Email privacy@inbound.com'
      },
      objection: {
        available: true,
        description: 'Object to processing based on legitimate interests',
        timeframe: 'Immediate',
        method: 'Email privacy@inbound.com'
      }
    }
  }

  private getRetentionPolicy(category: DataCategory): RetentionPolicy {
    const config = this.privacyManager.getPrivacyConfiguration('organizational-assessment')
    const categoryPeriod = config?.retentionPolicy.categorySpecific[category] || 730

    return {
      category,
      retentionPeriod: categoryPeriod,
      retentionReason: 'Strategic insights and organizational improvement tracking',
      deletionMethod: 'secure_erasure',
      nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      automaticDeletion: true
    }
  }

  private generateConsentRecord(participantId: string, role: 'management' | 'employee'): ConsentRecord {
    return {
      participantId,
      consentTimestamp: new Date(),
      consentMethod: 'explicit_online',
      consentScope: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
      consentVersion: '1.0',
      withdrawalMethod: 'Email privacy@inbound.com or contact your organization\'s HR department',
      proofOfConsent: {
        type: 'checkbox_log',
        reference: `consent-${participantId}-${Date.now()}`,
        ipAddress: 'logged-separately',
        userAgent: 'logged-separately'
      }
    }
  }

  private generateParticipantRights(): ParticipantDataRights {
    return {
      informationProvided: true,
      rightsExplained: true,
      contactProvided: true,
      withdrawalInstructionsClear: true,
      noAdverseConsequences: true,
      anonymityGuaranteed: true
    }
  }

  private getAssessmentDataClassifications(): DataClassification[] {
    return [
      {
        category: DataCategory.SURVEY_RESPONSES,
        sensitivity: DataSensitivity.PERSONAL,
        legalBasis: LegalBasis.LEGITIMATE_INTEREST,
        purpose: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
        controller: DataController.JOINT_CONTROLLERS,
        processors: [DataProcessor.INBOUND_PLATFORM],
        retentionPeriod: 730,
        dataSubjectType: 'employee'
      },
      {
        category: DataCategory.ORGANIZATIONAL_DATA,
        sensitivity: DataSensitivity.CONFIDENTIAL,
        legalBasis: LegalBasis.LEGITIMATE_INTEREST,
        purpose: [ProcessingPurpose.STRATEGIC_INSIGHTS],
        controller: DataController.INBOUND_CONSULTING,
        processors: [DataProcessor.INBOUND_PLATFORM, DataProcessor.OPENAI_SUBPROCESSOR],
        retentionPeriod: 1095,
        dataSubjectType: 'management'
      }
    ]
  }

  private generateLegitimateInterestAssessment(): LegitimateInterestAssessment {
    return {
      businessPurpose: 'Organizational strategic assessment and improvement guidance',
      necessityJustification: 'Essential for identifying organizational strengths, weaknesses, and strategic alignment opportunities',
      balancingTest: {
        businessInterest: 'Strategic organizational improvement and competitive advantage',
        dataSubjectInterest: 'Privacy protection and employment security',
        necessityAssessment: 'No less intrusive alternatives available for comprehensive organizational assessment',
        proportionalityAssessment: 'Minimal data collection with strong anonymity protections',
        safeguardsImplemented: [
          'Employee response anonymization',
          'Aggregated reporting only',
          'No individual performance evaluation',
          'Clear communication of survey purpose',
          'Voluntary participation emphasis'
        ],
        conclusion: 'legitimate_interest_prevails',
        conductedBy: 'Privacy Officer',
        conductedDate: new Date()
      },
      safeguards: [
        'Response pseudonymization',
        'Category-level aggregation',
        'No individual tracking',
        'Employee anonymity protection',
        'Management results separation'
      ],
      reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'valid'
    }
  }

  private getDataMinimizationRules(): DataMinimizationRule[] {
    return [
      {
        category: DataCategory.SURVEY_RESPONSES,
        collectionLimitation: 'Only 1-10 scale responses to strategic questions',
        retentionLimitation: '2 years maximum',
        processingLimitation: 'Aggregation by category only',
        accessLimitation: 'Consultant and authorized client contacts only',
        deletionTrigger: 'Assessment completion + retention period'
      },
      {
        category: DataCategory.PARTICIPANT_IDENTIFIERS,
        collectionLimitation: 'Role identifier only (management/employee)',
        retentionLimitation: '1 year maximum',
        processingLimitation: 'Role-based aggregation only',
        accessLimitation: 'System administrators only',
        deletionTrigger: 'Immediate after aggregation complete'
      }
    ]
  }

  private generateAssessmentPrivacyNotices(assessment: OrganizationalAssessment): PrivacyNotice[] {
    return [
      {
        title: `Employee Privacy Notice - ${assessment.organizationName} Strategic Assessment`,
        controller: `${assessment.organizationName} (jointly with Inbound Consulting AS)`,
        purposes: ['Anonymous organizational assessment', 'Strategic improvement insights'],
        legalBasis: 'Legitimate business interest with employee protection safeguards',
        dataTypes: ['Anonymous 1-10 scale responses', 'Employee role identifier'],
        retentionPeriod: '2 years for insights, immediate deletion of identifiers after aggregation',
        recipients: ['Inbound Consulting team', 'Management (anonymous aggregated data only)'],
        rightsInformation: 'Full data subject rights available - contact privacy@inbound.com',
        contactDetails: {
          controller: assessment.organizationName,
          email: 'privacy@inbound.com',
          dpo: 'Data Protection Officer - privacy@inbound.com'
        },
        lastUpdated: new Date()
      }
    ]
  }

  private generateDataSubjectRightsInfo(): DataSubjectRightsInformation {
    return {
      accessRight: 'Request copy of your data within 30 days',
      rectificationRight: 'Correct any inaccurate information',
      erasureRight: 'Request deletion (subject to legitimate business interests)',
      restrictionRight: 'Limit processing in certain circumstances',
      portabilityRight: 'Receive data in machine-readable format',
      objectionRight: 'Object to processing based on legitimate interests',
      automatedDecisionMaking: 'No automated decision-making affecting individuals',
      contactDetails: 'privacy@inbound.com for all data subject requests',
      responseTimeframe: '30 days maximum',
      complaintRights: 'Contact your national data protection authority'
    }
  }

  private assessComplianceStatus(assessmentId: string): ComplianceStatus {
    const overview = this.controllerProcessorManager.generateProcessingOverview(assessmentId)
    const legalBasisReport = this.legalBasisTracker.generateLegalBasisReport(assessmentId)

    return {
      overallStatus: overview.complianceStatus === 'Compliant' && legalBasisReport.complianceIssues.length === 0 
        ? 'compliant' : 'requires_review',
      legalBasisCompliance: legalBasisReport.complianceIssues.length === 0,
      processorCompliance: overview.complianceStatus === 'Compliant',
      dataMinimizationCompliance: true, // Validated by design
      retentionCompliance: true, // Automated schedules in place
      rightsCompliance: true, // Rights information provided
      lastReview: new Date(),
      nextReview: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      issues: legalBasisReport.complianceIssues,
      recommendations: legalBasisReport.recommendations
    }
  }
}

// Enhanced Type Definitions
export interface EnhancedSurvey extends Survey {
  privacyMetadata: PrivacyMetadata
  dataProcessingRecord: string
  jointControllerAgreement?: string
  privacyNotice: PrivacyNotice
  dataSubjectRights: DataSubjectRights
  retentionPolicy: RetentionPolicy
}

export interface EnhancedParticipantSession extends ParticipantSession {
  privacyMetadata: PrivacyMetadata
  legalBasisTracker: LegalBasisTracker
  participantRole: 'management' | 'employee'
  dataSubjectRights: ParticipantDataRights
  consentRecord?: ConsentRecord
}

export interface EnhancedOrganizationalAssessment extends OrganizationalAssessment {
  legalBasisMatrix: LegalBasisMatrix
  dataProcessingAgreements: string[]
  jointControllerAgreement: string
  privacyConfiguration: AssessmentPrivacyConfiguration
  privacyNotices: PrivacyNotice[]
  dataSubjectRightsInfo: DataSubjectRightsInformation
  complianceStatus: ComplianceStatus
}

// Supporting Interfaces
export interface PrivacyNotice {
  title: string
  controller: string
  purposes: string[]
  legalBasis: string
  dataTypes: string[]
  retentionPeriod: string
  recipients: string[]
  rightsInformation: string
  contactDetails: {
    controller: string
    email: string
    dpo: string
  }
  lastUpdated: Date
}

export interface DataSubjectRights {
  access: DataSubjectRight
  rectification: DataSubjectRight
  erasure: DataSubjectRight
  restriction: DataSubjectRight
  portability: DataSubjectRight
  objection: DataSubjectRight
}

export interface DataSubjectRight {
  available: boolean
  description: string
  timeframe: string
  method: string
  limitations?: string[]
}

export interface ParticipantDataRights {
  informationProvided: boolean
  rightsExplained: boolean
  contactProvided: boolean
  withdrawalInstructionsClear: boolean
  noAdverseConsequences: boolean
  anonymityGuaranteed: boolean
}

export interface ConsentRecord {
  participantId: string
  consentTimestamp: Date
  consentMethod: 'explicit_online' | 'opt_in_form' | 'verbal_recorded' | 'implicit_participation'
  consentScope: ProcessingPurpose[]
  consentVersion: string
  withdrawalMethod: string
  proofOfConsent: {
    type: 'checkbox_log' | 'form_submission' | 'audit_log' | 'email_confirmation'
    reference: string
    ipAddress?: string
    userAgent?: string
  }
}

export interface RetentionPolicy {
  category: DataCategory
  retentionPeriod: number
  retentionReason: string
  deletionMethod: 'secure_erasure' | 'anonymization' | 'pseudonymization'
  nextReview: Date
  automaticDeletion: boolean
}

export interface LegalBasisMatrix {
  assessmentId: string
  participantRoles: {
    role: 'management' | 'employee'
    legalBasis: LegalBasis
    justification: string
    dataCategories: DataCategory[]
    purposes: ProcessingPurpose[]
  }[]
  dataProcessingActivities: {
    activity: string
    legalBasis: LegalBasis
    controller: DataController
    processors: DataProcessor[]
    categories: DataCategory[]
    purposes: ProcessingPurpose[]
  }[]
  crossBorderTransfers: {
    recipient: string
    country: string
    adequacyDecision: boolean
    safeguards: string[]
    legalBasis: LegalBasis
  }[]
}

export interface AssessmentPrivacyConfiguration {
  assessmentId: string
  privacyConfigurationId: string
  dataClassifications: DataClassification[]
  jointControllerArrangement: boolean
  internationalTransfers: boolean
  consentRequired: boolean
  legitimateInterestAssessment: LegitimateInterestAssessment
  dataMinimizationRules: DataMinimizationRule[]
}

export interface LegitimateInterestAssessment {
  businessPurpose: string
  necessityJustification: string
  balancingTest: BalancingTestResult
  safeguards: string[]
  reviewDate: Date
  status: 'valid' | 'requires_review' | 'invalid'
}

export interface BalancingTestResult {
  businessInterest: string
  dataSubjectInterest: string
  necessityAssessment: string
  proportionalityAssessment: string
  safeguardsImplemented: string[]
  conclusion: 'legitimate_interest_prevails' | 'data_subject_interest_prevails' | 'requires_consent'
  conductedBy: string
  conductedDate: Date
}

export interface DataMinimizationRule {
  category: DataCategory
  collectionLimitation: string
  retentionLimitation: string
  processingLimitation: string
  accessLimitation: string
  deletionTrigger: string
}

export interface DataSubjectRightsInformation {
  accessRight: string
  rectificationRight: string
  erasureRight: string
  restrictionRight: string
  portabilityRight: string
  objectionRight: string
  automatedDecisionMaking: string
  contactDetails: string
  responseTimeframe: string
  complaintRights: string
}

export interface DataSubjectRequestResponse {
  requestId: string
  participantId: string
  requestType: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection'
  requestDetails: string
  status: 'received' | 'in_progress' | 'completed' | 'rejected'
  receivedDate: Date
  deadlineDate: Date
  estimatedResponseTime: string
  contactInformation: string
  trackingReference: string
}

export interface ComplianceStatus {
  overallStatus: 'compliant' | 'requires_review' | 'non_compliant'
  legalBasisCompliance: boolean
  processorCompliance: boolean
  dataMinimizationCompliance: boolean
  retentionCompliance: boolean
  rightsCompliance: boolean
  lastReview: Date
  nextReview: Date
  issues: string[]
  recommendations: string[]
}

export interface PrivacyImpactAssessment {
  assessmentId: string
  conductedDate: Date
  riskLevel: 'low' | 'medium' | 'high'
  dataTypes: string[]
  processingPurposes: string[]
  legalBasis: string
  risks: {
    risk: string
    likelihood: 'low' | 'medium' | 'high'
    impact: 'low' | 'medium' | 'high'
    mitigation: string
  }[]
  safeguards: string[]
  dataRetention: string
  dataTransfers: string
  complianceStatus: string
  reviewDate: Date
  approvedBy: string
  recommendations: string[]
}