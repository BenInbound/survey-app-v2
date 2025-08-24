# Deployment Guide

## Production Setup

### 1. Supabase Database Setup
1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `supabase-schema-safe.sql`
4. Execute the SQL to create tables, policies, and demo data

### 2. Environment Variables
1. Copy `.env.example` to `.env.local`
2. Get your Supabase credentials:
   - Go to Project Settings → API in your Supabase dashboard
   - Copy the Project URL and anon/public key
3. Update `.env.local` with your actual values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
   OPENAI_API_KEY=your_openai_key_optional
   ```

### 3. Deployment Options

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard under Settings → Environment Variables
3. Deploy - Vercel will automatically build and deploy your Next.js app

#### Other Platforms
The app is a standard Next.js application and can be deployed to:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify
- Any Node.js hosting service

### 4. Post-Deployment
1. Visit your deployed app
2. Test the demo assessment with access code: `DEMO-2025-STRATEGY`
3. Create new assessments to verify database connectivity
4. Consultant login password: `INBOUND2025`

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment variables: `cp .env.example .env.local`
4. Start development server: `npm run dev`
5. Open http://localhost:3000

### Without Supabase
The app works in localStorage-only mode without Supabase configuration. This is perfect for:
- Local development
- Single-device demos
- Testing features

### With Supabase
Configure environment variables for:
- Multi-device participant support
- Persistent data across sessions
- Production deployment

## Features

### Current Capabilities
- ✅ Multi-device organizational assessments
- ✅ Role-based access control (consultant, management, employee)
- ✅ Anonymous response aggregation
- ✅ Hybrid database + localStorage architecture
- ✅ Comprehensive analytics and reporting
- ✅ AI-powered strategic insights
- ✅ GDPR compliance framework
- ✅ Data migration utilities

### Architecture
- **Frontend**: Next.js 14 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **AI Integration**: OpenAI API (optional)
- **Deployment**: Vercel-optimized

## Support

For issues or questions:
1. Check the existing documentation in `/docs`
2. Review test files for usage examples
3. Ensure environment variables are properly configured
4. Verify Supabase schema is correctly installed