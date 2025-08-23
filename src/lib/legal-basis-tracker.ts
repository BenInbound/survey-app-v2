/**
 * GDPR Legal Basis Tracking for Survey Platform
 * Enhances existing data models with comprehensive privacy compliance
 */

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

import {
  Survey,
  ParticipantSession,
  SurveyResponse,
  OrganizationalAssessment,
  ParticipantResponse,
  AggregatedResponses
} from './types'

// Enhanced interfaces with legal basis tracking
export interface GDPREnhancedSurvey extends Survey {
  privacyMetadata: PrivacyMetadata
  legalBasisJustification: LegalBasisJustification
  dataProcessingNotice: DataProcessingNotice
  retentionSchedule: RetentionSchedule
}

export interface GDPREnhancedParticipantSession extends ParticipantSession {
  privacyMetadata: PrivacyMetadata
  consentRecord?: ConsentRecord
  legalBasisTracker: LegalBasisTracker
  dataSubjectRights: DataSubjectRightsStatus
}

export interface GDPREnhancedSurveyResponse extends SurveyResponse {
  privacyClassification: DataClassification
  processingLegalBasis: LegalBasis
  minimizationApplied: boolean
  pseudonymizationLevel: 'none' | 'basic' | 'advanced'
}

export interface GDPREnhancedOrganizationalAssessment extends OrganizationalAssessment {
  privacyConfiguration: AssessmentPrivacyConfiguration
  legalBasisMatrix: LegalBasisMatrix
  dataProcessingRecord: string // Reference to DataProcessingRecord ID
  jointControllerAgreement?: string // Reference to JointControllerAgreement ID
  dataSubjectNotifications: DataSubjectNotification[]
}

export interface GDPREnhancedParticipantResponse extends ParticipantResponse {
  privacyMetadata: PrivacyMetadata
  legalBasisTracker: LegalBasisTracker
  dataSubjectRights: DataSubjectRightsStatus
}

// Legal Basis Tracking Support Interfaces
export interface LegalBasisJustification {
  primaryBasis: LegalBasis
  justification: string
  balancingTestRequired: boolean
  balancingTestResult?: BalancingTestResult
  alternativeBasisConsidered: LegalBasis[]
  reviewDate: Date
  approvedBy: string
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

export interface DataProcessingNotice {
  title: string
  purpose: ProcessingPurpose[]
  legalBasis: LegalBasis
  categories: DataCategory[]
  recipients: string[]
  retentionPeriod: string
  rightsInformation: string
  contactDetails: {
    controller: string
    dpo?: string
    email: string
  }
  lastUpdated: Date
  version: string
}

export interface RetentionSchedule {
  category: DataCategory
  retentionPeriod: number // days
  retentionReason: string
  deletionMethod: 'secure_erasure' | 'anonymization' | 'pseudonymization'
  archivalRequirements?: {
    required: boolean
    period: number // days
    location: string
    encryption: boolean
  }
  reviewFrequency: number // days
  nextReview: Date
}

export interface ConsentRecord {
  participantId: string
  consentTimestamp: Date
  consentMethod: 'explicit_online' | 'opt_in_form' | 'verbal_recorded' | 'implicit_participation'
  consentScope: ProcessingPurpose[]
  consentVersion: string
  withdrawalMethod: string
  withdrawalDeadline?: Date
  proofOfConsent: {
    type: 'checkbox_log' | 'form_submission' | 'audit_log' | 'email_confirmation'
    reference: string
    ipAddress?: string
    userAgent?: string
  }
}

export interface LegalBasisTracker {
  sessionId: string
  participantRole: 'management' | 'employee' | 'consultant'
  primaryLegalBasis: LegalBasis
  basisJustification: string
  dataCategories: DataCategory[]
  purposes: ProcessingPurpose[]
  necessityTest: {
    isNecessary: boolean
    justification: string
    alternativesConsidered: string[]
  }
  trackingEvents: LegalBasisEvent[]
}

export interface LegalBasisEvent {
  timestamp: Date
  eventType: 'data_collection' | 'processing_start' | 'consent_given' | 'consent_withdrawn' | 'purpose_change' | 'basis_change'
  details: string
  legalBasis: LegalBasis
  dataCategory: DataCategory
  purpose: ProcessingPurpose
}

export interface DataSubjectRightsStatus {
  participantId: string
  assessmentId: string
  rightsExercised: DataSubjectRight[]
  pendingRequests: DataSubjectRequest[]
  rightsToCommunicate: DataSubjectRightInfo[]
}

export interface DataSubjectRight {
  right: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection'
  exercisedDate: Date
  requestMethod: string
  responseDate?: Date
  responseMethod?: string
  outcome: 'granted' | 'denied' | 'partially_granted' | 'pending'
  denialReason?: string
}

export interface DataSubjectRequest {
  requestId: string
  requestType: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection'
  requestDate: Date
  requestDetails: string
  status: 'received' | 'in_progress' | 'completed' | 'rejected'
  deadlineDate: Date
  assignedTo: string
  responseRequired: boolean
}

export interface DataSubjectRightInfo {
  right: string
  description: string
  howToExercise: string
  timeframe: string
  limitations?: string[]
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

export interface DataMinimizationRule {
  category: DataCategory
  collectionLimitation: string
  retentionLimitation: string
  processingLimitation: string
  accessLimitation: string
  deletionTrigger: string
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

export interface DataSubjectNotification {
  notificationId: string
  recipientRole: 'management' | 'employee' | 'all'
  notificationType: 'privacy_notice' | 'rights_information' | 'data_breach' | 'purpose_change' | 'consent_request'
  title: string
  content: string
  deliveryMethod: 'email' | 'in_app' | 'sms' | 'physical_mail'
  sentDate: Date
  acknowledgmentRequired: boolean
  acknowledgmentDeadline?: Date
  acknowledgmentStatus: 'pending' | 'acknowledged' | 'overdue'
}

// Legal Basis Tracking Manager
export class LegalBasisTrackingManager {
  private static instance: LegalBasisTrackingManager
  private trackingEvents: Map<string, LegalBasisEvent[]> = new Map()
  private consentRecords: Map<string, ConsentRecord> = new Map()
  private dataSubjectRequests: Map<string, DataSubjectRequest[]> = new Map()

