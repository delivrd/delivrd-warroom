-- ============================================
-- FIX CRM DATA - Replace Dealers with Customer Leads
-- Run this in Supabase SQL Editor
-- ============================================

BEGIN;

-- Step 1: Delete all existing contacts
DELETE FROM contacts WHERE deleted_at IS NULL;

-- Step 2: Insert realistic customer leads for Delivrd's car concierge service
-- These are car BUYERS, not dealers

-- LEAD stage (new inquiries) - 2 leads
INSERT INTO contacts (
  first_name, last_name, email, phone,
  dealership_name, dealership_brand, dealership_location, title,
  stage, source, priority, status, lead_score,
  tags, notes, metadata
) VALUES
(
  'John', 'Smith', 'john.smith@gmail.com', '+1 (415) 234-5678',
  'Individual Customer', NULL, 'San Francisco, CA', NULL,
  'lead', 'manychat', 'medium', 'active', 65,
  ARRAY['2025 Honda CR-V', 'first-time-buyer', 'tiktok'],
  'Interested in finding the best deal on a 2025 Honda CR-V in the Bay Area. Saw our TikTok about dealer concierge services.',
  '{"vehicle_interest": "2025 Honda CR-V EX", "budget": "$35,000", "timeline": "2-3 weeks", "trade_in": false, "lead_source_detail": "TikTok comment"}'::jsonb
),
(
  'Sarah', 'Johnson', 'sjohnson@yahoo.com', '+1 (510) 987-6543',
  'Individual Customer', NULL, 'Oakland, CA', NULL,
  'lead', 'manychat', 'high', 'active', 72,
  ARRAY['2024 Toyota RAV4', 'urgent', 'instagram'],
  'Lease ending in 3 weeks. Looking for 2024 Toyota RAV4 Hybrid. Needs fast turnaround.',
  '{"vehicle_interest": "2024 Toyota RAV4 Hybrid XLE", "budget": "$40,000", "timeline": "1-2 weeks", "trade_in": true, "trade_in_vehicle": "2021 RAV4", "lead_source_detail": "Instagram DM"}'::jsonb
),

-- CONTACTED stage - 2 leads
(
  'Mike', 'Rodriguez', 'mike.r@outlook.com', '+1 (408) 555-1234',
  'Individual Customer', NULL, 'San Jose, CA', NULL,
  'contacted', 'website', 'medium', 'active', 68,
  ARRAY['2025 Tesla Model Y', 'tech-savvy', 'ev-buyer'],
  'Filled out inquiry form on website. Looking for best price on Tesla Model Y. Open to EV incentives.',
  '{"vehicle_interest": "2025 Tesla Model Y Long Range", "budget": "$52,000", "timeline": "3-4 weeks", "trade_in": false}'::jsonb
),
(
  'Emily', 'Chen', 'emily.chen@icloud.com', '+1 (650) 321-7890',
  'Individual Customer', NULL, 'Palo Alto, CA', NULL,
  'contacted', 'referral', 'high', 'active', 78,
  ARRAY['2025 BMW X5', 'high-budget', 'referral', 'luxury'],
  'Referred by previous client David Wu. Looking for luxury SUV with custom options. Price not a major concern.',
  '{"vehicle_interest": "2025 BMW X5 xDrive40i M Sport", "budget": "$75,000+", "timeline": "4-6 weeks", "trade_in": true, "trade_in_vehicle": "2020 BMW X3", "referred_by": "David Wu"}'::jsonb
),

