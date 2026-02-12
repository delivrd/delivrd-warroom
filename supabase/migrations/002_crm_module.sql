-- ============================================
-- DELIVRD CRM MODULE - DATABASE SCHEMA
-- Migration: 002_crm_module.sql
-- ============================================

-- ============================================
-- CONTACTS TABLE
-- Core dealer contact information
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Basic Info
    first_name TEXT NOT NULL,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN last_name IS NOT NULL THEN first_name || ' ' || last_name
            ELSE first_name
        END
    ) STORED,
    email TEXT,
    phone TEXT,
    
    -- Dealership Info
    dealership_name TEXT NOT NULL,
    dealership_brand TEXT, -- Honda, Toyota, Ford, etc.
    dealership_location TEXT, -- City, State
    title TEXT, -- General Manager, Sales Manager, etc.
    
    -- Pipeline Stage
    stage TEXT NOT NULL DEFAULT 'lead',
    CONSTRAINT valid_stage CHECK (stage IN (
        'lead',           -- Initial contact
        'contacted',      -- Reached out
        'qualified',      -- Confirmed fit
        'proposal',       -- Sent pricing
        'negotiation',    -- Active deal
        'closed-won',     -- Success!
        'closed-lost',    -- Not now
        'nurture'         -- Long-term follow-up
    )),
    
    -- Lead Source
    source TEXT DEFAULT 'manual',
    CONSTRAINT valid_source CHECK (source IN (
        'manual',         -- Manually added
        'quo',            -- Quo inbound message
        'manychat',       -- ManyChat automation
        'referral',       -- Existing dealer referral
        'cold-outbound',  -- First-to-call campaign
        'website',        -- Website inquiry
        'event'           -- Conference/trade show
    )),
    
    -- Scoring & Priority
    lead_score INTEGER DEFAULT 0, -- 0-100, auto-calculated
    priority TEXT DEFAULT 'medium',
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Status
    status TEXT DEFAULT 'active',
    CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'archived', 'churned')),
    
    -- Tags (JSONB for flexibility)
    tags TEXT[] DEFAULT '{}',
    
    -- Custom Fields
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Relationships
    assigned_to UUID REFERENCES profiles(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ
);

-- ============================================
-- COMMUNICATIONS TABLE
-- All interactions with contacts (SMS, email, calls, notes)
-- ============================================
CREATE TABLE IF NOT EXISTS communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Relationships
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    
    -- Communication Type
    type TEXT NOT NULL,
    CONSTRAINT valid_comm_type CHECK (type IN (
        'sms',           -- Quo/OpenPhone SMS
        'call',          -- Phone call
        'email',         -- Email
        'note',          -- Internal note
        'meeting',       -- Meeting/demo
        'voicemail'      -- Voicemail left/received
    )),
    
    -- Direction
    direction TEXT NOT NULL,
    CONSTRAINT valid_direction CHECK (direction IN ('inbound', 'outbound', 'internal')),
    
    -- Content
    subject TEXT,        -- For emails/meetings
    body TEXT,           -- Message content
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb, -- Phone numbers, email addresses, duration, etc.
    
    -- External IDs
    quo_message_id TEXT, -- Link to Quo system
    external_id TEXT,    -- Generic external reference
    
    -- Status
    status TEXT DEFAULT 'sent',
    CONSTRAINT valid_comm_status CHECK (status IN ('draft', 'sent', 'delivered', 'read', 'failed'))
);

-- ============================================
-- PIPELINE_HISTORY TABLE
-- Track stage changes and deal progression
-- ============================================
CREATE TABLE IF NOT EXISTS pipeline_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Relationships
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES profiles(id),
    
    -- Stage Change
    from_stage TEXT NOT NULL,
    to_stage TEXT NOT NULL,
    
    -- Context
    reason TEXT,         -- Why moved (e.g., "Not interested", "Budget approved")
    notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- FOLLOW_UPS TABLE
-- Scheduled tasks and reminders
-- ============================================
CREATE TABLE IF NOT EXISTS follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Relationships
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES profiles(id),
    created_by UUID REFERENCES profiles(id),
    
    -- Task Details
    title TEXT NOT NULL,
    description TEXT,
    
    -- Timing
    due_date TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    
    -- Type
    type TEXT DEFAULT 'general',
    CONSTRAINT valid_followup_type CHECK (type IN (
        'call',
        'email',
        'sms',
        'meeting',
        'demo',
        'proposal',
        'check-in',
        'general'
    )),
    
    -- Priority
    priority TEXT DEFAULT 'medium',
    CONSTRAINT valid_followup_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Status
    status TEXT DEFAULT 'pending',
    CONSTRAINT valid_followup_status CHECK (status IN ('pending', 'completed', 'cancelled', 'overdue'))
);

