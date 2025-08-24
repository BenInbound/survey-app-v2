# Documentation

This directory contains detailed documentation for the strategic organizational diagnosis platform.

## Documentation Structure

### Core Documents
- `IMPLEMENTATION_STATUS.md` - Detailed status of all completed phases (1-11)
- `TECHNICAL_ARCHITECTURE.md` - Architecture details, data models, and component structure  
- `TESTING_COVERAGE.md` - Comprehensive testing documentation with coverage details

### Project Root Documents
- `../CLAUDE.md` - Essential guidance for Claude Code (streamlined)
- `../stork_diagnosis_tool_brief.md` - Complete project requirements and specifications
- `../MVP_PLAN.md` - Detailed implementation plan with phases, tech stack, and timeline

## Quick Reference

### Implementation Status
✅ **ALL 11 PHASES COMPLETE**: Individual + Organizational assessments with consultant workflows, GDPR compliance, authentication, per-assessment question management, and consultant-first UX design.

### Architecture
- **Current**: Next.js 14 + TypeScript + localStorage + Tailwind CSS
- **Production**: Supabase migration required for multi-device support

### Testing
- **441+ tests** covering all functionality with 96%+ coverage
- Jest + Testing Library + jsdom

### Key Routes
- `/` - Consultant portal homepage
- `/consultant/dashboard` - Assessment creation and management  
- `/consultant/results/[assessmentId]` - Comparative analytics
- `/survey/[id]/access` - Access code entry
- `/admin` - Admin portal (password: `INBOUND2025`)

For detailed information on any topic, see the specific documentation files above.