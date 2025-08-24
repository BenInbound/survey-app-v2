-- Survey Tool Database Schema for Supabase
-- Production database migration from localStorage

-- ========================================
-- 1. ORGANIZATIONAL ASSESSMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS organizational_assessments (
  id TEXT PRIMARY KEY,
  organization_name TEXT NOT NULL,
  consultant_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('collecting', 'ready', 'locked')),
  created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  locked_at TIMESTAMP WITH TIME ZONE,
  
  -- Legacy access control (single code)
  access_code TEXT NOT NULL,
  code_expiration TIMESTAMP WITH TIME ZONE,
  code_regenerated_at TIMESTAMP WITH TIME ZONE,
  
  -- Department configuration
  departments JSONB NOT NULL DEFAULT '[]',
  
  -- Assessment questions
  questions JSONB NOT NULL DEFAULT '[]',
  question_source JSONB DEFAULT '{}',
  
  -- Aggregated data
  management_responses JSONB DEFAULT '{}',
  employee_responses JSONB DEFAULT '{}',
  response_count JSONB DEFAULT '{"management": 0, "employee": 0}',
  department_data JSONB DEFAULT '[]',
  
  -- Privacy metadata (GDPR compliance)
  privacy_metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. PARTICIPANT RESPONSES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS participant_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT NOT NULL REFERENCES organizational_assessments(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('management', 'employee')),
  department TEXT NOT NULL,
  
  -- Survey session data
  survey_id TEXT NOT NULL,
  responses JSONB NOT NULL DEFAULT '[]',
  current_question_index INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Privacy metadata
  privacy_metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure uniqueness per assessment/participant
  UNIQUE(assessment_id, participant_id)
);

-- ========================================
-- 3. INDIVIDUAL SURVEYS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS surveys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  branding JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. INDIVIDUAL PARTICIPANT SESSIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS participant_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  department TEXT NOT NULL,
  responses JSONB NOT NULL DEFAULT '[]',
  current_question_index INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Privacy metadata
  privacy_metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure uniqueness per survey/participant
  UNIQUE(survey_id, participant_id)
);

