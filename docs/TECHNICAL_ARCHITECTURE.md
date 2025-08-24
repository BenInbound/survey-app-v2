# Technical Architecture

## Architecture Strategy

The project uses a **local-first development approach** that easily migrates to production:

### Current MVP Architecture
- Next.js 14 with App Router and TypeScript
- Local JSON file for questions (`/src/data/questions.json`)
- localStorage for response persistence
- Tailwind CSS for mobile-first responsive design
- Jest + Testing Library for comprehensive testing

### Production Migration Path
- Supabase (database + auth + storage)
- Chart.js for spider chart visualizations (✅ Complete)
- OpenAI API integration for strategic insights (✅ Complete)
- Vercel deployment
- Role-based access control system
- Multi-participant assessment management

## Key Implementation Details

### Components Architecture
- `src/components/ui/SliderInput.tsx` - 1-10 rating slider with emoji feedback and animations
- `src/components/ui/ProgressBar.tsx` - Animated progress tracking with step indicators
- `src/components/ui/SpiderChart.tsx` - Interactive radar chart using Chart.js for individual assessment
- `src/components/ui/ComparativeSpiderChart.tsx` - Dual-overlay spider chart for management vs employee comparison
- `src/components/ui/SummaryCard.tsx` - AI-powered strategic insights with loading states and error handling
- `src/components/ui/Logo.tsx` - Reusable Inbound logo component with customizable sizing and linking
- `src/components/ui/ConsultantLogin.tsx` - Professional consultant login form with brand-consistent styling
- `src/components/ui/ConsultantAuthGuard.tsx` - Authentication wrapper protecting consultant-only pages
- `src/components/ui/QuestionEditor.tsx` - **TRANSFORMED**: Per-assessment question management with context indicators, useMemo optimization, and assessment-specific CRUD operations
- `src/app/privacy/[assessmentId]/page.tsx` - GDPR privacy notice with assessment-specific data
- `src/app/consultant/dashboard/page.tsx` - **ENHANCED**: Individual "📝 Manage Questions" buttons per assessment with state management for per-assessment editing + **NEW**: Assessment deletion functionality with confirmation dialogs
- `src/app/admin/page.tsx` - **UPDATED**: Admin portal with demo restoration functionality for testing and development
- `src/lib/survey-logic.ts` - **UPDATED**: Core survey management with assessment-specific QuestionManager integration
- `src/lib/question-manager.ts` - **COMPLETELY REFACTORED**: Assessment-specific context with robust error handling, graceful fallbacks, and seamless integration with OrganizationalAssessmentManager
- `src/lib/question-templates.ts` - **NEW**: Strategic focus template system with QuestionTemplateManager class, 6 professional templates (54 questions), and custom template persistence
- `src/lib/organizational-assessment-manager.ts` - **ENHANCED**: Flexible question source options, assessment-specific question storage, integrated template system support + **NEW**: Complete deleteAssessment() method with data integrity protection
- `src/lib/demo-data.ts` - **ENHANCED**: Smart demo assessment creation with deletion tracking and restoration capabilities
- `src/lib/ai-summary.ts` - OpenAI API integration for both individual and organizational insights
- `src/lib/consultant-auth.ts` - Consultant authentication system with localStorage session management
- `src/lib/types.ts` - **EXPANDED**: TypeScript interfaces including QuestionTemplate, StrategicFocus, AssessmentQuestionSetup, and QuestionLibraryState types
- `src/lib/__tests__/organizational-assessment-manager-delete.test.ts` - **NEW**: Comprehensive deletion functionality test suite with 4 tests covering edge cases and error handling

### GDPR Compliance Architecture
- `src/lib/gdpr-types.ts` - GDPR Article 4 definitions, legal basis framework, and privacy type system
- `src/lib/privacy-manager.ts` - Privacy-by-design configuration with data minimization and retention automation
- `src/lib/controller-processor-manager.ts` - Data Processing Agreements and joint controller relationship management
- `src/lib/legal-basis-tracker.ts` - Real-time legal basis validation and compliance event tracking
- `src/lib/privacy-enhanced-models.ts` - GDPR integration service for seamless privacy metadata enhancement
- `src/app/admin/reset-demo/page.tsx` - Demo data management with GDPR-compliant access codes

### Data Flow
- Questions stored in `src/data/questions.json` (8 strategic assessment questions)
- Survey sessions managed by `SurveyManager` class in survey-logic.ts
- Individual responses persist in localStorage with key pattern `survey-session-{surveyId}`
- Organizational assessments stored with keys: `organizational-assessments` and `organizational-responses`
- Demo data uses fixed ID `demo-org` for consistent routing and testing
- Data structure mirrors planned Supabase schema for easy migration

## Data Models

### Current Data Models (Individual Assessment)

```typescript
interface Question {
  id: string
  text: string
  category: string
  order: number
}

interface ParticipantSession {
  surveyId: string
  participantId: string
  department: string
  responses: SurveyResponse[]
  currentQuestionIndex: number
  completedAt?: Date
  startedAt: Date
}

interface Survey {
  id: string
  name: string
  questions: Question[]
  branding: { name: string; primaryColor: string }
  createdAt: Date
}
```

### Current Data Models (Organizational Assessment)

```typescript
interface OrganizationalAssessment {
  id: string
  organizationName: string  // "Stork"
  consultantId: string     // "guro@inbound.com"
  status: 'collecting' | 'ready' | 'locked'
  created: Date
  lockedAt?: Date
  
  // Anonymous aggregated data only
  managementResponses: AggregatedResponses
  employeeResponses: AggregatedResponses
  responseCount: { management: number, employee: number }
}

interface ParticipantResponse extends ParticipantSession {
  role: 'management' | 'employee'
  assessmentId: string
}

interface AggregatedResponses {
  categoryAverages: CategoryAverage[]
  overallAverage: number
  // NO individual participant data stored for privacy
}
```

## Technical Foundation

Current localStorage persistence enables immediate testing and demonstration without database setup. All data structures are designed for seamless Supabase migration when moving to production. The role-based access control system will maintain privacy-first design principles while providing powerful comparative analytics for consultants.