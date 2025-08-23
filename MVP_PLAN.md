# Stork Organizational Diagnosis Platform - Implementation Plan

## Overview
Building a comprehensive organizational assessment platform for strategic diagnosis of client organizations. Enables consultants to collect and analyze comparative feedback from management and employees, identifying perception gaps and strategic alignment issues. Target for Stork engagement: September 2, 2025.

## Core Requirements

### ✅ Completed (Phases 1-2)
- ✅ One-question-at-a-time mobile-first survey flow
- ✅ 1-10 slider scoring with visual feedback and animations
- ✅ Progress bar for completion tracking  
- ✅ Interactive spider chart visualization using Chart.js
- ✅ AI-powered strategic insights using OpenAI API
- ✅ Basic admin interface for question management
- ✅ Comprehensive test coverage (79 tests, 96% passing)

### 🔄 Phase 3 - Organizational Assessment Platform
- [ ] Role-based access control (consultant, management, employee)
- [ ] Multi-participant organizational assessments  
- [ ] Consultant dashboard for creating and managing client assessments
- [ ] Anonymous response aggregation (management vs employee)
- [ ] Comparative analytics and gap identification
- [ ] Assessment lifecycle management (collecting → ready → locked)
- [ ] Role-appropriate result dashboards

## Technical Stack

### Current Stack (Phase 2 Complete)
```
- Next.js 14 (App Router + TypeScript)
- Tailwind CSS (responsive design)
- Chart.js + react-chartjs-2 (interactive spider chart)
- OpenAI API (strategic insights generation) ✅
- Local JSON files (question storage)
- localStorage (response persistence)
- Jest + Testing Library (comprehensive test suite)
```

### Production Migration Path
```
- Supabase (database + auth + storage for organizational assessments)
- Vercel (deployment) 
- Role-based authentication system
- Multi-tenant data architecture for client organizations
```

## Project Structure
```
/app
  /page.tsx                      # Landing/admin portal
  /survey/[id]/page.tsx          # Survey interface with role support
  /results/[id]/page.tsx         # Enhanced results with spider chart & AI
  /admin/page.tsx                # Admin management
  /consultant/                   # Planned: Consultant dashboard
  /management/                   # Planned: Management results view
/components
  /ui/
    - SliderInput.tsx            # 1-10 scoring component ✅
    - ProgressBar.tsx            # Survey progress tracking ✅
    - SpiderChart.tsx            # Interactive radar chart ✅
    - SummaryCard.tsx            # AI insights component ✅
    - Button.tsx                 # Consistent buttons
  /__tests__/                    # Comprehensive test suite ✅
/data
  /questions.json                # Strategic assessment questions
/lib
  /types.ts                      # TypeScript definitions ✅
  /survey-logic.ts               # Survey flow & validation ✅  
  /ai-summary.ts                 # OpenAI integration ✅
  /__tests__/                    # Logic test coverage ✅
/.env.example                    # Environment configuration ✅
```

## Data Models

### Current Models (Individual Assessment)
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

