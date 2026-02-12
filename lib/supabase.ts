// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client (will fail at runtime if env vars missing, but allows build to complete)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Helper to check if user is authenticated
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper to sign in
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// Helper to sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
