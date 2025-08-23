/**
 * @jest-environment jsdom
 */

/**
 * Privacy Notice Page Tests
 * Comprehensive test coverage for GDPR privacy notice functionality
 */

import { render, screen } from '@testing-library/react'
import { jest } from '@jest/globals'
import PrivacyNotice from '../page'

// Mock the GDPR infrastructure
jest.mock('../../../../lib/organizational-assessment-manager', () => ({
  OrganizationalAssessmentManager: jest.fn().mockImplementation(() => ({
    getAssessment: jest.fn().mockReturnValue({
      id: 'test-assessment',
      organizationName: 'Test Organization',
      status: 'collecting',
      created: new Date(),
      consultantId: 'test-consultant',
      accessCode: 'TEST-2025-CODE',
      responseCount: { management: 5, employee: 15 }
    })
  }))
}))

jest.mock('../../../../lib/controller-processor-manager', () => ({
  ControllerProcessorManager: jest.fn().mockImplementation(() => ({
    generateProcessingOverview: jest.fn().mockReturnValue({
      assessment: 'test-assessment',
      controllers: [
        {
          id: 'inbound_consulting',
          name: 'Inbound Consulting',
          legalName: 'Inbound Consulting AS',
          contactEmail: 'privacy@inbound.com',
          address: 'Oslo, Norway'
        }
      ],
      processors: [
        {
          id: 'openai_subprocessor',
          name: 'OpenAI',
          legalName: 'OpenAI, Inc.',
          jurisdiction: 'United States'
        }
      ],
      agreements: [],
      jointControllerAgreement: null,
      complianceStatus: 'Compliant'
    }),
    getJointControllerAgreement: jest.fn().mockReturnValue(null),
    createJointControllerAgreement: jest.fn().mockReturnValue({
      id: 'jca-test-assessment',
      controllers: ['inbound_consulting', 'client_organization'],
      assessmentId: 'test-assessment'
    })
  }))
}))

jest.mock('../../../../lib/legal-basis-tracker', () => ({
  LegalBasisTracker: jest.fn().mockImplementation(() => ({}))
}))

jest.mock('../../../../lib/privacy-manager', () => ({
  PrivacyManager: jest.fn().mockImplementation(() => ({}))
}))

// Mock Logo component
jest.mock('../../../../components/ui/Logo', () => {
  return function MockLogo() {
    return <div data-testid="logo">Inbound Logo</div>
  }
})

