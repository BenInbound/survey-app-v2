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
    console.log('AccessController: Validating code', normalizedCode)
    console.log('AccessController: Available assessments:', assessments.map(a => ({ id: a.id, code: a.accessCode, status: a.status })))
    
    const assessment = assessments.find(a => a.accessCode === normalizedCode)
    console.log('AccessController: Found assessment:', assessment?.id)
    
    if (!assessment) {
      console.log('AccessController: No assessment found for code')
      return {
        code: normalizedCode,
        assessmentId: '',
        organizationName: '',
        isValid: false,
        isExpired: false
      }
    }

    const isExpired = this.isCodeExpired(assessment)
    console.log('AccessController: Code expired?', isExpired, 'Status:', assessment.status)
    
    const result = {
      code: normalizedCode,
      assessmentId: assessment.id,
      organizationName: assessment.organizationName,
      isValid: !isExpired && assessment.status !== 'locked',
      isExpired,
      expiresAt: assessment.codeExpiration
    }
    
    console.log('AccessController: Validation result:', result)
    return result
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