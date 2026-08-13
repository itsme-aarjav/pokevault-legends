/**
 * Supabase client helper supporting both ES module imports and browser UMD window fallbacks
 */

const getEnvVar = (key, viteKey) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey || key]) {
    return import.meta.env[viteKey || key];
  }
  return '';
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL') || 'https://ztrgazrciuyyxoxxfjou.supabase.co';
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0cmdhenJjaXV5eXhveHhmam91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MzUzODEsImV4cCI6MjEwMTMxMTM4MX0.P3NHOqz8G-iWZTKjO6PBrO0jJRc9Cl5vdyop976R9ik';

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    !supabaseUrl.includes('your-project-id') &&
    Boolean(supabaseAnonKey) &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

let clientInstance = null;
if (isSupabaseConfigured()) {
  try {
    if (typeof window !== 'undefined' && window.supabase?.createClient) {
      clientInstance = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    }
  } catch (e) {
    console.warn('Supabase client init warning:', e);
  }
}

export const supabase = clientInstance;

/**
 * Fetch Hype Drop Lock-State Settings from Supabase DB or Local Fallback
 */
export async function getStoreSettings() {
  if (!supabase) {
    return {
      is_hype_drop_active: false,
      drop_password: 'POKEVAULTVIP',
      drop_timestamp: new Date(Date.now() + 86400000 * 3).toISOString(),
      opt_in_count: 342
    };
  }

  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) {
      return {
        is_hype_drop_active: false,
        drop_password: 'POKEVAULTVIP',
        drop_timestamp: new Date(Date.now() + 86400000 * 3).toISOString(),
        opt_in_count: 342
      };
    }
    return data;
  } catch (err) {
    console.warn('Error reading store_settings from Supabase:', err);
    return {
      is_hype_drop_active: false,
      drop_password: 'POKEVAULTVIP',
      drop_timestamp: new Date(Date.now() + 86400000 * 3).toISOString(),
      opt_in_count: 342
    };
  }
}
