// Database Types for Delivrd War Room

export type Tier = 'now' | 'soon' | 'later' | 'monitor';
export type Impact = 'C' | 'H' | 'M' | 'L'; // Critical, High, Medium, Low
export type Effort = 'L' | 'M' | 'H'; // Low, Medium, High
export type Owner = 't' | 's' | 'b' | 'a' | 'n'; // Tomi, Schalaschly, Both, Assign, None
export type BattleStatus = 'not_started' | 'in_progress' | 'blocked' | 'done' | 'deferred';
export type SprintStatus = 'active' | 'completed' | 'planned';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Zone = 'TIER1' | 'TIER2' | 'TIER3' | 'INFRASTRUCTURE';

export interface Profile {
  id: string;
  name: string;
  role: string;
  created_at: string;
}

export interface Battle {
  id: number;
  name: string;
  category: string;
  tier: Tier;
  impact: Impact;
  effort: Effort;
  owner: Owner;
  description?: string;
  why_this_tier?: string;
  next_action?: string;
  ai_play?: string;
  success_metric?: string;
  created_at: string;
  updated_at: string;
}

export interface Sprint {
  id: string;
  name: string;
  subtitle?: string;
  weeks?: string;
  goal?: string;
  success_metric?: string;
  status: SprintStatus;
  sort_order: number;
  created_at: string;
}

export interface SprintBattle {
  id: number;
  sprint_id: string;
  battle_id: number;
  status: BattleStatus;
  priority: number;
  owner: Owner;
  time_estimate?: string;
  description?: string;
  deliverable?: string;
  steps: string[];
  ai_lever?: string;
  blockers?: string;
  metric?: string;
  notes?: string;
  updated_at: string;
  updated_by?: string;
  // Joined data
  battle?: Battle;
}

export interface ActivityLog {
  id: number;
  user_id?: string;
  entity_type: string;
  entity_id: string;
  action: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export interface Front {
  id: string;
  name: string;
  zone: Zone;
  priority: Priority;
  status: string;
  current_state?: string;
  target_state?: string;
  conversion_path?: string;
  sort_order: number;
}

export interface FrontBattle {
  front_id: string;
  battle_id: number;
}

// Display helpers
export const OWNER_LABELS: Record<Owner, string> = {
  t: 'Tomi',
  s: 'Schalaschly',
  b: 'Both',
  a: 'Assign',
  n: 'None'
};

export const IMPACT_LABELS: Record<Impact, string> = {
  C: 'Critical',
  H: 'High',
  M: 'Medium',
  L: 'Low'
};

export const EFFORT_LABELS: Record<Effort, string> = {
  L: 'Low',
  M: 'Medium',
  H: 'High'
};

export const TIER_LABELS: Record<Tier, string> = {
  now: 'Now',
  soon: 'Soon',
  later: 'Later',
  monitor: 'Monitor'
};

export const STATUS_LABELS: Record<BattleStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
  deferred: 'Deferred'
};
