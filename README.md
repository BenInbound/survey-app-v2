# Organizational Diagnosis Platform

A comprehensive strategic assessment platform built for Inbound's consulting work, enabling comparative feedback analysis between management and employees to identify organizational perception gaps and strategic alignment issues.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to access the platform.

## 📋 Platform Features

### ✅ Individual Assessments
- Interactive spider chart visualizations
- AI-powered strategic insights
- Mobile-first responsive design
- 1-10 slider scoring with visual feedback

### ✅ Organizational Assessments
- Role-based access control (consultant, management, employee)
- Comparative analytics (management vs employee perspectives)
- Anonymous employee response aggregation
- Real-time participation tracking
- Assessment lifecycle management with deletion functionality
- Professional client presentation dashboards
- Complete assessment deletion with data integrity protection

### ✅ Per-Assessment Question Management
- Client-specific question customization for each assessment
- 6 strategic focus templates with 54 professional questions:
  - Strategic Alignment, Innovation & Growth, Leadership & Culture
  - Operational Excellence, Performance & Results, Digital Transformation
- Flexible question sources (default template, custom template, copy assessment, blank)
- Full CRUD operations: Add, Edit, Delete, Reorder questions
- Question template library with reusable custom question sets
- Assessment-specific context with individual "📝 Manage Questions" buttons

### ✅ Consultant Authentication
- Password-protected consultant dashboard and admin portal
- Secure session management with 24-hour expiration
- Professional login experience with automatic logout
- Seamless navigation between protected areas

## 🔧 Commands

- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode

## 📊 Quick Demo

**⚠️ Consultant areas require authentication (password: `INBOUND2025`)**

1. **Individual Assessment**: Visit `/survey/stork-assessment`
2. **Organizational Demo**: 
   - Management: `/survey/demo-org?role=management`
   - Employee: `/survey/demo-org?role=employee`
   - Results: `/consultant/results/demo-org` (requires login)
3. **Consultant Dashboard**: `/consultant/dashboard` (requires login)
4. **Admin Portal**: `/admin` (requires login)

## 📚 Documentation

- `CLAUDE.md` - Complete implementation guide and technical details
- `MVP_PLAN.md` - Project phases, requirements, and architecture
- `stork_diagnosis_tool_brief.md` - Original client requirements

## 🏗️ Architecture

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Charts**: Chart.js + react-chartjs-2
- **AI**: OpenAI API integration
- **Storage**: localStorage (development) → Supabase (production)
- **Testing**: Jest + Testing Library

## 🎯 Status

**✅ All 9 phases complete** - Production-ready platform with comprehensive assessment lifecycle management

Latest addition: **Phase 9 - Assessment Lifecycle Management**
- Complete assessment deletion system with confirmation dialogs
- Data integrity protection ensuring complete removal of assessments and responses
- Demo assessment management with intelligent recreation prevention
- Admin restoration tools for testing and development workflows
- 4 comprehensive deletion tests covering edge cases and error handling

Built with ❤️ for Inbound's strategic consulting practice.