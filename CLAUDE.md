# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **strategic organizational assessment tool** built for Inbound's consulting work with clients like Stork. It's a reusable web application for collecting and analyzing employee feedback across strategic dimensions during client strategy engagements.

## Key Project Documents

- `stork_diagnosis_tool_brief.md`: Complete project requirements and specifications  
- `MVP_PLAN.md`: Detailed implementation plan with phases, tech stack, and timeline

## Commands

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build production version
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests (53 tests currently passing)
- `npm run test:watch` - Run tests in watch mode

## Current Implementation Status (MVP Complete)

**✅ Implemented:**
- Complete survey flow with one-question-at-a-time interface
- 1-10 slider input with visual feedback (emojis, colors, animations)
- Progress tracking with animated progress bar and step indicators
- localStorage persistence (survives browser refresh)
- Results dashboard with category breakdown and detailed responses
- Admin portal for managing test data and viewing sessions
- Fully responsive mobile-first design
- Comprehensive test coverage (53 tests passing)

**🔄 Next Phase (Future):**
- Spider chart visualization using Chart.js
- AI text summary generation
- Advanced branding customization
- Supabase migration for production

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
- Chart.js for spider chart visualizations
- Vercel deployment
- OpenAI API integration for text summaries

## Application Routes & User Flows

### Main Routes
- `/` - Homepage with assessment overview and start button
- `/survey/[id]` - Survey interface (currently using `stork-assessment` as demo ID)
- `/results/[id]` - Results dashboard with category breakdown and detailed responses
- `/admin` - Admin portal for managing test data

### Complete User Flow
1. **Homepage** → User reads about assessment and clicks "Start Assessment"
2. **Survey** → One-question-at-a-time flow with 1-10 slider, progress tracking, navigation
3. **Results** → Category scores, overall average, detailed question responses
4. **Admin** → View all sessions, clear test data, manage survey responses

### Demo Usage
- Visit http://localhost:3000 to start
- Survey ID `stork-assessment` is pre-configured for testing
- All data persists in localStorage until manually cleared

## Data Models

The application uses these core TypeScript interfaces:

```typescript
interface Question {
  id: string
  text: string
  category: string
  order: number
}

interface Response {
  surveyId: string
  participantId: string
  department: string
  responses: { questionId: string; score: number }[]
  completedAt: Date
}

interface Survey {
  id: string
  name: string
  questions: Question[]
  branding: { name: string; primaryColor: string }
  createdAt: Date
}
```

## Critical Requirements

- **Mobile-first design**: Survey interface must work seamlessly on mobile devices
- **Single question display**: Never show multiple questions simultaneously
- **Spider chart primary**: This is the key visualization output for client presentations
- **Department tracking**: All responses must be categorized by department/group
- **Reusable template**: Code should support easy replication for future clients

## Target Timeline

MVP delivery target: September 2, 2025
- Phase 1 (Days 1-2): Core survey flow
- Phase 2 (Days 3-4): Visualization & results
- Phase 3 (Days 5-6): Admin & management  
- Phase 4 (Days 7-8): Polish & testing

## Key Implementation Details

### Components Architecture
- `src/components/ui/SliderInput.tsx` - 1-10 rating slider with emoji feedback and animations
- `src/components/ui/ProgressBar.tsx` - Animated progress tracking with step indicators  
- `src/lib/survey-logic.ts` - Core survey management with localStorage persistence
- `src/lib/types.ts` - TypeScript interfaces for type safety

### Data Flow
- Questions stored in `src/data/questions.json` (8 strategic assessment questions)
- Survey sessions managed by `SurveyManager` class in survey-logic.ts
- All responses persist in localStorage with key pattern `survey-session-{surveyId}`
- Data structure mirrors planned Supabase schema for easy migration

### Testing Coverage
- 53 tests covering all core functionality
- Component tests for SliderInput and ProgressBar
- Logic tests for survey management and data persistence
- Tests run with Jest + Testing Library + jsdom

## Development Notes

The MVP prioritizes the survey-taking experience with elegant UI components and smooth user flow. The spider chart visualization (mentioned in requirements) is planned for the next development phase.

Current localStorage persistence enables immediate testing and demonstration without database setup. All data structures are designed for seamless Supabase migration when moving to production.