-- QUALIFIED stage (consultation booked) - 2 leads
(
  'David', 'Martinez', 'dmartinez@gmail.com', '+1 (925) 444-5555',
  'Individual Customer', NULL, 'Walnut Creek, CA', NULL,
  'qualified', 'manychat', 'high', 'active', 82,
  ARRAY['2025 Ford F-150', 'business-use', 'qualified', 'tiktok'],
  'Consultation booked for Feb 15 at 2pm. Business owner needing work truck. Ready to buy, comparing lease vs finance options.',
  '{"vehicle_interest": "2025 Ford F-150 Lariat 4WD", "budget": "$60,000", "timeline": "1-2 weeks", "trade_in": false, "business_purchase": true, "consult_date": "2026-02-15T14:00:00"}'::jsonb
),
(
  'Jessica', 'Kim', 'jessica.kim@gmail.com', '+1 (669) 777-8888',
  'Individual Customer', NULL, 'Sunnyvale, CA', NULL,
  'qualified', 'manychat', 'medium', 'active', 75,
  ARRAY['2025 Mazda CX-5', 'family-vehicle', 'instagram'],
  'Consultation booked for Feb 14 at 10am. Growing family needs reliable SUV. Likes Mazda''s safety features.',
  '{"vehicle_interest": "2025 Mazda CX-5 Grand Touring", "budget": "$38,000", "timeline": "2-3 weeks", "trade_in": true, "trade_in_vehicle": "2018 Honda Civic", "family_size": 4, "consult_date": "2026-02-14T10:00:00"}'::jsonb
),

-- PROPOSAL stage (consultation done, proposals sent) - 3 leads
(
  'Robert', 'Taylor', 'rtaylor@me.com', '+1 (831) 999-0000',
  'Individual Customer', NULL, 'Santa Cruz, CA', NULL,
  'proposal', 'website', 'high', 'active', 85,
  ARRAY['2025 Subaru Outback', 'outdoor-enthusiast', 'proposal-sent'],
  'Consultation completed Feb 10. Proposal sent for Outback Wilderness at Santa Cruz dealer. Test drives arranged at 3 dealers.',
  '{"vehicle_interest": "2025 Subaru Outback Wilderness", "budget": "$45,000", "timeline": "2 weeks", "trade_in": true, "trade_in_vehicle": "2017 Outback", "consult_date": "2026-02-10T14:00:00", "proposal_sent": "2026-02-11T10:00:00"}'::jsonb
),
(
  'Amanda', 'Foster', 'afoster@proton.me', '+1 (707) 111-2222',
  'Individual Customer', NULL, 'Napa, CA', NULL,
  'proposal', 'referral', 'medium', 'active', 79,
  ARRAY['2024 Lexus RX', 'luxury-seeker', 'proposal-sent'],
  'Consultation completed Feb 9. Comparing Lexus RX vs Acura MDX. Sent proposals for both vehicles from dealers in Walnut Creek.',
  '{"vehicle_interest": "2024 Lexus RX 350 F Sport", "budget": "$55,000", "timeline": "3 weeks", "trade_in": false, "consult_date": "2026-02-09T10:00:00", "proposal_sent": "2026-02-10T15:00:00", "comparing": "Lexus RX vs Acura MDX"}'::jsonb
),
(
  'Marcus', 'Washington', 'mwashington@gmail.com', '+1 (415) 333-4444',
  'Individual Customer', NULL, 'San Francisco, CA', NULL,
  'proposal', 'manychat', 'high', 'active', 88,
  ARRAY['2025 Porsche Macan', 'high-end', 'hot-lead', 'tiktok'],
  'Consultation completed Feb 8. VERY hot lead - ready to buy. Proposal sent for Macan S at Fremont Porsche. Expecting decision this week.',
  '{"vehicle_interest": "2025 Porsche Macan S", "budget": "$72,000", "timeline": "ASAP", "trade_in": true, "trade_in_vehicle": "2021 Audi Q5", "consult_date": "2026-02-08T15:00:00", "proposal_sent": "2026-02-09T09:00:00", "consult_outcome": "Very positive - ready to buy"}'::jsonb
),

-- CLOSED-WON stage (paid customer!) - 1 lead
(
  'Lauren', 'Anderson', 'lauren.anderson@gmail.com', '+1 (408) 666-7777',
  'Individual Customer', NULL, 'San Jose, CA', NULL,
  'closed-won', 'manychat', 'high', 'active', 95,
  ARRAY['2025 Kia EV6', 'ev-buyer', 'paid-customer', 'success', 'instagram'],
  '🎉 CLOSED! Lauren picked up her EV6 GT-Line on Feb 11. Found amazing deal at Stevens Creek Kia - $3,200 under MSRP + EV rebates. Very happy customer!',
  '{"vehicle_interest": "2025 Kia EV6 GT-Line AWD", "budget": "$50,000", "actual_price": "$46,800", "savings": "$3,200 under MSRP + $7,500 federal credit", "timeline": "Completed", "trade_in": false, "consult_date": "2026-02-06T11:00:00", "proposal_sent": "2026-02-07T09:30:00", "deal_closed": "2026-02-11T14:00:00", "dealer": "Stevens Creek Kia", "revenue": "$1,500"}'::jsonb
);

