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
- Assessment lifecycle management
- Professional client presentation dashboards

## 🔧 Commands

- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode

## 📊 Quick Demo

1. **Individual Assessment**: Visit `/survey/stork-assessment`
2. **Organizational Demo**: 
   - Management: `/survey/demo-org?role=management`
   - Employee: `/survey/demo-org?role=employee`
   - Results: `/consultant/results/demo-org`
3. **Consultant Dashboard**: `/consultant/dashboard`

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

**✅ All phases complete** - Platform ready for Stork engagement (September 2025)

Built with ❤️ for Inbound's strategic consulting practice.