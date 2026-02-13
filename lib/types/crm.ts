// CRM Types - matches actual Supabase schema

export type PipelineStage =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost'
  | 'nurture';

export type ContactSource = 'manual' | 'quo' | 'manychat' | 'referral' | 'tiktok' | 'instagram' | 'youtube' | 'website';

export interface Contact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  source: ContactSource;
  source_detail: string | null;
  vehicle_interest: string | null;
  vehicle_make: string | null;
  timeline: string | null;
  budget_range: string | null;
  lead_score: number;
  pipeline_stage: PipelineStage;
  assigned_to: string | null;
  notes: string | null;
  tags: string[];
  manychat_id: string | null;
  quo_contact_id: string | null;
  created_at: string;
  updated_at: string;
  last_contact_at: string | null;
  next_follow_up: string | null;
  lost_reason: string | null;
  closed_deal_value: number | null;
  savings_amount: number | null;
  draft_subject: string | null;
  draft_email: string | null;
  draft_sms: string | null;
}

export interface Communication {
  id: string;
  contact_id: string;
  type: 'sms' | 'call' | 'email' | 'note' | 'voicemail';
  direction: 'inbound' | 'outbound' | 'internal';
  content: string | null;
  quo_message_id: string | null;
  duration_seconds: number | null;
  status: string | null;
  sent_by: string | null;
  created_at: string;
}

export interface FollowUp {
  id: string;
  contact_id: string;
  assigned_to: string | null;
  due_at: string;
  type: 'manual' | 'sequence' | 'auto';
  message_template: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  completed_at: string | null;
  created_at: string;
}

export interface PipelineHistory {
  id: number;
  contact_id: string;
  from_stage: string | null;
  to_stage: string;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

export const PIPELINE_STAGES: { id: PipelineStage; label: string; color: string }[] = [
  { id: 'new', label: 'New Lead', color: '#9DA3AE' },
  { id: 'contacted', label: 'Contacted', color: '#5A9CF5' },
  { id: 'qualified', label: 'Qualified', color: '#B07CFF' },
  { id: 'proposal', label: 'Proposal', color: '#FFB340' },
  { id: 'negotiation', label: 'Negotiation', color: '#FF8C40' },
  { id: 'closed_won', label: 'Won', color: '#2DD881' },
  { id: 'closed_lost', label: 'Lost', color: '#FF5C5C' },
  { id: 'nurture', label: 'Nurture', color: '#606878' },
];

export function getStageConfig(stage: PipelineStage) {
  return PIPELINE_STAGES.find(s => s.id === stage) || PIPELINE_STAGES[0];
}
