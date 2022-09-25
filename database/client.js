import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// exporting database client from supabase sdk and initializing it with URL & ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)