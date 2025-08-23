/**
 * GDPR Privacy Configuration Manager
 * Implements privacy-by-design principles and Article 25 technical measures
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
} from './gdpr-types'

interface PrivacyConfiguration {
  id: string
  name: string
  description: string
  dataClassifications: DataClassification[]
  defaultLegalBasis: LegalBasis
  consentRequired: boolean
  minimizationRules: DataMinimizationRule[]
  retentionPolicy: RetentionPolicy
  encryptionRequired: boolean
  pseudonymizationRequired: boolean
}

interface DataMinimizationRule {
  category: DataCategory
  allowedPurposes: ProcessingPurpose[]
  dataSubjectAccess: boolean
  storageLocation: 'local' | 'encrypted_cloud' | 'eu_only'
}

interface RetentionPolicy {
  defaultPeriod: number // days
  categorySpecific: Record<DataCategory, number>
  automaticDeletion: boolean
  archivalRules?: {
    enabled: boolean
    period: number // days until archival
    location: string
  }
}

interface ConsentRecord {
  participantId: string
  consentTimestamp: Date
  consentVersion: string
  legalBasis: LegalBasis
  purposes: ProcessingPurpose[]
  dataCategories: DataCategory[]
  withdrawalDeadline?: Date
  ipAddress?: string // for audit trail
}

export class PrivacyManager {
  private configurations: Map<string, PrivacyConfiguration> = new Map()
  private processingRecords: Map<string, DataProcessingRecord> = new Map()
  private consentRecords: Map<string, ConsentRecord> = new Map()

  constructor() {
    this.initializeDefaultConfigurations()
  }

  private initializeDefaultConfigurations(): void {
    // Organizational Assessment Privacy Configuration
    const organizationalConfig: PrivacyConfiguration = {
      id: 'organizational-assessment',
      name: 'Organizational Strategic Assessment',
      description: 'Privacy configuration for employee/management strategic alignment surveys',
      dataClassifications: [
        {
          category: DataCategory.SURVEY_RESPONSES,
          sensitivity: DataSensitivity.PERSONAL,
          legalBasis: LegalBasis.LEGITIMATE_INTEREST,
          purpose: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT, ProcessingPurpose.STRATEGIC_INSIGHTS],
          controller: DataController.JOINT_CONTROLLERS,
          processors: [DataProcessor.INBOUND_PLATFORM],
          retentionPeriod: 730, // 2 years
          dataSubjectType: 'employee'
        },
        {
          category: DataCategory.PARTICIPANT_IDENTIFIERS,
          sensitivity: DataSensitivity.PERSONAL,
          legalBasis: LegalBasis.LEGITIMATE_INTEREST,
          purpose: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
          controller: DataController.CLIENT_ORGANIZATION,
          processors: [DataProcessor.INBOUND_PLATFORM],
          retentionPeriod: 365, // 1 year
          dataSubjectType: 'employee'
        },
        {
          category: DataCategory.ORGANIZATIONAL_DATA,
          sensitivity: DataSensitivity.CONFIDENTIAL,
          legalBasis: LegalBasis.LEGITIMATE_INTEREST,
          purpose: [ProcessingPurpose.STRATEGIC_INSIGHTS, ProcessingPurpose.PERFORMANCE_ANALYTICS],
          controller: DataController.JOINT_CONTROLLERS,
          processors: [DataProcessor.INBOUND_PLATFORM, DataProcessor.OPENAI_SUBPROCESSOR],
          retentionPeriod: 1095, // 3 years
          dataSubjectType: 'management'
        }
      ],
      defaultLegalBasis: LegalBasis.LEGITIMATE_INTEREST,
      consentRequired: false,
      minimizationRules: [
        {
          category: DataCategory.SURVEY_RESPONSES,
          allowedPurposes: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT, ProcessingPurpose.STRATEGIC_INSIGHTS],
          dataSubjectAccess: false, // Aggregated data only
          storageLocation: 'local'
        },
        {
          category: DataCategory.PARTICIPANT_IDENTIFIERS,
          allowedPurposes: [ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT],
          dataSubjectAccess: true,
          storageLocation: 'local'
        }
      ],
      retentionPolicy: {
        defaultPeriod: 730,
        categorySpecific: {
          [DataCategory.SURVEY_RESPONSES]: 730,
          [DataCategory.PARTICIPANT_IDENTIFIERS]: 365,
          [DataCategory.ORGANIZATIONAL_DATA]: 1095,
          [DataCategory.TECHNICAL_DATA]: 90,
          [DataCategory.USAGE_ANALYTICS]: 365
        },
        automaticDeletion: true,
        archivalRules: {
          enabled: true,
          period: 2555, // 7 years for business records
          location: 'encrypted_archive'
        }
      },
      encryptionRequired: true,
      pseudonymizationRequired: true
    }

    this.configurations.set('organizational-assessment', organizationalConfig)
  }

  getPrivacyConfiguration(configId: string): PrivacyConfiguration | null {
    return this.configurations.get(configId) || null
  }

  classifyData(configId: string, dataType: DataCategory): DataClassification | null {
    const config = this.getPrivacyConfiguration(configId)
    if (!config) return null

    return config.dataClassifications.find(
      classification => classification.category === dataType
    ) || null
  }

  validateLegalBasis(
    legalBasis: LegalBasis,
    purpose: ProcessingPurpose[],
    dataCategory: DataCategory,
    dataSubjectType: 'employee' | 'management' | 'consultant'
  ): { valid: boolean; reason?: string } {
    // Article 6 GDPR validation logic
    switch (legalBasis) {
      case LegalBasis.CONSENT:
        if (dataSubjectType === 'employee' && purpose.includes(ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT)) {
          return { valid: false, reason: 'Employee consent may not be freely given due to employment relationship (GDPR Recital 43)' }
        }
        return { valid: true }

      case LegalBasis.LEGITIMATE_INTEREST:
        // Note: DataCategory doesn't include sensitivity, this would be checked via DataClassification
        // Special category data validation would be handled at the classification level
        if (purpose.includes(ProcessingPurpose.ORGANIZATIONAL_ASSESSMENT)) {
          return { valid: true }
        }
        return { valid: false, reason: 'Purpose not aligned with legitimate business interest' }

      case LegalBasis.CONTRACT:
        if (dataSubjectType === 'employee' && purpose.includes(ProcessingPurpose.PERFORMANCE_ANALYTICS)) {
          return { valid: true }
        }
        return { valid: false, reason: 'No contractual relationship or purpose not contract-related' }

      default:
        return { valid: false, reason: 'Legal basis not applicable for this data processing context' }
    }
  }

  createPrivacyMetadata(
    configId: string,
    dataCategory: DataCategory,
    participantId?: string
  ): PrivacyMetadata | null {
    const classification = this.classifyData(configId, dataCategory)
    const config = this.getPrivacyConfiguration(configId)
    
    if (!classification || !config) return null

    const now = new Date()
    const retentionPeriod = config.retentionPolicy.categorySpecific[dataCategory] || 
                           config.retentionPolicy.defaultPeriod
    const scheduledDeletion = new Date(now.getTime() + retentionPeriod * 24 * 60 * 60 * 1000)

    return {
      classification,
      consentRequired: config.consentRequired,
      consentTimestamp: config.consentRequired ? now : undefined,
      consentVersion: config.consentRequired ? '1.0' : undefined,
      pseudonymized: config.pseudonymizationRequired,
      encrypted: config.encryptionRequired,
      minimized: true,
      createdAt: now,
      lastModified: now,
      scheduledDeletion
    }
  }

  recordDataProcessing(
    assessmentId: string,
    organizationName: string,
    purposes: ProcessingPurpose[],
    categories: DataCategory[]
  ): DataProcessingRecord {
    const record: DataProcessingRecord = {
      id: `proc-${assessmentId}-${Date.now()}`,
      purpose: purposes,
      categories,
      dataSubjects: ['Employees', 'Management Team'],
      recipients: ['Inbound Consulting Team', 'Client Management (aggregated data only)'],
      retentionPeriod: 730, // 2 years default
      internationalTransfers: false, // Data processed in EU/EEA
      safeguards: [
        'Data pseudonymization before processing',
        'Encryption at rest and in transit',
        'Access controls and authentication',
        'Regular deletion schedules',
        'Employee anonymization in aggregated reporting'
      ],
      createdAt: new Date()
    }

    this.processingRecords.set(record.id, record)
    return record
  }

  validateDataMinimization(
    configId: string,
    requestedData: DataCategory[],
    purposes: ProcessingPurpose[]
  ): { compliant: boolean; violations: string[] } {
    const config = this.getPrivacyConfiguration(configId)
    if (!config) return { compliant: false, violations: ['Configuration not found'] }

    const violations: string[] = []

    requestedData.forEach(category => {
      const rule = config.minimizationRules.find(r => r.category === category)
      if (!rule) {
        violations.push(`No minimization rule found for category: ${category}`)
        return
      }

      const unauthorizedPurposes = purposes.filter(
        purpose => !rule.allowedPurposes.includes(purpose)
      )
      
      if (unauthorizedPurposes.length > 0) {
        violations.push(
          `Category ${category} not authorized for purposes: ${unauthorizedPurposes.join(', ')}`
        )
      }
    })

    return {
      compliant: violations.length === 0,
      violations
    }
  }

  scheduleDataDeletion(privacyMetadata: PrivacyMetadata): void {
    if (!privacyMetadata.scheduledDeletion) return

    // In production, this would integrate with a job scheduler
    // For now, we store the deletion schedule
    const deletionJob = {
      id: `deletion-${Date.now()}`,
      scheduledFor: privacyMetadata.scheduledDeletion,
      dataIdentifier: privacyMetadata.classification.category,
      created: new Date()
    }

    // Store in localStorage for demonstration
    const existingJobs = JSON.parse(localStorage.getItem('gdpr-deletion-schedule') || '[]')
    existingJobs.push(deletionJob)
    localStorage.setItem('gdpr-deletion-schedule', JSON.stringify(existingJobs))
  }

  getProcessingRecords(): DataProcessingRecord[] {
    return Array.from(this.processingRecords.values())
  }

  exportProcessingRecord(recordId: string): string | null {
    const record = this.processingRecords.get(recordId)
    if (!record) return null

    // Article 30 GDPR format for processing records
    return JSON.stringify({
      recordId: record.id,
      controller: 'Inbound Consulting AS',
      jointController: 'Client Organization',
      processingPurposes: record.purpose,
      dataCategories: record.categories,
      dataSubjects: record.dataSubjects,
      recipients: record.recipients,
      internationalTransfers: record.internationalTransfers,
      safeguards: record.safeguards,
      retentionPeriod: `${record.retentionPeriod} days`,
      created: record.createdAt.toISOString()
    }, null, 2)
  }
}