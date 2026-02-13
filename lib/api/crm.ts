import { supabase } from '@/lib/supabase';
import type { Contact, Communication, PipelineStage, FollowUp } from '@/lib/types/crm';

// ═══ CONTACTS ═══

export async function getContacts() {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Contact[];
}

export async function getContactsByStage(stage: PipelineStage) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('pipeline_stage', stage)
    .order('lead_score', { ascending: false });
  if (error) throw error;
  return data as Contact[];
}

export async function createContact(contact: Partial<Contact>) {
  const { data, error } = await supabase
    .from('contacts')
    .insert(contact)
    .select()
    .single();
  if (error) throw error;
  return data as Contact;
}

export async function updateContact(id: string, updates: Partial<Contact>) {
  const { data, error } = await supabase
    .from('contacts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Contact;
}

export async function updateContactStage(id: string, stage: PipelineStage) {
  return updateContact(id, { pipeline_stage: stage });
}

export async function searchContacts(query: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%,vehicle_interest.ilike.%${query}%`)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data as Contact[];
}

// ═══ COMMUNICATIONS ═══

export async function getContactCommunications(contactId: string) {
  const { data, error } = await supabase
    .from('communications')
    .select('*')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Communication[];
}

export async function createCommunication(comm: Partial<Communication>) {
  const { data, error } = await supabase
    .from('communications')
    .insert(comm)
    .select()
    .single();
  if (error) throw error;
  return data as Communication;
}

// ═══ FOLLOW-UPS ═══

export async function getPendingFollowUps() {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*, contacts(first_name, last_name, phone, pipeline_stage)')
    .eq('status', 'pending')
    .order('due_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createFollowUp(followUp: Partial<FollowUp>) {
  const { data, error } = await supabase
    .from('follow_ups')
    .insert(followUp)
    .select()
    .single();
  if (error) throw error;
  return data as FollowUp;
}

export async function completeFollowUp(id: string) {
  const { error } = await supabase
    .from('follow_ups')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// ═══ REAL-TIME ═══

export function subscribeToContacts(callback: (payload: any) => void) {
  return supabase
    .channel('contacts-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, callback)
    .subscribe();
}
