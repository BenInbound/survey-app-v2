import { createClient } from '@supabase/supabase-js'

// Create supabase client safely for both client and server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a safe client that can handle missing env variables during build
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Basic type definitions for our tables
export type Database = {
  public: {
    Tables: {
      organizational_assessments: {
        Row: {
          id: string
          organization_name: string
          consultant_id: string
          status: 'collecting' | 'ready' | 'locked'
          created: string
          locked_at: string | null
          access_code: string
          code_expiration: string | null
          code_regenerated_at: string | null
          departments: any[]
          questions: any[]
          question_source: any
          management_responses: any
          employee_responses: any
          response_count: any
          department_data: any[]
          privacy_metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_name: string
          consultant_id: string
          status?: 'collecting' | 'ready' | 'locked'
          created?: string
          locked_at?: string | null
          access_code: string
          code_expiration?: string | null
          code_regenerated_at?: string | null
          departments?: any[]
          questions?: any[]
          question_source?: any
          management_responses?: any
          employee_responses?: any
          response_count?: any
          department_data?: any[]
          privacy_metadata?: any
        }
        Update: {
          id?: string
          organization_name?: string
          consultant_id?: string
          status?: 'collecting' | 'ready' | 'locked'
          created?: string
          locked_at?: string | null
          access_code?: string
          code_expiration?: string | null
          code_regenerated_at?: string | null
          departments?: any[]
          questions?: any[]
          question_source?: any
          management_responses?: any
          employee_responses?: any
          response_count?: any
          department_data?: any[]
          privacy_metadata?: any
        }
      }
      participant_responses: {
        Row: {
          id: string
          assessment_id: string
          participant_id: string
          role: 'management' | 'employee'
          department: string
          survey_id: string
          responses: any[]
          current_question_index: number
          completed_at: string | null
          started_at: string
          privacy_metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          participant_id: string
          role: 'management' | 'employee'
          department: string
          survey_id: string
          responses?: any[]
          current_question_index?: number
          completed_at?: string | null
          started_at?: string
          privacy_metadata?: any
        }
        Update: {
          id?: string
          assessment_id?: string
          participant_id?: string
          role?: 'management' | 'employee'
          department?: string
          survey_id?: string
          responses?: any[]
          current_question_index?: number
          completed_at?: string | null
          started_at?: string
          privacy_metadata?: any
        }
      }
    }
  }
}