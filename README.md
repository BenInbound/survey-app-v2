# Organizational Diagnosis Platform

A comprehensive strategic assessment platform built for Inbound's consulting work, enabling comparative feedback analysis between management and employees to identify organizational perception gaps and strategic alignment issues.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to access the platform.

## 📋 Platform Features

### ✅ Organizational Assessments
- Role-based access control with consultant, management, employee roles
- Comparative analytics showing management vs employee perspectives
- Anonymous employee response aggregation with privacy protection
- Access code security system preventing unauthorized access
- Real-time participation tracking and assessment lifecycle management
- Professional client presentation dashboards

### ✅ Question Management
- 6 strategic focus templates with 54 professional questions
- Per-assessment question customization for client-specific needs
- Full CRUD operations: Add, Edit, Delete, Reorder questions
- Question template library with reusable custom question sets

### ✅ Technical Features  
- Interactive spider chart visualizations using Chart.js
- AI-powered strategic insights via OpenAI API
- Mobile-first responsive design with 1-10 slider scoring
- Consultant authentication with 24-hour session management
- GDPR compliance framework for EU deployment

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

## 🏗️ Architecture

- Next.js 14 + TypeScript + Tailwind CSS
- Chart.js for spider chart visualizations
- OpenAI API for strategic insights
- localStorage (dev) → Supabase (production)
- Jest + Testing Library for comprehensive testing

## 🎯 Status

**✅ Production Ready** - All phases complete with comprehensive organizational assessment platform

Built for Inbound's strategic consulting practice.