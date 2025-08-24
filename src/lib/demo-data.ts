import { OrganizationalAssessmentManager } from './organizational-assessment-manager'
import { ParticipantResponse, SliderValue } from './types'

export function createDemoAssessment() {
  const assessmentManager = new OrganizationalAssessmentManager()
  
  // Check if demo already exists
  const existing = assessmentManager.getAssessment('demo-org')
  if (existing) {
    return existing
  }
  
  // Check if demo was intentionally deleted (don't recreate if user deleted it)
  if (typeof window !== 'undefined') {
    const demoDeleted = localStorage.getItem('demo-assessment-deleted')
    if (demoDeleted === 'true') {
      return null
    }
  }

  // Create demo assessment with fixed ID
  const demoAssessment = assessmentManager.createAssessment('Demo Organization', 'demo@consultant.com', undefined, undefined, 'demo-org')
  
  // Set fixed access code for demo by directly updating localStorage
  if (typeof window !== 'undefined') {
    const assessments = assessmentManager.getAllAssessments()
    const demoIndex = assessments.findIndex(a => a.id === 'demo-org')
    if (demoIndex >= 0) {
      assessments[demoIndex].accessCode = 'DEMO-2025-STRATEGY'
      localStorage.setItem('organizational-assessments', JSON.stringify(assessments))
    }
  }
  
  // Add sample management responses
  const managementResponses: ParticipantResponse[] = [
    {
      surveyId: 'mgmt-demo-1',
      participantId: 'mgmt-participant-1',
      department: 'Management',
      responses: [
        { questionId: 'strategy-clarity', score: 8 as SliderValue },
        { questionId: 'market-position', score: 7 as SliderValue },
        { questionId: 'competitive-advantage', score: 9 as SliderValue },
        { questionId: 'innovation-capability', score: 6 as SliderValue },
        { questionId: 'operational-efficiency', score: 8 as SliderValue },
        { questionId: 'talent-capabilities', score: 7 as SliderValue },
        { questionId: 'financial-performance', score: 8 as SliderValue },
        { questionId: 'customer-satisfaction', score: 9 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 86400000), // 1 day ago
      completedAt: new Date(Date.now() - 86400000 + 600000), // 10 minutes later
      role: 'management',
      assessmentId: 'demo-org'
    },
    {
      surveyId: 'mgmt-demo-2',
      participantId: 'mgmt-participant-2', 
      department: 'Management',
      responses: [
        { questionId: 'strategy-clarity', score: 9 as SliderValue },
        { questionId: 'market-position', score: 8 as SliderValue },
        { questionId: 'competitive-advantage', score: 8 as SliderValue },
        { questionId: 'innovation-capability', score: 7 as SliderValue },
        { questionId: 'operational-efficiency', score: 9 as SliderValue },
        { questionId: 'talent-capabilities', score: 8 as SliderValue },
        { questionId: 'financial-performance', score: 7 as SliderValue },
        { questionId: 'customer-satisfaction', score: 8 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 82800000), // 23 hours ago
      completedAt: new Date(Date.now() - 82800000 + 720000), // 12 minutes later
      role: 'management',
      assessmentId: 'demo-org'
    }
  ]

  // Add sample employee responses  
  const employeeResponses: ParticipantResponse[] = [
    {
      surveyId: 'emp-demo-1',
      participantId: 'emp-participant-1',
      department: 'Employee',
      responses: [
        { questionId: 'strategy-clarity', score: 5 as SliderValue },
        { questionId: 'market-position', score: 6 as SliderValue },
        { questionId: 'competitive-advantage', score: 6 as SliderValue },
        { questionId: 'innovation-capability', score: 4 as SliderValue },
        { questionId: 'operational-efficiency', score: 5 as SliderValue },
        { questionId: 'talent-capabilities', score: 4 as SliderValue },
        { questionId: 'financial-performance', score: 6 as SliderValue },
        { questionId: 'customer-satisfaction', score: 7 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 79200000), // 22 hours ago
      completedAt: new Date(Date.now() - 79200000 + 480000), // 8 minutes later
      role: 'employee', 
      assessmentId: 'demo-org'
    },
    {
      surveyId: 'emp-demo-2',
      participantId: 'emp-participant-2',
      department: 'Employee',
      responses: [
        { questionId: 'strategy-clarity', score: 6 as SliderValue },
        { questionId: 'market-position', score: 7 as SliderValue },
        { questionId: 'competitive-advantage', score: 5 as SliderValue },
        { questionId: 'innovation-capability', score: 5 as SliderValue },
        { questionId: 'operational-efficiency', score: 6 as SliderValue },
        { questionId: 'talent-capabilities', score: 5 as SliderValue },
        { questionId: 'financial-performance', score: 7 as SliderValue },
        { questionId: 'customer-satisfaction', score: 8 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 75600000), // 21 hours ago
      completedAt: new Date(Date.now() - 75600000 + 540000), // 9 minutes later
      role: 'employee',
      assessmentId: 'demo-org'
    },
    {
      surveyId: 'emp-demo-3',
      participantId: 'emp-participant-3',
      department: 'Employee', 
      responses: [
        { questionId: 'strategy-clarity', score: 4 as SliderValue },
        { questionId: 'market-position', score: 5 as SliderValue },
        { questionId: 'competitive-advantage', score: 7 as SliderValue },
        { questionId: 'innovation-capability', score: 3 as SliderValue },
        { questionId: 'operational-efficiency', score: 4 as SliderValue },
        { questionId: 'talent-capabilities', score: 3 as SliderValue },
        { questionId: 'financial-performance', score: 5 as SliderValue },
        { questionId: 'customer-satisfaction', score: 6 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 72000000), // 20 hours ago
      completedAt: new Date(Date.now() - 72000000 + 420000), // 7 minutes later
      role: 'employee',
      assessmentId: 'demo-org'
    }
  ]

  // Add all responses to create aggregated data
  managementResponses.forEach(response => {
    assessmentManager.addParticipantResponse('demo-org', response)
  })
  
  employeeResponses.forEach(response => {
    assessmentManager.addParticipantResponse('demo-org', response)
  })

  // Keep status as collecting to allow new responses
  // assessmentManager.updateAssessmentStatus('demo-org', 'ready')

  return assessmentManager.getAssessment('demo-org')
}

// Force demo assessment to have collecting status and correct access code
export function fixDemoAssessmentStatus() {
  const assessmentManager = new OrganizationalAssessmentManager()
  const existing = assessmentManager.getAssessment('demo-org')
  
  if (existing && existing.status !== 'collecting') {
    assessmentManager.updateAssessmentStatus('demo-org', 'collecting')
  }

  // Ensure access code is always DEMO-2025-STRATEGY
  if (typeof window !== 'undefined') {
    const assessments = assessmentManager.getAllAssessments()
    const demoIndex = assessments.findIndex(a => a.id === 'demo-org')
    if (demoIndex >= 0 && assessments[demoIndex].accessCode !== 'DEMO-2025-STRATEGY') {
      assessments[demoIndex].accessCode = 'DEMO-2025-STRATEGY'
      localStorage.setItem('organizational-assessments', JSON.stringify(assessments))
    }
  }
}

// Restore demo assessment (useful for testing)
export function restoreDemoAssessment() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('demo-assessment-deleted')
  }
  return createDemoAssessment()
}

// Demo data initialization is now controlled by consultant dashboard
// No auto-initialization to allow demo assessment to be deleted