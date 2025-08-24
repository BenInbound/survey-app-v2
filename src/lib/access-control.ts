import { AccessCodeValidation, OrganizationalAssessment, ParticipantRole, Department, AccessCodeParseResult } from './types'

export class AccessController {
  // Legacy method - kept for backward compatibility
  generateAccessCode(organizationName: string): string {
    const year = new Date().getFullYear()
    const orgCode = this.sanitizeOrganizationName(organizationName)
    const randomSuffix = this.generateRandomSuffix()
    
    return `${orgCode}-${year}-${randomSuffix}`.toUpperCase()
  }

  // NEW: Generate department-specific access codes
  generateDepartmentAccessCode(organizationName: string, role: ParticipantRole, departmentCode: string): string {
    const timestamp = Date.now().toString().slice(-4) // Use last 4 digits of timestamp for uniqueness
    const orgCode = this.sanitizeOrganizationName(organizationName)
    const roleCode = role === 'management' ? 'MGMT' : 'EMP'
    const deptCode = this.sanitizeDepartmentCode(departmentCode) // Sanitize and limit department code
    
    return `${orgCode}-${roleCode}-${deptCode}${timestamp}`.toUpperCase()
  }

  // NEW: Parse access code to extract role and department information
  parseAccessCode(code: string): AccessCodeParseResult {
    const normalizedCode = code.trim().toUpperCase()
    
    // Try parsing as department-embedded code first: ORG-ROLE-DEPT#### (4 digits for timestamp)
    const departmentMatch = normalizedCode.match(/^([A-Z0-9]+)-(MGMT|EMP)-([A-Z0-9]+)(\d{4})$/)
    if (departmentMatch) {
      const [, orgCode, roleCode, deptCode] = departmentMatch
      return {
        isValid: true,
        role: roleCode === 'MGMT' ? 'management' : 'employee',
        department: deptCode,
        organizationName: this.reconstructOrgName(orgCode)
      }
    }

    // Fall back to legacy format: ORG-YEAR-SUFFIX
    const legacyMatch = normalizedCode.match(/^([A-Z0-9]+)-(\d{4})-([A-Z]+)$/)
    if (legacyMatch) {
      const [, orgCode] = legacyMatch
      return {
        isValid: true,
        organizationName: this.reconstructOrgName(orgCode)
        // No role/department for legacy codes
      }
    }

    return {
      isValid: false,
      errors: ['Invalid access code format']
    }
  }

  validateAccessCode(code: string, assessments: OrganizationalAssessment[]): AccessCodeValidation {
    const normalizedCode = code.trim().toUpperCase()
    const parseResult = this.parseAccessCode(normalizedCode)
    
    if (!parseResult.isValid) {
      return {
        code: normalizedCode,
        assessmentId: '',
        organizationName: '',
        isValid: false,
        isExpired: false
      }
    }

    // Find assessment by matching different code types
    let assessment: OrganizationalAssessment | undefined
    
    if (parseResult.role && parseResult.department) {
      // Department-embedded code - find assessment with matching department code
      assessment = assessments.find(a => 
        a.departments.some(d => 
          (parseResult.role === 'management' && d.managementCode === normalizedCode) ||
          (parseResult.role === 'employee' && d.employeeCode === normalizedCode)
        )
      )
    } else {
      // Legacy code - find by direct access code match
      assessment = assessments.find(a => a.accessCode === normalizedCode)
    }
    
    if (!assessment) {
      return {
        code: normalizedCode,
        assessmentId: '',
        organizationName: parseResult.organizationName || '',
        isValid: false,
        isExpired: false
      }
    }

    const isExpired = this.isCodeExpired(assessment)
    
    return {
      code: normalizedCode,
      assessmentId: assessment.id,
      organizationName: assessment.organizationName,
      role: parseResult.role,
      department: parseResult.department,
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

  // NEW: Sanitize department code for access code generation
  private sanitizeDepartmentCode(departmentCode: string): string {
    return departmentCode
      .replace(/[^a-zA-Z0-9]/g, '') // Remove all special chars
      .substring(0, 3) // Limit to 3 chars to leave room for year
      .toUpperCase()
  }

  // NEW: Attempt to reconstruct organization name from sanitized code
  private reconstructOrgName(orgCode: string): string {
    // This is a best-effort reconstruction since sanitization is lossy
    // In practice, we'll rely on the assessment lookup for the real name
    return orgCode.toLowerCase().replace(/([a-z])([A-Z])/g, '$1 $2')
  }

  private isCodeExpired(assessment: OrganizationalAssessment): boolean {
    if (!assessment.codeExpiration) return false
    return new Date() > assessment.codeExpiration
  }
}

// Export singleton instance
export const accessController = new AccessController()