-- ========================================
-- 5. QUESTION TEMPLATES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS question_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  strategic_focus TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. GDPR DATA PROCESSING RECORDS
-- ========================================
CREATE TABLE IF NOT EXISTS data_processing_records (
  id TEXT PRIMARY KEY,
  assessment_id TEXT REFERENCES organizational_assessments(id) ON DELETE CASCADE,
  purpose JSONB NOT NULL DEFAULT '[]',
  categories JSONB NOT NULL DEFAULT '[]',
  data_subjects JSONB NOT NULL DEFAULT '[]',
  recipients JSONB NOT NULL DEFAULT '[]',
  retention_period INTEGER NOT NULL,
  international_transfers BOOLEAN DEFAULT FALSE,
  safeguards JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE organizational_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_records ENABLE ROW LEVEL SECURITY;

-- Allow public read access to question templates (they are not sensitive)
CREATE POLICY "Question templates are publicly readable" ON question_templates
  FOR SELECT USING (true);

-- Allow public access to organizational assessments for survey access
CREATE POLICY "Public read access to organizational assessments" ON organizational_assessments
  FOR SELECT USING (true);

CREATE POLICY "Public insert access to organizational assessments" ON organizational_assessments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access to organizational assessments" ON organizational_assessments
  FOR UPDATE USING (true);

CREATE POLICY "Public delete access to organizational assessments" ON organizational_assessments
  FOR DELETE USING (true);

-- Allow public access to participant responses for survey functionality
CREATE POLICY "Public access to participant responses" ON participant_responses
  FOR ALL USING (true);

-- Allow public access to surveys and sessions
CREATE POLICY "Public access to surveys" ON surveys
  FOR ALL USING (true);

CREATE POLICY "Public access to participant sessions" ON participant_sessions
  FOR ALL USING (true);

-- Allow public access to GDPR records for compliance
CREATE POLICY "Public access to data processing records" ON data_processing_records
  FOR ALL USING (true);

-- ========================================
-- 8. INDEXES FOR PERFORMANCE
-- ========================================

-- Organizational assessments indexes
CREATE INDEX IF NOT EXISTS idx_org_assessments_status ON organizational_assessments(status);
CREATE INDEX IF NOT EXISTS idx_org_assessments_consultant ON organizational_assessments(consultant_id);
CREATE INDEX IF NOT EXISTS idx_org_assessments_created ON organizational_assessments(created);

-- Participant responses indexes
CREATE INDEX IF NOT EXISTS idx_participant_responses_assessment ON participant_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_participant_responses_role ON participant_responses(role);
CREATE INDEX IF NOT EXISTS idx_participant_responses_department ON participant_responses(department);

-- Participant sessions indexes
CREATE INDEX IF NOT EXISTS idx_participant_sessions_survey ON participant_sessions(survey_id);
CREATE INDEX IF NOT EXISTS idx_participant_sessions_completed ON participant_sessions(completed_at);

-- ========================================
-- 9. TRIGGERS FOR UPDATED_AT
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_organizational_assessments_updated_at BEFORE UPDATE ON organizational_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_participant_responses_updated_at BEFORE UPDATE ON participant_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_participant_sessions_updated_at BEFORE UPDATE ON participant_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_question_templates_updated_at BEFORE UPDATE ON question_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 10. INITIAL DATA POPULATION
-- ========================================

-- Insert default strategic focus templates
INSERT INTO question_templates (id, name, description, strategic_focus, questions, is_default) VALUES
('strategic-alignment', 'Strategic Alignment', 'Core strategic clarity and positioning questions', 'strategic-alignment', 
 '[
   {"id": "sa1", "text": "Our organization has a clear, well-communicated strategy", "category": "strategic-clarity", "order": 1},
   {"id": "sa2", "text": "I understand how my role contributes to our strategic objectives", "category": "strategic-clarity", "order": 2},
   {"id": "sa3", "text": "Our leadership team is aligned on strategic priorities", "category": "strategic-clarity", "order": 3},
   {"id": "sa4", "text": "We have a strong competitive position in our market", "category": "competitive-positioning", "order": 4},
   {"id": "sa5", "text": "Our value proposition clearly differentiates us from competitors", "category": "competitive-positioning", "order": 5},
   {"id": "sa6", "text": "We effectively anticipate and respond to market changes", "category": "competitive-positioning", "order": 6},
   {"id": "sa7", "text": "Our strategic decisions are based on solid market intelligence", "category": "strategic-execution", "order": 7},
   {"id": "sa8", "text": "We execute our strategy effectively across all departments", "category": "strategic-execution", "order": 8}
 ]', true),

('innovation-growth', 'Innovation & Growth', 'Market expansion and innovation capabilities', 'innovation-growth',
 '[
   {"id": "ig1", "text": "We consistently identify new market opportunities", "category": "market-expansion", "order": 1},
   {"id": "ig2", "text": "Our organization embraces calculated risk-taking", "category": "market-expansion", "order": 2},
   {"id": "ig3", "text": "We have effective processes for developing new products/services", "category": "innovation-capabilities", "order": 3},
   {"id": "ig4", "text": "Innovation is encouraged and supported at all levels", "category": "innovation-capabilities", "order": 4},
   {"id": "ig5", "text": "We invest adequately in research and development", "category": "innovation-capabilities", "order": 5},
   {"id": "ig6", "text": "Our growth strategy is sustainable and well-planned", "category": "growth-strategy", "order": 6},
   {"id": "ig7", "text": "We have the resources needed to support growth initiatives", "category": "growth-strategy", "order": 7},
   {"id": "ig8", "text": "Our market research informs strategic decisions effectively", "category": "market-intelligence", "order": 8},
   {"id": "ig9", "text": "We adapt quickly to changing customer needs", "category": "market-intelligence", "order": 9},
   {"id": "ig10", "text": "Our competitive intelligence drives strategic advantage", "category": "market-intelligence", "order": 10}
 ]', false);

-- Create demo organizational assessment
INSERT INTO organizational_assessments (
  id, organization_name, consultant_id, status, access_code,
  departments, questions, question_source,
  management_responses, employee_responses, response_count, department_data
) VALUES (
  'demo-org',
  'Stork Technologies',
  'demo@consultant.com',
  'ready',
  'DEMO-2025-STRATEGY',
  '[
    {"id": "ENG", "name": "Engineering", "managementCode": "DEMO-MGMT-ENG25", "employeeCode": "DEMO-EMP-ENG25"},
    {"id": "SAL", "name": "Sales", "managementCode": "DEMO-MGMT-SAL25", "employeeCode": "DEMO-EMP-SAL25"},
    {"id": "MKT", "name": "Marketing", "managementCode": "DEMO-MGMT-MKT25", "employeeCode": "DEMO-EMP-MKT25"},
    {"id": "OPS", "name": "Operations", "managementCode": "DEMO-MGMT-OPS25", "employeeCode": "DEMO-EMP-OPS25"}
  ]',
  '[
    {"id": "sa1", "text": "Our organization has a clear, well-communicated strategy", "category": "strategic-clarity", "order": 1},
    {"id": "sa2", "text": "I understand how my role contributes to our strategic objectives", "category": "strategic-clarity", "order": 2},
    {"id": "sa3", "text": "Our leadership team is aligned on strategic priorities", "category": "strategic-clarity", "order": 3},
    {"id": "sa4", "text": "We have a strong competitive position in our market", "category": "competitive-positioning", "order": 4},
    {"id": "sa5", "text": "Our value proposition clearly differentiates us from competitors", "category": "competitive-positioning", "order": 5},
    {"id": "sa6", "text": "We effectively anticipate and respond to market changes", "category": "competitive-positioning", "order": 6},
    {"id": "sa7", "text": "Our strategic decisions are based on solid market intelligence", "category": "strategic-execution", "order": 7},
    {"id": "sa8", "text": "We execute our strategy effectively across all departments", "category": "strategic-execution", "order": 8}
  ]',
  '{"source": "template", "templateId": "strategic-alignment"}',
  '{"categoryAverages": [{"category": "strategic-clarity", "average": 7.5, "responses": 6}, {"category": "competitive-positioning", "average": 8.2, "responses": 6}, {"category": "strategic-execution", "average": 6.8, "responses": 6}], "overallAverage": 7.5, "responseCount": 6}',
  '{"categoryAverages": [{"category": "strategic-clarity", "average": 6.2, "responses": 18}, {"category": "competitive-positioning", "average": 5.8, "responses": 18}, {"category": "strategic-execution", "average": 5.5, "responses": 18}], "overallAverage": 5.83, "responseCount": 18}',
  '{"management": 6, "employee": 18}',
  '[]'
) ON CONFLICT (id) DO NOTHING;