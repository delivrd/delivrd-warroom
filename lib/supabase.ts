// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Create client (placeholder values allow build to complete; real values needed at runtime)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