-- Step 3: Add communication history for each lead
-- This creates realistic conversation timelines

-- John Smith communications
INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'note',
  'internal',
  'New lead from TikTok. Commented on video about dealer markups. Interested in Honda CR-V.',
  NOW() - INTERVAL '2 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'John' AND c.last_name = 'Smith';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'sms',
  'outbound',
  'Hi John! This is Tomi from Delivrd. Saw your comment about finding a 2025 CR-V. I can help you get dealer pricing and handle the entire search. Mind if I give you a quick call?',
  NOW() - INTERVAL '1 day',
  'delivered'
FROM contacts c WHERE c.first_name = 'John' AND c.last_name = 'Smith';

-- Sarah Johnson communications
INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'note',
  'internal',
  'Instagram DM inquiry. Lease ending soon, time-sensitive.',
  NOW() - INTERVAL '1 day',
  'delivered'
FROM contacts c WHERE c.first_name = 'Sarah' AND c.last_name = 'Johnson';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'sms',
  'outbound',
  'Hi Sarah! Got your message about the RAV4 Hybrid. Since your lease is ending soon, I can fast-track your search. When''s a good time to chat?',
  NOW() - INTERVAL '1 day',
  'delivered'
FROM contacts c WHERE c.first_name = 'Sarah' AND c.last_name = 'Johnson';

-- Mike Rodriguez communications
INSERT INTO communications (contact_id, type, direction, subject, body, created_at, status)
SELECT 
  c.id,
  'note',
  'internal',
  NULL,
  'Website form submission. Interested in Tesla Model Y.',
  NOW() - INTERVAL '3 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Mike' AND c.last_name = 'Rodriguez';

INSERT INTO communications (contact_id, type, direction, subject, body, created_at, status)
SELECT 
  c.id,
  'email',
  'outbound',
  'Your Tesla Model Y Search - Delivrd Can Help',
  'Hi Mike,

Thanks for reaching out! I saw you''re looking for a Model Y. I work with Tesla dealers across the Bay Area and can get you the best available price + help with EV incentives.

Would you be open to a quick 15-min call this week?

Best,
Tomi',
  NOW() - INTERVAL '3 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Mike' AND c.last_name = 'Rodriguez';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'sms',
  'inbound',
  'Yes definitely interested. Friday afternoon works for me.',
  NOW() - INTERVAL '2 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Mike' AND c.last_name = 'Rodriguez';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'call',
  'outbound',
  'Called Mike - discussed budget, timeline, and EV incentives. He''s interested in Long Range model. Following up with next steps.',
  NOW() - INTERVAL '1 day',
  'delivered'
FROM contacts c WHERE c.first_name = 'Mike' AND c.last_name = 'Rodriguez';

-- Emily Chen communications
INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'note',
  'internal',
  'Referral from David Wu. High-value lead - luxury buyer.',
  NOW() - INTERVAL '4 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Emily' AND c.last_name = 'Chen';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'sms',
  'outbound',
  'Hi Emily! David Wu recommended I reach out about your BMW X5 search. He raved about how we helped him last year. Would love to chat about what you''re looking for.',
  NOW() - INTERVAL '3 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Emily' AND c.last_name = 'Chen';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'sms',
  'inbound',
  'Hi Tomi! David had great things to say. Looking for X5 with M Sport package and premium sound. Can you help?',
  NOW() - INTERVAL '2 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Emily' AND c.last_name = 'Chen';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'call',
  'outbound',
  'Great call with Emily. She wants fully loaded X5. Budget flexible. Connecting her with BMW dealers in SF and Peninsula.',
  NOW() - INTERVAL '1 day',
  'delivered'
FROM contacts c WHERE c.first_name = 'Emily' AND c.last_name = 'Chen';

