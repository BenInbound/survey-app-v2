# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **strategic organizational diagnosis platform** built for Inbound's consulting work with clients like Stork. It enables consultants to collect and analyze comparative feedback from both management and employees, identifying organizational perception gaps and strategic alignment issues across strategic dimensions during client strategy engagements.

## Key Project Documents

- `stork_diagnosis_tool_brief.md`: Complete project requirements and specifications  
- `MVP_PLAN.md`: Detailed implementation plan with phases, tech stack, and timeline

## Commands

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build production version
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode

## Current Implementation Status (Phase 3 Complete)

**✅ Phase 1 - Individual Assessment MVP:**
- Complete survey flow with one-question-at-a-time interface
- 1-10 slider input with visual feedback (emojis, colors, animations)
- Progress tracking with animated progress bar and step indicators
- localStorage persistence (survives browser refresh)
- Results dashboard with category breakdown and detailed responses
- Admin portal for managing test data and viewing sessions
- Fully responsive mobile-first design

**✅ Phase 2 - Advanced Visualization & AI:**
- Interactive spider chart visualization using Chart.js
- AI-powered strategic insights using OpenAI API
- Enhanced results dashboard with professional client presentation layout
- Comprehensive test coverage with Jest + Testing Library

**✅ Phase 3 - Organizational Assessment Platform:**
- Role-based access control (consultant, management, employee)
- Multi-participant organizational assessments with role-based survey links
- Comparative analytics dashboard with dual spider charts (management vs employee)
- Assessment lifecycle management (collecting → ready → locked)
- Anonymous response aggregation system protecting employee privacy
- Consultant dashboard for creating and managing client assessments
- Real-time participation tracking with response counters
- AI-powered organizational insights for perception gap analysis
- Demo assessment with pre-populated data for testing

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

## Application Routes & User Flows (UX REDESIGNED)

### Current Routes (Post-UX Redesign)
- `/` - **Consultant portal homepage** (primary entry point for platform users)
- `/survey/[id]/access` - **Access code entry page** (security gateway for surveys)
- `/survey/[id]` - **Role-specific survey landing pages** with company branding (`?role=management|employee`)
- `/survey/complete` - Role-appropriate completion pages
- `/consultant/dashboard` - Consultant control panel for creating assessments and managing access codes
- `/consultant/results/[assessmentId]` - **Full comparative organizational analytics** (consultant-only access)
- `/admin` - Admin portal for managing test data

### ⚠️ REMOVED ROUTES (UX Security & Privacy)
- ❌ `/management/results/[assessmentId]` - **ELIMINATED** to prevent organizational relationship damage
- ❌ `/results/[id]` - Individual assessment results moved to admin-only access
- ❌ All demo/individual assessment links removed from main navigation

### REDESIGNED User Flow (Production-Ready)

#### Consultant Workflow (Primary Platform Users)
1. **Consultant Portal** → Access main homepage (professional login/dashboard entry)
2. **Assessment Creation** → Create organizational assessment with unique access code generation
3. **Code Distribution** → Share access code with client contact for internal distribution
4. **Analysis & Presentation** → View full comparative analytics and present curated insights to management

#### Participant Workflow (Survey Recipients)
1. **Access Code Entry** → Participants receive code from company, enter on secure access page
2. **Role-Specific Landing** → Automatic redirect to appropriate landing page (employee vs management messaging)
3. **Survey Completion** → One-question-at-a-time flow with company branding
4. **Thank You Confirmation** → All participants receive thank you (NO results access for employees or management)

#### Distribution Strategy
1. **Consultant → Client Contact** → Shares assessment access code
2. **Client Contact → Internal Distribution** → Company distributes code via email/meetings/Slack
3. **Participants** → Use code to access appropriate survey experience
4. **Results Analysis** → Only consultant sees comparative data and insights

