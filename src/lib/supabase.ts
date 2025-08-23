import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.')
}

// Create a dummy client when credentials are missing to prevent initialization errors
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)

export type Database = {
  public: {
    Tables: {
      user_searches: {
        Row: {
          id: string
          user_id: string | null
          ip_address: string
          search_query: string
          search_type: 'ai_search' | 'product_quote'
          created_at: string
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          ip_address: string
          search_query: string
          search_type: 'ai_search' | 'product_quote'
          created_at?: string
          user_agent?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          ip_address?: string
          search_query?: string
          search_type?: 'ai_search' | 'product_quote'
          created_at?: string
          user_agent?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string | null
          phone: string | null
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email?: string | null
          phone?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string | null
          phone?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}