import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const isSupabaseConfigured = () => {
  return supabaseUrl && !supabaseUrl.includes('your-project-id') && supabaseKey && !supabaseKey.includes('your-anon-key');
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseKey)
  : null;

console.log(`[Supabase Status]: ${isSupabaseConfigured() ? 'Connected to ' + supabaseUrl : 'Using Local Data Mode (Configure SUPABASE_URL in .env to connect live DB)'}`);
