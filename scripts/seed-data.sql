-- ============================================
-- DELIVRD WAR ROOM - SEED DATA
-- Run this in Supabase SQL Editor
-- ============================================

BEGIN;

-- Get Tomi's user ID for assignments
DO $$
DECLARE
  tomi_id UUID;
BEGIN
  SELECT id INTO tomi_id FROM profiles LIMIT 1;
  
  IF tomi_id IS NULL THEN
    RAISE NOTICE 'No profiles found, using NULL for assigned_to';
  ELSE
    RAISE NOTICE 'Using profile ID: %', tomi_id;
  END IF;

  -- ============================================
  -- INSERT BATTLES (95 marketing channels)
  -- ============================================
  
  -- Organic Social (15)
  INSERT INTO battles (id, name, category, tier, impact, effort, owner, description, why_this_tier, next_action, ai_play, success_metric) VALUES
  (1, 'TikTok', 'organic', 'now', 'C', 'L', 't', 'Short-form vertical video discovery. 470k followers, highest volume channel.', '#1 channel. Priority infrastructure build.', 'Keyword CTA system + AI comment monitor', 'AI monitors comments for buying signals, auto-DMs qualified leads', 'DM-to-qualified rate, weekly revenue from TikTok'),
  (2, 'Instagram Reels', 'organic', 'now', 'C', 'M', 't', 'Vertical video on Instagram. Strong engagement, cross-post from TikTok.', 'Major channel, needs systematic posting automation', 'Auto-cross-post TikTok winners + story link system', 'AI generates caption variants, schedules optimal times', 'Story link clicks, DM conversations'),
  (3, 'Instagram Stories', 'organic', 'now', 'H', 'L', 't', '24hr ephemeral content. High engagement, direct link capability.', 'Daily touchpoint with followers, link stickers drive traffic', 'Daily story template system', 'AI generates story copy from recent posts', 'Link clicks, DM replies'),
  (4, 'Instagram Feed Posts', 'organic', 'soon', 'M', 'M', 't', 'Permanent grid posts. Brand building, portfolio showcase.', 'Secondary to Reels but important for profile credibility', 'Monthly carousel template pack', 'AI generates carousel educational content', 'Profile visits, follower growth'),
  (5, 'YouTube Shorts', 'organic', 'now', 'H', 'L', 't', 'TikTok competitor. Easy cross-post, growing discovery.', 'Free distribution, minimal extra effort', 'Auto-upload TikTok content to Shorts', 'AI reformats for YouTube metadata', 'Views, subscriber growth'),
  (6, 'YouTube Long-form', 'organic', 'soon', 'H', 'H', 't', 'Educational deep-dives. High trust, search-friendly.', 'High ROI but needs production infrastructure', 'Monthly video series format', 'AI generates outlines + timestamps', 'Watch time, qualified leads'),
  (7, 'Facebook Reels', 'organic', 'later', 'M', 'L', 't', 'Cross-post destination. Older demographic.', 'Low effort cross-post opportunity', 'Auto-post top TikToks', 'AI adapts copy for FB audience', 'Page likes, shares'),
  (8, 'Facebook Groups', 'organic', 'monitor', 'M', 'H', 'n', 'Community participation. Dealer/automotive groups.', 'Time-intensive, risk of spam reputation', 'Research high-value groups', 'AI monitors for lead opportunities', 'Warm intros, partnerships'),
  (9, 'LinkedIn Personal', 'organic', 'now', 'H', 'M', 't', 'B2B thought leadership. GM/owner network.', 'Decision-makers hang here', 'Weekly dealership insight posts', 'AI drafts from voice memos', 'Connection requests from GMs'),
  (10, 'LinkedIn Company Page', 'organic', 'later', 'L', 'M', 's', 'Brand presence. Less engagement than personal.', 'Nice-to-have, low priority', 'Weekly case study posts', 'AI repurposes client wins', 'Page followers'),
  (11, 'Twitter/X', 'organic', 'monitor', 'L', 'M', 'n', 'Real-time commentary. Niche automotive community.', 'Limited dealer presence', 'Monitor car dealer conversations', 'AI finds trending automotive topics', 'Engagement from dealers'),
  (12, 'Pinterest', 'organic', 'monitor', 'L', 'M', 'n', 'Visual discovery. Consumer-focused.', 'Not B2B focused', 'Test infographic pins', 'AI generates pin descriptions', 'Link clicks'),
  (13, 'Snapchat', 'organic', 'monitor', 'L', 'H', 'n', 'Younger demographic. Limited B2B application.', 'Wrong audience for dealer outreach', 'None currently', 'N/A', 'N/A'),
  (14, 'Reddit', 'organic', 'later', 'M', 'H', 'n', 'Community-driven. Automotive subreddits.', 'Anti-promotional culture, requires finesse', 'Research askcarsales community', 'AI monitors for partnership opportunities', 'Credible contributions'),
  (15, 'Threads', 'organic', 'monitor', 'L', 'L', 'n', 'Instagram text-based. Still early.', 'Unclear dealer presence', 'Monitor growth', 'Cross-post capability', 'Follower growth')
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    tier = EXCLUDED.tier,
    impact = EXCLUDED.impact;

  -- Paid Advertising (20)
  INSERT INTO battles (id, name, category, tier, impact, effort, owner, description, why_this_tier, next_action, ai_play, success_metric) VALUES
  (16, 'Facebook Ads - Conversions', 'paid', 'now', 'C', 'M', 'b', 'Lead gen campaigns. Dealer targeting.', 'Proven channel, needs optimization', 'A/B test creative + landing pages', 'AI generates ad variants', 'Cost per qualified lead'),
  (17, 'Instagram Ads', 'paid', 'now', 'H', 'M', 'b', 'Visual storytelling ads. Same platform as FB.', 'Bundled with FB, strong visual medium', 'Story ads with swipe-up', 'AI generates ad copy variations', 'CTR, CPL'),
  (18, 'TikTok Ads', 'paid', 'soon', 'H', 'H', 't', 'In-feed native ads. Requires different creative.', 'High potential but needs creative testing', 'Test in-feed video ads', 'AI analyzes top organic content for ad ideas', 'View-through rate, CPL'),
  (19, 'Google Search Ads', 'paid', 'now', 'C', 'M', 'b', 'Intent-based. Dealer marketing keywords.', 'High-intent traffic', 'Expand keyword list + negative keywords', 'AI suggests keyword opportunities', 'Conversion rate, ROAS'),
  (20, 'Google Display Network', 'paid', 'later', 'M', 'M', 'b', 'Banner ads. Retargeting focused.', 'Support channel for retargeting', 'Retargeting campaign for site visitors', 'AI generates banner ad variations', 'Return visitor conversion rate'),
  (21, 'YouTube Ads', 'paid', 'soon', 'H', 'H', 't', 'Pre-roll video ads. Educational targeting.', 'Requires video creative production', 'Create 15-sec skippable ad', 'AI scripts video ads', 'View rate, CPL'),
  (22, 'LinkedIn Ads', 'paid', 'soon', 'H', 'H', 'b', 'B2B targeting. Expensive but precise.', 'High CPL but quality leads', 'Test sponsored content campaign', 'AI generates professional copy', 'Lead quality score'),
  (23, 'Twitter/X Ads', 'paid', 'monitor', 'L', 'M', 'n', 'Promoted tweets. Declining platform stability.', 'Uncertain ROI', 'Monitor platform changes', 'N/A', 'N/A'),
  (24, 'Snapchat Ads', 'paid', 'monitor', 'L', 'H', 'n', 'AR lenses, story ads. Young demographic.', 'Wrong audience', 'None', 'N/A', 'N/A'),
  (25, 'Pinterest Ads', 'paid', 'monitor', 'L', 'M', 'n', 'Shopping-focused. Not B2B.', 'Consumer platform', 'None', 'N/A', 'N/A'),
  (26, 'Reddit Ads', 'paid', 'later', 'M', 'M', 'n', 'Subreddit targeting. Requires soft approach.', 'Community sensitivity needed', 'Research dealership subreddits', 'AI monitors discussion sentiment', 'Engagement quality'),
  (27, 'Bing Ads', 'paid', 'later', 'M', 'L', 'b', 'Microsoft search ads. Lower competition.', 'Supplement to Google', 'Import Google campaigns', 'AI syncs with Google', 'Incremental conversions'),
  (28, 'Programmatic Display', 'paid', 'monitor', 'M', 'H', 'n', 'Automated banner buying. Complex setup.', 'Requires significant spend', 'Research at scale', 'N/A currently', 'N/A'),
  (29, 'Spotify Ads', 'paid', 'monitor', 'L', 'M', 'n', 'Audio ads. Unclear dealer fit.', 'Experimental channel', 'Test if budget allows', 'AI generates audio scripts', 'Brand recall'),
  (30, 'Pandora Ads', 'paid', 'monitor', 'L', 'M', 'n', 'Audio streaming ads.', 'Declining platform', 'None', 'N/A', 'N/A'),
  (31, 'Connected TV Ads', 'paid', 'later', 'M', 'H', 'n', 'Streaming TV ads. Premium creative needed.', 'High production barrier', 'Research at larger scale', 'AI video generation', 'Brand lift'),
  (32, 'Native Ads (Taboola/Outbrain)', 'paid', 'later', 'M', 'M', 'n', 'Content recommendation widgets.', 'Requires landing page content', 'Test with lead magnet', 'AI generates headlines', 'Content engagement'),
  (33, 'Retargeting Pixels', 'paid', 'now', 'H', 'L', 'b', 'Track and retarget site visitors.', 'Critical infrastructure', 'Install on all pages', 'AI optimizes audience segments', 'Return visitor rate'),
  (34, 'Lookalike Audiences', 'paid', 'now', 'H', 'L', 'b', 'Target similar to best customers.', 'Proven scale strategy', 'Build from CRM list', 'AI identifies commonalities', 'New lead quality'),
  (35, 'Dynamic Product Ads', 'paid', 'later', 'M', 'H', 'n', 'Auto-generated service ads.', 'Requires catalog setup', 'Build service catalog', 'AI matches services to dealers', 'Ad relevance score')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- Content & SEO (15) - battles 36-50
  INSERT INTO battles (id, name, category, tier, impact, effort, owner, description, why_this_tier, next_action, ai_play, success_metric) VALUES
  (36, 'Blog - Educational', 'content', 'now', 'H', 'M', 't', 'Dealership marketing guides. SEO + lead magnets.', 'Inbound lead engine', 'Weekly how-to posts', 'AI drafts from outlines', 'Organic traffic, downloads'),
  (37, 'Blog - Case Studies', 'content', 'now', 'H', 'M', 't', 'Client success stories. Social proof.', 'Trust building, sales tool', 'Monthly case study', 'AI structures interviews', 'Sales page conversions'),
  (38, 'SEO - On-page', 'content', 'now', 'H', 'L', 't', 'Keyword optimization, meta tags.', 'Foundational for organic growth', 'Audit top 20 pages', 'AI suggests keyword opportunities', 'Keyword rankings'),
  (39, 'SEO - Technical', 'content', 'now', 'M', 'M', 't', 'Site speed, mobile, core web vitals.', 'Google ranking factor', 'Run Lighthouse audit', 'AI identifies issues', 'Core Web Vitals score'),
  (40, 'SEO - Backlinks', 'content', 'soon', 'H', 'H', 't', 'Link building, guest posts, PR.', 'Long-term authority builder', 'Automotive site outreach list', 'AI finds link opportunities', 'Domain authority'),
  (41, 'Lead Magnets - PDFs', 'content', 'now', 'H', 'M', 't', 'Downloadable guides. Email capture.', 'List building essential', '''TikTok for Dealers'' guide', 'AI generates PDF content', 'Download-to-lead rate'),
  (42, 'Lead Magnets - Webinars', 'content', 'soon', 'H', 'H', 'b', 'Live training sessions. High-touch.', 'Strong qualifier, labor intensive', 'Monthly webinar series', 'AI generates webinar outlines', 'Attendee-to-customer rate'),
  (43, 'Email Newsletter', 'content', 'now', 'M', 'M', 't', 'Weekly dealer marketing tips.', 'Nurture channel', 'Weekly send with blog summary', 'AI drafts newsletter', 'Open rate, click rate'),
  (44, 'Podcasting', 'content', 'later', 'M', 'H', 't', 'Audio long-form. Dealer interviews.', 'High effort, niche audience', 'Test 10-episode series', 'AI generates show notes', 'Downloads, dealer inquiries'),
  (45, 'SlideShare/LinkedIn Docs', 'content', 'later', 'L', 'M', 'n', 'Presentation sharing. Lead gen.', 'Low priority repurposing', 'Upload webinar decks', 'AI converts content to slides', 'Views, downloads'),
  (46, 'Infographics', 'content', 'later', 'M', 'M', 'n', 'Visual data storytelling. Shareable.', 'Good for social, labor intensive', 'Quarterly stat roundup', 'AI suggests data stories', 'Shares, backlinks'),
  (47, 'Ebooks', 'content', 'later', 'M', 'H', 'n', 'Long-form premium content.', 'One-time effort, ongoing value', '''Ultimate Dealer Marketing Guide''', 'AI drafts chapters', 'Download quality'),
  (48, 'Templates/Tools', 'content', 'soon', 'H', 'M', 't', 'Free tools. Content calendar, ROI calc.', 'High perceived value', 'Build ROI calculator', 'AI suggests tool ideas', 'Tool usage, leads'),
  (49, 'Video Tutorials', 'content', 'soon', 'M', 'H', 't', 'How-to screen recordings.', 'Support + marketing hybrid', 'Create ''Getting Started'' series', 'AI generates scripts', 'Watch time, help ticket reduction'),
  (50, 'Documentation', 'content', 'later', 'L', 'M', 'n', 'Public help center.', 'Support focused, not lead gen', 'Launch knowledge base', 'AI drafts articles', 'Search traffic')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- Partnerships & Referrals (15) - battles 51-65
  INSERT INTO battles (id, name, category, tier, impact, effort, owner, description, why_this_tier, next_action, ai_play, success_metric) VALUES
  (51, 'Dealer Referral Program', 'referral', 'now', 'C', 'M', 'b', 'Current dealers refer others. Revenue share.', 'Best leads, lowest CAC', 'Launch referral portal + incentives', 'AI tracks referral attribution', 'Referral revenue %'),
  (52, 'Agency Partnerships', 'partnerships', 'soon', 'H', 'H', 'b', 'White-label for other agencies.', 'Channel scaling opportunity', 'Build partner deck', 'AI manages partner onboarding', 'Partner-sourced revenue'),
  (53, 'DMS Provider Integration', 'partnerships', 'soon', 'H', 'H', 'b', 'CDK, Reynolds partnerships.', 'Distribution through trusted vendors', 'Research integration requirements', 'API integration', 'Integration partners'),
  (54, 'Dealer Group Relationships', 'partnerships', 'now', 'H', 'M', 'b', 'Multi-location groups. Bulk deals.', 'Higher ACV, strategic accounts', 'Target top 100 groups', 'AI identifies decision-makers', 'Group contracts signed'),
  (55, 'OEM Programs', 'partnerships', 'later', 'H', 'H', 'b', 'Honda/Toyota co-op programs.', 'Long sales cycle, huge upside', 'Research OEM marketing managers', 'AI drafts proposals', 'OEM approvals'),
  (56, 'Trade Show Presence', 'partnerships', 'soon', 'M', 'H', 'b', 'NADA, Digital Dealer conferences.', 'Face-to-face, expensive', 'Book NADA booth', 'AI qualifies booth leads', 'Conference pipeline'),
  (57, 'Industry Associations', 'partnerships', 'later', 'M', 'M', 'b', 'State dealer associations.', 'Credibility, networking', 'Join 3 state associations', 'AI monitors member events', 'Association leads'),
  (58, 'Automotive Influencers', 'partnerships', 'later', 'M', 'M', 't', 'Car YouTubers, podcasters.', 'Indirect reach, brand building', 'List top 50 auto influencers', 'AI monitors for partnership fit', 'Brand mentions'),
  (59, 'Affiliate Program', 'referral', 'later', 'M', 'M', 'n', 'Commission for bloggers/creators.', 'Passive channel, needs scale', 'Set up affiliate tracking', 'AI manages payouts', 'Affiliate revenue'),
  (60, 'Co-marketing Campaigns', 'partnerships', 'soon', 'M', 'M', 'b', 'Joint campaigns with complementary brands.', 'Audience sharing', 'Identify 5 potential partners', 'AI suggests partner fit', 'Co-marketing leads'),
  (61, 'Guest Blogging', 'partnerships', 'later', 'M', 'H', 'n', 'Write for automotive sites.', 'SEO + audience building', 'Pitch top 10 auto blogs', 'AI drafts guest posts', 'Backlinks, referral traffic'),
  (62, 'Podcast Guest Appearances', 'partnerships', 'later', 'M', 'M', 't', 'Be interviewed on dealer podcasts.', 'Trust building, niche reach', 'List top dealer podcasts', 'AI generates talking points', 'Podcast leads'),
  (63, 'LinkedIn Group Admin', 'partnerships', 'monitor', 'L', 'H', 'n', 'Create and moderate dealer group.', 'Long-term play, high maintenance', 'Research group interest', 'AI moderates spam', 'Group engagement'),
  (64, 'Joint Ventures', 'partnerships', 'monitor', 'M', 'H', 'n', 'Strategic business partnerships.', 'Case-by-case opportunity', 'Evaluate inbound opportunities', 'N/A', 'JV revenue'),
  (65, 'Speaking Engagements', 'partnerships', 'soon', 'H', 'M', 't', 'Present at dealer events.', 'Authority building, direct access', 'Submit NADA session proposal', 'AI drafts presentation', 'Speaking gigs booked')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- Automation & Tech (15) - battles 66-80
  INSERT INTO battles (id, name, category, tier, impact, effort, owner, description, why_this_tier, next_action, ai_play, success_metric) VALUES
  (66, 'ManyChat Automation', 'automation', 'now', 'C', 'M', 't', 'IG/FB DM automation. Lead qualification.', 'Handles inbound volume', 'Build lead qual flow', 'AI conversations', 'DM-to-qualified rate'),
  (67, 'Quo Phone System', 'automation', 'now', 'H', 'L', 'b', 'Dealer outreach phone system.', 'Active communication channel', 'Optimize call scripts', 'AI transcribes + suggests responses', 'Call-to-meeting rate'),
  (68, 'Email Sequences', 'automation', 'now', 'H', 'M', 't', 'Drip campaigns for leads.', 'Nurture automation', 'Build 5-email onboarding sequence', 'AI personalizes emails', 'Sequence conversion rate'),
  (69, 'SMS Campaigns', 'automation', 'soon', 'M', 'M', 'b', 'Text message outreach.', 'High open rates', 'Compliance check + test campaign', 'AI generates messages', 'SMS reply rate'),
  (70, 'Chatbot - Website', 'automation', 'soon', 'M', 'M', 't', 'Live chat on website.', '24/7 lead capture', 'Install Intercom/Drift', 'AI answers FAQs', 'Chat-to-lead rate'),
  (71, 'Lead Scoring System', 'automation', 'now', 'H', 'M', 'b', 'Auto-rank lead quality.', 'Prioritize sales efforts', 'Define scoring criteria', 'AI predicts conversion likelihood', 'Score accuracy'),
  (72, 'CRM Automation', 'automation', 'now', 'H', 'M', 'b', 'Auto-create tasks, assign leads.', 'Workflow efficiency', 'Map lead lifecycle automations', 'AI suggests next actions', 'Time to first contact'),
  (73, 'Calendar Booking System', 'automation', 'now', 'M', 'L', 'b', 'Calendly/Chili Piper for demos.', 'Reduces booking friction', 'Install on all CTAs', 'AI suggests optimal times', 'Booking rate'),
  (74, 'Proposal Automation', 'automation', 'soon', 'M', 'M', 'b', 'Auto-generate custom proposals.', 'Speed to quote', 'Build proposal template system', 'AI customizes proposals', 'Proposal-to-close rate'),
  (75, 'Contract E-signature', 'automation', 'now', 'M', 'L', 'b', 'DocuSign/PandaDoc integration.', 'Close deals faster', 'Implement e-sign', 'Auto-send after verbal yes', 'Contract turnaround time'),
  (76, 'Zapier Integrations', 'automation', 'now', 'M', 'M', 'b', 'Connect tools without code.', 'Glue layer for systems', 'Map critical workflows', 'Pre-built zaps', 'Manual tasks eliminated'),
  (77, 'Reporting Dashboards', 'automation', 'soon', 'M', 'M', 'b', 'Real-time KPI tracking.', 'Data-driven decisions', 'Build marketing dashboard', 'AI highlights anomalies', 'Dashboard usage'),
  (78, 'A/B Testing Platform', 'automation', 'soon', 'M', 'M', 't', 'Optimize landing pages, ads.', 'Continuous improvement', 'Implement Google Optimize', 'AI suggests test ideas', 'Conversion lift'),
  (79, 'Video Personalization', 'automation', 'later', 'M', 'H', 'n', 'Bonjoro-style personal videos.', 'High-touch, time-consuming', 'Test with top prospects', 'AI generates video outlines', 'Video response rate'),
  (80, 'AI Content Generator', 'automation', 'now', 'H', 'M', 't', 'GPT for drafting content.', '10x content velocity', 'Build prompt library', 'Core AI infrastructure', 'Content output volume')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- Infrastructure & Operations (15) - battles 81-95
  INSERT INTO battles (id, name, category, tier, impact, effort, owner, description, why_this_tier, next_action, ai_play, success_metric) VALUES
  (81, 'Website Redesign', 'infrastructure', 'now', 'C', 'H', 't', 'Modern, fast, conversion-focused site.', 'Central hub for all channels', 'Finalize design + launch', 'AI personalizes content', 'Site conversion rate'),
  (82, 'Landing Page System', 'infrastructure', 'now', 'H', 'M', 't', 'Unbounce/Webflow for campaigns.', 'Test offers independently', 'Build 3 core templates', 'AI generates variations', 'Landing page CVR'),
  (83, 'CRM Implementation', 'infrastructure', 'now', 'C', 'H', 'b', 'HubSpot/Pipedrive setup.', 'Central nervous system', 'Migrate contacts + train team', 'AI enriches contact data', 'CRM adoption rate'),
  (84, 'Analytics Setup', 'infrastructure', 'now', 'H', 'M', 't', 'GA4, tracking pixels, attribution.', 'Can''t improve what you don''t measure', 'Audit tracking + fix gaps', 'AI attribution modeling', 'Data accuracy'),
  (85, 'Brand Identity System', 'infrastructure', 'later', 'M', 'M', 'n', 'Logo, colors, typography, voice.', 'Professional polish', 'Create brand guidelines', 'AI ensures brand consistency', 'Brand recognition'),
  (86, 'Video Production Setup', 'infrastructure', 'soon', 'M', 'H', 't', 'Studio, lighting, camera, editing.', 'Needed for scale', 'Purchase equipment', 'AI editing assistance', 'Video output frequency'),
  (87, 'Photography Assets', 'infrastructure', 'later', 'L', 'M', 'n', 'Stock library, custom shoots.', 'Nice-to-have', 'Build photo library', 'AI image generation', 'Asset reuse rate'),
  (88, 'Email Infrastructure', 'infrastructure', 'now', 'M', 'M', 'b', 'SendGrid, email warming, deliverability.', 'Avoid spam folder', 'Set up SPF/DKIM/DMARC', 'AI monitors deliverability', 'Inbox placement rate'),
  (89, 'Team Hiring', 'infrastructure', 'soon', 'H', 'H', 'b', 'Expand team: video editor, SDR.', 'Scale bottleneck', 'Post job descriptions', 'AI screens applicants', 'Time to hire'),
  (90, 'Knowledge Management', 'infrastructure', 'later', 'M', 'M', 'n', 'Internal wiki, SOPs, training.', 'Onboarding efficiency', 'Set up Notion workspace', 'AI generates documentation', 'Onboarding time'),
  (91, 'Legal & Compliance', 'infrastructure', 'now', 'M', 'M', 'b', 'Contracts, privacy policy, TCPA.', 'Risk mitigation', 'Legal review of all assets', 'AI flags compliance issues', 'Zero violations'),
  (92, 'Security & Backups', 'infrastructure', 'now', 'M', 'M', 'b', '2FA, encrypted data, backups.', 'Protect business', 'Security audit', 'AI monitors threats', 'Zero breaches'),
  (93, 'Project Management System', 'infrastructure', 'now', 'M', 'L', 'b', 'Asana/Monday for task tracking.', 'Team coordination', 'Migrate to PM tool', 'AI prioritizes tasks', 'Task completion rate'),
  (94, 'Financial Systems', 'infrastructure', 'soon', 'M', 'M', 'b', 'Accounting, invoicing, forecasting.', 'Business health', 'Implement QuickBooks', 'AI forecasts revenue', 'Financial reporting accuracy'),
  (95, 'Customer Support System', 'infrastructure', 'later', 'M', 'M', 'n', 'Helpdesk, ticket system.', 'When client volume grows', 'Set up Help Scout', 'AI answers common questions', 'First response time')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  RAISE NOTICE '✅ Inserted 95 battles';

  -- ============================================
  -- INSERT SPRINTS
  -- ============================================
  INSERT INTO sprints (id, name, subtitle, weeks, goal, success_metric, status, sort_order) VALUES
  ('sprint-1', 'Sprint 1: Foundation', 'Core Infrastructure & Quick Wins', 'Weeks 1-4', 'Establish core marketing infrastructure and launch high-impact organic channels', '10 qualified dealer leads from organic + 5 from paid', 'active', 1),
  ('sprint-2', 'Sprint 2: Scale', 'Automation & Channel Expansion', 'Weeks 5-8', 'Automate lead nurture, expand channel presence, close first 3 dealer deals', '25 qualified leads, 3 closed deals, automated DM flow live', 'planned', 2)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  RAISE NOTICE '✅ Inserted 2 sprints';

  -- ============================================
  -- INSERT SPRINT BATTLES
  -- ============================================
  INSERT INTO sprint_battles (sprint_id, battle_id, status, priority, owner, time_estimate, description, deliverable, steps, ai_lever, metric, notes, updated_by) VALUES
  ('sprint-1', 1, 'in_progress', 1, 't', '8 hours', 'Implement keyword CTA system and set up AI comment monitoring for buying signals', 'Keyword CTA links live on all videos + ManyChat DM automation', '["Add keyword CTA to video captions", "Set up ManyChat IG automation", "Build qualification flow", "Connect to CRM", "Test end-to-end flow"]', 'ManyChat AI monitors comments, auto-engages qualified leads', 'DM-to-qualified rate >30%, 5 qualified leads in Sprint 1', 'Already have 470k followers, need to convert traffic to leads', tomi_id),
  ('sprint-1', 16, 'in_progress', 2, 'b', '12 hours', 'Launch targeted dealer lead gen campaigns with A/B tested creative', '3 ad sets running, 2 landing page variants live', '["Define target audience", "Create 3 ad variations", "Build 2 landing pages", "Set up tracking", "Launch campaigns", "Daily optimization"]', 'AI generates ad copy variations, suggests bid optimizations', 'CPL <$75, 10 qualified leads in Sprint 1', 'Focus on Honda/Toyota dealers first', tomi_id),
  ('sprint-1', 19, 'not_started', 3, 'b', '10 hours', 'Launch search campaigns targeting dealer marketing keywords', 'Campaign live with 20+ keyword targets', '["Keyword research", "Build negative keyword list", "Create 5 ad groups", "Write responsive search ads", "Set up tracking", "Launch"]', 'AI suggests long-tail keyword opportunities', 'CTR >4%, CVR >8%, 8 qualified leads in Sprint 1', 'High-intent channel', tomi_id),
  ('sprint-1', 36, 'in_progress', 4, 't', '6 hours', 'Publish 4 SEO-optimized dealership marketing guides', '4 blog posts published with lead magnets', '["Keyword research", "Outline 4 posts", "AI drafts content", "Edit and enhance", "Create PDFs", "Publish and promote"]', 'GPT generates blog drafts from detailed outlines', '500 organic visits, 20 lead magnet downloads', 'Long-term SEO play', tomi_id),
  ('sprint-1', 66, 'not_started', 5, 't', '8 hours', 'Build IG/FB DM automation for lead qualification', 'Full qualification flow live on IG & FB', '["Map qualification criteria", "Build conversational flow", "Add conditional logic", "Integrate with CRM", "Test thoroughly", "Launch"]', 'Natural language understanding for open-ended responses', '50+ DM conversations, 15 qualified leads', 'Critical for handling inbound volume', tomi_id),
  ('sprint-1', 81, 'in_progress', 6, 't', '20 hours', 'Launch new conversion-focused website', 'New site live with clear CTAs and lead capture', '["Finalize wireframe", "Build service pages", "Add case studies", "Implement booking widget", "Set up GA4", "Launch"]', 'AI personalizes homepage hero based on traffic source', 'Site CVR >3%, 10 demo bookings', 'Website is central hub', tomi_id),
  ('sprint-1', 51, 'not_started', 7, 'b', '6 hours', 'Launch referral program for existing dealer clients', 'Referral portal live + 3 clients enrolled', '["Define incentive", "Create landing page", "Set up unique links", "Build tracking", "Email clients", "Follow up"]', 'AI tracks referral attribution across touchpoints', '3 referrals generated in Sprint 1', 'Easiest channel', tomi_id),
  ('sprint-1', 83, 'not_started', 8, 'b', '12 hours', 'Implement CRM and migrate existing contacts', 'CRM fully configured with all leads imported', '["Choose CRM platform", "Set up pipeline stages", "Import contacts", "Configure automation", "Integrate tools", "Train team"]', 'AI enriches contact data', 'All leads in CRM, 100% adoption', 'Foundation for sales ops', tomi_id);

  RAISE NOTICE '✅ Assigned 8 battles to Sprint 1';

  -- ============================================
  -- INSERT CRM CONTACTS (DELIVRD SERVICE PROSPECTS - PRE-SALE FUNNEL)
  -- ============================================
  INSERT INTO contacts (first_name, last_name, email, phone, dealership_name, dealership_brand, dealership_location, title, stage, source, lead_score, priority, tags, notes, assigned_to) VALUES
  -- PAID (signed up for Delivrd service)
  ('Michael', 'Chen', 'mchen_sf@gmail.com', '(415) 555-8291', NULL, NULL, 'San Francisco, CA', NULL, 'closed-won', 'tiktok', 98, 'high', ARRAY['paid', 'honda', 'cr-v', 'success'], 'PAID! Signed up for Delivrd concierge service ($499). Looking for Honda CR-V in Bay Area. Moving to production CRM for delivery tracking.', tomi_id),
  
  -- PROPOSAL OUT (pricing sent, waiting for decision)
  ('Jessica', 'Martinez', 'jessica.m.1987@gmail.com', '(408) 555-2847', NULL, NULL, 'San Jose, CA', NULL, 'proposal', 'tiktok', 88, 'urgent', ARRAY['honda', 'accord', 'proposal-out', 'hot'], 'Sent Delivrd pricing ($499 concierge fee). Wants Honda Accord Sport. Budget $35k. Asked about how trade-in works. Very interested, just needs to discuss with spouse.', tomi_id),
  
  ('David', 'Patel', 'dpatel.atl@gmail.com', '(404) 555-9182', NULL, NULL, 'Atlanta, GA', NULL, 'proposal', 'instagram', 82, 'high', ARRAY['bmw', 'x5', 'luxury', 'proposal-out'], 'Sent proposal for Delivrd service. Looking for BMW X5, budget $60k. Likes the idea of avoiding dealership hassle. Comparing us vs going direct to dealer.', tomi_id),
  
  -- CONSULT DONE (had consultation, deciding next steps)
  ('Emily', 'Rodriguez', 'emily.rod92@gmail.com', '(512) 555-3892', NULL, NULL, 'Austin, TX', NULL, 'qualified', 'tiktok', 75, 'high', ARRAY['toyota', 'rav4', 'consult-done'], 'Consult call completed. First-time buyer, needs RAV4 Hybrid. Budget $38k with trade-in. Loved the walkthrough of our process. Sending proposal today.', tomi_id),
  
  -- CONSULT BOOKED (meeting scheduled)
  ('Brandon', 'Thompson', 'b_thompson@yahoo.com', '(214) 555-7234', NULL, NULL, 'Dallas, TX', NULL, 'qualified', 'instagram', 70, 'high', ARRAY['ford', 'f150', 'consult-booked'], 'Consult booked for tomorrow 2pm CT. Contractor needs F-150 for work. Budget $45k. Frustrated with dealer markups. Great fit for our service.', tomi_id),
  
  ('Sarah', 'Kim', 'sarahkim23@gmail.com', '(206) 555-4721', NULL, NULL, 'Seattle, WA', NULL, 'qualified', 'tiktok', 68, 'medium', ARRAY['nissan', 'rogue', 'consult-booked', 'family'], 'Consult scheduled for Friday 10am PT. Family of 4, needs 7-seater. Budget $35k. Saw our TikTok about avoiding dealer fees. Excited to learn more.', tomi_id),
  
  -- QUALIFIED (confirmed fit, need to book consult)
  ('Marcus', 'Johnson', 'mjohnson305@gmail.com', '(305) 555-1923', NULL, NULL, 'Miami, FL', NULL, 'contacted', 'instagram', 65, 'medium', ARRAY['hyundai', 'tucson', 'qualified'], 'Qualified lead. Wants Hyundai Tucson, budget $32k. Hates dealership pressure. Perfect fit for Delivrd. Needs to book consult call.', tomi_id),
  
  -- CONTACTED (reached out, in conversation)
  ('Ashley', 'Davis', 'ashleyd85@gmail.com', '(602) 555-8721', NULL, NULL, 'Phoenix, AZ', NULL, 'contacted', 'tiktok', 58, 'medium', ARRAY['kia', 'telluride', 'contacted'], 'Left voicemail + sent SMS. Inquired about buying Kia Telluride through Delivrd. Waiting for response. Follow up in 24hrs.', tomi_id),
  
  ('Alex', 'Garcia', 'alexg_la@gmail.com', '(310) 555-6453', NULL, NULL, 'Los Angeles, CA', NULL, 'contacted', 'instagram', 55, 'medium', ARRAY['mazda', 'cx5', 'contacted'], 'Responded to DM. Interested in Mazda CX-5. Asking how our service fee works. Sent explainer video. Scheduling qualification call.', tomi_id),
  
  -- NEW (fresh leads, haven't contacted yet)
  ('Jennifer', 'White', 'jwhite_denver@gmail.com', '(720) 555-2901', NULL, NULL, 'Denver, CO', NULL, 'lead', 'tiktok', 45, 'low', ARRAY['subaru', 'outback', 'new-lead'], 'Just submitted lead form from TikTok bio link. Interested in Subaru Outback. Location: Denver. Need to send intro SMS.', tomi_id),
  
  ('Chris', 'Taylor', 'ctaylor919@gmail.com', '(919) 555-7621', NULL, NULL, 'Raleigh, NC', NULL, 'lead', 'instagram', 42, 'low', ARRAY['toyota', 'camry', 'new-lead'], 'Instagram lead form submission. Looking for used Toyota Camry under $25k. College grad, first car. Haven''t reached out yet.', tomi_id);

  RAISE NOTICE '✅ Created 11 Delivrd service prospects (pre-sale funnel)';

  -- ============================================
  -- INSERT SAMPLE COMMUNICATIONS (DELIVRD SERVICE SALES FUNNEL)
  -- ============================================
  
  -- Jessica Martinez (PROPOSAL OUT - HOT PROSPECT)
  INSERT INTO communications (contact_id, type, direction, body, status, created_by, created_at)
  SELECT id, 'sms', 'outbound', 'Hi Jessica! Thanks for reaching out about Delivrd. We help people buy cars without the dealership hassle. Want to hop on a quick call to explain how it works? 📱', 'delivered', tomi_id, NOW() - interval '96 hours'
  FROM contacts WHERE email = 'jessica.m.1987@gmail.com';

  INSERT INTO communications (contact_id, type, direction, body, status, created_at)
  SELECT id, 'sms', 'inbound', 'Yes! I saw your TikTok about avoiding markups. I need a Honda Accord but hate dealing with salespeople. How much does your service cost?', 'delivered', NOW() - interval '95 hours'
  FROM contacts WHERE email = 'jessica.m.1987@gmail.com';

  INSERT INTO communications (contact_id, type, direction, subject, body, metadata, status, created_by, created_at)
  SELECT id, 'call', 'outbound', 'Service consultation', 'Walked Jessica through Delivrd process: we find the car, negotiate pricing, handle all dealer BS. She loves it. Budget $35k for Accord Sport. Sent pricing proposal ($499 concierge fee). She needs to talk to spouse before committing.', '{"duration_seconds": 1240, "phone": "(408) 555-2847"}'::jsonb, 'sent', tomi_id, NOW() - interval '72 hours'
  FROM contacts WHERE email = 'jessica.m.1987@gmail.com';

  INSERT INTO communications (contact_id, type, direction, body, status, created_by, created_at)
  SELECT id, 'sms', 'outbound', 'Hey Jessica! Did you and your spouse get a chance to discuss? Happy to answer any questions! Our $499 fee saves most people $2k+ in dealer markups 💰', 'delivered', tomi_id, NOW() - interval '24 hours'
  FROM contacts WHERE email = 'jessica.m.1987@gmail.com';

  -- Emily Rodriguez (CONSULT DONE)
  INSERT INTO communications (contact_id, type, direction, body, status, created_at)
  SELECT id, 'sms', 'inbound', 'Hi! I''m Emily. Saw your video about buying a RAV4 Hybrid. I''m a first-time buyer and terrified of dealerships. Can you really handle everything?', 'delivered', NOW() - interval '120 hours'
  FROM contacts WHERE email = 'emily.rod92@gmail.com';

  INSERT INTO communications (contact_id, type, direction, body, status, created_by, created_at)
  SELECT id, 'sms', 'outbound', 'Hey Emily! Yes, we handle EVERYTHING - finding inventory, negotiating, paperwork. You just show up to sign and drive away! Want to schedule a call so I can explain the full process?', 'delivered', tomi_id, NOW() - interval '119 hours'
  FROM contacts WHERE email = 'emily.rod92@gmail.com';

  INSERT INTO communications (contact_id, type, direction, subject, body, metadata, status, created_by, created_at)
  SELECT id, 'call', 'outbound', 'First-time buyer consultation', 'Emily is perfect for our service. First car, doesn''t know what to expect, wants someone in her corner. Walked through: how we find cars, negotiate, and save her money. RAV4 Hybrid, budget $38k. She''s ready to move forward. Sending proposal today.', '{"duration_seconds": 1680, "phone": "(512) 555-3892"}'::jsonb, 'sent', tomi_id, NOW() - interval '48 hours'
  FROM contacts WHERE email = 'emily.rod92@gmail.com';

  -- Brandon Thompson (CONSULT BOOKED)
  INSERT INTO communications (contact_id, type, direction, body, status, created_at)
  SELECT id, 'sms', 'inbound', 'Yo, I need an F-150 for my contracting business. Dealers are marking them up $5k over MSRP. Seen your stuff on IG. Can you help?', 'delivered', NOW() - interval '72 hours'
  FROM contacts WHERE email = 'b_thompson@yahoo.com';

  INSERT INTO communications (contact_id, type, direction, body, status, created_by, created_at)
  SELECT id, 'sms', 'outbound', 'Brandon! That''s exactly what we do - get you the truck at FAIR pricing. We don''t let dealers pull that markup BS. Let''s hop on a call tomorrow. What time works? Morning or afternoon?', 'delivered', tomi_id, NOW() - interval '71 hours'
  FROM contacts WHERE email = 'b_thompson@yahoo.com';

  INSERT INTO communications (contact_id, type, direction, body, status, created_at)
  SELECT id, 'sms', 'inbound', 'Afternoon works. 2pm?', 'delivered', NOW() - interval '70 hours'
  FROM contacts WHERE email = 'b_thompson@yahoo.com';

  INSERT INTO communications (contact_id, type, direction, body, status, created_by, created_at)
  SELECT id, 'sms', 'outbound', 'Perfect! Tomorrow 2pm CT. I''ll call you at this number. We''ll go over how we find trucks, negotiate pricing, and save you thousands. See you then! 🚗', 'delivered', tomi_id, NOW() - interval '69 hours'
  FROM contacts WHERE email = 'b_thompson@yahoo.com';

  -- Michael Chen (PAID - SUCCESS!)
  INSERT INTO communications (contact_id, type, direction, body, status, created_by, created_at)
  SELECT id, 'sms', 'outbound', 'Michael! Just confirmed your payment. Welcome to Delivrd! 🎉 You''re going to love how easy this is. Our production team will reach out within 24hrs to start finding your CR-V.', 'delivered', tomi_id, NOW() - interval '12 hours'
  FROM contacts WHERE email = 'mchen_sf@gmail.com';

  INSERT INTO communications (contact_id, type, direction, body, status, created_at)
  SELECT id, 'sms', 'inbound', 'Thanks Tomi! So relieved I don''t have to deal with dealers. You guys made this so simple.', 'delivered', NOW() - interval '11 hours'
  FROM contacts WHERE email = 'mchen_sf@gmail.com';

  -- Marcus Johnson (QUALIFIED)
  INSERT INTO communications (contact_id, type, direction, subject, body, metadata, status, created_by, created_at)
  SELECT id, 'call', 'outbound', 'Qualification call', 'Called Marcus. He wants Hyundai Tucson, budget $32k. Hates high-pressure sales tactics. PERFECT fit for Delivrd. Explained our flat $499 fee vs dealer markups. He''s interested but wants to think about it. Following up tomorrow to book consultation.', '{"duration_seconds": 920, "phone": "(305) 555-1923"}'::jsonb, 'sent', tomi_id, NOW() - interval '48 hours'
  FROM contacts WHERE email = 'mjohnson305@gmail.com';

  -- Ashley Davis (CONTACTED)
  INSERT INTO communications (contact_id, type, direction, subject, body, metadata, status, created_by, created_at)
  SELECT id, 'call', 'outbound', 'Initial outreach', 'Left voicemail introducing Delivrd service. Mentioned we saw her inquiry about Kia Telluride. Explained we help buyers avoid dealer markups and hassle.', '{"duration_seconds": 0, "phone": "(602) 555-8721", "voicemail": true}'::jsonb, 'sent', tomi_id, NOW() - interval '36 hours'
  FROM contacts WHERE email = 'ashleyd85@gmail.com';

  INSERT INTO communications (contact_id, type, direction, body, status, created_by, created_at)
  SELECT id, 'sms', 'outbound', 'Hi Ashley! Left you a voicemail about Delivrd. We help people buy cars without the dealer BS. If you''re still looking for a Telluride, let''s chat! 📱', 'delivered', tomi_id, NOW() - interval '35 hours'
  FROM contacts WHERE email = 'ashleyd85@gmail.com';

  -- David Patel (PROPOSAL OUT)
  INSERT INTO communications (contact_id, type, direction, body, status, created_by, created_at)
  SELECT id, 'sms', 'outbound', 'Hey David! Sent over the Delivrd proposal to your email. $499 flat fee to handle your BMW X5 purchase. Most clients save $3k+ vs going direct to dealer. Let me know if you have any questions!', 'delivered', tomi_id, NOW() - interval '48 hours'
  FROM contacts WHERE email = 'dpatel.atl@gmail.com';

  INSERT INTO communications (contact_id, type, direction, body, status, created_at)
  SELECT id, 'sms', 'inbound', 'Got it. This seems legit. Just comparing to going straight to the dealer myself. What''s the main benefit of using you guys?', 'delivered', NOW() - interval '36 hours'
  FROM contacts WHERE email = 'dpatel.atl@gmail.com';

  INSERT INTO communications (contact_id, type, direction, body, status, created_by, created_at)
  SELECT id, 'sms', 'outbound', 'Great question! Main benefits: 1) We negotiate on your behalf (save $2-5k typically), 2) We find the best inventory across multiple dealers, 3) No high-pressure sales BS. You save time, money, and stress. Worth the $499? 100%.', 'delivered', tomi_id, NOW() - interval '35 hours'
  FROM contacts WHERE email = 'dpatel.atl@gmail.com';

  RAISE NOTICE '✅ Added 20 communications (Delivrd service sales funnel)';

  -- ============================================
  -- INSERT FOLLOW-UP TASKS (DELIVRD SERVICE SALES FUNNEL)
  -- ============================================
  INSERT INTO follow_ups (contact_id, assigned_to, created_by, title, description, type, priority, status, due_date)
  SELECT id, tomi_id, tomi_id, 'URGENT: Close Jessica', 'Jessica has proposal ($499 concierge fee for Honda Accord). She needs to discuss with spouse. Follow up to close the deal. Offer payment plan if needed.', 'call', 'urgent', 'pending', NOW() + interval '12 hours'
  FROM contacts WHERE email = 'jessica.m.1987@gmail.com';

  INSERT INTO follow_ups (contact_id, assigned_to, created_by, title, description, type, priority, status, due_date)
  SELECT id, tomi_id, tomi_id, 'Consult call: Brandon F-150', 'Brandon''s consultation is scheduled for tomorrow 2pm CT. Prep notes: contractor, hates dealer markups, budget $45k. Show ROI on our $499 fee vs dealer markup savings.', 'call', 'urgent', 'pending', NOW() + interval '24 hours'
  FROM contacts WHERE email = 'b_thompson@yahoo.com';

  INSERT INTO follow_ups (contact_id, assigned_to, created_by, title, description, type, priority, status, due_date)
  SELECT id, tomi_id, tomi_id, 'Send proposal: Emily RAV4', 'Emily''s consult went great. First-time buyer, needs RAV4 Hybrid, budget $38k. Send Delivrd proposal today with payment link. She''s ready to sign up.', 'email', 'high', 'pending', NOW() + interval '6 hours'
  FROM contacts WHERE email = 'emily.rod92@gmail.com';

  INSERT INTO follow_ups (contact_id, assigned_to, created_by, title, description, type, priority, status, due_date)
  SELECT id, tomi_id, tomi_id, 'Follow up: David proposal', 'David has proposal for BMW X5 service. Comparing us vs going direct. Follow up to address objections. Emphasize: we save time + negotiate better pricing.', 'call', 'high', 'pending', NOW() + interval '24 hours'
  FROM contacts WHERE email = 'dpatel.atl@gmail.com';

  INSERT INTO follow_ups (contact_id, assigned_to, created_by, title, description, type, priority, status, due_date)
  SELECT id, tomi_id, tomi_id, 'Book consult: Marcus', 'Marcus is qualified (Hyundai Tucson, budget $32k). Hates dealer pressure. Need to schedule consultation call. Send Calendly link via SMS.', 'sms', 'medium', 'pending', NOW() + interval '48 hours'
  FROM contacts WHERE email = 'mjohnson305@gmail.com';

  INSERT INTO follow_ups (contact_id, assigned_to, created_by, title, description, type, priority, status, due_date)
  SELECT id, tomi_id, tomi_id, 'Follow up: Ashley voicemail', 'Left Ashley voicemail + SMS about Delivrd service (Kia Telluride). No response yet. Follow up with another SMS and case study link.', 'sms', 'medium', 'pending', NOW() + interval '36 hours'
  FROM contacts WHERE email = 'ashleyd85@gmail.com';

  INSERT INTO follow_ups (contact_id, assigned_to, created_by, title, description, type, priority, status, due_date)
  SELECT id, tomi_id, tomi_id, 'Testimonial: Michael video', 'Michael signed up and paid! Loving his CR-V. Ask for video testimonial for TikTok/Instagram. Offer $50 Amazon gift card as thank you.', 'general', 'low', 'pending', NOW() + interval '168 hours'
  FROM contacts WHERE email = 'mchen_sf@gmail.com';

  RAISE NOTICE '✅ Created 7 follow-up tasks (sales funnel)';

END $$;

COMMIT;

-- ============================================
-- SUMMARY
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🎉 SEED COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '';
  RAISE NOTICE 'WAR ROOM (Marketing Channels):';
  RAISE NOTICE '   ⚔️  95 marketing channel battles';
  RAISE NOTICE '   🏃 2 sprints (Sprint 1 active, Sprint 2 planned)';
  RAISE NOTICE '   📋 8 battles assigned to Sprint 1';
  RAISE NOTICE '';
  RAISE NOTICE 'CRM (Pre-Sale Funnel - Customer Acquisition):';
  RAISE NOTICE '   👥 11 Delivrd service prospects';
  RAISE NOTICE '   💬 20 communications (service sales convos)';
  RAISE NOTICE '   📅 7 follow-up tasks';
  RAISE NOTICE '';
  RAISE NOTICE 'Pipeline Stages:';
  RAISE NOTICE '   → NEW (fresh leads)';
  RAISE NOTICE '   → CONTACTED (reached out)';
  RAISE NOTICE '   → QUALIFIED (confirmed fit)';
  RAISE NOTICE '   → CONSULT BOOKED (meeting scheduled)';
  RAISE NOTICE '   → CONSULT DONE (meeting completed)';
  RAISE NOTICE '   → PROPOSAL OUT (pricing sent)';
  RAISE NOTICE '   → PAID (signed up - moves to production CRM)';
  RAISE NOTICE '';
  RAISE NOTICE '✨ Your War Room is ready!';
  RAISE NOTICE '   📖 /library → 95 marketing battles';
  RAISE NOTICE '   🏃 /sprints → Sprint 1 execution plan';
  RAISE NOTICE '   📊 /pipeline → Pre-sale customer acquisition';
  RAISE NOTICE '';
  RAISE NOTICE '💡 This CRM is PRE-SALE ONLY (marketing → paid signup).';
  RAISE NOTICE '   After PAID, customers move to production CRM.';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
END $$;
