// CRM Module Type Definitions

export type PipelineStage = 
  | 'lead'          // Initial contact
  | 'contacted'     // Reached out
  | 'qualified'     // Confirmed fit
  | 'proposal'      // Sent pricing
  | 'negotiation'   // Active deal
  | 'closed-won'    // Success!
  | 'closed-lost'   // Not now
  | 'nurture';      // Long-term follow-up

export type ContactSource = 
  | 'manual'
  | 'quo'
  | 'manychat'
  | 'referral'
  | 'cold-outbound'
  | 'website'
  | 'event';

export type ContactPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ContactStatus = 'active' | 'paused' | 'archived' | 'churned';

export type CommunicationType = 'sms' | 'call' | 'email' | 'note' | 'meeting' | 'voicemail';

export type CommunicationDirection = 'inbound' | 'outbound' | 'internal';

export type FollowUpType = 'call' | 'email' | 'sms' | 'meeting' | 'demo' | 'proposal' | 'check-in' | 'general';

export type FollowUpStatus = 'pending' | 'completed' | 'cancelled' | 'overdue';

export type TemplateType = 'sms' | 'email' | 'call-script';

export interface Contact {
  id: string;
  created_at: string;
  updated_at: string;
  
  // Basic Info
  first_name: string;
  last_name: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  
  // Dealership Info
  dealership_name: string;
  dealership_brand: string | null;
  dealership_location: string | null;
  title: string | null;
  
  // Pipeline
  stage: PipelineStage;
  source: ContactSource;
  
  // Scoring & Priority
  lead_score: number;
  priority: ContactPriority;
  status: ContactStatus;
  
  // Tags & Notes
  tags: string[];
  notes: string | null;
  metadata: Record<string, any>;
  
  // Relationships
  assigned_to: string | null;
  
  // Soft Delete
  deleted_at: string | null;
}

export interface Communication {
  id: string;
  created_at: string;
  
  // Relationships
  contact_id: string;
  created_by: string | null;
  
  // Type & Direction
  type: CommunicationType;
  direction: CommunicationDirection;
  
  // Content
  subject: string | null;
  body: string | null;
  
  // Metadata
  metadata: Record<string, any>;
  quo_message_id: string | null;
  external_id: string | null;
  
  // Status
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface PipelineHistory {
  id: string;
  created_at: string;
  
  contact_id: string;
  changed_by: string | null;
  
  from_stage: string;
  to_stage: string;
  
  reason: string | null;
  notes: string | null;
  metadata: Record<string, any>;
}

export interface FollowUp {
  id: string;
  created_at: string;
  updated_at: string;
  
  contact_id: string;
  assigned_to: string;
  created_by: string | null;
  
  title: string;
  description: string | null;
  
  due_date: string;
  completed_at: string | null;
  
  type: FollowUpType;
  priority: ContactPriority;
  status: FollowUpStatus;
}

export interface Sequence {
  id: string;
  created_at: string;
  updated_at: string;
  
  name: string;
  description: string | null;
  active: boolean;
  
  steps: SequenceStep[];
  trigger_stage: string | null;
  
  metadata: Record<string, any>;
  created_by: string | null;
}

export interface SequenceStep {
  day: number;
  type: 'sms' | 'email' | 'call';
  template_id: string;
}

export interface SequenceEnrollment {
  id: string;
  created_at: string;
  
  sequence_id: string;
  contact_id: string;
  enrolled_by: string | null;
  
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  current_step: number;
  started_at: string;
  completed_at: string | null;
  
  metadata: Record<string, any>;
}

export interface Template {
  id: string;
  created_at: string;
  updated_at: string;
  
  name: string;
  type: TemplateType;
  
  subject: string | null;
  body: string;
  
  category: string | null;
  tags: string[];
  
  use_count: number;
  last_used_at: string | null;
  
  created_by: string | null;
  is_shared: boolean;
}

// Pipeline View (from database view)
export interface PipelineContact extends Contact {
  assigned_name: string | null;
  last_contact_date: string | null;
  last_contact_type: CommunicationType | null;
  total_communications: number;
  pending_followups: number;
}

// Stage Configuration
export interface StageConfig {
  id: PipelineStage;
  label: string;
  color: string;
  description: string;
  order: number;
}

export const PIPELINE_STAGES: StageConfig[] = [
  {
    id: 'lead',
    label: 'Lead',
    color: '#8B8F96',
    description: 'Initial contact, not yet reached',
    order: 0
  },
  {
    id: 'contacted',
    label: 'Contacted',
    color: '#2D7FF9',
    description: 'Reached out, awaiting response',
    order: 1
  },
  {
    id: 'qualified',
    label: 'Qualified',
    color: '#5E5CE6',
    description: 'Confirmed fit, exploring solutions',
    order: 2
  },
  {
    id: 'proposal',
    label: 'Proposal',
    color: '#FF9500',
    description: 'Pricing sent, under review',
    order: 3
  },
  {
    id: 'negotiation',
    label: 'Negotiation',
    color: '#FF9500',
    description: 'Active deal discussions',
    order: 4
  },
  {
    id: 'closed-won',
    label: 'Closed Won',
    color: '#34C759',
    description: 'Deal won! 🎉',
    order: 5
  },
  {
    id: 'closed-lost',
    label: 'Closed Lost',
    color: '#FF3B30',
    description: 'Not moving forward',
    order: 6
  },
  {
    id: 'nurture',
    label: 'Nurture',
    color: '#8B8F96',
    description: 'Long-term follow-up',
    order: 7
  }
];

// Helper functions
export function getStageConfig(stage: PipelineStage): StageConfig {
  return PIPELINE_STAGES.find(s => s.id === stage) || PIPELINE_STAGES[0];
}

export function getStageColor(stage: PipelineStage): string {
  return getStageConfig(stage).color;
}

export function getStageLabel(stage: PipelineStage): string {
  return getStageConfig(stage).label;
}

// Priority colors
export const PRIORITY_COLORS = {
  low: '#8B8F96',
  medium: '#2D7FF9',
  high: '#FF9500',
  urgent: '#FF3B30'
};

// Communication icons
export const COMM_TYPE_ICONS = {
  sms: '💬',
  call: '📞',
  email: '📧',
  note: '📝',
  meeting: '🤝',
  voicemail: '🔊'
};
