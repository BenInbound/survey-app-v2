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

## Application Routes & User Flows

### Current Routes (All Phases Complete)
- `/` - Enhanced homepage showcasing both organizational and individual assessments
- `/survey/[id]` - Survey interface with role-aware support (`?role=management|employee`)
- `/survey/complete` - Role-appropriate completion pages
- `/results/[id]` - Individual assessment results with spider chart and AI insights
- `/consultant/dashboard` - Consultant control panel for creating assessments
- `/consultant/results/[assessmentId]` - Full comparative organizational analytics
- `/management/results/[assessmentId]` - Curated organizational health view for leadership
- `/admin` - Admin portal for managing test data

### Current User Flow (Individual Assessment)
1. **Homepage** → User reads about assessment and clicks "Start Assessment"
2. **Survey** → One-question-at-a-time flow with 1-10 slider, progress tracking, navigation  
3. **Results** → Spider chart, AI insights, category scores, detailed responses
4. **Admin** → View all sessions, clear test data, manage survey responses

### Current User Flow (Organizational Assessment)
1. **Consultant** → Creates assessment for organization (e.g., Stork) in consultant dashboard
2. **Distribution** → Generates role-specific links for management (`?role=management`) + employees (`?role=employee`)
3. **Collection** → Management and employees take survey with automatic role assignment
4. **Analysis** → Consultant views comparative management vs employee insights with dual spider charts
5. **Presentation** → Management receives curated organizational health results, employees see thank you confirmation

### Demo Usage
- Visit http://localhost:3000 to see the new organizational assessment platform
- Click "Launch Consultant Dashboard" to create and manage assessments
- Try the demo links on homepage to experience role-based surveys
- Survey ID `stork-assessment` is pre-configured for individual testing
- Demo organizational assessment `demo-org` includes pre-populated management and employee responses
- All data persists in localStorage until manually cleared

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

### Privacy & Security
- **Anonymous by design**: Employee responses aggregated immediately, individual data not stored
- **Role-appropriate results**: Employees see thank you only, management sees curated insights, consultants see full analysis
- **Professional presentation**: All dashboards ready for client meetings without additional formatting

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
- All responses persist in localStorage with key pattern `survey-session-{surveyId}`
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

### OpenAI Integration
AI summary generation requires `OPENAI_API_KEY` environment variable. See `.env.example` for setup instructions. The AI analysis is specifically tuned for organizational strategic insights rather than individual feedback.