### Production Usage (Post-UX Redesign)
- Visit http://localhost:3000 to access **Consultant Portal** (main entry point)
- Access consultant dashboard to create assessments and generate access codes
- Use `/admin` for development testing and data management
- Demo organizational assessment `demo-org` includes pre-populated responses for consultant analytics testing
- Access codes required for all survey access (no direct survey links)
- All data persists in localStorage until manually cleared via admin portal

### Important Notes for Demo Testing
- **Demo Assessment ID**: The platform uses a fixed ID `demo-org` for demo organizational assessments
- **Data Consistency**: Demo data auto-initializes on page load if not present
- **Results Access**: 
  - Individual results: `/results/stork-assessment`
  - Organizational results: `/consultant/results/demo-org`
- **Clear Data**: Use `/admin` portal to reset all test data if needed

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

## Critical Requirements

### Core Survey Experience
- **Mobile-first design**: Survey interface must work seamlessly on mobile devices
- **Single question display**: Never show multiple questions simultaneously
- **Spider chart primary**: This is the key visualization output for client presentations

### Organizational Assessment Platform
- **Role-based access control**: Consultants, management, and employees have different access levels
- **Anonymous response aggregation**: Individual employee responses not accessible to consultants
- **Comparative analytics**: Management vs employee perspective gap identification
- **Assessment lifecycle management**: Controlled data collection and presentation phases

### Privacy & Security (Enhanced UX Design)
- **Anonymous by design**: Employee responses aggregated immediately, individual data not stored
- **Access code control**: Unique codes per assessment prevent unauthorized survey access
- **Consultant-only analytics**: Management and employees have NO access to comparative results
- **Role-appropriate messaging**: Employees see anonymity guarantees, management sees strategic value
- **Professional consulting boundaries**: Consultants control all information flow to protect organizational relationships

### Scalability & Reusability
- **Multi-client support**: Easy replication for future organizational assessments beyond Stork
- **Consultant-centric workflow**: Designed for consultants like Guro managing multiple client assessments

## Implementation Timeline

### ✅ All Phases Complete
- **Phase 1** (Completed): Core survey flow with mobile-first design
- **Phase 2** (Completed): Spider chart visualization + AI strategic insights
- **Phase 3** (Completed): Full organizational assessment platform with comparative analytics

### 🎯 Ready for Stork Engagement
**Status:** Platform fully operational and tested
**Target Date:** Week of September 2, 2025

The platform now includes:
- Consultant dashboard for assessment creation and management
- Role-based survey distribution with automatic participant tracking
- Comparative analytics engine with management vs employee gap analysis
- AI-powered organizational insights for strategic recommendations
- Professional presentation-ready dashboards for client meetings

## Key Implementation Details

### Components Architecture
- `src/components/ui/SliderInput.tsx` - 1-10 rating slider with emoji feedback and animations
- `src/components/ui/ProgressBar.tsx` - Animated progress tracking with step indicators
- `src/components/ui/SpiderChart.tsx` - Interactive radar chart using Chart.js for individual assessment
- `src/components/ui/ComparativeSpiderChart.tsx` - Dual-overlay spider chart for management vs employee comparison
- `src/components/ui/SummaryCard.tsx` - AI-powered strategic insights with loading states and error handling
- `src/lib/survey-logic.ts` - Core survey management with localStorage persistence
- `src/lib/organizational-assessment-manager.ts` - Organizational assessment lifecycle and data aggregation
- `src/lib/ai-summary.ts` - OpenAI API integration for both individual and organizational insights
- `src/lib/demo-data.ts` - Pre-populated demo assessment for testing
- `src/lib/types.ts` - TypeScript interfaces including new organizational types

### Data Flow
- Questions stored in `src/data/questions.json` (8 strategic assessment questions)
- Survey sessions managed by `SurveyManager` class in survey-logic.ts
- Individual responses persist in localStorage with key pattern `survey-session-{surveyId}`
- Organizational assessments stored with keys: `organizational-assessments` and `organizational-responses`
- Demo data uses fixed ID `demo-org` for consistent routing and testing
- Data structure mirrors planned Supabase schema for easy migration

