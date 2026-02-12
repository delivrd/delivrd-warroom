-- ============================================
-- DEFAULT SEQUENCES & NEW LEAD AUTO-RESPONSE
-- Migration: 003_default_sequences.sql
-- ============================================

-- Create default welcome SMS template
INSERT INTO templates (name, type, body, category, is_shared)
VALUES (
    'New Lead Welcome',
    'sms',
    'Hey {{first_name}}! Thanks for reaching out to Delivrd. Quick question — what vehicle are you looking at and when are you looking to buy?',
    'welcome',
    true
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Store template ID in a temporary variable for sequence creation
DO $$
DECLARE
    welcome_template_id UUID;
    followup_template_id UUID;
    checkin_template_id UUID;
    nurture_sequence_id UUID;
BEGIN
    -- Get welcome template ID
    SELECT id INTO welcome_template_id
    FROM templates
    WHERE name = 'New Lead Welcome'
    LIMIT 1;

    -- Get or create follow-up template
    INSERT INTO templates (name, type, body, category, is_shared)
    VALUES (
        'Follow-up Day 2',
        'sms',
        'Hi {{first_name}}, just wanted to check in - did you have any questions about vehicle options? Happy to help you find the perfect match! 🚗',
        'follow-up',
        true
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO followup_template_id;
    
    IF followup_template_id IS NULL THEN
        SELECT id INTO followup_template_id
        FROM templates
        WHERE name = 'Follow-up Day 2'
        LIMIT 1;
    END IF;

    -- Get or create check-in template
    INSERT INTO templates (name, type, body, category, is_shared)
    VALUES (
        'Check-in Day 5',
        'sms',
        'Hey {{first_name}}! Wanted to see if you''re still looking for a vehicle. We have some great deals this week. Let me know if I can help! 🙌',
        'check-in',
        true
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO checkin_template_id;
    
    IF checkin_template_id IS NULL THEN
        SELECT id INTO checkin_template_id
        FROM templates
        WHERE name = 'Check-in Day 5'
        LIMIT 1;
    END IF;

    -- Create default nurture sequence
    INSERT INTO sequences (name, description, active, steps, trigger_stage)
    VALUES (
        'Nurture - New Lead',
        'Automated follow-up sequence for new leads',
        true,
        jsonb_build_array(
            jsonb_build_object('day', 0, 'type', 'sms', 'template_id', welcome_template_id),
            jsonb_build_object('day', 2, 'type', 'sms', 'template_id', followup_template_id),
            jsonb_build_object('day', 5, 'type', 'sms', 'template_id', checkin_template_id)
        ),
        'lead'
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO nurture_sequence_id;

    RAISE NOTICE '✅ Default sequences created!';
    RAISE NOTICE '📋 Welcome template: %', welcome_template_id;
    RAISE NOTICE '📋 Follow-up template: %', followup_template_id;
    RAISE NOTICE '📋 Check-in template: %', checkin_template_id;
    RAISE NOTICE '🔄 Nurture sequence: %', nurture_sequence_id;
END $$;

-- ============================================
-- TRIGGER: Auto-enroll new leads in welcome sequence
-- ============================================

CREATE OR REPLACE FUNCTION auto_enroll_new_lead()
RETURNS TRIGGER AS $$
DECLARE
    sequence_id UUID;
BEGIN
    -- Only trigger for new leads from certain sources
    IF NEW.source IN ('manychat', 'quo', 'website', 'referral') THEN
        
        -- Find the default nurture sequence
        SELECT id INTO sequence_id
        FROM sequences
        WHERE name = 'Nurture - New Lead' AND active = true
        LIMIT 1;
        
        IF sequence_id IS NOT NULL THEN
            -- Enroll contact in sequence
            INSERT INTO sequence_enrollments (
                sequence_id,
                contact_id,
                status,
                current_step,
                metadata
            )
            VALUES (
                sequence_id,
                NEW.id,
                'active',
                0,
                jsonb_build_object(
                    'next_step_at', NOW(),
                    'enrolled_from', 'auto_new_lead',
                    'enrolled_at', NOW()
                )
            )
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Auto-enrolled contact % in nurture sequence', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on contacts table
DROP TRIGGER IF EXISTS auto_enroll_new_lead_trigger ON contacts;
CREATE TRIGGER auto_enroll_new_lead_trigger
    AFTER INSERT ON contacts
    FOR EACH ROW
    WHEN (NEW.deleted_at IS NULL AND NEW.stage = 'lead')
    EXECUTE FUNCTION auto_enroll_new_lead();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Default sequences and auto-enrollment configured!';
    RAISE NOTICE '🔄 New leads will automatically receive welcome SMS';
    RAISE NOTICE '📱 Sequence: Welcome → Day 2 follow-up → Day 5 check-in';
END $$;