-- ============================================
-- SEQUENCES TABLE
-- Automated follow-up campaigns
-- ============================================
CREATE TABLE IF NOT EXISTS sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Sequence Info
    name TEXT NOT NULL,
    description TEXT,
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    
    -- Steps (JSONB array of steps)
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Format: [{ "day": 0, "type": "sms", "template_id": "uuid" }, ...]
    
    -- Trigger Conditions
    trigger_stage TEXT, -- Auto-enroll when contact enters this stage
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Ownership
    created_by UUID REFERENCES profiles(id)
);

-- ============================================
-- SEQUENCE_ENROLLMENTS TABLE
-- Track contacts in sequences
-- ============================================
CREATE TABLE IF NOT EXISTS sequence_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Relationships
    sequence_id UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    enrolled_by UUID REFERENCES profiles(id),
    
    -- Status
    status TEXT DEFAULT 'active',
    CONSTRAINT valid_enrollment_status CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    
    -- Progression
    current_step INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Uniqueness
    UNIQUE(sequence_id, contact_id)
);

-- ============================================
-- TEMPLATES TABLE
-- Reusable message templates
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Template Info
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    CONSTRAINT valid_template_type CHECK (type IN ('sms', 'email', 'call-script')),
    
    -- Content
    subject TEXT,        -- For emails
    body TEXT NOT NULL,  -- Supports {{variables}}
    
    -- Metadata
    category TEXT,       -- "follow-up", "intro", "proposal", etc.
    tags TEXT[] DEFAULT '{}',
    
    -- Usage Stats
    use_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Ownership
    created_by UUID REFERENCES profiles(id),
    is_shared BOOLEAN DEFAULT TRUE -- Available to all users
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Contacts
CREATE INDEX idx_contacts_stage ON contacts(stage) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_assigned ON contacts(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_dealership ON contacts(dealership_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_phone ON contacts(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_email ON contacts(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_lead_score ON contacts(lead_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_created ON contacts(created_at DESC);
CREATE INDEX idx_contacts_updated ON contacts(updated_at DESC);

-- Communications
CREATE INDEX idx_communications_contact ON communications(contact_id, created_at DESC);
CREATE INDEX idx_communications_type ON communications(type, created_at DESC);
CREATE INDEX idx_communications_created ON communications(created_at DESC);
CREATE INDEX idx_communications_quo_id ON communications(quo_message_id) WHERE quo_message_id IS NOT NULL;

-- Pipeline History
CREATE INDEX idx_pipeline_history_contact ON pipeline_history(contact_id, created_at DESC);
CREATE INDEX idx_pipeline_history_stage ON pipeline_history(to_stage, created_at DESC);

-- Follow-ups
CREATE INDEX idx_followups_contact ON follow_ups(contact_id, due_date);
CREATE INDEX idx_followups_assigned ON follow_ups(assigned_to, status, due_date);
CREATE INDEX idx_followups_due ON follow_ups(due_date) WHERE status = 'pending';
CREATE INDEX idx_followups_overdue ON follow_ups(due_date) WHERE status = 'pending' AND due_date < NOW();

-- Sequence Enrollments
CREATE INDEX idx_enrollments_sequence ON sequence_enrollments(sequence_id, status);
CREATE INDEX idx_enrollments_contact ON sequence_enrollments(contact_id, status);

-- Templates
CREATE INDEX idx_templates_type ON templates(type, created_at DESC);
CREATE INDEX idx_templates_category ON templates(category) WHERE category IS NOT NULL;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Contacts: All authenticated users can read/write
CREATE POLICY "Authenticated users can view all contacts"
    ON contacts FOR SELECT
    TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert contacts"
    ON contacts FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update contacts"
    ON contacts FOR UPDATE
    TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can soft delete contacts"
    ON contacts FOR UPDATE
    TO authenticated
    USING (true);

-- Communications: All authenticated users can view/create
CREATE POLICY "Authenticated users can view all communications"
    ON communications FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create communications"
    ON communications FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Pipeline History: Read-only for all, system writes
CREATE POLICY "Authenticated users can view pipeline history"
    ON pipeline_history FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create pipeline history"
    ON pipeline_history FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Follow-ups: Full access for authenticated users
CREATE POLICY "Authenticated users can manage follow-ups"
    ON follow_ups FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Sequences: Full access for authenticated users
CREATE POLICY "Authenticated users can manage sequences"
    ON sequences FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Sequence Enrollments: Full access for authenticated users
CREATE POLICY "Authenticated users can manage enrollments"
    ON sequence_enrollments FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Templates: Full access for authenticated users
CREATE POLICY "Authenticated users can manage templates"
    ON templates FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER follow_ups_updated_at
    BEFORE UPDATE ON follow_ups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sequences_updated_at
    BEFORE UPDATE ON sequences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Auto-create pipeline history on stage change
CREATE OR REPLACE FUNCTION track_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.stage IS DISTINCT FROM NEW.stage THEN
        INSERT INTO pipeline_history (contact_id, from_stage, to_stage, changed_by)
        VALUES (NEW.id, OLD.stage, NEW.stage, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contacts_stage_change
    AFTER UPDATE ON contacts
    FOR EACH ROW
    WHEN (OLD.stage IS DISTINCT FROM NEW.stage)
    EXECUTE FUNCTION track_stage_change();

-- Auto-update follow-up status when overdue
CREATE OR REPLACE FUNCTION check_followup_overdue()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending' AND NEW.due_date < NOW() THEN
        NEW.status = 'overdue';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER follow_ups_check_overdue
    BEFORE INSERT OR UPDATE ON follow_ups
    FOR EACH ROW
    EXECUTE FUNCTION check_followup_overdue();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Active pipeline view with latest communication
CREATE OR REPLACE VIEW pipeline_overview AS
SELECT 
    c.*,
    p.name as assigned_name,
    (
        SELECT created_at 
        FROM communications 
        WHERE contact_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) as last_contact_date,
    (
        SELECT type 
        FROM communications 
        WHERE contact_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) as last_contact_type,
    (
        SELECT COUNT(*) 
        FROM communications 
        WHERE contact_id = c.id
    ) as total_communications,
    (
        SELECT COUNT(*) 
        FROM follow_ups 
        WHERE contact_id = c.id AND status = 'pending'
    ) as pending_followups
FROM contacts c
LEFT JOIN profiles p ON c.assigned_to = p.id
WHERE c.deleted_at IS NULL;

-- ============================================
-- SEED DATA (Sample Templates)
-- ============================================

INSERT INTO templates (name, type, subject, body, category) VALUES
('Initial Outreach - SMS', 'sms', NULL, 
'Hey {{first_name}}! This is {{sender_name}} from Delivrd. We help dealerships like {{dealership_name}} get more leads through TikTok & Instagram. Got 2 min for a quick intro? 📲', 
'intro'),

('Follow-up - SMS', 'sms', NULL,
'Hi {{first_name}}, just following up on my message from {{days_ago}} days ago. Would love to show you what we''re doing for {{similar_dealer}}. When works for a quick chat?',
'follow-up'),

('Proposal Sent - Email', 'email', 'Delivrd Partnership Proposal for {{dealership_name}}',
'Hi {{first_name}},

Great chatting with you earlier! Attached is the custom proposal we discussed for {{dealership_name}}.

Key highlights:
- 🎯 {{benefit_1}}
- 📈 {{benefit_2}}
- 💰 {{benefit_3}}

Let''s schedule a 15-min call this week to walk through it. What day works best?

Best,
{{sender_name}}',
'proposal'),

('Check-in - SMS', 'sms', NULL,
'Hey {{first_name}}! Wanted to check in - how''s Q1 going for {{dealership_name}}? Our other dealers are seeing {{metric}}. Let me know if you want to see some examples! 🚀',
'check-in'),

('Demo Reminder - SMS', 'sms', NULL,
'Hi {{first_name}}! Reminder: we have our demo scheduled for {{demo_time}} today. I''ll call you at {{phone}}. Looking forward to it! 📞',
'reminder');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ CRM Module schema created successfully!';
    RAISE NOTICE '📊 Tables: contacts, communications, pipeline_history, follow_ups, sequences, sequence_enrollments, templates';
    RAISE NOTICE '🔒 RLS enabled on all tables';
    RAISE NOTICE '⚡ Indexes created for performance';
    RAISE NOTICE '🤖 Triggers configured for automation';
    RAISE NOTICE '📋 Sample templates seeded';
END $$;
