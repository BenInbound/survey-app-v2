import { AccessCodeValidation, OrganizationalAssessment } from './types'

export class AccessController {
  generateAccessCode(organizationName: string): string {
    const year = new Date().getFullYear()
    const orgCode = this.sanitizeOrganizationName(organizationName)
    const randomSuffix = this.generateRandomSuffix()
    
    return `${orgCode}-${year}-${randomSuffix}`.toUpperCase()
  }

  validateAccessCode(code: string, assessments: OrganizationalAssessment[]): AccessCodeValidation {
    const normalizedCode = code.trim().toUpperCase()
    const assessment = assessments.find(a => a.accessCode === normalizedCode)
    
    if (!assessment) {
      return {
        code: normalizedCode,
        assessmentId: '',
        organizationName: '',
        isValid: false,
        isExpired: false
      }
    }

    const isExpired = this.isCodeExpired(assessment)
    
    return {
      code: normalizedCode,
      assessmentId: assessment.id,
      organizationName: assessment.organizationName,
      isValid: !isExpired && assessment.status !== 'locked',
      isExpired,
      expiresAt: assessment.codeExpiration
    }
  }

  expireAccessCode(assessment: OrganizationalAssessment): OrganizationalAssessment {
    return {
      ...assessment,
      codeExpiration: new Date()
    }
  }

  regenerateAccessCode(assessment: OrganizationalAssessment): OrganizationalAssessment {
    const newCode = this.generateAccessCode(assessment.organizationName)
    return {
      ...assessment,
      accessCode: newCode,
      codeRegeneratedAt: new Date(),
      codeExpiration: undefined // Remove expiration when regenerating
    }
  }

  private sanitizeOrganizationName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
      .trim()
      .split(/\s+/)
      .map(word => word.substring(0, 4)) // Max 4 chars per word
      .join('')
      .substring(0, 8) // Max 8 chars total
      .toUpperCase()
  }

  private generateRandomSuffix(): string {
    const words = [
      'STRATEGY', 'GROWTH', 'VISION', 'FOCUS', 'ALIGN', 
      'ENGAGE', 'THRIVE', 'EXCEL', 'LEAD', 'SCALE'
    ]
    return words[Math.floor(Math.random() * words.length)]
  }

  private isCodeExpired(assessment: OrganizationalAssessment): boolean {
    if (!assessment.codeExpiration) return false
    return new Date() > assessment.codeExpiration
  }
}

// Export singleton instance
export const accessController = new AccessController()