  static getInstance(): LegalBasisTrackingManager {
    if (!LegalBasisTrackingManager.instance) {
      LegalBasisTrackingManager.instance = new LegalBasisTrackingManager()
    }
    return LegalBasisTrackingManager.instance
  }

  // Method to clear all data - useful for testing
  clearAllData(): void {
    this.trackingEvents.clear()
    this.consentRecords.clear()
    this.dataSubjectRequests.clear()
  }

  trackLegalBasisEvent(sessionId: string, event: Omit<LegalBasisEvent, 'timestamp'>): void {
    const fullEvent: LegalBasisEvent = {
      timestamp: new Date(),
      ...event
    }

    const existingEvents = this.trackingEvents.get(sessionId) || []
    this.trackingEvents.set(sessionId, [...existingEvents, fullEvent])

    // Persist to localStorage for demonstration
    localStorage.setItem(
      `gdpr-legal-basis-events-${sessionId}`,
      JSON.stringify(this.trackingEvents.get(sessionId))
    )
  }

  recordConsent(consentRecord: ConsentRecord): void {
    this.consentRecords.set(consentRecord.participantId, consentRecord)
    localStorage.setItem(
      `gdpr-consent-${consentRecord.participantId}`,
      JSON.stringify(consentRecord)
    )

    // Track consent as legal basis event
    this.trackLegalBasisEvent(consentRecord.participantId, {
      eventType: 'consent_given',
      details: `Consent given via ${consentRecord.consentMethod}`,
      legalBasis: LegalBasis.CONSENT,
      dataCategory: DataCategory.SURVEY_RESPONSES,
      purpose: consentRecord.consentScope[0] || ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT
    })
  }

