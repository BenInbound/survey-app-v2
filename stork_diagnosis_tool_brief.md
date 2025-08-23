# App Brief: Diagnosis Tool for Stork (AI Strategy Phase)

## 1. Context
Inbound is enhancing its strategy phase for clients by embedding AI-driven tools. For **Stork**, a new client starting in early September, the team wants to digitize the **Diagnosis exercise** — a survey-based tool where employees and management score strategic dimensions to create actionable insights.

The app will serve as a **reusable template**, not just a one-off build, for future client engagements.

## 2. Objectives
- Build a **lightweight, hosted web app** to collect and analyze survey input.
- Provide **real-time, visual, and textual summaries** of responses.
- Deliver a tool that integrates smoothly into **existing workflows** like HubSpot, Google Sheets, and presentation platforms.

## 3. Key Requirements

### 3.1 Input / Survey Experience
- **Simple & Mobile-first**  
  Designed to be frictionless on mobile and desktop.
- **One-question-at-a-time flow**  
  Progress bar for motivation and clarity.
- **Question Bank**
  - Start with the existing set of questions from Guro’s shared doc.
  - Allow admins to **add, remove, or reorder** questions.
  - Option to **randomize** order to reduce bias.
- **Scoring Options**
  - Default: **1–10 slider** with visual icons/emojis.
  - Alternate: **5-point Likert scale** (fully disagree → fully agree).
- **Optionality**
  - Ability to switch between one-off surveys and “pulse mode” for ongoing feedback collection.

### 3.2 Admin & Setup
- Upload/edit question sets (via Google Sheets or inline editor).
- Choose scoring method.
- Set **branding (logos, colors)** per client.
- Define groups (e.g., Management, Sales, Marketing) for comparative insights.
- Preview mode before sending links.
- Generate shareable, secure links for participants.

### 3.3 Output & Results
- **Visual Insights**
  - **Spider chart** as the primary visualization.
  - Optional **heatmaps** for category-by-department scores.
  - Trend lines if running surveys over time.
- **Text Summaries**
  - AI-generated overview of:
    - Key strengths
    - Major challenges
    - Departmental discrepancies
    - Suggested next steps
- **Export Options**
  - PDF summaries.
  - Slide-ready images for presentations.
  - Data exports to Sheets, HubSpot, or APIs.

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

### Participants
- *As an employee*, I want to complete the survey quickly and easily on my phone, so I can share input without hassle.  
- *As a manager*, I want to trust the branding and simplicity, so I know it’s a legitimate internal tool.

### Admins (Inbound team)
- *As an admin*, I want to edit the question set, so I can tailor the tool to each client.  
- *As an admin*, I want to preview the survey before sharing, so I avoid mistakes.

### Strategists
- *As a strategist*, I want clear visuals and summaries, so I can present findings confidently in workshops.  
- *As a strategist*, I want to export data easily, so I can integrate it with HubSpot and our strategy decks.

### Developers
- *As a developer*, I want the tool to be modular and reusable, so we can launch future client surveys faster.

## 8. Creative Enhancements
- **Org Persona Card:** Generate an animated “profile” of the organization based on responses.  
- **Animated Radar:** Departments animate on the spider chart for instant comparison.  
- **AI Insights:** Summaries evolve over time as more data accumulates, enabling longitudinal analysis.

## 9. Next Steps
1. Finalize the **question set** and decide on **scoring method**.  
2. Prototype workshop scheduled for tomorrow at 12:00.  
3. Confirm **hosting setup** on Databutton post-credit reset.  
4. Begin development with MVP for internal testing before August ends.
