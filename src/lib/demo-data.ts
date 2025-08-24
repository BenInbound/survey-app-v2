import { OrganizationalAssessmentManager } from './organizational-assessment-manager'
import { ParticipantResponse, SliderValue, Department } from './types'

export async function createDemoAssessment(forceRecreate = false) {
  const assessmentManager = new OrganizationalAssessmentManager()
  
  // Check if demo already exists
  const existing = await assessmentManager.getAssessment('demo-org')
  if (existing && !forceRecreate) {
    return existing
  }
  
  // If force recreating, delete the existing assessment first
  if (forceRecreate && existing) {
    await assessmentManager.deleteAssessment('demo-org')
  }

  // Define realistic departments for demo
  const demoDepartments: Department[] = [
    {
      id: 'engineering',
      name: 'Engineering',
      managementCode: 'DEMO-MGMT-ENG25',
      employeeCode: 'DEMO-EMP-ENG25'
    },
    {
      id: 'sales',
      name: 'Sales',
      managementCode: 'DEMO-MGMT-SAL25',
      employeeCode: 'DEMO-EMP-SAL25'
    },
    {
      id: 'marketing',
      name: 'Marketing',
      managementCode: 'DEMO-MGMT-MKT25',
      employeeCode: 'DEMO-EMP-MKT25'
    },
    {
      id: 'operations',
      name: 'Operations',
      managementCode: 'DEMO-MGMT-OPS25',
      employeeCode: 'DEMO-EMP-OPS25'
    }
  ]

  // Create demo assessment with departments
  const demoAssessment = await assessmentManager.createAssessment(
    'Demo Organization', 
    'demo@consultant.com', 
    undefined,
    demoDepartments,
    'demo-org'
  )
  
  // Set fixed access code for demo
  demoAssessment.accessCode = 'DEMO-2025-STRATEGY'
  await assessmentManager.saveAssessment(demoAssessment)
  
  // Engineering Department Responses (High Performing, Well Aligned)
  const engineeringResponses: ParticipantResponse[] = [
    // Engineering Management
    {
      surveyId: 'eng-mgmt-1',
      participantId: 'eng-mgmt-participant-1',
      department: 'engineering',
      responses: [
        { questionId: 'vision-clarity', score: 8 as SliderValue },
        { questionId: 'strategy-execution', score: 8 as SliderValue },
        { questionId: 'leadership-alignment', score: 9 as SliderValue },
        { questionId: 'stakeholder-buyin', score: 9 as SliderValue },
        { questionId: 'strategic-communication', score: 8 as SliderValue },
        { questionId: 'resource-allocation', score: 8 as SliderValue },
        { questionId: 'strategic-metrics', score: 7 as SliderValue },
        { questionId: 'strategic-agility', score: 8 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 86400000),
      completedAt: new Date(Date.now() - 86400000 + 600000),
      role: 'management',
      assessmentId: 'demo-org'
    },
    {
      surveyId: 'eng-mgmt-2',
      participantId: 'eng-mgmt-participant-2',
      department: 'engineering',
      responses: [
        { questionId: 'vision-clarity', score: 8 as SliderValue },
        { questionId: 'strategy-execution', score: 7 as SliderValue },
        { questionId: 'leadership-alignment', score: 8 as SliderValue },
        { questionId: 'stakeholder-buyin', score: 9 as SliderValue },
        { questionId: 'strategic-communication', score: 9 as SliderValue },
        { questionId: 'resource-allocation', score: 8 as SliderValue },
        { questionId: 'strategic-metrics', score: 7 as SliderValue },
        { questionId: 'strategic-agility', score: 8 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 82800000),
      completedAt: new Date(Date.now() - 82800000 + 720000),
      role: 'management',
      assessmentId: 'demo-org'
    },
    // Engineering Employees (Similar scores - good alignment)
    {
      surveyId: 'eng-emp-1',
      participantId: 'eng-emp-participant-1',
      department: 'engineering',
      responses: [
        { questionId: 'vision-clarity', score: 7 as SliderValue },
        { questionId: 'strategy-execution', score: 7 as SliderValue },
        { questionId: 'leadership-alignment', score: 8 as SliderValue },
        { questionId: 'stakeholder-buyin', score: 8 as SliderValue },
        { questionId: 'strategic-communication', score: 8 as SliderValue },
        { questionId: 'resource-allocation', score: 7 as SliderValue },
        { questionId: 'strategic-metrics', score: 7 as SliderValue },
        { questionId: 'strategic-agility', score: 8 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 79200000),
      completedAt: new Date(Date.now() - 79200000 + 480000),
      role: 'employee',
      assessmentId: 'demo-org'
    },
    {
      surveyId: 'eng-emp-2',
      participantId: 'eng-emp-participant-2',
      department: 'engineering',
      responses: [
        { questionId: 'vision-clarity', score: 8 as SliderValue },
        { questionId: 'strategy-execution', score: 7 as SliderValue },
        { questionId: 'leadership-alignment', score: 8 as SliderValue },
        { questionId: 'stakeholder-buyin', score: 9 as SliderValue },
        { questionId: 'strategic-communication', score: 7 as SliderValue },
        { questionId: 'resource-allocation', score: 8 as SliderValue },
        { questionId: 'strategic-metrics', score: 6 as SliderValue },
        { questionId: 'strategic-agility', score: 8 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 75600000),
      completedAt: new Date(Date.now() - 75600000 + 540000),
      role: 'employee',
      assessmentId: 'demo-org'
    }
  ]

  // Sales Department Responses (Good Performing, Minor Gaps)
  const salesResponses: ParticipantResponse[] = [
    // Sales Management
    {
      surveyId: 'sales-mgmt-1',
      participantId: 'sales-mgmt-participant-1',
      department: 'sales',
      responses: [
        { questionId: 'vision-clarity', score: 8 as SliderValue },
        { questionId: 'strategy-execution', score: 9 as SliderValue },
        { questionId: 'leadership-alignment', score: 8 as SliderValue },
        { questionId: 'stakeholder-buyin', score: 6 as SliderValue },
        { questionId: 'strategic-communication', score: 7 as SliderValue },
        { questionId: 'resource-allocation', score: 8 as SliderValue },
        { questionId: 'strategic-metrics', score: 9 as SliderValue },
        { questionId: 'strategic-agility', score: 9 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 72000000),
      completedAt: new Date(Date.now() - 72000000 + 660000),
      role: 'management',
      assessmentId: 'demo-org'
    },
    // Sales Employees (Moderate gaps in strategy clarity)
    {
      surveyId: 'sales-emp-1',
      participantId: 'sales-emp-participant-1',
      department: 'sales',
      responses: [
        { questionId: 'vision-clarity', score: 6 as SliderValue },
        { questionId: 'strategy-execution', score: 8 as SliderValue },
        { questionId: 'leadership-alignment', score: 7 as SliderValue },
        { questionId: 'stakeholder-buyin', score: 5 as SliderValue },
        { questionId: 'strategic-communication', score: 6 as SliderValue },
        { questionId: 'resource-allocation', score: 7 as SliderValue },
        { questionId: 'strategic-metrics', score: 8 as SliderValue },
        { questionId: 'strategic-agility', score: 8 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 68400000),
      completedAt: new Date(Date.now() - 68400000 + 420000),
      role: 'employee',
      assessmentId: 'demo-org'
    },
    {
      surveyId: 'sales-emp-2',
      participantId: 'sales-emp-participant-2',
      department: 'sales',
      responses: [
        { questionId: 'vision-clarity', score: 5 as SliderValue },
        { questionId: 'strategy-execution', score: 7 as SliderValue },
        { questionId: 'leadership-alignment', score: 7 as SliderValue },
        { questionId: 'stakeholder-buyin', score: 6 as SliderValue },
        { questionId: 'strategic-communication', score: 7 as SliderValue },
        { questionId: 'resource-allocation', score: 6 as SliderValue },
        { questionId: 'strategic-metrics', score: 8 as SliderValue },
        { questionId: 'strategic-agility', score: 9 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 64800000),
      completedAt: new Date(Date.now() - 64800000 + 390000),
      role: 'employee',
      assessmentId: 'demo-org'
    }
  ]

  // Marketing Department Responses (Needs Attention - Significant Gaps)
  const marketingResponses: ParticipantResponse[] = [
    // Marketing Management (Overconfident)
    {
      surveyId: 'mkt-mgmt-1',
      participantId: 'mkt-mgmt-participant-1',
      department: 'marketing',
      responses: [
        { questionId: 'vision-clarity', score: 8 as SliderValue },
        { questionId: 'strategy-execution', score: 8 as SliderValue },
        { questionId: 'leadership-alignment', score: 7 as SliderValue },
        { questionId: 'stakeholder-buyin', score: 8 as SliderValue },
        { questionId: 'strategic-communication', score: 6 as SliderValue },
        { questionId: 'resource-allocation', score: 8 as SliderValue },
        { questionId: 'strategic-metrics', score: 6 as SliderValue },
        { questionId: 'strategic-agility', score: 7 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 61200000),
      completedAt: new Date(Date.now() - 61200000 + 780000),
      role: 'management',
      assessmentId: 'demo-org'
    },
    // Marketing Employees (Lower scores - gaps)
    {
      surveyId: 'mkt-emp-1',
      participantId: 'mkt-emp-participant-1',
      department: 'marketing',
      responses: [
        { questionId: 'vision-clarity', score: 5 as SliderValue },
        { questionId: 'strategy-execution', score: 6 as SliderValue },
        { questionId: 'leadership-alignment', score: 5 as SliderValue },
        { questionId: 'stakeholder-buyin', score: 5 as SliderValue },
        { questionId: 'strategic-communication', score: 4 as SliderValue },
        { questionId: 'resource-allocation', score: 5 as SliderValue },
        { questionId: 'strategic-metrics', score: 5 as SliderValue },
        { questionId: 'strategic-agility', score: 6 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 57600000),
      completedAt: new Date(Date.now() - 57600000 + 510000),
      role: 'employee',
      assessmentId: 'demo-org'
    },
    {
      surveyId: 'mkt-emp-2',
      participantId: 'mkt-emp-participant-2',
      department: 'marketing',
      responses: [
        { questionId: 'vision-clarity', score: 4 as SliderValue },
        { questionId: 'strategy-execution', score: 5 as SliderValue },
        { questionId: 'leadership-alignment', score: 6 as SliderValue },
        { questionId: 'stakeholder-buyin', score: 6 as SliderValue },
        { questionId: 'strategic-communication', score: 5 as SliderValue },
        { questionId: 'resource-allocation', score: 4 as SliderValue },
        { questionId: 'strategic-metrics', score: 4 as SliderValue },
        { questionId: 'strategic-agility', score: 5 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 54000000),
      completedAt: new Date(Date.now() - 54000000 + 450000),
      role: 'employee',
      assessmentId: 'demo-org'
    }
  ]

  // Operations Department Responses (Critical Issues - Large Gaps)
  const operationsResponses: ParticipantResponse[] = [
    // Operations Management (Very overconfident)
    {
      surveyId: 'ops-mgmt-1',
      participantId: 'ops-mgmt-participant-1',
      department: 'operations',
      responses: [
        { questionId: 'vision-clarity', score: 7 as SliderValue },
        { questionId: 'strategy-execution', score: 6 as SliderValue },
        { questionId: 'leadership-alignment', score: 6 as SliderValue },
        { questionId: 'stakeholder-buyin', score: 5 as SliderValue },
        { questionId: 'strategic-communication', score: 8 as SliderValue },
        { questionId: 'resource-allocation', score: 7 as SliderValue },
        { questionId: 'strategic-metrics', score: 6 as SliderValue },
        { questionId: 'strategic-agility', score: 6 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 50400000),
      completedAt: new Date(Date.now() - 50400000 + 840000),
      role: 'management',
      assessmentId: 'demo-org'
    },
    // Operations Employees (Very low scores - critical gaps)
    {
      surveyId: 'ops-emp-1',
      participantId: 'ops-emp-participant-1',
      department: 'operations',
      responses: [
        { questionId: 'vision-clarity', score: 3 as SliderValue },
        { questionId: 'strategy-execution', score: 4 as SliderValue },
        { questionId: 'leadership-alignment', score: 3 as SliderValue },
        { questionId: 'stakeholder-buyin', score: 2 as SliderValue },
        { questionId: 'strategic-communication', score: 4 as SliderValue },
        { questionId: 'resource-allocation', score: 3 as SliderValue },
        { questionId: 'strategic-metrics', score: 4 as SliderValue },
        { questionId: 'strategic-agility', score: 4 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 46800000),
      completedAt: new Date(Date.now() - 46800000 + 600000),
      role: 'employee',
      assessmentId: 'demo-org'
    },
    {
      surveyId: 'ops-emp-2',
      participantId: 'ops-emp-participant-2',
      department: 'operations',
      responses: [
        { questionId: 'vision-clarity', score: 2 as SliderValue },
        { questionId: 'strategy-execution', score: 3 as SliderValue },
        { questionId: 'leadership-alignment', score: 4 as SliderValue },
        { questionId: 'stakeholder-buyin', score: 3 as SliderValue },
        { questionId: 'strategic-communication', score: 5 as SliderValue },
        { questionId: 'resource-allocation', score: 2 as SliderValue },
        { questionId: 'strategic-metrics', score: 3 as SliderValue },
        { questionId: 'strategic-agility', score: 3 as SliderValue }
      ],
      currentQuestionIndex: 8,
      startedAt: new Date(Date.now() - 43200000),
      completedAt: new Date(Date.now() - 43200000 + 720000),
      role: 'employee',
      assessmentId: 'demo-org'
    }
  ]

  // Add all responses to the assessment
  const allResponses = [
    ...engineeringResponses,
    ...salesResponses, 
    ...marketingResponses,
    ...operationsResponses
  ]

  // Add each response to trigger aggregation
  allResponses.forEach(response => {
    assessmentManager.addParticipantResponse('demo-org', response)
  })

  return assessmentManager.getAssessment('demo-org')
}

// Function to restore demo after deletion (for admin)
export function restoreDemoAssessment() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('demo-assessment-deleted')
  }
  return createDemoAssessment(true) // Force recreation
}

// Function to force refresh demo data (fix data issues)
export function refreshDemoAssessment() {
  return createDemoAssessment(true) // Force recreation
}