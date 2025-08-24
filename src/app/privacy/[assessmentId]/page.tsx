'use client'

import { useState, useEffect } from 'react'
import { OrganizationalAssessmentManager } from '@/lib/organizational-assessment-manager'
import { ControllerProcessorManager } from '@/lib/controller-processor-manager'
import { LegalBasisTracker } from '@/lib/legal-basis-tracker'
import { PrivacyManager } from '@/lib/privacy-manager'
import { DataCategory, ProcessingPurpose, LegalBasis, DataController, DataSensitivity } from '@/lib/gdpr-types'
import Logo from '@/components/ui/Logo'

interface PrivacyNoticeProps {
  params: { assessmentId: string }
}

export default function PrivacyNotice({ params }: PrivacyNoticeProps) {
  const { assessmentId } = params
  const [assessment, setAssessment] = useState<any>(null)
  const [processingOverview, setProcessingOverview] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const assessmentManager = new OrganizationalAssessmentManager()
      const controllerManager = new ControllerProcessorManager()
      const privacyManager = new PrivacyManager()

      // Get assessment details
      const assessmentData = await assessmentManager.getAssessment(assessmentId)
      if (!assessmentData) {
        setIsLoading(false)
        return
      }

      setAssessment(assessmentData)

      // Get processing overview with GDPR details
      const overview = controllerManager.generateProcessingOverview(assessmentId)
      setProcessingOverview(overview)

      // Initialize joint controller agreement if not exists
      if (!controllerManager.getJointControllerAgreement(assessmentId)) {
        controllerManager.createJointControllerAgreement(assessmentId, assessmentData.organizationName)
      }

      setIsLoading(false)
    }

    loadData()
  }, [assessmentId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Assessment not found</h2>
          <p className="text-gray-600">The requested assessment could not be found.</p>
        </div>
      </div>
    )
  }

  const retentionPeriods = {
    surveyResponses: '730 days (2 years) for organizational insights',
    participantIdentifiers: '365 days (1 year) for audit and validation',
    technicalData: '90 days for system maintenance'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Logo />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Notice</h1>
            <p className="text-lg text-gray-600">
              Strategic Assessment for {assessment.organizationName}
            </p>
          </div>

          {/* Data Controllers Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Who Processes Your Data</h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Joint Data Controllers</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Inbound Consulting</h4>
                  <p className="text-sm text-gray-600 mb-2">Platform provider and strategic consultant</p>
                  <p className="text-sm text-gray-500">
                    <strong>Contact:</strong> privacy@inbound.com<br/>
                    <strong>Address:</strong> Oslo, Norway
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{assessment.organizationName}</h4>
                  <p className="text-sm text-gray-600 mb-2">Your employer and assessment initiator</p>
                  <p className="text-sm text-gray-500">
                    Primary contact for data subject rights
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Collection Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What Data We Collect</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Survey Responses</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Your ratings (1-10 scale) on strategic organizational dimensions
                </p>
                <div className="text-xs text-gray-500">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Personal Data</span>
                  <span className="ml-2">Immediately pseudonymized and aggregated</span>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Role Identifier</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Whether you are management or employee (for comparative analysis)
                </p>
                <div className="text-xs text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Organizational Data</span>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Technical Data</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Session timestamps and completion status (no IP addresses or tracking)
                </p>
                <div className="text-xs text-gray-500">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Technical Data</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Basis Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Legal Basis for Processing</h2>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Legitimate Business Interest</h3>
              <p className="text-sm text-gray-600 mb-4">
                We process your data based on legitimate business interest for organizational strategic improvement. 
                This means we don&apos;t need your explicit consent, but we must balance our business needs against your privacy rights.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Our Interest</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Strategic organizational improvement</li>
                    <li>• Professional consulting services</li>
                    <li>• Competitive advantage for client</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Your Protections</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Immediate anonymization</li>
                    <li>• No individual evaluation</li>
                    <li>• Voluntary participation</li>
                    <li>• Right to object</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Purpose Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Use Your Data</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Organizational Assessment</h3>
                <p className="text-sm text-gray-600">
                  Generate insights comparing management and employee perspectives across strategic dimensions
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Strategic Insights</h3>
                <p className="text-sm text-gray-600">
                  AI-powered analysis of organizational patterns to provide strategic recommendations
                </p>
              </div>
            </div>
          </div>

          {/* Data Sharing Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Sharing & International Transfers</h2>
            <div className="space-y-4">
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">AI Analysis (OpenAI)</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Pseudonymized organizational patterns are processed by OpenAI for strategic insights
                </p>
                <div className="text-xs text-gray-500">
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">US Transfer</span>
                  <span className="ml-2">Protected by Standard Contractual Clauses</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Important Privacy Guarantees</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• No individual responses shared with management</li>
                  <li>• No individual identifiers sent to third parties</li>
                  <li>• Only aggregated, anonymized patterns analyzed</li>
                  <li>• Automatic deletion of personal identifiers</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Retention Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How Long We Keep Your Data</h2>
            <div className="space-y-3">
              {Object.entries(retentionPeriods).map(([category, period]) => (
                <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <span className="text-sm text-gray-600">{period}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              All data is automatically deleted according to these schedules. No manual intervention required.
            </p>
          </div>

          {/* Rights Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Privacy Rights</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Access</p>
                    <p className="text-sm text-gray-600">Get a copy of your personal data</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Rectification</p>
                    <p className="text-sm text-gray-600">Correct inaccurate information</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Erasure</p>
                    <p className="text-sm text-gray-600">Request deletion of your data</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Portability</p>
                    <p className="text-sm text-gray-600">Receive your data in usable format</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Objection</p>
                    <p className="text-sm text-gray-600">Object to legitimate interest processing</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Restriction</p>
                    <p className="text-sm text-gray-600">Limit processing in specific cases</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Exercise Your Rights</h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">For Data Subject Rights:</h3>
                  <p className="text-sm text-gray-600 mb-2">Contact your organization&apos;s HR or management</p>
                  <p className="text-xs text-gray-500">
                    {assessment.organizationName} handles access, rectification, portability, and objection requests
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">For Technical Questions:</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <a href="mailto:privacy@inbound.com" className="text-blue-600 hover:text-blue-700">
                      privacy@inbound.com
                    </a>
                  </p>
                  <p className="text-xs text-gray-500">
                    Inbound Consulting handles technical queries and data deletion requests
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs text-gray-500">
                  <strong>Response Time:</strong> We will respond to all requests within 30 days (1 month) as required by GDPR.
                  No fees apply for exercising your rights unless requests are excessive.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              This privacy notice is effective as of the assessment creation date and complies with EU GDPR requirements.
            </p>
            <p className="text-xs text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}