// CRM API Functions - Supabase Client Operations
import { supabase } from '@/lib/supabase';
import type { 
  Contact, 
  Communication, 
  PipelineHistory, 
  FollowUp, 
  PipelineContact,
  PipelineStage 
} from '@/lib/types/crm';

// ============================================
// CONTACTS
// ============================================

export async function getContacts() {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Contact[];
}

export async function getPipelineContacts() {
  const { data, error } = await supabase
    .from('pipeline_overview')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data as PipelineContact[];
}

export async function getContactsByStage(stage: PipelineStage) {
  const { data, error } = await supabase
    .from('pipeline_overview')
    .select('*')
    .eq('stage', stage)
    .order('lead_score', { ascending: false });
  
  if (error) throw error;
  return data as PipelineContact[];
}

export async function getContact(id: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();
  
  if (error) throw error;
  return data as Contact;
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
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Contact;
}

export async function deleteContact(id: string) {
  // Soft delete
  const { error } = await supabase
    .from('contacts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) throw error;
}

export async function updateContactStage(id: string, stage: PipelineStage) {
  return updateContact(id, { stage });
}

export async function searchContacts(query: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .is('deleted_at', null)
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,dealership_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data as Contact[];
}

// ============================================
// COMMUNICATIONS
// ============================================

export async function getContactCommunications(contactId: string) {
  const { data, error } = await supabase
    .from('communications')
    .select('*')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Communication[];
}

export async function createCommunication(communication: Partial<Communication>) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('communications')
    .insert({
      ...communication,
      created_by: user?.id
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Communication;
}

export async function getRecentCommunications(limit: number = 20) {
  const { data, error } = await supabase
    .from('communications')
    .select(`
      *,
      contacts (
        first_name,
        last_name,
        dealership_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

// ============================================
// PIPELINE HISTORY
// ============================================

export async function getContactHistory(contactId: string) {
  const { data, error } = await supabase
    .from('pipeline_history')
    .select('*')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as PipelineHistory[];
}

// ============================================
// FOLLOW-UPS
// ============================================

export async function getFollowUps() {
  const { data, error } = await supabase
    .from('follow_ups')
    .select(`
      *,
      contacts (
        first_name,
        last_name,
        dealership_name,
        stage
      )
    `)
    .in('status', ['pending', 'overdue'])
    .order('due_date', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function getContactFollowUps(contactId: string) {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*')
    .eq('contact_id', contactId)
    .order('due_date', { ascending: true });
  
  if (error) throw error;
  return data as FollowUp[];
}

export async function createFollowUp(followUp: Partial<FollowUp>) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('follow_ups')
    .insert({
      ...followUp,
      created_by: user?.id,
      assigned_to: followUp.assigned_to || user?.id
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as FollowUp;
}

export async function updateFollowUp(id: string, updates: Partial<FollowUp>) {
  const { data, error } = await supabase
    .from('follow_ups')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as FollowUp;
}

export async function completeFollowUp(id: string) {
  return updateFollowUp(id, {
    status: 'completed',
    completed_at: new Date().toISOString()
  });
}

export async function getUpcomingFollowUps(days: number = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  const { data, error } = await supabase
    .from('follow_ups')
    .select(`
      *,
      contacts (
        first_name,
        last_name,
        dealership_name
      )
    `)
    .eq('status', 'pending')
    .lte('due_date', futureDate.toISOString())
    .order('due_date', { ascending: true });
  
  if (error) throw error;
  return data;
}

// ============================================
// TEMPLATES
// ============================================

export async function getTemplates(type?: string) {
  let query = supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function getTemplate(id: string) {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createTemplate(template: any) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('templates')
    .insert({
      ...template,
      created_by: user?.id
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// STATS & ANALYTICS
// ============================================

export async function getPipelineStats() {
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('stage')
    .is('deleted_at', null);
  
  if (error) throw error;
  
  // Count by stage
  const stageCounts = contacts.reduce((acc, contact) => {
    acc[contact.stage] = (acc[contact.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return stageCounts;
}

export async function getActivityStats(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('communications')
    .select('type, created_at')
    .gte('created_at', startDate.toISOString());
  
  if (error) throw error;
  
  return data;
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export function subscribeToContacts(callback: (payload: any) => void) {
  return supabase
    .channel('contacts-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'contacts' },
      callback
    )
    .subscribe();
}

export function subscribeToContactCommunications(contactId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`communications-${contactId}`)
    .on('postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'communications',
        filter: `contact_id=eq.${contactId}`
      },
      callback
    )
    .subscribe();
}

// ============================================
// LEAD SCORING
// ============================================

/**
 * Calculate lead score for a contact (0-100)
 * 
 * Formula:
 * - Timeline: +25 (this month), +15 (1-3mo), +5 (3-6mo), 0 (6+mo)
 * - Budget: +20 ($75k+), +15 ($50-75k), +10 ($30-50k), +5 (<$30k)
 * - Source: +15 (referral), +10 (YouTube/TikTok Live), +5 (DM/form), +3 (phone)
 * - Engagement: +10 (has phone), +5 (responded <1hr), +5 (specific vehicle)
 * - Decay: -10 (7+ days no response), -20 (14+ days)
 */
export async function calculateLeadScore(contactId: string): Promise<number> {
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .is('deleted_at', null)
    .single();

  if (contactError || !contact) {
    console.error('[Lead Score] Contact not found:', contactId);
    return 0;
  }

  let score = 0;
  const metadata = contact.metadata || {};

  // ===== TIMELINE =====
  const timeline = metadata.timeline;
  if (timeline === 'this_month' || timeline === 'asap' || timeline === '0-1mo') {
    score += 25;
  } else if (timeline === '1-3mo') {
    score += 15;
  } else if (timeline === '3-6mo') {
    score += 5;
  }

  // ===== BUDGET =====
  const budget = metadata.budget;
  if (budget === '75k+' || budget === 'above_75k') {
    score += 20;
  } else if (budget === '50-75k' || budget === '50_75k') {
    score += 15;
  } else if (budget === '30-50k' || budget === '30_50k') {
    score += 10;
  } else if (budget === 'under_30k' || budget === 'below_30k') {
    score += 5;
  }

  // ===== SOURCE =====
  if (contact.source === 'referral') {
    score += 15;
  } else if (contact.source === 'manychat') {
    const manychatSource = metadata.manychat_source || '';
    if (manychatSource.includes('youtube') || manychatSource.includes('tiktok') || manychatSource.includes('live')) {
      score += 10;
    } else {
      score += 5;
    }
  } else if (contact.source === 'quo') {
    score += 3; // Phone inbound
  } else if (contact.source === 'website' || contact.source === 'cold-outbound') {
    score += 5;
  }

  // ===== ENGAGEMENT =====
  // Has phone number
  if (contact.phone) {
    score += 10;
  }

  // Has specific vehicle interest
  if (metadata.vehicle_interest) {
    score += 5;
  }

  // Check for quick response (responded <1hr from first contact)
  const { data: communications } = await supabase
    .from('communications')
    .select('created_at, direction')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: true })
    .limit(2);

  if (communications && communications.length >= 2) {
    const firstComm = communications[0];
    const secondComm = communications[1];
    
    // If first was outbound and second was inbound within 1 hour
    if (firstComm.direction === 'outbound' && secondComm.direction === 'inbound') {
      const timeDiff = new Date(secondComm.created_at).getTime() - new Date(firstComm.created_at).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff <= 1) {
        score += 5;
      }
    }
  }

  // ===== DECAY (inactivity penalty) =====
  const lastContactDate = metadata.last_contact_at || contact.updated_at;
  const daysSinceContact = Math.floor(
    (Date.now() - new Date(lastContactDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceContact >= 14) {
    score -= 20;
  } else if (daysSinceContact >= 7) {
    score -= 10;
  }

  // ===== STAGE BONUS =====
  // Contacts further in pipeline should maintain higher scores
  if (contact.stage === 'qualified') {
    score += 10;
  } else if (contact.stage === 'proposal' || contact.stage === 'negotiation') {
    score += 15;
  }

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  console.log('[Lead Score]', {
    contactId,
    name: contact.full_name || contact.first_name,
    score,
    timeline: metadata.timeline,
    budget: metadata.budget,
    source: contact.source,
    daysSinceContact,
  });

  return score;
}

/**
 * Recalculate lead scores for all active contacts
 * (Used by daily cron job)
 */
export async function recalculateAllLeadScores(): Promise<{ updated: number; errors: number }> {
  console.log('[Lead Score] Recalculating all active contacts...');
  
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('id')
    .is('deleted_at', null)
    .in('status', ['active', 'paused']);

  if (error || !contacts) {
    console.error('[Lead Score] Failed to fetch contacts:', error);
    return { updated: 0, errors: 1 };
  }

  let updated = 0;
  let errors = 0;

  for (const contact of contacts) {
    try {
      const score = await calculateLeadScore(contact.id);
      
      await supabase
        .from('contacts')
        .update({ 
          lead_score: score,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contact.id);
      
      updated++;
    } catch (error) {
      console.error('[Lead Score] Error calculating for', contact.id, error);
      errors++;
    }
  }

  console.log('[Lead Score] Recalculation complete:', { updated, errors });
  return { updated, errors };
}
