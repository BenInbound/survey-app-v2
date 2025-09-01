import { OrganizationalAssessment } from './types'

interface DepartmentPerformanceRow {
  department: string
  overallScore: number
  managementScore: number
  employeeScore: number
  alignmentGap: number
  criticalGaps: number
  status: string
  managementResponses: number
  employeeResponses: number
}

interface ConsultantInsights {
  departmentRanking: Array<{
    department: string
    departmentName: string
    overallScore: number
    alignmentGap: number
    criticalGaps: number
    status: string
  }>
  organizationalHealth: number
  totalDepartments: number
  criticalDepartments: number
  needsAttentionDepartments: number
}

function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}

function arrayToCSV<T extends Record<string, any>>(data: T[], headers: string[]): string {
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => 
    headers.map(header => escapeCsvValue(row[header])).join(',')
  )
  
  return [csvHeaders, ...csvRows].join('\n')
}

export function generateDepartmentPerformanceCSV(
  assessment: OrganizationalAssessment,
  consultantInsights: ConsultantInsights
): string {
  const departmentData: DepartmentPerformanceRow[] = consultantInsights.departmentRanking.map(dept => {
    const assessmentDept = assessment.departmentData?.find(d => d.department === dept.department)
    
    return {
      department: dept.departmentName,
      overallScore: Number(dept.overallScore.toFixed(2)),
      managementScore: Number(assessmentDept?.managementResponses.overallAverage.toFixed(2) || 0),
      employeeScore: Number(assessmentDept?.employeeResponses.overallAverage.toFixed(2) || 0),
      alignmentGap: Number(dept.alignmentGap.toFixed(2)),
      criticalGaps: dept.criticalGaps,
      status: dept.status,
      managementResponses: assessmentDept?.responseCount.management || 0,
      employeeResponses: assessmentDept?.responseCount.employee || 0
    }
  })

  const headers = [
    'department',
    'overallScore',
    'managementScore', 
    'employeeScore',
    'alignmentGap',
    'criticalGaps',
    'status',
    'managementResponses',
    'employeeResponses'
  ]

  return arrayToCSV(departmentData, headers)
}

export function generateAssessmentSummaryCSV(
  assessment: OrganizationalAssessment,
  consultantInsights: ConsultantInsights
): string {
  const summaryData = [{
    organizationName: assessment.organizationName,
    assessmentDate: assessment.created.toISOString().split('T')[0],
    organizationalHealth: consultantInsights.organizationalHealth,
    totalDepartments: consultantInsights.totalDepartments,
    departmentsPerformingWell: consultantInsights.totalDepartments - consultantInsights.criticalDepartments - consultantInsights.needsAttentionDepartments,
    departmentsNeedingAttention: consultantInsights.needsAttentionDepartments,
    criticalDepartments: consultantInsights.criticalDepartments,
    totalManagementResponses: assessment.responseCount.management,
    totalEmployeeResponses: assessment.responseCount.employee,
    exportedAt: new Date().toISOString()
  }]

  const headers = [
    'organizationName',
    'assessmentDate',
    'organizationalHealth',
    'totalDepartments',
    'departmentsPerformingWell',
    'departmentsNeedingAttention', 
    'criticalDepartments',
    'totalManagementResponses',
    'totalEmployeeResponses',
    'exportedAt'
  ]

  return arrayToCSV(summaryData, headers)
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export function exportAssessmentData(
  assessment: OrganizationalAssessment,
  consultantInsights: ConsultantInsights
): void {
  try {
    const timestamp = new Date().toISOString().split('T')[0]
    const orgName = assessment.organizationName.replace(/[^a-zA-Z0-9]/g, '_')
    
    const departmentCSV = generateDepartmentPerformanceCSV(assessment, consultantInsights)
    downloadCSV(departmentCSV, `${orgName}_department_performance_${timestamp}.csv`)
    
  } catch (error) {
    console.error('Failed to export assessment data:', error)
    throw new Error('Export failed. Please try again.')
  }
}