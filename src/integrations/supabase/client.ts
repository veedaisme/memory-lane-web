
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// IMPORTANT: These are public credentials that are safe to be in client-side code
// For production, it's recommended to use environment variables
const SUPABASE_URL = "https://xqotanwwbpqhbwvtxiyv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxb3Rhbnd3YnBxaGJ3dnR4aXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MzQ0NTksImV4cCI6MjA1NjUxMDQ1OX0.5yVA3aV-TF7zFsy0-qLukAXli34apv4poJbGCoLkdRM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