### Testing Coverage
- Comprehensive test suite covering all core functionality
- Component tests for SliderInput, ProgressBar, SpiderChart, and SummaryCard
- Logic tests for survey management, data persistence, and AI summary generation
- Integration tests ensuring components work together across user flows
- Tests run with Jest + Testing Library + jsdom

## Development Notes

### Current Status
The application is now a complete organizational diagnosis platform with all three phases implemented. It provides:
- **Individual assessments** with personalized insights and spider chart visualizations
- **Organizational assessments** with role-based comparative analytics
- **Consultant workflows** for managing multiple client engagements
- **Professional dashboards** ready for client presentations

### Platform Capabilities
The platform enables consultants like Guro to:
- Create and manage assessments for client organizations (e.g., Stork)
- Distribute role-specific survey links to management and employees
- Track participation in real-time with lifecycle management controls
- Analyze perception gaps between management and employee perspectives
- Generate AI-powered strategic recommendations for organizational alignment
- Present professional, client-ready results to different stakeholder groups

### Technical Foundation
Current localStorage persistence enables immediate testing and demonstration without database setup. All data structures are designed for seamless Supabase migration when moving to production. The role-based access control system will maintain privacy-first design principles while providing powerful comparative analytics for consultants.

### Recent Updates & UX Redesign (August 2025)
- **Major UX Redesign**: Complete information architecture overhaul based on real-world consultant workflow analysis
- **Security Enhancement**: Implemented access code system to prevent unauthorized survey access
- **Professional Boundaries**: Removed management results access to protect organizational relationships and consultant advisory role
- **Consultant-Centric Design**: Homepage transformed to consultant portal, eliminating demo/individual assessment confusion
- **Role-Specific Landing Pages**: Separate messaging for employees (anonymity focus) vs management (strategic value focus)
- **Access Control Architecture**: All comparative analytics restricted to consultant dashboard only

### OpenAI Integration
AI summary generation requires `OPENAI_API_KEY` environment variable. See `.env.example` for setup instructions. The AI analysis is specifically tuned for organizational strategic insights rather than individual feedback.

## 🚧 UPCOMING IMPLEMENTATION: UX REDESIGN PHASE

### Phase 4: Production UX Implementation (Next Steps)
Based on senior UX analysis, the following critical changes are required for real-world consultant use:

#### 4A: Access Code Security System
- `lib/access-control.ts` - New access code generation and validation system
- `app/survey/[id]/access/page.tsx` - New security gateway for all surveys
- Assessment-specific codes (e.g., "STORK-2024-STRATEGY") prevent unauthorized access
- Code expiration when assessments are locked by consultant

#### 4B: Information Architecture Overhaul  
- Homepage transformation to consultant portal (remove demo/individual links)
- Role-specific survey landing pages with company branding and appropriate messaging
- Employee landing: Anonymous trust messaging
- Management landing: Strategic value messaging (no results promise)

#### 4C: Professional Consulting Boundaries
- **REMOVE** `/management/results/` routes entirely to protect organizational relationships
- Consultant-only access to comparative analytics prevents management/employee tension
- All results access controlled by consultant for professional client presentation

#### 4D: Enhanced Data Models
```typescript
interface OrganizationalAssessment {
  // ... existing fields
  accessCode: string              // "STORK-2024-STRATEGY"  
  codeExpiration?: Date          // Auto-expire on lock
  codeRegeneratedAt?: Date       // Track code changes
}

interface AccessCodeValidation {
  code: string
  assessmentId: string
  isValid: boolean
  expiresAt?: Date
}
```

This redesign transforms the platform from a demo/testing tool into a production-ready consultant platform that protects professional relationships and maintains proper organizational boundaries.