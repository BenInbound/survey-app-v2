# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **strategic organizational diagnosis platform** built for Inbound's consulting work with clients like Stork. It enables consultants to collect and analyze comparative feedback from both management and employees, identifying organizational perception gaps and strategic alignment issues across strategic dimensions during client strategy engagements.

## Key Project Documents

- `stork_diagnosis_tool_brief.md`: Complete project requirements and specifications  
- `MVP_PLAN.md`: Detailed implementation plan with phases, tech stack, and timeline
- `docs/IMPLEMENTATION_STATUS.md`: Detailed status of all completed phases
- `docs/TECHNICAL_ARCHITECTURE.md`: Architecture details and component structure
- `docs/TESTING_COVERAGE.md`: Comprehensive testing documentation

## Commands

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build production version
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode

## Current Status

✅ **ALL PHASES COMPLETE + CRITICAL RELIABILITY FIXES**: Individual + Organizational assessments with consultant workflows, GDPR compliance, authentication, per-assessment question management, and consultant-first UX design.

🔧 **Recent Critical Fixes (2025-08-24)**:
- ✅ **Assessment deletion now works** - Fixed async race condition
- ✅ **Survey completion errors eliminated** - Fixed UUID database conflicts
- ✅ **Dashboard updates in real-time** - Fixed missing await keywords
- ✅ **Copy URL functionality added** - One-click survey link sharing
- ✅ **Brand color update** - Hot pink button theme (#ff0056)

See `docs/IMPLEMENTATION_STATUS.md` for complete technical details.

## Application Routes & User Flows

### Current Routes (Production-Ready)
- `/` - **Consultant portal homepage** (primary entry point)
- `/survey/[id]/access` - **Access code entry page** (security gateway)
- `/survey/[id]` - **Role-specific survey landing pages** (`?role=management|employee`)
- `/survey/complete` - Role-appropriate completion pages
- `/consultant/dashboard` - Consultant control panel for creating assessments
- `/consultant/results/[assessmentId]` - **Full comparative organizational analytics** (consultant-only)
- `/privacy/[assessmentId]` - **GDPR Privacy Notice** with assessment-specific information
- `/admin` - Admin portal for managing test data

### Production Usage (GDPR-Compliant)
- Visit http://localhost:3000 to access **Consultant Portal**
- **Consultant Authentication**: Both `/consultant/dashboard` and `/admin` require password: `INBOUND2025`
- Demo organizational assessment `demo-org` with access code: `DEMO-2025-STRATEGY`
- All data persists in localStorage until manually cleared via admin portal

## Critical Requirements

### Core Survey Experience
- **Mobile-first design**: Survey interface must work seamlessly on mobile devices
- **Single question display**: Never show multiple questions simultaneously
- **Spider chart primary**: Key visualization output for client presentations

### Organizational Assessment Platform
- **Role-based access control**: Consultants, management, and employees have different access levels
- **Anonymous response aggregation**: Individual employee responses not accessible to consultants
- **Comparative analytics**: Management vs employee perspective gap identification
- **Assessment lifecycle management**: Controlled data collection and presentation phases

### Privacy & Security
- **Anonymous by design**: Employee responses aggregated immediately, individual data not stored
- **Access code control**: Unique codes per assessment prevent unauthorized survey access
- **Consultant-only analytics**: Management and employees have NO access to comparative results
- **Professional consulting boundaries**: Consultants control all information flow

## Brand Identity & Design System
- **Logo**: Inbound logo (`public/assets/images/Inbound-logo-RGB.svg`) displayed on all screens
- **Typography**: TT Norms Pro font family with web-optimized formats (WOFF2/WOFF/TTF)
- **Color Scheme**: Rose/pink theme (#FFE5EE primary, #F8F8F4 custom background)
- **Font Assets**: `public/assets/fonts/` with progressive loading (WOFF2 → WOFF → TTF)

## Platform Capabilities

The platform enables consultants like Guro to:
- Create and manage assessments for client organizations (e.g., Stork)
- **Customize assessment questions per individual client** with full CRUD operations
- **Choose from 6 strategic focus templates** covering key organizational dimensions:
  - Strategic Alignment (clarity, positioning, competitive advantage)
  - Innovation & Growth (market expansion, innovation capabilities)
  - Leadership & Culture (people transformation, cultural development)
  - Operational Excellence (process optimization, efficiency)
  - Performance & Results (metrics, outcomes, financial performance)
  - Digital Transformation (technology capabilities, digital readiness)
- Distribute role-specific survey links to management and employees
- Track participation in real-time with lifecycle management controls
- Analyze perception gaps between management and employee perspectives
- Generate AI-powered strategic recommendations for organizational alignment
- Present professional, client-ready results to different stakeholder groups

## Production Deployment Readiness

### ✅ Current Status: Production-Ready Supabase-Only Platform
**Platform Components:**
- ✅ **Consultant Dashboard**: Full assessment creation and management with async Supabase operations
- ✅ **Participant Experience**: Anonymous access code system with role-based survey flows
- ✅ **Analytics Engine**: Executive summary, department leaderboards, strategic action items
- ✅ **Test Coverage**: 441+ comprehensive tests covering all functionality
- ✅ **GDPR Compliance**: Complete privacy framework and legal basis tracking
- ✅ **Supabase-Only Architecture**: Single source of truth with direct CRUD operations
- ✅ **Clean Data Flow**: Eliminated localStorage/database synchronization issues

### ✅ Production Database Migration Complete
**Current Architecture**: Supabase-only (elegant single-source-of-truth design)
**Production Status**: Multi-device participant support fully implemented with no data conflicts

**What Works Now:**
- ✅ Multiple participants on different devices submitting to same assessment
- ✅ Consultant accessing results from different devices
- ✅ Real-time response aggregation across devices
- ✅ Centralized Supabase storage with consistent data access
- ✅ Eliminated 0/10 scoring issues caused by data conflicts
- ✅ Demo scenarios with pre-populated data
- ✅ All UI/UX and calculation logic
- ✅ Access code security system for participants

## OpenAI Integration
AI summary generation requires `OPENAI_API_KEY` environment variable. See `.env.example` for setup instructions. The AI analysis is specifically tuned for organizational strategic insights rather than individual feedback.

## Development Notes

### Current Status
The application is now a complete organizational diagnosis platform with all phases implemented and **production-ready with Supabase-only architecture**. The system uses centralized Supabase database for all data operations, eliminating localStorage dependencies and ensuring consistent data access across all devices. This architectural migration resolved the 0/10 scoring issues caused by data synchronization conflicts.

### Following Conventions
When making changes to files, first understand the file's code conventions. Mimic code style, use existing libraries and utilities, and follow existing patterns.
- NEVER assume that a given library is available, even if it is well known. Always check that this codebase already uses the given library.
- When you create a new component, first look at existing components to see how they're written.
- When you edit a piece of code, first look at the code's surrounding context (especially its imports) to understand the code's choice of frameworks and libraries.
- Always follow security best practices. Never introduce code that exposes or logs secrets and keys.

### Code Style
- IMPORTANT: DO NOT ADD ***ANY*** COMMENTS unless asked