-- David Martinez communications
INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'note',
  'internal',
  'TikTok lead - business owner needs work truck.',
  NOW() - INTERVAL '5 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'David' AND c.last_name = 'Martinez';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'sms',
  'outbound',
  'Hi David! Saw you''re looking for an F-150 for your business. I can help you compare lease vs finance options and find the best dealer pricing. Interested?',
  NOW() - INTERVAL '4 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'David' AND c.last_name = 'Martinez';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'call',
  'outbound',
  'Spoke with David - construction business needs reliable truck. Qualified buyer. Discussing tax benefits of lease vs purchase.',
  NOW() - INTERVAL '3 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'David' AND c.last_name = 'Martinez';

INSERT INTO communications (contact_id, type, direction, subject, body, created_at, status)
SELECT 
  c.id,
  'email',
  'outbound',
  'F-150 Lariat - Lease vs Finance Comparison',
  'Hi David,

As discussed, here''s the breakdown:

Lease: $689/mo (36 months, 12k miles/year)
Finance: $1,124/mo (60 months at 6.9% APR)

With your business, the lease has Section 179 advantages. Let me know if you want to move forward!

Tomi',
  NOW() - INTERVAL '2 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'David' AND c.last_name = 'Martinez';

-- Jessica Kim communications
INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'note',
  'internal',
  'Instagram inquiry - family needs reliable SUV.',
  NOW() - INTERVAL '6 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Jessica' AND c.last_name = 'Kim';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'sms',
  'outbound',
  'Hi Jessica! Got your message about the CX-5. Mazda''s are great family vehicles. Can we hop on a quick call to discuss what features are most important to you?',
  NOW() - INTERVAL '5 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Jessica' AND c.last_name = 'Kim';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'call',
  'outbound',
  'Qualified Jessica - safety is top priority (has 2 young kids). Looking at Grand Touring trim. Trade-in value discussed. Consultation booked.',
  NOW() - INTERVAL '3 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Jessica' AND c.last_name = 'Kim';

-- Robert Taylor communications
INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'note',
  'internal',
  'Website inquiry - outdoor enthusiast needs AWD.',
  NOW() - INTERVAL '8 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Robert' AND c.last_name = 'Taylor';

INSERT INTO communications (contact_id, type, direction, subject, body, created_at, status)
SELECT 
  c.id,
  'email',
  'outbound',
  'Your Subaru Outback Search',
  'Hi Robert,

Saw you''re looking for a Wilderness trim. Perfect for mountain adventures! I can help you find one and arrange test drives at multiple dealers.

When''s a good time to discuss?

Tomi',
  NOW() - INTERVAL '7 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Robert' AND c.last_name = 'Taylor';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'call',
  'outbound',
  'Great call with Robert. He goes to Tahoe often, needs AWD. Qualified buyer with trade-in. Consultation completed.',
  NOW() - INTERVAL '5 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Robert' AND c.last_name = 'Taylor';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'sms',
  'outbound',
  'Hi Robert! Found 3 Outback Wilderness models in your color at Bay Area dealers. Proposal sent with pricing - check your email!',
  NOW() - INTERVAL '2 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Robert' AND c.last_name = 'Taylor';

-- Amanda Foster communications
INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'note',
  'internal',
  'Referral lead - wants luxury SUV.',
  NOW() - INTERVAL '7 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Amanda' AND c.last_name = 'Foster';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'sms',
  'outbound',
  'Hi Amanda! Your friend mentioned you''re looking for a Lexus RX. I can help you compare dealers and get the best price. Want to chat?',
  NOW() - INTERVAL '6 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Amanda' AND c.last_name = 'Foster';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'call',
  'outbound',
  'Consultation complete. Amanda wants quiet, comfortable ride. Comparing Lexus RX vs Acura MDX. Proposals sent for both.',
  NOW() - INTERVAL '4 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Amanda' AND c.last_name = 'Foster';

