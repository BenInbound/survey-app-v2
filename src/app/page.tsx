export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Strategic Assessment Tool
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Evaluate your organization&apos;s strategic capabilities across key dimensions
        </p>
        
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to begin?
          </h2>
          <p className="text-gray-600 mb-6">
            This assessment takes about 5-10 minutes to complete. 
            You&apos;ll rate statements about your organization on a scale of 1-10.
          </p>
          
          <div className="space-y-4">
            <a
              href="/survey/stork-assessment"
              className="inline-block w-full bg-blue-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
            >
              Start Assessment
            </a>
            
            <div className="flex justify-center space-x-4 text-sm">
              <a
                href="/results/stork-assessment"
                className="text-blue-600 hover:text-blue-700"
              >
                View Previous Results
              </a>
              <span className="text-gray-300">•</span>
              <a
                href="/admin"
                className="text-blue-600 hover:text-blue-700"
              >
                Admin Portal
              </a>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              📊 Comprehensive Analysis
            </h3>
            <p className="text-gray-600 text-sm">
              Evaluate vision, strategy, leadership, operations and market positioning
            </p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              📈 Visual Results
            </h3>
            <p className="text-gray-600 text-sm">
              Get detailed insights with category breakdowns and actionable recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}