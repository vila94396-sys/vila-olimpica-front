import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://dtednbeqgqjbzgiqhedo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0ZWRuYmVxZ3FqYnpnaXFoZWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzM1MDAsImV4cCI6MjA4MTkwOTUwMH0.0W8ZcaWBUoZ_39kxLytpeM3zgfVFFgOLfr0xjTDlt5U";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});