-- Marcus Washington communications
INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'note',
  'internal',
  'TikTok lead - high-end buyer interested in Macan.',
  NOW() - INTERVAL '10 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Marcus' AND c.last_name = 'Washington';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'call',
  'outbound',
  'Great conversation with Marcus. Finance professional, ready to buy. Loves Porsche brand. Booking consultation.',
  NOW() - INTERVAL '8 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Marcus' AND c.last_name = 'Washington';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'sms',
  'outbound',
  'Hi Marcus! Looking forward to our consultation Feb 8. I''ve identified 3 Macan S models in your color preference at Bay Area dealers.',
  NOW() - INTERVAL '5 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Marcus' AND c.last_name = 'Washington';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'note',
  'internal',
  'Consultation complete. Marcus loved the service. Found perfect Macan at Fremont Porsche. Preparing deal proposal - HOT LEAD.',
  NOW() - INTERVAL '4 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Marcus' AND c.last_name = 'Washington';

INSERT INTO communications (contact_id, type, direction, subject, body, created_at, status)
SELECT 
  c.id,
  'email',
  'outbound',
  'Your Porsche Macan S Proposal',
  'Marcus,

Great news! Found your perfect Macan S at Fremont Porsche:

2025 Macan S - Jet Black Metallic
MSRP: $72,000
Dealer price: $70,500

Car is in stock and ready. Let me know if you want to move forward!

Tomi',
  NOW() - INTERVAL '3 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Marcus' AND c.last_name = 'Washington';

-- Lauren Anderson communications (closed-won!)
INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'note',
  'internal',
  'Instagram DM - interested in EV6.',
  NOW() - INTERVAL '12 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Lauren' AND c.last_name = 'Anderson';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'call',
  'outbound',
  'Qualified Lauren - first EV purchase, nervous about charging. Educated her on home charging + public network. She''s excited!',
  NOW() - INTERVAL '9 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Lauren' AND c.last_name = 'Anderson';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'sms',
  'outbound',
  'Hi Lauren! Consultation went great. Found an EV6 GT-Line at Stevens Creek Kia - $3,200 under MSRP + you qualify for $7,500 federal credit!',
  NOW() - INTERVAL '7 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Lauren' AND c.last_name = 'Anderson';

INSERT INTO communications (contact_id, type, direction, subject, body, created_at, status)
SELECT 
  c.id,
  'email',
  'outbound',
  'Your EV6 Proposal - $46,800 Final Price',
  'Hi Lauren,

Attached is your full proposal:

2025 Kia EV6 GT-Line AWD
MSRP: $50,000
Discounted Price: $46,800
Federal Credit: $7,500
Net Cost: $39,300

This is an incredible deal. The dealer has 2 in stock. Let me know if you want to move forward!

Best,
Tomi',
  NOW() - INTERVAL '5 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Lauren' AND c.last_name = 'Anderson';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'sms',
  'inbound',
  'This is amazing! I want to move forward. When can we schedule the purchase?',
  NOW() - INTERVAL '4 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Lauren' AND c.last_name = 'Anderson';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'call',
  'outbound',
  'Lauren is ready to buy! Scheduled pickup for Feb 11 at Stevens Creek Kia. Coordinating paperwork with dealer.',
  NOW() - INTERVAL '3 days',
  'delivered'
FROM contacts c WHERE c.first_name = 'Lauren' AND c.last_name = 'Anderson';

INSERT INTO communications (contact_id, type, direction, body, created_at, status)
SELECT 
  c.id,
  'note',
  'internal',
  '🎉 DEAL CLOSED! Lauren picked up her EV6 today. Super happy customer. Paid $1,500 commission.',
  NOW() - INTERVAL '1 day',
  'delivered'
FROM contacts c WHERE c.first_name = 'Lauren' AND c.last_name = 'Anderson';

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  COUNT(*) as total_contacts,
  COUNT(*) FILTER (WHERE stage = 'lead') as lead_count,
  COUNT(*) FILTER (WHERE stage = 'contacted') as contacted_count,
  COUNT(*) FILTER (WHERE stage = 'qualified') as qualified_count,
  COUNT(*) FILTER (WHERE stage = 'proposal') as proposal_count,
  COUNT(*) FILTER (WHERE stage = 'closed-won') as closed_won_count
FROM contacts
WHERE deleted_at IS NULL;

SELECT 
  COUNT(*) as total_communications
FROM communications;

-- ============================================
-- SUCCESS!
-- ✅ CRM now has realistic customer leads
-- ✅ All leads are car BUYERS, not dealers
-- ✅ Pipeline shows progression through sales funnel
-- ✅ Communications show realistic sales conversations
-- ============================================
