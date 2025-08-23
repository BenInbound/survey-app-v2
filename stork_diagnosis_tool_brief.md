# Organizational Diagnosis Platform Brief: Stork Assessment

## 1. Context & Strategic Intent
Inbound is transforming its strategy phase for clients by embedding AI-driven organizational assessment tools. For **Stork**, a new client engagement starting in early September, consultants like Guro need to digitize the **organizational diagnosis exercise** — a comprehensive platform that collects feedback from both management and employees to identify perception gaps and strategic alignment issues.

**Critical Requirement**: This platform enables consultants to analyze **comparative perspectives** (management vs employees) rather than individual assessments, providing organizational-level insights for strategic recommendations.

The app will serve as a **reusable organizational assessment template** for future client engagements across Inbound's portfolio.

## 2. Objectives
- Build a **comprehensive organizational assessment platform** that collects feedback from both management and employees
- Provide **role-based access control** ensuring consultants see full comparative analytics while management receives curated insights
- Enable **anonymous employee feedback** while identifying organizational perception gaps and strategic misalignments
- Deliver **professional client presentation tools** with interactive visualizations and AI-powered strategic insights
- Create a **reusable consultant workflow** for managing multiple client organizational assessments

## 3. Key Requirements

### 3.1 Survey Experience (Multi-Role)
- **Mobile-first Design** ✅  
  Frictionless experience on mobile and desktop devices
- **One-question-at-a-time Flow** ✅  
  Animated progress bar with step indicators for clarity
- **Role-Based Survey Links**  
  Generate separate links for management and employee participants
- **1-10 Scoring System** ✅  
  Interactive slider with visual feedback (emojis, colors, animations)
- **Anonymous Response Collection**  
  Employee responses aggregated immediately for privacy protection
- **Strategic Question Bank** ✅  
  Curated set of strategic assessment questions across key business dimensions

### 3.2 Consultant Dashboard & Assessment Management (ENHANCED)
- **Organizational Assessment Creation**  
  Create assessments for client organizations (e.g., Stork)
- **Access Code Generation & Management**  
  Generate unique secure codes for each assessment (e.g., "STORK-2024-STRATEGY")
- **Role-Specific Landing Page Management**  
  Configure company-branded survey experiences with appropriate messaging
- **Real-time Participation Tracking**  
  Monitor response rates and engagement across management/employee groups
- **Assessment Lifecycle Control**  
  Manage data collection phases with security controls (collecting → ready → locked)
- **Multi-Client Support**  
  Handle multiple concurrent organizational assessments with secure access control

### 3.3 Comparative Analytics & Results (Role-Based Access)

#### Consultant View (Full Analytics)
- **Interactive Spider Chart** ✅  
  Dual overlay showing management vs employee perspectives
- **Gap Analysis Dashboard**  
  Identify organizational perception gaps and misalignments
- **AI-Powered Strategic Insights** ✅  
  Organizational health analysis with specific recommendations for management vs employee alignment
- **Professional Presentation Tools**  
  Client-ready visualizations and executive summaries

#### Management Experience (REVISED - No Results Access)
- **Survey Participation Only**  
  Management completes assessment with strategic value messaging
- **Results via Consultant Presentation**  
  Consultants present curated insights in facilitated sessions
- **No Direct Platform Access**  
  Protects organizational relationships and consultant advisory role

#### Employee Experience
- **Post-Survey Completion**  
  Thank you message confirming contribution to organizational assessment
- **No Results Access**  
  Maintains privacy and prevents organizational tension

### 3.4 Hosting & Integration
- Host externally (Databutton preferred, server-ready).
- Ensure mobile-friendly performance.
- Integrations:
  - **HubSpot:** Store and access scores per company/department.
  - **Google Sheets:** Sync raw data for backup and advanced analysis.
  - **Gamma.app:** Automatically generate slide decks.
  - **Slack:** Notify strategists with insights after surveys close.

## 4. UX and Design Principles
- **Clarity:** One clear task per screen.
- **Playfulness:** Light gamification (progress indicators, emojis).
- **Trust:** Branding for credibility and security cues.
- **Scalability:** Easy to replicate for new clients with minimal setup.

## 5. Suggested Tech Stack
- **Frontend:** Next.js or Databutton for rapid development.
- **Backend:** Node.js or Python (FastAPI) for API logic.
- **Database:** Firebase or Supabase for storage.
- **Visualization:** Chart.js or D3.js for charts.
- **AI Processing:** OpenAI or Claude for summaries and insight generation.

## 6. Timeline
| Phase | Deliverables | Target Date |
|--------|-------------|-------------|
| **Prototype** | Working MVP hosted | Aug 28 |
| **Internal Testing** | Data validation + feedback loop | Aug 30 |
| **Client Launch** | Ready for Stork onboarding | Sept 2 |
| **Iteration** | Feedback-driven improvements | Post-launch |

## 7. User Stories

### Survey Participants

#### Employees
- *As an employee*, I want to complete the organizational assessment quickly on my phone while knowing my responses are anonymous, so I can provide honest feedback without concern for individual repercussions.
- *As an employee*, I want clear confirmation that my input contributes to organizational improvement, so I feel valued in the process.

#### Management  
- *As a manager*, I want to complete my assessment understanding its strategic value to our organization, so I can provide thoughtful leadership perspective.
- *As a manager*, I want to receive organizational insights through professional consultant-facilitated sessions, so I can act on findings without damaging team relationships.

### Consultants (Primary Users)
- *As a consultant like Guro*, I want to create organizational assessments for clients like Stork, so I can systematically collect feedback from all levels.
- *As a consultant*, I want to see management vs employee perception gaps clearly visualized, so I can identify organizational alignment issues and provide targeted strategic recommendations.
- *As a consultant*, I want professional presentation-ready results, so I can present findings confidently in client strategy sessions.
- *As a consultant*, I want to manage multiple client assessments simultaneously, so I can scale this approach across my portfolio.

### Technical Requirements (ENHANCED SECURITY)
- *As a platform*, I need access code security to prevent unauthorized survey access while maintaining participant anonymity.
- *As a system*, I need consultant-only access to comparative analytics to protect organizational relationships and professional consulting boundaries.
- *As a platform*, I need to handle multiple concurrent assessments for different client organizations without data crossover.

## 8. Creative Enhancements
- **Org Persona Card:** Generate an animated “profile” of the organization based on responses.  
- **Animated Radar:** Departments animate on the spider chart for instant comparison.  
- **AI Insights:** Summaries evolve over time as more data accumulates, enabling longitudinal analysis.

## 9. Implementation Status & Next Steps

### ✅ Completed (August 2025)
- Platform fully developed with comprehensive organizational assessment capabilities
- Major UX redesign implementing consultant-centric workflow and access code security
- Role-based access control with professional consulting boundaries
- Comparative analytics engine with management vs employee gap analysis

### 🔄 Current Implementation Phase
1. **Access Code Security System**: Implement unique codes per assessment
2. **Consultant-Only Analytics**: Remove management results access
3. **Role-Specific Landing Pages**: Company-branded survey experiences
4. **Professional Boundaries**: Consultant controls all information flow

### 🎯 Ready for Stork Engagement (September 2025)
Platform ready for secure client deployment with proper consultant workflow protection.