interface CategoryAverage {
  category: string
  average: number
  responses: number
}
```

### Planned Models (Organizational Assessment)
```typescript
interface OrganizationalAssessment {
  id: string
  organizationName: string    // "Stork"
  consultantId: string       // "guro@inbound.com"
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
```

## Implementation Phases

### ✅ Phase 1: Core Survey Flow (Completed)
- [x] Next.js project setup with TypeScript
- [x] SliderInput component with emoji feedback and animations
- [x] ProgressBar component with step indicators
- [x] Survey taking interface with navigation
- [x] localStorage response storage and persistence
- [x] Strategic assessment question set

### ✅ Phase 2: Advanced Visualization & AI (Completed)  
- [x] Interactive spider chart using Chart.js and react-chartjs-2
- [x] AI-powered strategic insights using OpenAI API
- [x] Enhanced results dashboard with professional client layout
- [x] SummaryCard component with loading states and error handling
- [x] Anonymous response aggregation utilities
- [x] Comprehensive test coverage (79 tests, 96% passing)

### 🔄 Phase 3: Organizational Assessment Platform (Current)

#### Phase 3a: Role-Based Infrastructure (Days 1-2)
- [ ] Role-based survey link system (?role=management|employee)
- [ ] Enhanced data models for organizational assessments
- [ ] Anonymous response aggregation by role
- [ ] Access control middleware and utilities

#### Phase 3b: Consultant Dashboard (Days 3-4)
- [ ] Assessment creation interface for client organizations
- [ ] Real-time participation tracking dashboard
- [ ] Assessment lifecycle controls (collecting → ready → locked)
- [ ] Comparative analytics engine (management vs employee)

#### Phase 3c: Role-Appropriate Results (Days 5-6)
- [ ] Enhanced consultant results with gap analysis
- [ ] Management results dashboard with curated insights
- [ ] Employee post-survey thank you experience
- [ ] Role-based access control implementation

#### Phase 3d: Integration & Testing (Day 7)
- [ ] End-to-end testing across all user roles
- [ ] Performance optimization for comparative analytics
- [ ] Production deployment preparation
- [ ] Stork engagement readiness verification

## Key Features

### ✅ Current Survey Experience
- Single question per screen with large, touch-friendly slider
- Visual feedback (colors, emojis, animations) for score selection
- Animated progress indicator with step indicators
- Department selection at start
- Professional completion experience

### ✅ Current Results Dashboard  
- Interactive spider chart showing category performance
- AI-powered strategic insights with organizational context
- Category breakdown with visual progress bars
- Detailed response review with professional styling
- Export-ready presentation format

### ✅ Current Admin Interface
- View all survey sessions and responses
- Clear test data functionality
- Comprehensive testing and debugging tools

### 🔄 Planned Organizational Features
- **Consultant Dashboard**: Create and manage client assessments
- **Role-Based Distribution**: Generate management and employee survey links
- **Comparative Analytics**: Management vs employee perception analysis
- **Gap Identification**: Highlight organizational alignment issues
- **Assessment Lifecycle**: Controlled data collection and presentation phases
- **Privacy-First Design**: Anonymous employee feedback aggregation

## Local Development Workflow

1. **Setup**: `npm run dev` starts local server
2. **Testing**: Navigate to `/survey/test` for survey flow
3. **Results**: View at `/results/test` after completing survey  
4. **Admin**: Manage data at `/admin`
5. **Data**: All stored in browser localStorage + JSON files

## Migration to Production

### Database Schema (Future Supabase)
```sql
-- Surveys table
CREATE TABLE surveys (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  branding jsonb,
  created_at timestamptz DEFAULT now()
);

-- Questions table  
CREATE TABLE questions (
  id uuid PRIMARY KEY,
  survey_id uuid REFERENCES surveys(id),
  text text NOT NULL,
  category text,
  order_num integer
);

-- Responses table
CREATE TABLE responses (
  id uuid PRIMARY KEY,
  survey_id uuid REFERENCES surveys(id),
  participant_id uuid,
  department text,
  responses jsonb,
  completed_at timestamptz
);
```

### Deployment Checklist
- [ ] Supabase project setup
- [ ] Database migrations
- [ ] Environment variables configuration
- [ ] Vercel deployment pipeline
- [ ] Domain configuration
- [ ] SSL certificate setup

## Success Metrics
- Survey completion rate > 80%
- Mobile usability score > 90/100
- Page load time < 2 seconds
- Zero data loss in localStorage → DB migration
- Admin interface usable without documentation

## Risk Mitigation
- **Data Loss**: localStorage backup to JSON export
- **Performance**: Lazy loading for charts, pagination for large datasets
- **Mobile Issues**: Extensive mobile testing, touch-optimized components
- **Browser Compatibility**: Fallbacks for localStorage, modern JS features

---

**Next Steps**: Begin Phase 1 with Next.js setup and core components.