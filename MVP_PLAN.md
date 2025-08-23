# Stork Diagnosis Tool - MVP Implementation Plan

## Overview
Building a lightweight survey tool for strategic diagnosis exercises. MVP target: Sept 2, 2025. Focus on local development first, then migrate to Supabase hosting.

## Core Requirements (Must Have)
- ✅ One-question-at-a-time mobile-first survey flow
- ✅ 1-10 slider scoring with visual feedback  
- ✅ Progress bar for completion tracking
- ✅ Spider chart visualization (primary output)
- ✅ Basic admin interface for question management
- ✅ Secure survey links with unique IDs
- ✅ Response collection by department/group
- ✅ Simple text summaries of results

## Technical Stack

### Local Development
```
- Next.js 14 (App Router + TypeScript)
- Tailwind CSS (responsive design)
- Chart.js (spider chart visualization)
- Local JSON files (question storage)
- localStorage (response persistence)
```

### Production Migration Path
```
- Supabase (database + auth + storage)
- Vercel (deployment)
- OpenAI API (text summaries)
```

## Project Structure
```
/app
  /page.tsx                # Landing/admin portal
  /survey/[id]/page.tsx    # Survey interface
  /results/[id]/page.tsx   # Results dashboard
  /admin/page.tsx          # Admin management
/components
  /ui/
    - Slider.tsx           # 1-10 scoring component
    - ProgressBar.tsx      # Survey progress
    - Button.tsx           # Consistent buttons
  /charts/
    - SpiderChart.tsx      # Chart.js radar chart
/data
  /questions.json          # Sample question sets
  /surveys.json            # Survey configurations
/lib
  /types.ts                # TypeScript definitions
  /survey-logic.ts         # Survey flow & validation
  /storage.ts              # localStorage utilities
```

## Data Models

### Question
```typescript
interface Question {
  id: string
  text: string
  category: string
  order: number
}
```

### Survey Response  
```typescript
interface Response {
  surveyId: string
  participantId: string
  department: string
  responses: { questionId: string; score: number }[]
  completedAt: Date
}
```

### Survey Config
```typescript
interface Survey {
  id: string
  name: string
  questions: Question[]
  branding: { name: string; primaryColor: string }
  createdAt: Date
}
```

## Implementation Phases

### Phase 1: Core Survey Flow (Days 1-2)
- [x] Next.js project setup with TypeScript
- [ ] Basic UI components (Slider, ProgressBar, Layout)
- [ ] Survey taking interface with navigation
- [ ] localStorage response storage
- [ ] Sample question set in JSON

### Phase 2: Visualization & Results (Days 3-4)  
- [ ] Chart.js spider chart implementation
- [ ] Results dashboard showing aggregated data
- [ ] Department-based filtering/comparison
- [ ] Response data processing utilities

### Phase 3: Admin & Management (Days 5-6)
- [ ] Admin interface for viewing all responses
- [ ] Survey configuration management  
- [ ] Basic branding system (name, colors)
- [ ] Data export (JSON/CSV download)

### Phase 4: Polish & Testing (Days 7-8)
- [ ] Mobile responsive optimization
- [ ] Error handling and validation
- [ ] Complete user flow testing
- [ ] Performance optimization

## Key Features

### Survey Experience
- Single question per screen with large, touch-friendly slider
- Visual feedback (colors, emojis) for score selection
- Progress indicator showing completion percentage
- Department selection at start
- Thank you page with completion confirmation

### Results Dashboard  
- Primary spider chart showing average scores by category
- Department comparison view
- Raw response data table
- Basic statistics (completion rate, avg scores)

### Admin Interface
- View all survey responses
- Clear test data functionality
- Switch between question sets
- Generate new survey links

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