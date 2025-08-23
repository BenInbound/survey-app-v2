/**
 * GDPR Data Classification and Privacy Types
 * Implements Article 4 definitions and privacy-by-design principles
 */

export enum DataCategory {
  SURVEY_RESPONSES = 'survey_responses',
  PARTICIPANT_IDENTIFIERS = 'participant_identifiers', 
  TECHNICAL_DATA = 'technical_data',
  ORGANIZATIONAL_DATA = 'organizational_data',
  USAGE_ANALYTICS = 'usage_analytics'
}

export enum LegalBasis {
  CONSENT = 'consent',                    // Art. 6(1)(a) - Freely given consent
  LEGITIMATE_INTEREST = 'legitimate_interest', // Art. 6(1)(f) - Legitimate business interest
  CONTRACT = 'contract',                  // Art. 6(1)(b) - Contract performance  
  LEGAL_OBLIGATION = 'legal_obligation',  // Art. 6(1)(c) - Legal compliance
  VITAL_INTERESTS = 'vital_interests',    // Art. 6(1)(d) - Life protection
  PUBLIC_TASK = 'public_task'            // Art. 6(1)(e) - Public interest
}

export enum DataSensitivity {
  PUBLIC = 'public',           // No privacy concerns
  INTERNAL = 'internal',       // Internal business data
  CONFIDENTIAL = 'confidential', // Sensitive business data
  PERSONAL = 'personal',       // Personal data under GDPR
  SENSITIVE = 'sensitive'      // Special category personal data (Art. 9)
}

export enum ProcessingPurpose {
  ORGANIZATIONAL_ASSESSMENT = 'organizational_assessment',
  STRATEGIC_INSIGHTS = 'strategic_insights',
  PERFORMANCE_ANALYTICS = 'performance_analytics',
  SYSTEM_ADMINISTRATION = 'system_administration',
  LEGAL_COMPLIANCE = 'legal_compliance'
}

export enum DataController {
  INBOUND_CONSULTING = 'inbound_consulting',
  CLIENT_ORGANIZATION = 'client_organization', 
  JOINT_CONTROLLERS = 'joint_controllers'
}

export enum DataProcessor {
  INBOUND_PLATFORM = 'inbound_platform',
  OPENAI_SUBPROCESSOR = 'openai_subprocessor',
  HOSTING_PROVIDER = 'hosting_provider'
}

export interface DataClassification {
  category: DataCategory
  sensitivity: DataSensitivity
  legalBasis: LegalBasis
  purpose: ProcessingPurpose[]
  controller: DataController
  processors: DataProcessor[]
  retentionPeriod: number // days
  dataSubjectType: 'employee' | 'management' | 'consultant'
}

export interface PrivacyMetadata {
  classification: DataClassification
  consentRequired: boolean
  consentTimestamp?: Date
  consentVersion?: string
  pseudonymized: boolean
  encrypted: boolean
  minimized: boolean
  createdAt: Date
  lastModified: Date
  scheduledDeletion?: Date
}

export interface DataProcessingRecord {
  id: string
  purpose: ProcessingPurpose[]
  categories: DataCategory[]
  dataSubjects: string[]
  recipients: string[]
  retentionPeriod: number
  internationalTransfers: boolean
  safeguards?: string[]
  createdAt: Date
}