describe('PrivacyNotice', () => {
  const mockParams = { assessmentId: 'test-assessment' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders privacy notice page with correct heading', async () => {
    render(<PrivacyNotice params={mockParams} />)
    
    expect(screen.getByRole('heading', { name: 'Privacy Notice' })).toBeInTheDocument()
    expect(screen.getByText('Strategic Assessment for Test Organization')).toBeInTheDocument()
  })

  it('displays data controllers information', async () => {
    render(<PrivacyNotice params={mockParams} />)
    
    expect(screen.getByRole('heading', { name: 'Who Processes Your Data' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Joint Data Controllers' })).toBeInTheDocument()
    expect(screen.getByText('Inbound Consulting')).toBeInTheDocument()
    expect(screen.getByText('Platform provider and strategic consultant')).toBeInTheDocument()
    expect(screen.getByText('privacy@inbound.com')).toBeInTheDocument()
    expect(screen.getByText('Test Organization')).toBeInTheDocument()
    expect(screen.getByText('Your employer and assessment initiator')).toBeInTheDocument()
  })

  it('explains data collection categories', async () => {
    render(<PrivacyNotice params={mockParams} />)
    
    expect(screen.getByRole('heading', { name: 'What Data We Collect' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Survey Responses' })).toBeInTheDocument()
    expect(screen.getByText(/Your ratings \(1-10 scale\)/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Role Identifier' })).toBeInTheDocument()
    expect(screen.getByText(/Whether you are management or employee/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Technical Data' })).toBeInTheDocument()
    expect(screen.getByText(/Session timestamps and completion status/)).toBeInTheDocument()
  })

  it('displays legal basis information', async () => {
    render(<PrivacyNotice params={mockParams} />)
    
    expect(screen.getByRole('heading', { name: 'Legal Basis for Processing' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Legitimate Business Interest' })).toBeInTheDocument()
    expect(screen.getByText(/We process your data based on legitimate business interest/)).toBeInTheDocument()
    expect(screen.getByText(/This means we don't need your explicit consent/)).toBeInTheDocument()
  })

  it('explains data usage purposes', async () => {
    render(<PrivacyNotice params={mockParams} />)
    
    expect(screen.getByRole('heading', { name: 'How We Use Your Data' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Organizational Assessment' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Strategic Insights' })).toBeInTheDocument()
    expect(screen.getByText(/AI-powered analysis of organizational patterns/)).toBeInTheDocument()
  })

  it('describes data sharing and international transfers', async () => {
    render(<PrivacyNotice params={mockParams} />)
    
    expect(screen.getByRole('heading', { name: 'Data Sharing & International Transfers' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'AI Analysis (OpenAI)' })).toBeInTheDocument()
    expect(screen.getByText(/Protected by Standard Contractual Clauses/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Important Privacy Guarantees' })).toBeInTheDocument()
    expect(screen.getByText(/No individual responses shared with management/)).toBeInTheDocument()
  })

  it('specifies data retention periods', async () => {
    render(<PrivacyNotice params={mockParams} />)
    
    expect(screen.getByRole('heading', { name: 'How Long We Keep Your Data' })).toBeInTheDocument()
    expect(screen.getByText(/730 days \(2 years\) for organizational insights/)).toBeInTheDocument()
    expect(screen.getByText(/365 days \(1 year\) for audit and validation/)).toBeInTheDocument()
    expect(screen.getByText(/90 days for system maintenance/)).toBeInTheDocument()
    expect(screen.getByText(/All data is automatically deleted/)).toBeInTheDocument()
  })

  it('lists all GDPR data subject rights', async () => {
    render(<PrivacyNotice params={mockParams} />)
    
    expect(screen.getByRole('heading', { name: 'Your Privacy Rights' })).toBeInTheDocument()
    
    // Check all six main GDPR rights
    expect(screen.getByText('Access')).toBeInTheDocument()
    expect(screen.getByText('Get a copy of your personal data')).toBeInTheDocument()
    
    expect(screen.getByText('Rectification')).toBeInTheDocument()
    expect(screen.getByText('Correct inaccurate information')).toBeInTheDocument()
    
    expect(screen.getByText('Erasure')).toBeInTheDocument()
    expect(screen.getByText('Request deletion of your data')).toBeInTheDocument()
    
    expect(screen.getByText('Portability')).toBeInTheDocument()
    expect(screen.getByText('Receive your data in usable format')).toBeInTheDocument()
    
    expect(screen.getByText('Objection')).toBeInTheDocument()
    expect(screen.getByText('Object to legitimate interest processing')).toBeInTheDocument()
    
    expect(screen.getByText('Restriction')).toBeInTheDocument()
    expect(screen.getByText('Limit processing in specific cases')).toBeInTheDocument()
  })

  it('provides contact information for rights requests', async () => {
    render(<PrivacyNotice params={mockParams} />)
    
    expect(screen.getByRole('heading', { name: 'Exercise Your Rights' })).toBeInTheDocument()
    expect(screen.getByText('For Data Subject Rights:')).toBeInTheDocument()
    expect(screen.getByText(/Contact your organization's HR or management/)).toBeInTheDocument()
    expect(screen.getByText('For Technical Questions:')).toBeInTheDocument()
    
    const privacyEmail = screen.getByRole('link', { name: 'privacy@inbound.com' })
    expect(privacyEmail).toBeInTheDocument()
    expect(privacyEmail).toHaveAttribute('href', 'mailto:privacy@inbound.com')
    
    expect(screen.getByText(/We will respond to all requests within 30 days/)).toBeInTheDocument()
  })

  it('displays compliance and update information', async () => {
    render(<PrivacyNotice params={mockParams} />)
    
    expect(screen.getByText(/This privacy notice is effective as of the assessment creation date/)).toBeInTheDocument()
    expect(screen.getByText(/complies with EU GDPR requirements/)).toBeInTheDocument()
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
  })

  it('includes Inbound logo', async () => {
    render(<PrivacyNotice params={mockParams} />)
    
    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })

  it('handles missing assessment gracefully', async () => {
    // Mock a scenario where assessment is not found
    const { OrganizationalAssessmentManager } = require('../../../../lib/organizational-assessment-manager')
    const mockManager = OrganizationalAssessmentManager.mock.results[0].value
    mockManager.getAssessment.mockReturnValueOnce(null)

    render(<PrivacyNotice params={{ assessmentId: 'nonexistent' }} />)
    
    expect(screen.getByText('Assessment not found')).toBeInTheDocument()
    expect(screen.getByText('The requested assessment could not be found.')).toBeInTheDocument()
  })

  it('integrates with GDPR infrastructure managers', async () => {
    render(<PrivacyNotice params={mockParams} />)
    
    const { OrganizationalAssessmentManager } = require('../../../../lib/organizational-assessment-manager')
    const { ControllerProcessorManager } = require('../../../../lib/controller-processor-manager')
    
    // Verify managers were instantiated
    expect(OrganizationalAssessmentManager).toHaveBeenCalled()
    expect(ControllerProcessorManager).toHaveBeenCalled()
    
    // Verify manager methods were called
    const assessmentManager = OrganizationalAssessmentManager.mock.results[0].value
    const controllerManager = ControllerProcessorManager.mock.results[0].value
    
    expect(assessmentManager.getAssessment).toHaveBeenCalledWith('test-assessment')
    expect(controllerManager.generateProcessingOverview).toHaveBeenCalledWith('test-assessment')
    expect(controllerManager.getJointControllerAgreement).toHaveBeenCalledWith('test-assessment')
  })

  it('creates joint controller agreement if none exists', async () => {
    render(<PrivacyNotice params={mockParams} />)
    
    const { ControllerProcessorManager } = require('../../../../lib/controller-processor-manager')
    const controllerManager = ControllerProcessorManager.mock.results[0].value
    
    expect(controllerManager.createJointControllerAgreement).toHaveBeenCalledWith(
      'test-assessment', 
      'Test Organization'
    )
  })

  it('uses proper semantic HTML structure', async () => {
    render(<PrivacyNotice params={mockParams} />)
    
    // Check for proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1, name: 'Privacy Notice' })
    expect(mainHeading).toBeInTheDocument()
    
    const sectionHeadings = screen.getAllByRole('heading', { level: 2 })
    expect(sectionHeadings.length).toBeGreaterThan(5) // Multiple major sections
    
    const subsectionHeadings = screen.getAllByRole('heading', { level: 3 })
    expect(subsectionHeadings.length).toBeGreaterThan(3) // Multiple subsections
  })

  it('has proper accessibility attributes', async () => {
    const { container } = render(<PrivacyNotice params={mockParams} />)
    
    // Check for proper link accessibility
    const privacyEmailLink = screen.getByRole('link', { name: 'privacy@inbound.com' })
    expect(privacyEmailLink).toHaveAttribute('href', 'mailto:privacy@inbound.com')
    
    // Check for proper contrast and readable text
    const bodyText = container.querySelector('.text-sm')
    expect(bodyText).toBeInTheDocument()
  })
})