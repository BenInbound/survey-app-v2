'use client'

import { useState, useEffect } from 'react'
import { OrganizationalAssessmentManager } from '@/lib/organizational-assessment-manager'
import { OrganizationalAssessment, ComparativeAnalysis } from '@/lib/types'
import { ComparativeSpiderChart } from '@/components/ui/ComparativeSpiderChart'
import { generateOrganizationalSummary } from '@/lib/ai-summary'
import { createDemoAssessment, refreshDemoAssessment } from '@/lib/demo-data'
import Logo from '@/components/ui/Logo'

interface ConsultantResultsProps {
  params: { id: string }
}

export default function ConsultantResults({ params }: ConsultantResultsProps) {
  const { id: assessmentId } = params
  const [assessment, setAssessment] = useState<OrganizationalAssessment | null>(null)
  const [comparativeAnalysis, setComparativeAnalysis] = useState<ComparativeAnalysis | null>(null)
  const [aiInsights, setAiInsights] = useState<string | null>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const assessmentManager = new OrganizationalAssessmentManager()

  useEffect(() => {
    loadAssessmentData()
  }, [assessmentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAssessmentData = async () => {
    console.log('🚨 CONSOLE TEST - If you see this, console is working!')
    console.log('🚨 Loading assessment:', assessmentId)
    try {
      setIsLoadingAssessment(true)
      setError(null)

      // Ensure demo assessment exists if this is the demo
      if (assessmentId === 'demo-org') {
        // Force refresh demo data to fix any data structure issues
        await refreshDemoAssessment()
      }
      
      // Load assessment from Supabase
      const assessmentData = await assessmentManager.getAssessment(assessmentId)
      if (!assessmentData) {
        setError('Assessment not found in database or local storage')
        return
      }

      // CRITICAL DEBUG: Log the loaded assessment data
      console.log('🔍 RESULTS PAGE - Loaded assessment:', {
        id: assessmentData.id,
        departments: assessmentData.departments?.map(d => ({
          id: d.id,
          name: d.name,
          mgmtCode: d.managementCode,
          empCode: d.employeeCode
        })),
        departmentData: assessmentData.departmentData?.map(d => ({
          dept: d.department,
          name: d.departmentName,
          mgmtAvg: d.managementResponses.overallAverage,
          empAvg: d.employeeResponses.overallAverage,
          mgmtCount: d.responseCount.management,
          empCount: d.responseCount.employee
        })),
        responseCount: assessmentData.responseCount
      })
      
      // If department data is empty but we have responses, force recalculation
      const hasEmptyDepartmentData = !assessmentData.departmentData || assessmentData.departmentData.length === 0
      const hasResponses = (assessmentData.responseCount?.management || 0) + (assessmentData.responseCount?.employee || 0) > 0
      
      if (hasEmptyDepartmentData && hasResponses) {
        console.log('⚠️ Empty department data detected, forcing recalculation')
        
        // Simply trigger updateAggregatedData without clearing existing data
        await assessmentManager.updateAggregatedData(assessmentId)
        const updatedAssessment = await assessmentManager.getAssessment(assessmentId)
        if (updatedAssessment) {
          console.log('🔄 RECALCULATED DATA:', updatedAssessment.departmentData?.length || 0, 'departments')
          setAssessment(updatedAssessment)
          const newAnalysis = generateComparativeAnalysis(updatedAssessment)
          setComparativeAnalysis(newAnalysis)
          return
        }
      }

      setAssessment(assessmentData)

      // Generate comparative analysis
      const analysis = generateComparativeAnalysis(assessmentData)
      setComparativeAnalysis(analysis)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment')
      console.error('Assessment loading error:', err)
    } finally {
      setIsLoadingAssessment(false)
    }
  }

  const generateComparativeAnalysis = (assessment: OrganizationalAssessment): ComparativeAnalysis => {
    const gapAnalysis = assessment.managementResponses.categoryAverages.map(mgmtCategory => {
      const empCategory = assessment.employeeResponses.categoryAverages.find(
        cat => cat.category === mgmtCategory.category
      )

      const gap = mgmtCategory.average - (empCategory?.average || 0)
      const absGap = Math.abs(gap)

      return {
        category: mgmtCategory.category,
        managementScore: mgmtCategory.average,
        employeeScore: empCategory?.average || 0,
        gap,
        significance: absGap > 2.5 ? 'high' as const : absGap > 1.5 ? 'medium' as const : 'low' as const
      }
    })

    const overallAlignment = 100 - (gapAnalysis.reduce((acc, item) => acc + Math.abs(item.gap), 0) / gapAnalysis.length) * 10

    const criticalGaps = gapAnalysis
      .filter(item => item.significance === 'high')
      .map(item => item.category)

    const recommendations = generateRecommendations(gapAnalysis)

    return {
      gapAnalysis,
      overallAlignment: Math.max(0, Math.min(100, overallAlignment)),
      criticalGaps,
      recommendations
    }
  }

  const generateRecommendations = (gapAnalysis: any[]): string[] => {
    const recommendations: string[] = []

    gapAnalysis.forEach(item => {
      if (item.significance === 'high') {
        if (item.gap > 0) {
          recommendations.push(`Address overconfidence in ${item.category} - management rates this significantly higher than employees`)
        } else {
          recommendations.push(`Improve communication about ${item.category} - employees see this more positively than management realizes`)
        }
      }
    })

    return recommendations
  }

  // Consultant-focused analytics
  const generateConsultantInsights = (assessment: OrganizationalAssessment) => {
    if (!assessment.departmentData || assessment.departmentData.length === 0) {
      return null
    }

    // Calculate department performance ranking
    const departmentRanking = assessment.departmentData
      .map(dept => {
        const overallScore = (dept.managementResponses.overallAverage + dept.employeeResponses.overallAverage) / 2
        const alignmentGap = Math.abs(dept.managementResponses.overallAverage - dept.employeeResponses.overallAverage)
        const criticalGaps = dept.perceptionGaps.filter(gap => gap.significance === 'high').length
        
        return {
          department: dept.department,
          departmentName: dept.departmentName,
          overallScore,
          alignmentGap,
          criticalGaps,
          status: criticalGaps > 2 || overallScore < 6 ? 'critical' : 
                 criticalGaps > 0 || alignmentGap > 1.5 ? 'needs-attention' : 'performing-well'
        }
      })
      .sort((a, b) => b.overallScore - a.overallScore)

    // Calculate organizational health score
    const organizationalHealth = Math.round(
      departmentRanking.reduce((sum, dept) => sum + dept.overallScore, 0) / departmentRanking.length
    )

    // Identify success story and critical priority
    const successStory = departmentRanking.find(d => d.status === 'performing-well') || departmentRanking[0]
    const criticalPriority = departmentRanking.find(d => d.status === 'critical')
    
    // Count issues
    const criticalDepartments = departmentRanking.filter(d => d.status === 'critical').length
    const needsAttentionDepartments = departmentRanking.filter(d => d.status === 'needs-attention').length

    return {
      departmentRanking,
      organizationalHealth,
      successStory,
      criticalPriority,
      criticalDepartments,
      needsAttentionDepartments,
      totalDepartments: departmentRanking.length
    }
  }

  const handleGenerateInsights = async () => {
    if (!assessment || !comparativeAnalysis) return

    setIsLoadingInsights(true)
    try {
      const insights = await generateOrganizationalSummary(assessment, comparativeAnalysis)
      setAiInsights(insights)
    } catch (err) {
      console.error('Failed to generate insights:', err)
      setError('Failed to generate AI insights. Please try again.')
    } finally {
      setIsLoadingInsights(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-error mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Error</h2>
          <p className="text-neutral-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (isLoadingAssessment || !assessment || !comparativeAnalysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">
            {isLoadingAssessment ? 'Loading assessment from database...' : 'Loading assessment results...'}
          </p>
        </div>
      </div>
    )
  }

  const hasData = assessment.responseCount.management > 0 || assessment.responseCount.employee > 0
  const hasDepartmentData = assessment.departmentData && assessment.departmentData.length > 0
  const hasLegacyData = assessment.managementResponses.categoryAverages.length > 0 || assessment.employeeResponses.categoryAverages.length > 0
  
  // Generate consultant insights
  const consultantInsights = generateConsultantInsights(assessment)

  return (
    <div className="min-h-screen bg-custom-gray py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="mb-8">
          <Logo />
        </div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                {assessment.organizationName} - Organizational Analysis
              </h1>
              <p className="text-neutral-600 mt-2">
                Comparative insights between management and employee perspectives
              </p>
            </div>
            <div className="flex gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                assessment.status === 'collecting' ? 'bg-secondary-100 text-secondary-800' :
                assessment.status === 'ready' ? 'bg-primary-100 text-primary-800' :
                'bg-neutral-100 text-neutral-800'
              }`}>
                {assessment.status}
              </span>
              <a
                href="/consultant/dashboard"
                className="bg-neutral-200 text-neutral-800 px-4 py-2 rounded-lg hover:bg-neutral-300 transition-colors text-sm font-medium"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>

        {!hasData ? (
          <div className="text-center py-12">
            <div className="text-neutral-400 text-lg mb-4">
              No responses collected yet
            </div>
            <p className="text-neutral-600 mb-6">
              Share the survey links to start collecting responses from management and employees
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Executive Summary - CONSULTANT FIRST */}
            {consultantInsights && (
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-8 border-l-4 border-primary-600">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900">Executive Summary</h2>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary-600">{consultantInsights.organizationalHealth}/10</div>
                    <div className="text-sm text-neutral-600">Organizational Health</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success mb-1">
                      {consultantInsights.totalDepartments - consultantInsights.criticalDepartments - consultantInsights.needsAttentionDepartments}
                    </div>
                    <div className="text-sm text-neutral-600">Performing Well</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning mb-1">{consultantInsights.needsAttentionDepartments}</div>
                    <div className="text-sm text-neutral-600">Need Attention</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-error mb-1">{consultantInsights.criticalDepartments}</div>
                    <div className="text-sm text-neutral-600">Critical Issues</div>
                  </div>
                </div>
                
                {/* Key Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {consultantInsights.successStory && (
                    <div className="bg-success bg-opacity-10 rounded-lg p-4 border border-success border-opacity-20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <h3 className="font-semibold text-success">Success Story</h3>
                      </div>
                      <p className="text-neutral-700">
                        <strong>{consultantInsights.successStory.departmentName}</strong> department is your benchmark 
                        ({consultantInsights.successStory.overallScore.toFixed(1)}/10, {consultantInsights.successStory.alignmentGap.toFixed(1)} alignment gap)
                      </p>
                    </div>
                  )}
                  
                  {consultantInsights.criticalPriority && (
                    <div className="bg-error bg-opacity-10 rounded-lg p-4 border border-error border-opacity-20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-error rounded-full"></div>
                        <h3 className="font-semibold text-error">Critical Priority</h3>
                      </div>
                      <p className="text-neutral-700">
                        <strong>{consultantInsights.criticalPriority.departmentName}</strong> requires immediate intervention 
                        ({consultantInsights.criticalPriority.overallScore.toFixed(1)}/10, {consultantInsights.criticalPriority.criticalGaps} critical gaps)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Department Leaderboard */}
            {consultantInsights && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Department Performance Leaderboard</h2>
                <div className="space-y-4">
                  {consultantInsights.departmentRanking.map((dept, index) => {
                    const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
                    const statusColor = dept.status === 'critical' ? 'border-error bg-error bg-opacity-5' :
                                       dept.status === 'needs-attention' ? 'border-warning bg-warning bg-opacity-5' :
                                       'border-success bg-success bg-opacity-5'
                    
                    return (
                      <div key={dept.department} className={`border-l-4 ${statusColor} rounded-lg p-4`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-xl font-bold text-neutral-600 w-12">{rankIcon}</div>
                            <div>
                              <h3 className="text-lg font-semibold text-neutral-900">{dept.departmentName}</h3>
                              <div className="flex items-center gap-4 text-sm text-neutral-600 mt-1">
                                <span>Score: {dept.overallScore.toFixed(1)}/10</span>
                                <span>Gap: {dept.alignmentGap.toFixed(1)}</span>
                                {dept.criticalGaps > 0 && (
                                  <span className="text-error font-medium">{dept.criticalGaps} critical issues</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            dept.status === 'critical' ? 'bg-error text-white' :
                            dept.status === 'needs-attention' ? 'bg-warning text-white' :
                            'bg-success text-white'
                          }`}>
                            {dept.status === 'critical' ? 'Critical' : 
                             dept.status === 'needs-attention' ? 'Attention' : 'Performing Well'}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Strategic Action Items */}
            {consultantInsights && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Strategic Action Items</h2>
                <div className="space-y-4">
                  
                  {/* Priority 1: Critical Department */}
                  {consultantInsights.criticalPriority && (
                    <div className="border border-error border-opacity-20 bg-error bg-opacity-5 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-error text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">1</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-neutral-900 text-lg mb-2">
                            Immediate Focus: {consultantInsights.criticalPriority.departmentName} Department
                          </h3>
                          <p className="text-neutral-700 mb-3">
                            Critical performance issues ({consultantInsights.criticalPriority.overallScore.toFixed(1)}/10) with {consultantInsights.criticalPriority.criticalGaps} critical perception gaps. 
                            This department requires urgent intervention to prevent organizational impact.
                          </p>
                          <div className="text-sm text-neutral-600">
                            <strong>Recommended Actions:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Schedule immediate leadership alignment session</li>
                              <li>Conduct employee focus groups to understand root causes</li>
                              <li>Implement weekly check-ins until performance improves</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Priority 2: Leverage Success Story */}
                  {consultantInsights.successStory && (
                    <div className="border border-success border-opacity-20 bg-success bg-opacity-5 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-success text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">2</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-neutral-900 text-lg mb-2">
                            Leverage Success: {consultantInsights.successStory.departmentName} Department
                          </h3>
                          <p className="text-neutral-700 mb-3">
                            Highest performing department ({consultantInsights.successStory.overallScore.toFixed(1)}/10) with excellent alignment. 
                            Use as internal benchmark and knowledge sharing source.
                          </p>
                          <div className="text-sm text-neutral-600">
                            <strong>Recommended Actions:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Document best practices and success factors</li>
                              <li>Facilitate cross-department knowledge sharing sessions</li>
                              <li>Recognize and celebrate this team&apos;s achievements publicly</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Priority 3: Overall Strategy */}
                  <div className="border border-info border-opacity-20 bg-info bg-opacity-5 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-info text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">3</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-neutral-900 text-lg mb-2">
                          Organizational Alignment Strategy
                        </h3>
                        <p className="text-neutral-700 mb-3">
                          Current organizational health: {consultantInsights.organizationalHealth}/10. 
                          Focus on improving perception alignment across all departments.
                        </p>
                        <div className="text-sm text-neutral-600">
                          <strong>Recommended Actions:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Implement monthly organizational health monitoring</li>
                            <li>Create department-specific improvement roadmaps</li>
                            <li>Schedule follow-up assessment in 3-6 months</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Supporting Details - Detailed Analysis (moved to bottom) */}
            {hasDepartmentData && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Department Performance Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assessment.departmentData
                    .filter(dept => dept.responseCount.management > 0 || dept.responseCount.employee > 0)
                    .map((dept, index) => {
                      const overallDeptScore = (dept.managementResponses.overallAverage + dept.employeeResponses.overallAverage) / 2
                      const alignmentGap = Math.abs(dept.managementResponses.overallAverage - dept.employeeResponses.overallAverage)
                      const criticalGaps = dept.perceptionGaps.filter(gap => gap.significance === 'high').length
                      
                      return (
                        <div key={dept.department} className="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-neutral-900">{dept.departmentName}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-primary-600">{overallDeptScore.toFixed(1)}</span>
                              <span className="text-sm text-neutral-500">/10</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-neutral-600">Management Avg</span>
                              <span className="font-medium text-neutral-900">{dept.managementResponses.overallAverage.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-neutral-600">Employee Avg</span>
                              <span className="font-medium text-neutral-900">{dept.employeeResponses.overallAverage.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-neutral-600">Alignment Gap</span>
                              <span className={`font-medium ${
                                alignmentGap > 2 ? 'text-error' : alignmentGap > 1 ? 'text-warning' : 'text-success'
                              }`}>
                                {alignmentGap.toFixed(1)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-neutral-600">Critical Issues</span>
                              <span className={`font-medium ${
                                criticalGaps > 2 ? 'text-error' : criticalGaps > 0 ? 'text-warning' : 'text-success'
                              }`}>
                                {criticalGaps}
                              </span>
                            </div>
                            
                            <div className="pt-2">
                              <div className="text-xs text-neutral-500 mb-1">Response Count</div>
                              <div className="text-sm">
                                <span className="text-primary-600">{dept.responseCount.management}M</span>
                                <span className="text-neutral-400 mx-1">/</span>
                                <span className="text-secondary-600">{dept.responseCount.employee}E</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Comparative Spider Chart */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                {hasDepartmentData ? 'Organization-Wide Analysis' : 'Management vs Employee Perspectives'}
              </h2>
              {hasLegacyData && (
                <ComparativeSpiderChart
                  managementData={assessment.managementResponses.categoryAverages}
                  employeeData={assessment.employeeResponses.categoryAverages}
                />
              )}
              {!hasLegacyData && hasDepartmentData && (() => {
                // Aggregate department data into organization-wide categories
                const categoryMap = new Map<string, { mgmtSum: number, mgmtCount: number, empSum: number, empCount: number }>()
                
                assessment.departmentData.forEach(dept => {
                  dept.managementResponses.categoryAverages.forEach(cat => {
                    if (!categoryMap.has(cat.category)) {
                      categoryMap.set(cat.category, { mgmtSum: 0, mgmtCount: 0, empSum: 0, empCount: 0 })
                    }
                    const entry = categoryMap.get(cat.category)!
                    entry.mgmtSum += cat.average * cat.responses
                    entry.mgmtCount += cat.responses
                  })
                  
                  dept.employeeResponses.categoryAverages.forEach(cat => {
                    if (!categoryMap.has(cat.category)) {
                      categoryMap.set(cat.category, { mgmtSum: 0, mgmtCount: 0, empSum: 0, empCount: 0 })
                    }
                    const entry = categoryMap.get(cat.category)!
                    entry.empSum += cat.average * cat.responses
                    entry.empCount += cat.responses
                  })
                })
                
                const aggregatedMgmtData = Array.from(categoryMap.entries()).map(([category, data]) => ({
                  category,
                  average: data.mgmtCount > 0 ? data.mgmtSum / data.mgmtCount : 0,
                  responses: data.mgmtCount
                }))
                
                const aggregatedEmpData = Array.from(categoryMap.entries()).map(([category, data]) => ({
                  category,
                  average: data.empCount > 0 ? data.empSum / data.empCount : 0,
                  responses: data.empCount
                }))
                
                return (
                  <div>
                    <div className="mb-4 text-sm text-neutral-600">
                      Aggregated from {assessment.departmentData.length} departments
                    </div>
                    <ComparativeSpiderChart
                      managementData={aggregatedMgmtData}
                      employeeData={aggregatedEmpData}
                    />
                  </div>
                )
              })()}
            </div>

            {/* Department-Specific Gap Analysis */}
            {hasDepartmentData && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Department-Specific Perception Gaps</h2>
                <div className="space-y-6">
                  {assessment.departmentData
                    .filter(dept => dept.responseCount.management > 0 && dept.responseCount.employee > 0)
                    .map((dept, deptIndex) => {
                      const criticalGaps = dept.perceptionGaps.filter(gap => gap.significance === 'high')
                      const hasSignificantGaps = criticalGaps.length > 0
                      
                      return (
                        <div key={dept.department} className="border border-neutral-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-neutral-900">{dept.departmentName}</h3>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                criticalGaps.length > 2 ? 'bg-error bg-opacity-10 text-error' :
                                criticalGaps.length > 0 ? 'bg-warning bg-opacity-10 text-warning' :
                                'bg-success bg-opacity-10 text-success'
                              }`}>
                                {criticalGaps.length} critical gaps
                              </span>
                            </div>
                          </div>
                          
                          {hasSignificantGaps ? (
                            <div className="space-y-3">
                              {criticalGaps.slice(0, 3).map((gap, gapIndex) => (
                                <div key={gapIndex} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-neutral-900">{gap.category}</h4>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-neutral-600">
                                      <span>Mgmt: {gap.managementScore.toFixed(1)}</span>
                                      <span>Emp: {gap.employeeScore.toFixed(1)}</span>
                                      <span className="text-neutral-800 font-medium">Gap: {Math.abs(gap.gap).toFixed(1)}</span>
                                    </div>
                                  </div>
                                  <div className={`text-sm font-medium ${
                                    gap.gapDirection === 'positive' ? 'text-info' : 'text-warning'
                                  }`}>
                                    {gap.gapDirection === 'positive' ? 'Mgmt ↑' : 'Emp ↑'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-success">
                              <p className="font-medium">✓ Well Aligned Department</p>
                              <p className="text-sm text-neutral-600 mt-1">No critical perception gaps detected</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Legacy Gap Analysis */}
            {hasLegacyData && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Overall Gap Analysis</h2>
                <div className="space-y-4">
                  {comparativeAnalysis.gapAnalysis.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-custom-gray rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900">{item.category}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600">
                          <span>Management: {item.managementScore.toFixed(1)}</span>
                          <span>Employee: {item.employeeScore.toFixed(1)}</span>
                          <span>Gap: {Math.abs(item.gap).toFixed(1)}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.significance === 'high' ? 'bg-error bg-opacity-10 text-error' :
                        item.significance === 'medium' ? 'bg-warning bg-opacity-10 text-warning' :
                        'bg-success bg-opacity-10 text-success'
                      }`}>
                        {item.significance} impact
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consultant Action Items */}
            {hasDepartmentData && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Consultant Action Items</h2>
                <div className="space-y-4">
                  {/* High Priority Departments */}
                  {(() => {
                    const highPriorityDepts = assessment.departmentData
                      .filter(dept => {
                        const criticalGaps = dept.perceptionGaps.filter(gap => gap.significance === 'high').length
                        const overallScore = (dept.managementResponses.overallAverage + dept.employeeResponses.overallAverage) / 2
                        return criticalGaps > 1 || overallScore < 6
                      })
                      .sort((a, b) => {
                        const aCritical = a.perceptionGaps.filter(gap => gap.significance === 'high').length
                        const bCritical = b.perceptionGaps.filter(gap => gap.significance === 'high').length
                        return bCritical - aCritical
                      })

                    if (highPriorityDepts.length === 0) {
                      return (
                        <div className="bg-success bg-opacity-10 border border-success border-opacity-20 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-success text-white rounded-full flex items-center justify-center text-sm font-bold">
                              ✓
                            </div>
                            <div>
                              <p className="font-semibold text-success">Organization is Well-Aligned</p>
                              <p className="text-sm text-neutral-600 mt-1">No departments require immediate intervention</p>
                            </div>
                          </div>
                        </div>
                      )
                    }

                    return highPriorityDepts.slice(0, 3).map((dept, index) => {
                      const criticalGaps = dept.perceptionGaps.filter(gap => gap.significance === 'high')
                      const overallScore = (dept.managementResponses.overallAverage + dept.employeeResponses.overallAverage) / 2
                      
                      return (
                        <div key={dept.department} className="bg-warning bg-opacity-5 border border-warning border-opacity-20 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-warning text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-neutral-900">
                                Focus on {dept.departmentName} Department
                              </p>
                              <p className="text-sm text-neutral-600 mt-1">
                                {criticalGaps.length > 0 && `${criticalGaps.length} critical perception gaps detected. `}
                                {overallScore < 6 && `Overall performance (${overallScore.toFixed(1)}/10) below benchmark. `}
                              </p>
                              {criticalGaps.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium text-neutral-800">Priority Areas:</p>
                                  <ul className="text-sm text-neutral-600 ml-4 mt-1">
                                    {criticalGaps.slice(0, 2).map((gap, gapIndex) => (
                                      <li key={gapIndex} className="list-disc">
                                        {gap.category}: {gap.gapDirection === 'positive' ? 'Management overconfidence' : 'Employee concerns not recognized'}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  })()}

                  {/* Strategic Recommendations */}
                  <div className="bg-info bg-opacity-5 border border-info border-opacity-20 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-info text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        ★
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">Next Steps Recommendation</p>
                        <div className="text-sm text-neutral-600 mt-2 space-y-1">
                          <p>• Schedule individual department sessions with leadership teams</p>
                          <p>• Conduct focus groups in departments with high perception gaps</p>
                          <p>• Implement targeted interventions based on specific category gaps</p>
                          <p>• Plan follow-up assessment in 3-6 months to track improvement</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Legacy Recommendations */}
            {!hasDepartmentData && comparativeAnalysis.recommendations.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Key Recommendations</h2>
                <div className="space-y-3">
                  {comparativeAnalysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-neutral-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">AI Strategic Insights</h2>
                {!aiInsights && (
                  <button
                    onClick={handleGenerateInsights}
                    disabled={isLoadingInsights}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      isLoadingInsights 
                        ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {isLoadingInsights ? 'Generating...' : 'Generate Insights'}
                  </button>
                )}
              </div>
              
              {aiInsights ? (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-neutral-700 leading-relaxed">
                    {aiInsights}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <p>Generate AI-powered strategic insights based on the organizational assessment data</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}