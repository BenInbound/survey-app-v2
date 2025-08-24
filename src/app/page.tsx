import Logo from '@/components/ui/Logo'

export default function ConsultantPortal() {
  return (
    <div className="min-h-screen bg-custom-gray">
      <div className="container mx-auto px-4 py-16">
        {/* Logo */}
        <div className="mb-8">
          <Logo linkToHome={false} />
        </div>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              Strategic Organizational Assessment Platform
            </h1>
            <p className="text-xl text-neutral-600 mb-8">
              For Management Consultants
            </p>
            <a
              href="/consultant/dashboard"
              className="inline-flex items-center bg-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg"
            >
              Access Consultant Dashboard
            </a>
          </div>

          {/* Main Action Card */}
          <div className="bg-white rounded-2xl shadow-xl p-12 mb-12 border border-neutral-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                Create & Manage Client Assessments
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed">
                Generate secure access codes for organizational assessments, distribute role-based surveys, 
                and analyze comparative insights between management and employee perspectives.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Secure Access Control</h3>
                <p className="text-sm text-neutral-600">
                  Generate unique access codes per assessment to control survey distribution and prevent unauthorized access
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Professional Analytics</h3>
                <p className="text-sm text-neutral-600">
                  Access comprehensive comparative analytics and AI-powered insights for client presentations
                </p>
              </div>
            </div>

          </div>

          {/* Platform Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-100">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Role-Based Insights</h3>
              <p className="text-sm text-neutral-600">
                Compare management vs employee perspectives to identify organizational perception gaps
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-100">
              <div className="w-12 h-12 bg-secondary-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-sm text-neutral-600">
                Generate strategic recommendations and insights optimized for client presentations
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-100">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Privacy Protection</h3>
              <p className="text-sm text-neutral-600">
                Anonymous employee feedback aggregation maintains confidentiality and trust
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-4">
              Professional consulting platform for organizational strategic diagnosis
            </p>
            <a
              href="/admin"
              className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Development Tools
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}