  validateLegalBasisForProcessing(
    participantRole: 'management' | 'employee',
    purpose: ProcessingPurpose,
    dataCategory: DataCategory
  ): LegalBasisValidationResult {
    // Employee consent validation (GDPR Recital 43)
    if (participantRole === 'employee' && purpose === ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT) {
      return {
        recommendedBasis: LegalBasis.LEGITIMATE_INTEREST,
        isValid: true,
        reasoning: 'Legitimate interest preferred for employee organizational assessments due to employment relationship constraints on free consent',
        requiresBalancingTest: true,
        additionalSafeguards: ['Anonymization of individual responses', 'Clear communication of survey purpose', 'No adverse consequences for participation/non-participation']
      }
    }

    // Management can provide consent more freely
    if (participantRole === 'management' && purpose === ProcessingPurpose.STRATEGIC_INSIGHTS) {
      return {
        recommendedBasis: LegalBasis.CONSENT,
        isValid: true,
        reasoning: 'Management can freely consent to strategic insights processing',
        requiresBalancingTest: false,
        additionalSafeguards: ['Clear withdrawal mechanism', 'Specific consent for each purpose']
      }
    }

    return {
      recommendedBasis: LegalBasis.LEGITIMATE_INTEREST,
      isValid: true,
      reasoning: 'Default to legitimate interest with proper safeguards',
      requiresBalancingTest: true,
      additionalSafeguards: ['Data minimization', 'Purpose limitation', 'Transparency measures']
    }
  }

  generateLegalBasisReport(assessmentId: string): LegalBasisComplianceReport {
    const events = Array.from(this.trackingEvents.values()).flat()
    const assessmentEvents = events.filter(e => e.details.includes(assessmentId))

    const consentRecords = Array.from(this.consentRecords.values())
    
    // Extract participant IDs from session IDs and event details
    const participantIds = new Set<string>()
    Array.from(this.trackingEvents.keys()).forEach(sessionId => {
      const sessionEvents = this.trackingEvents.get(sessionId) || []
      const relevantEvents = sessionEvents.filter(e => e.details.includes(assessmentId))
      if (relevantEvents.length > 0) {
        participantIds.add(sessionId)
      }
    })
    
    // Also add participants from consent records
    consentRecords.forEach(record => {
      participantIds.add(record.participantId)
    })
    
    return {
      assessmentId,
      totalParticipants: participantIds.size,
      legalBasisBreakdown: this.calculateLegalBasisBreakdown(assessmentEvents),
      consentRecordsCount: consentRecords.length,
      complianceIssues: this.identifyComplianceIssues(assessmentEvents),
      recommendations: this.generateRecommendations(assessmentEvents),
      generatedAt: new Date()
    }
  }

  private calculateLegalBasisBreakdown(events: LegalBasisEvent[]): Record<LegalBasis, number> {
    const breakdown = {} as Record<LegalBasis, number>
    events.forEach(event => {
      breakdown[event.legalBasis] = (breakdown[event.legalBasis] || 0) + 1
    })
    return breakdown
  }

  private identifyComplianceIssues(events: LegalBasisEvent[]): string[] {
    const issues: string[] = []
    
    const consentWithdrawals = events.filter(e => e.eventType === 'consent_withdrawn')
    const consentGiven = events.filter(e => e.eventType === 'consent_given')
    
    if (consentWithdrawals.length > consentGiven.length * 0.1) {
      issues.push('High consent withdrawal rate may indicate consent fatigue or insufficient transparency')
    }

    return issues
  }

  private generateRecommendations(events: LegalBasisEvent[]): string[] {
    const recommendations: string[] = []
    
    const employeeEvents = events.filter(e => e.details.includes('employee'))
    const consentEvents = employeeEvents.filter(e => e.legalBasis === LegalBasis.CONSENT)
    
    if (consentEvents.length > 0) {
      recommendations.push('Consider using legitimate interest for employee data processing to avoid consent validity issues')
    }

    recommendations.push('Implement regular legal basis reviews to ensure ongoing compliance')
    recommendations.push('Provide clear data subject rights information at point of collection')

    return recommendations
  }
}

export interface LegalBasisValidationResult {
  recommendedBasis: LegalBasis
  isValid: boolean
  reasoning: string
  requiresBalancingTest: boolean
  additionalSafeguards: string[]
}

export interface LegalBasisComplianceReport {
  assessmentId: string
  totalParticipants: number
  legalBasisBreakdown: Record<LegalBasis, number>
  consentRecordsCount: number
  complianceIssues: string[]
  recommendations: string[]
  generatedAt: Date
}