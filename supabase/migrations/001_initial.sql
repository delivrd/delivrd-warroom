-- Delivrd War Room - Initial Schema
-- Run this in Supabase SQL Editor after project creation

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Battle Library: All 95 channels
CREATE TABLE battles (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'later', -- now, soon, later, monitor
  impact TEXT NOT NULL, -- C, H, M, L
  effort TEXT NOT NULL, -- L, M, H
  owner TEXT NOT NULL DEFAULT 'n', -- t, s, b, a, n
  description TEXT,
  why_this_tier TEXT,
  next_action TEXT,
  ai_play TEXT,
  success_metric TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sprints
CREATE TABLE sprints (
  id TEXT PRIMARY KEY, -- sprint-1, sprint-2, etc
  name TEXT NOT NULL,
  subtitle TEXT,
  weeks TEXT,
  goal TEXT,
  success_metric TEXT,
  status TEXT DEFAULT 'active', -- active, completed, planned
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sprint Battles: Links battles to sprints with execution details
CREATE TABLE sprint_battles (
  id SERIAL PRIMARY KEY,
  sprint_id TEXT REFERENCES sprints(id),
  battle_id INTEGER REFERENCES battles(id),
  status TEXT DEFAULT 'not_started', -- not_started, in_progress, blocked, done, deferred
  priority INTEGER DEFAULT 0, -- order within sprint
  owner TEXT DEFAULT 'n', -- can override battle-level owner
  time_estimate TEXT,
  description TEXT, -- sprint-specific description
  deliverable TEXT,
  steps JSONB DEFAULT '[]', -- array of step strings
  ai_lever TEXT,
  blockers TEXT,
  metric TEXT,
  notes TEXT, -- free-form notes field
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users,
  UNIQUE(sprint_id, battle_id)
);

-- Activity Log: Track who changed what
CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  entity_type TEXT NOT NULL, -- battle, sprint_battle, sprint
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL, -- status_change, tier_change, note_added, etc
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Battle Fronts: Grouping for Battle Map view
CREATE TABLE fronts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  zone TEXT NOT NULL, -- TIER1, TIER2, TIER3, INFRASTRUCTURE
  priority TEXT NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
  status TEXT NOT NULL,
  current_state TEXT,
  target_state TEXT,
  conversion_path TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Front-Battle mapping (which battles belong to which front)
CREATE TABLE front_battles (
  front_id TEXT REFERENCES fronts(id),
  battle_id INTEGER REFERENCES battles(id),
  PRIMARY KEY(front_id, battle_id)
);

-- Enable Row-Level Security
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE fronts ENABLE ROW LEVEL SECURITY;
ALTER TABLE front_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Authenticated users can do everything
CREATE POLICY "Authenticated users full access" ON battles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON sprints FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON sprint_battles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON activity_log FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON fronts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON front_battles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON profiles FOR ALL USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX idx_battles_tier ON battles(tier);
CREATE INDEX idx_battles_category ON battles(category);
CREATE INDEX idx_sprint_battles_sprint ON sprint_battles(sprint_id);
CREATE INDEX idx_sprint_battles_status ON sprint_battles(status);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_front_battles_front ON front_battles(front_id);
