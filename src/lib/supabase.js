import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using mock mode.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Auth helpers
export const signInWithGitHub = async () => {
  if (!supabase) {
    console.warn('Supabase not configured - returning mock auth');
    return { data: null, error: new Error('Supabase not configured') };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      scopes: 'repo read:user',
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });

  return { data, error };
};

export const signOut = async () => {
  if (!supabase) return { error: null };
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  if (!supabase) return { data: { session: null }, error: null };
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

export const getUser = async () => {
  if (!supabase) return { data: { user: null }, error: null };
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
};

// Get GitHub access token from session
export const getGitHubToken = async () => {
  if (!supabase) return null;
  
  const { data: { session } } = await supabase.auth.getSession();
  return session?.provider_token || null;
};
