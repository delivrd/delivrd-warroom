#!/usr/bin/env ts-node
// Seed Delivrd War Room with realistic test data (Authenticated version)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tqxtkqzswhcyhopkhjam.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxeHRrcXpzd2hjeWhvcGtoamFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzU0MjMsImV4cCI6MjA4NjUxMTQyM30.Iam6qQ715n_q1_z8yISvxom0SvyVEhvAYMNo5zMSR8Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// MARKETING CHANNEL BATTLES (95 channels)
// ============================================
const BATTLES = [
  // Organic Social (15)
  { id: 1, name: "TikTok", category: "organic", tier: "now", impact: "C", effort: "L", owner: "t", description: "Short-form vertical video discovery. 470k followers, highest volume channel.", why_this_tier: "#1 channel. Priority infrastructure build.", next_action: "Keyword CTA system + AI comment monitor", ai_play: "AI monitors comments for buying signals, auto-DMs qualified leads", success_metric: "DM-to-qualified rate, weekly revenue from TikTok" },
  { id: 2, name: "Instagram Reels", category: "organic", tier: "now", impact: "C", effort: "M", owner: "t", description: "Vertical video on Instagram. Strong engagement, cross-post from TikTok.", why_this_tier: "Major channel, needs systematic posting automation", next_action: "Auto-cross-post TikTok winners + story link system", ai_play: "AI generates caption variants, schedules optimal times", success_metric: "Story link clicks, DM conversations" },
  { id: 3, name: "Instagram Stories", category: "organic", tier: "now", impact: "H", effort: "L", owner: "t", description: "24hr ephemeral content. High engagement, direct link capability.", why_this_tier: "Daily touchpoint with followers, link stickers drive traffic", next_action: "Daily story template system", ai_play: "AI generates story copy from recent posts", success_metric: "Link clicks, DM replies" },
  { id: 4, name: "Instagram Feed Posts", category: "organic", tier: "soon", impact: "M", effort: "M", owner: "t", description: "Permanent grid posts. Brand building, portfolio showcase.", why_this_tier: "Secondary to Reels but important for profile credibility", next_action: "Monthly carousel template pack", ai_play: "AI generates carousel educational content", success_metric: "Profile visits, follower growth" },
  { id: 5, name: "YouTube Shorts", category: "organic", tier: "now", impact: "H", effort: "L", owner: "t", description: "TikTok competitor. Easy cross-post, growing discovery.", why_this_tier: "Free distribution, minimal extra effort", next_action: "Auto-upload TikTok content to Shorts", ai_play: "AI reformats for YouTube metadata", success_metric: "Views, subscriber growth" },
  { id: 6, name: "YouTube Long-form", category: "organic", tier: "soon", impact: "H", effort: "H", owner: "t", description: "Educational deep-dives. High trust, search-friendly.", why_this_tier: "High ROI but needs production infrastructure", next_action: "Monthly video series format", ai_play: "AI generates outlines + timestamps", success_metric: "Watch time, qualified leads" },
  { id: 7, name: "Facebook Reels", category: "organic", tier: "later", impact: "M", effort: "L", owner: "t", description: "Cross-post destination. Older demographic.", why_this_tier: "Low effort cross-post opportunity", next_action: "Auto-post top TikToks", ai_play: "AI adapts copy for FB audience", success_metric: "Page likes, shares" },
  { id: 8, name: "Facebook Groups", category: "organic", tier: "monitor", impact: "M", effort: "H", owner: "n", description: "Community participation. Dealer/automotive groups.", why_this_tier: "Time-intensive, risk of spam reputation", next_action: "Research high-value groups", ai_play: "AI monitors for lead opportunities", success_metric: "Warm intros, partnerships" },
  { id: 9, name: "LinkedIn Personal", category: "organic", tier: "now", impact: "H", effort: "M", owner: "t", description: "B2B thought leadership. GM/owner network.", why_this_tier: "Decision-makers hang here", next_action: "Weekly dealership insight posts", ai_play: "AI drafts from voice memos", success_metric: "Connection requests from GMs" },
  { id: 10, name: "LinkedIn Company Page", category: "organic", tier: "later", impact: "L", effort: "M", owner: "s", description: "Brand presence. Less engagement than personal.", why_this_tier: "Nice-to-have, low priority", next_action: "Weekly case study posts", ai_play: "AI repurposes client wins", success_metric: "Page followers" },
  { id: 11, name: "Twitter/X", category: "organic", tier: "monitor", impact: "L", effort: "M", owner: "n", description: "Real-time commentary. Niche automotive community.", why_this_tier: "Limited dealer presence", next_action: "Monitor car dealer conversations", ai_play: "AI finds trending automotive topics", success_metric: "Engagement from dealers" },
  { id: 12, name: "Pinterest", category: "organic", tier: "monitor", impact: "L", effort: "M", owner: "n", description: "Visual discovery. Consumer-focused.", why_this_tier: "Not B2B focused", next_action: "Test infographic pins", ai_play: "AI generates pin descriptions", success_metric: "Link clicks" },
  { id: 13, name: "Snapchat", category: "organic", tier: "monitor", impact: "L", effort: "H", owner: "n", description: "Younger demographic. Limited B2B application.", why_this_tier: "Wrong audience for dealer outreach", next_action: "None currently", ai_play: "N/A", success_metric: "N/A" },
  { id: 14, name: "Reddit", category: "organic", tier: "later", impact: "M", effort: "H", owner: "n", description: "Community-driven. Automotive subreddits.", why_this_tier: "Anti-promotional culture, requires finesse", next_action: "Research askcarsales community", ai_play: "AI monitors for partnership opportunities", success_metric: "Credible contributions" },
  { id: 15, name: "Threads", category: "organic", tier: "monitor", impact: "L", effort: "L", owner: "n", description: "Instagram text-based. Still early.", why_this_tier: "Unclear dealer presence", next_action: "Monitor growth", ai_play: "Cross-post capability", success_metric: "Follower growth" },

  // Paid Advertising (20)
  { id: 16, name: "Facebook Ads - Conversions", category: "paid", tier: "now", impact: "C", effort: "M", owner: "b", description: "Lead gen campaigns. Dealer targeting.", why_this_tier: "Proven channel, needs optimization", next_action: "A/B test creative + landing pages", ai_play: "AI generates ad variants", success_metric: "Cost per qualified lead" },
  { id: 17, name: "Instagram Ads", category: "paid", tier: "now", impact: "H", effort: "M", owner: "b", description: "Visual storytelling ads. Same platform as FB.", why_this_tier: "Bundled with FB, strong visual medium", next_action: "Story ads with swipe-up", ai_play: "AI generates ad copy variations", success_metric: "CTR, CPL" },
  { id: 18, name: "TikTok Ads", category: "paid", tier: "soon", impact: "H", effort: "H", owner: "t", description: "In-feed native ads. Requires different creative.", why_this_tier: "High potential but needs creative testing", next_action: "Test in-feed video ads", ai_play: "AI analyzes top organic content for ad ideas", success_metric: "View-through rate, CPL" },
  { id: 19, name: "Google Search Ads", category: "paid", tier: "now", impact: "C", effort: "M", owner: "b", description: "Intent-based. Dealer marketing keywords.", why_this_tier: "High-intent traffic", next_action: "Expand keyword list + negative keywords", ai_play: "AI suggests keyword opportunities", success_metric: "Conversion rate, ROAS" },
  { id: 20, name: "Google Display Network", category: "paid", tier: "later", impact: "M", effort: "M", owner: "b", description: "Banner ads. Retargeting focused.", why_this_tier: "Support channel for retargeting", next_action: "Retargeting campaign for site visitors", ai_play: "AI generates banner ad variations", success_metric: "Return visitor conversion rate" },
  { id: 21, name: "YouTube Ads", category: "paid", tier: "soon", impact: "H", effort: "H", owner: "t", description: "Pre-roll video ads. Educational targeting.", why_this_tier: "Requires video creative production", next_action: "Create 15-sec skippable ad", ai_play: "AI scripts video ads", success_metric: "View rate, CPL" },
  { id: 22, name: "LinkedIn Ads", category: "paid", tier: "soon", impact: "H", effort: "H", owner: "b", description: "B2B targeting. Expensive but precise.", why_this_tier: "High CPL but quality leads", next_action: "Test sponsored content campaign", ai_play: "AI generates professional copy", success_metric: "Lead quality score" },
  { id: 23, name: "Twitter/X Ads", category: "paid", tier: "monitor", impact: "L", effort: "M", owner: "n", description: "Promoted tweets. Declining platform stability.", why_this_tier: "Uncertain ROI", next_action: "Monitor platform changes", ai_play: "N/A", success_metric: "N/A" },
  { id: 24, name: "Snapchat Ads", category: "paid", tier: "monitor", impact: "L", effort: "H", owner: "n", description: "AR lenses, story ads. Young demographic.", why_this_tier: "Wrong audience", next_action: "None", ai_play: "N/A", success_metric: "N/A" },
  { id: 25, name: "Pinterest Ads", category: "paid", tier: "monitor", impact: "L", effort: "M", owner: "n", description: "Shopping-focused. Not B2B.", why_this_tier: "Consumer platform", next_action: "None", ai_play: "N/A", success_metric: "N/A" },
  { id: 26, name: "Reddit Ads", category: "paid", tier: "later", impact: "M", effort: "M", owner: "n", description: "Subreddit targeting. Requires soft approach.", why_this_tier: "Community sensitivity needed", next_action: "Research dealership subreddits", ai_play: "AI monitors discussion sentiment", success_metric: "Engagement quality" },
  { id: 27, name: "Bing Ads", category: "paid", tier: "later", impact: "M", effort: "L", owner: "b", description: "Microsoft search ads. Lower competition.", why_this_tier: "Supplement to Google", next_action: "Import Google campaigns", ai_play: "AI syncs with Google", success_metric: "Incremental conversions" },
  { id: 28, name: "Programmatic Display", category: "paid", tier: "monitor", impact: "M", effort: "H", owner: "n", description: "Automated banner buying. Complex setup.", why_this_tier: "Requires significant spend", next_action: "Research at scale", ai_play: "N/A currently", success_metric: "N/A" },
  { id: 29, name: "Spotify Ads", category: "paid", tier: "monitor", impact: "L", effort: "M", owner: "n", description: "Audio ads. Unclear dealer fit.", why_this_tier: "Experimental channel", next_action: "Test if budget allows", ai_play: "AI generates audio scripts", success_metric: "Brand recall" },
  { id: 30, name: "Pandora Ads", category: "paid", tier: "monitor", impact: "L", effort: "M", owner: "n", description: "Audio streaming ads.", why_this_tier: "Declining platform", next_action: "None", ai_play: "N/A", success_metric: "N/A" },
  { id: 31, name: "Connected TV Ads", category: "paid", tier: "later", impact: "M", effort: "H", owner: "n", description: "Streaming TV ads. Premium creative needed.", why_this_tier: "High production barrier", next_action: "Research at larger scale", ai_play: "AI video generation", success_metric: "Brand lift" },
  { id: 32, name: "Native Ads (Taboola/Outbrain)", category: "paid", tier: "later", impact: "M", effort: "M", owner: "n", description: "Content recommendation widgets.", why_this_tier: "Requires landing page content", next_action: "Test with lead magnet", ai_play: "AI generates headlines", success_metric: "Content engagement" },
  { id: 33, name: "Retargeting Pixels", category: "paid", tier: "now", impact: "H", effort: "L", owner: "b", description: "Track and retarget site visitors.", why_this_tier: "Critical infrastructure", next_action: "Install on all pages", ai_play: "AI optimizes audience segments", success_metric: "Return visitor rate" },
  { id: 34, name: "Lookalike Audiences", category: "paid", tier: "now", impact: "H", effort: "L", owner: "b", description: "Target similar to best customers.", why_this_tier: "Proven scale strategy", next_action: "Build from CRM list", ai_play: "AI identifies commonalities", success_metric: "New lead quality" },
  { id: 35, name: "Dynamic Product Ads", category: "paid", tier: "later", impact: "M", effort: "H", owner: "n", description: "Auto-generated service ads.", why_this_tier: "Requires catalog setup", next_action: "Build service catalog", ai_play: "AI matches services to dealers", success_metric: "Ad relevance score" },

  // Content & SEO (15)
  { id: 36, name: "Blog - Educational", category: "content", tier: "now", impact: "H", effort: "M", owner: "t", description: "Dealership marketing guides. SEO + lead magnets.", why_this_tier: "Inbound lead engine", next_action: "Weekly how-to posts", ai_play: "AI drafts from outlines", success_metric: "Organic traffic, downloads" },
  { id: 37, name: "Blog - Case Studies", category: "content", tier: "now", impact: "H", effort: "M", owner: "t", description: "Client success stories. Social proof.", why_this_tier: "Trust building, sales tool", next_action: "Monthly case study", ai_play: "AI structures interviews", success_metric: "Sales page conversions" },
  { id: 38, name: "SEO - On-page", category: "content", tier: "now", impact: "H", effort: "L", owner: "t", description: "Keyword optimization, meta tags.", why_this_tier: "Foundational for organic growth", next_action: "Audit top 20 pages", ai_play: "AI suggests keyword opportunities", success_metric: "Keyword rankings" },
  { id: 39, name: "SEO - Technical", category: "content", tier: "now", impact: "M", effort: "M", owner: "t", description: "Site speed, mobile, core web vitals.", why_this_tier: "Google ranking factor", next_action: "Run Lighthouse audit", ai_play: "AI identifies issues", success_metric: "Core Web Vitals score" },
  { id: 40, name: "SEO - Backlinks", category: "content", tier: "soon", impact: "H", effort: "H", owner: "t", description: "Link building, guest posts, PR.", why_this_tier: "Long-term authority builder", next_action: "Automotive site outreach list", ai_play: "AI finds link opportunities", success_metric: "Domain authority" },
  { id: 41, name: "Lead Magnets - PDFs", category: "content", tier: "now", impact: "H", effort: "M", owner: "t", description: "Downloadable guides. Email capture.", why_this_tier: "List building essential", next_action: "'TikTok for Dealers' guide", ai_play: "AI generates PDF content", success_metric: "Download-to-lead rate" },
  { id: 42, name: "Lead Magnets - Webinars", category: "content", tier: "soon", impact: "H", effort: "H", owner: "b", description: "Live training sessions. High-touch.", why_this_tier: "Strong qualifier, labor intensive", next_action: "Monthly webinar series", ai_play: "AI generates webinar outlines", success_metric: "Attendee-to-customer rate" },
  { id: 43, name: "Email Newsletter", category: "content", tier: "now", impact: "M", effort: "M", owner: "t", description: "Weekly dealer marketing tips.", why_this_tier: "Nurture channel", next_action: "Weekly send with blog summary", ai_play: "AI drafts newsletter", success_metric: "Open rate, click rate" },
  { id: 44, name: "Podcasting", category: "content", tier: "later", impact: "M", effort: "H", owner: "t", description: "Audio long-form. Dealer interviews.", why_this_tier: "High effort, niche audience", next_action: "Test 10-episode series", ai_play: "AI generates show notes", success_metric: "Downloads, dealer inquiries" },
  { id: 45, name: "SlideShare/LinkedIn Docs", category: "content", tier: "later", impact: "L", effort: "M", owner: "n", description: "Presentation sharing. Lead gen.", why_this_tier: "Low priority repurposing", next_action: "Upload webinar decks", ai_play: "AI converts content to slides", success_metric: "Views, downloads" },
  { id: 46, name: "Infographics", category: "content", tier: "later", impact: "M", effort: "M", owner: "n", description: "Visual data storytelling. Shareable.", why_this_tier: "Good for social, labor intensive", next_action: "Quarterly stat roundup", ai_play: "AI suggests data stories", success_metric: "Shares, backlinks" },
  { id: 47, name: "Ebooks", category: "content", tier: "later", impact: "M", effort: "H", owner: "n", description: "Long-form premium content.", why_this_tier: "One-time effort, ongoing value", next_action: "'Ultimate Dealer Marketing Guide'", ai_play: "AI drafts chapters", success_metric: "Download quality" },
  { id: 48, name: "Templates/Tools", category: "content", tier: "soon", impact: "H", effort: "M", owner: "t", description: "Free tools. Content calendar, ROI calc.", why_this_tier: "High perceived value", next_action: "Build ROI calculator", ai_play: "AI suggests tool ideas", success_metric: "Tool usage, leads" },
  { id: 49, name: "Video Tutorials", category: "content", tier: "soon", impact: "M", effort: "H", owner: "t", description: "How-to screen recordings.", why_this_tier: "Support + marketing hybrid", next_action: "Create 'Getting Started' series", ai_play: "AI generates scripts", success_metric: "Watch time, help ticket reduction" },
  { id: 50, name: "Documentation", category: "content", tier: "later", impact: "L", effort: "M", owner: "n", description: "Public help center.", why_this_tier: "Support focused, not lead gen", next_action: "Launch knowledge base", ai_play: "AI drafts articles", success_metric: "Search traffic" },

  // Partnerships & Referrals (15)
  { id: 51, name: "Dealer Referral Program", category: "referral", tier: "now", impact: "C", effort: "M", owner: "b", description: "Current dealers refer others. Revenue share.", why_this_tier: "Best leads, lowest CAC", next_action: "Launch referral portal + incentives", ai_play: "AI tracks referral attribution", success_metric: "Referral revenue %" },
  { id: 52, name: "Agency Partnerships", category: "partnerships", tier: "soon", impact: "H", effort: "H", owner: "b", description: "White-label for other agencies.", why_this_tier: "Channel scaling opportunity", next_action: "Build partner deck", ai_play: "AI manages partner onboarding", success_metric: "Partner-sourced revenue" },
  { id: 53, name: "DMS Provider Integration", category: "partnerships", tier: "soon", impact: "H", effort: "H", owner: "b", description: "CDK, Reynolds partnerships.", why_this_tier: "Distribution through trusted vendors", next_action: "Research integration requirements", ai_play: "API integration", success_metric: "Integration partners" },
  { id: 54, name: "Dealer Group Relationships", category: "partnerships", tier: "now", impact: "H", effort: "M", owner: "b", description: "Multi-location groups. Bulk deals.", why_this_tier: "Higher ACV, strategic accounts", next_action: "Target top 100 groups", ai_play: "AI identifies decision-makers", success_metric: "Group contracts signed" },
  { id: 55, name: "OEM Programs", category: "partnerships", tier: "later", impact: "H", effort: "H", owner: "b", description: "Honda/Toyota co-op programs.", why_this_tier: "Long sales cycle, huge upside", next_action: "Research OEM marketing managers", ai_play: "AI drafts proposals", success_metric: "OEM approvals" },
  { id: 56, name: "Trade Show Presence", category: "partnerships", tier: "soon", impact: "M", effort: "H", owner: "b", description: "NADA, Digital Dealer conferences.", why_this_tier: "Face-to-face, expensive", next_action: "Book NADA booth", ai_play: "AI qualifies booth leads", success_metric: "Conference pipeline" },
  { id: 57, name: "Industry Associations", category: "partnerships", tier: "later", impact: "M", effort: "M", owner: "b", description: "State dealer associations.", why_this_tier: "Credibility, networking", next_action: "Join 3 state associations", ai_play: "AI monitors member events", success_metric: "Association leads" },
  { id: 58, name: "Automotive Influencers", category: "partnerships", tier: "later", impact: "M", effort: "M", owner: "t", description: "Car YouTubers, podcasters.", why_this_tier: "Indirect reach, brand building", next_action: "List top 50 auto influencers", ai_play: "AI monitors for partnership fit", success_metric: "Brand mentions" },
  { id: 59, name: "Affiliate Program", category: "referral", tier: "later", impact: "M", effort: "M", owner: "n", description: "Commission for bloggers/creators.", why_this_tier: "Passive channel, needs scale", next_action: "Set up affiliate tracking", ai_play: "AI manages payouts", success_metric: "Affiliate revenue" },
  { id: 60, name: "Co-marketing Campaigns", category: "partnerships", tier: "soon", impact: "M", effort: "M", owner: "b", description: "Joint campaigns with complementary brands.", why_this_tier: "Audience sharing", next_action: "Identify 5 potential partners", ai_play: "AI suggests partner fit", success_metric: "Co-marketing leads" },
  { id: 61, name: "Guest Blogging", category: "partnerships", tier: "later", impact: "M", effort: "H", owner: "n", description: "Write for automotive sites.", why_this_tier: "SEO + audience building", next_action: "Pitch top 10 auto blogs", ai_play: "AI drafts guest posts", success_metric: "Backlinks, referral traffic" },
  { id: 62, name: "Podcast Guest Appearances", category: "partnerships", tier: "later", impact: "M", effort: "M", owner: "t", description: "Be interviewed on dealer podcasts.", why_this_tier: "Trust building, niche reach", next_action: "List top dealer podcasts", ai_play: "AI generates talking points", success_metric: "Podcast leads" },
  { id: 63, name: "LinkedIn Group Admin", category: "partnerships", tier: "monitor", impact: "L", effort: "H", owner: "n", description: "Create and moderate dealer group.", why_this_tier: "Long-term play, high maintenance", next_action: "Research group interest", ai_play: "AI moderates spam", success_metric: "Group engagement" },
  { id: 64, name: "Joint Ventures", category: "partnerships", tier: "monitor", impact: "M", effort: "H", owner: "n", description: "Strategic business partnerships.", why_this_tier: "Case-by-case opportunity", next_action: "Evaluate inbound opportunities", ai_play: "N/A", success_metric: "JV revenue" },
  { id: 65, name: "Speaking Engagements", category: "partnerships", tier: "soon", impact: "H", effort: "M", owner: "t", description: "Present at dealer events.", why_this_tier: "Authority building, direct access", next_action: "Submit NADA session proposal", ai_play: "AI drafts presentation", success_metric: "Speaking gigs booked" },

  // Automation & Tech (15)
  { id: 66, name: "ManyChat Automation", category: "automation", tier: "now", impact: "C", effort: "M", owner: "t", description: "IG/FB DM automation. Lead qualification.", why_this_tier: "Handles inbound volume", next_action: "Build lead qual flow", ai_play: "AI conversations", success_metric: "DM-to-qualified rate" },
  { id: 67, name: "Quo Phone System", category: "automation", tier: "now", impact: "H", effort: "L", owner: "b", description: "Dealer outreach phone system.", why_this_tier: "Active communication channel", next_action: "Optimize call scripts", ai_play: "AI transcribes + suggests responses", success_metric: "Call-to-meeting rate" },
  { id: 68, name: "Email Sequences", category: "automation", tier: "now", impact: "H", effort: "M", owner: "t", description: "Drip campaigns for leads.", why_this_tier: "Nurture automation", next_action: "Build 5-email onboarding sequence", ai_play: "AI personalizes emails", success_metric: "Sequence conversion rate" },
  { id: 69, name: "SMS Campaigns", category: "automation", tier: "soon", impact: "M", effort: "M", owner: "b", description: "Text message outreach.", why_this_tier: "High open rates", next_action: "Compliance check + test campaign", ai_play: "AI generates messages", success_metric: "SMS reply rate" },
  { id: 70, name: "Chatbot - Website", category: "automation", tier: "soon", impact: "M", effort: "M", owner: "t", description: "Live chat on website.", why_this_tier: "24/7 lead capture", next_action: "Install Intercom/Drift", ai_play: "AI answers FAQs", success_metric: "Chat-to-lead rate" },
  { id: 71, name: "Lead Scoring System", category: "automation", tier: "now", impact: "H", effort: "M", owner: "b", description: "Auto-rank lead quality.", why_this_tier: "Prioritize sales efforts", next_action: "Define scoring criteria", ai_play: "AI predicts conversion likelihood", success_metric: "Score accuracy" },
  { id: 72, name: "CRM Automation", category: "automation", tier: "now", impact: "H", effort: "M", owner: "b", description: "Auto-create tasks, assign leads.", why_this_tier: "Workflow efficiency", next_action: "Map lead lifecycle automations", ai_play: "AI suggests next actions", success_metric: "Time to first contact" },
  { id: 73, name: "Calendar Booking System", category: "automation", tier: "now", impact: "M", effort: "L", owner: "b", description: "Calendly/Chili Piper for demos.", why_this_tier: "Reduces booking friction", next_action: "Install on all CTAs", ai_play: "AI suggests optimal times", success_metric: "Booking rate" },
  { id: 74, name: "Proposal Automation", category: "automation", tier: "soon", impact: "M", effort: "M", owner: "b", description: "Auto-generate custom proposals.", why_this_tier: "Speed to quote", next_action: "Build proposal template system", ai_play: "AI customizes proposals", success_metric: "Proposal-to-close rate" },
  { id: 75, name: "Contract E-signature", category: "automation", tier: "now", impact: "M", effort: "L", owner: "b", description: "DocuSign/PandaDoc integration.", why_this_tier: "Close deals faster", next_action: "Implement e-sign", ai_play: "Auto-send after verbal yes", success_metric: "Contract turnaround time" },
  { id: 76, name: "Zapier Integrations", category: "automation", tier: "now", impact: "M", effort: "M", owner: "b", description: "Connect tools without code.", why_this_tier: "Glue layer for systems", next_action: "Map critical workflows", ai_play: "Pre-built zaps", success_metric: "Manual tasks eliminated" },
  { id: 77, name: "Reporting Dashboards", category: "automation", tier: "soon", impact: "M", effort: "M", owner: "b", description: "Real-time KPI tracking.", why_this_tier: "Data-driven decisions", next_action: "Build marketing dashboard", ai_play: "AI highlights anomalies", success_metric: "Dashboard usage" },
  { id: 78, name: "A/B Testing Platform", category: "automation", tier: "soon", impact: "M", effort: "M", owner: "t", description: "Optimize landing pages, ads.", why_this_tier: "Continuous improvement", next_action: "Implement Google Optimize", ai_play: "AI suggests test ideas", success_metric: "Conversion lift" },
  { id: 79, name: "Video Personalization", category: "automation", tier: "later", impact: "M", effort: "H", owner: "n", description: "Bonjoro-style personal videos.", why_this_tier: "High-touch, time-consuming", next_action: "Test with top prospects", ai_play: "AI generates video outlines", success_metric: "Video response rate" },
  { id: 80, name: "AI Content Generator", category: "automation", tier: "now", impact: "H", effort: "M", owner: "t", description: "GPT for drafting content.", why_this_tier: "10x content velocity", next_action: "Build prompt library", ai_play: "Core AI infrastructure", success_metric: "Content output volume" },

  // Infrastructure & Operations (15)
  { id: 81, name: "Website Redesign", category: "infrastructure", tier: "now", impact: "C", effort: "H", owner: "t", description: "Modern, fast, conversion-focused site.", why_this_tier: "Central hub for all channels", next_action: "Finalize design + launch", ai_play: "AI personalizes content", success_metric: "Site conversion rate" },
  { id: 82, name: "Landing Page System", category: "infrastructure", tier: "now", impact: "H", effort: "M", owner: "t", description: "Unbounce/Webflow for campaigns.", why_this_tier: "Test offers independently", next_action: "Build 3 core templates", ai_play: "AI generates variations", success_metric: "Landing page CVR" },
  { id: 83, name: "CRM Implementation", category: "infrastructure", tier: "now", impact: "C", effort: "H", owner: "b", description: "HubSpot/Pipedrive setup.", why_this_tier: "Central nervous system", next_action: "Migrate contacts + train team", ai_play: "AI enriches contact data", success_metric: "CRM adoption rate" },
  { id: 84, name: "Analytics Setup", category: "infrastructure", tier: "now", impact: "H", effort: "M", owner: "t", description: "GA4, tracking pixels, attribution.", why_this_tier: "Can't improve what you don't measure", next_action: "Audit tracking + fix gaps", ai_play: "AI attribution modeling", success_metric: "Data accuracy" },
  { id: 85, name: "Brand Identity System", category: "infrastructure", tier: "later", impact: "M", effort: "M", owner: "n", description: "Logo, colors, typography, voice.", why_this_tier: "Professional polish", next_action: "Create brand guidelines", ai_play: "AI ensures brand consistency", success_metric: "Brand recognition" },
  { id: 86, name: "Video Production Setup", category: "infrastructure", tier: "soon", impact: "M", effort: "H", owner: "t", description: "Studio, lighting, camera, editing.", why_this_tier: "Needed for scale", next_action: "Purchase equipment", ai_play: "AI editing assistance", success_metric: "Video output frequency" },
  { id: 87, name: "Photography Assets", category: "infrastructure", tier: "later", impact: "L", effort: "M", owner: "n", description: "Stock library, custom shoots.", why_this_tier: "Nice-to-have", next_action: "Build photo library", ai_play: "AI image generation", success_metric: "Asset reuse rate" },
  { id: 88, name: "Email Infrastructure", category: "infrastructure", tier: "now", impact: "M", effort: "M", owner: "b", description: "SendGrid, email warming, deliverability.", why_this_tier: "Avoid spam folder", next_action: "Set up SPF/DKIM/DMARC", ai_play: "AI monitors deliverability", success_metric: "Inbox placement rate" },
  { id: 89, name: "Team Hiring", category: "infrastructure", tier: "soon", impact: "H", effort: "H", owner: "b", description: "Expand team: video editor, SDR.", why_this_tier: "Scale bottleneck", next_action: "Post job descriptions", ai_play: "AI screens applicants", success_metric: "Time to hire" },
  { id: 90, name: "Knowledge Management", category: "infrastructure", tier: "later", impact: "M", effort: "M", owner: "n", description: "Internal wiki, SOPs, training.", why_this_tier: "Onboarding efficiency", next_action: "Set up Notion workspace", ai_play: "AI generates documentation", success_metric: "Onboarding time" },
  { id: 91, name: "Legal & Compliance", category: "infrastructure", tier: "now", impact: "M", effort: "M", owner: "b", description: "Contracts, privacy policy, TCPA.", why_this_tier: "Risk mitigation", next_action: "Legal review of all assets", ai_play: "AI flags compliance issues", success_metric: "Zero violations" },
  { id: 92, name: "Security & Backups", category: "infrastructure", tier: "now", impact: "M", effort: "M", owner: "b", description: "2FA, encrypted data, backups.", why_this_tier: "Protect business", next_action: "Security audit", ai_play: "AI monitors threats", success_metric: "Zero breaches" },
  { id: 93, name: "Project Management System", category: "infrastructure", tier: "now", impact: "M", effort: "L", owner: "b", description: "Asana/Monday for task tracking.", why_this_tier: "Team coordination", next_action: "Migrate to PM tool", ai_play: "AI prioritizes tasks", success_metric: "Task completion rate" },
  { id: 94, name: "Financial Systems", category: "infrastructure", tier: "soon", impact: "M", effort: "M", owner: "b", description: "Accounting, invoicing, forecasting.", why_this_tier: "Business health", next_action: "Implement QuickBooks", ai_play: "AI forecasts revenue", success_metric: "Financial reporting accuracy" },
  { id: 95, name: "Customer Support System", category: "infrastructure", tier: "later", impact: "M", effort: "M", owner: "n", description: "Helpdesk, ticket system.", why_this_tier: "When client volume grows", next_action: "Set up Help Scout", ai_play: "AI answers common questions", success_metric: "First response time" }
];

// ============================================
// SPRINTS
// ============================================
const SPRINTS = [
  {
    id: 'sprint-1',
    name: 'Sprint 1: Foundation',
    subtitle: 'Core Infrastructure & Quick Wins',
    weeks: 'Weeks 1-4',
    goal: 'Establish core marketing infrastructure and launch high-impact organic channels',
    success_metric: '10 qualified dealer leads from organic + 5 from paid',
    status: 'active',
    sort_order: 1
  },
  {
    id: 'sprint-2',
    name: 'Sprint 2: Scale',
    subtitle: 'Automation & Channel Expansion',
    weeks: 'Weeks 5-8',
    goal: 'Automate lead nurture, expand channel presence, close first 3 dealer deals',
    success_metric: '25 qualified leads, 3 closed deals, automated DM flow live',
    status: 'planned',
    sort_order: 2
  }
];

// ============================================
// SPRINT 1 BATTLE ASSIGNMENTS
// ============================================
const SPRINT_1_BATTLES = [
  {
    sprint_id: 'sprint-1',
    battle_id: 1, // TikTok
    status: 'in_progress',
    priority: 1,
    owner: 't',
    time_estimate: '8 hours',
    description: 'Implement keyword CTA system and set up AI comment monitoring for buying signals',
    deliverable: 'Keyword CTA links live on all videos + ManyChat DM automation',
    steps: [
      'Add keyword CTA to video captions (e.g., DM "DEALERS" for info)',
      'Set up ManyChat IG automation for keyword triggers',
      'Build qualification flow: dealership name, location, interest level',
      'Connect to CRM for auto-lead creation',
      'Test end-to-end flow with dummy accounts'
    ],
    ai_lever: 'ManyChat AI monitors comments, auto-engages qualified leads',
    metric: 'DM-to-qualified rate >30%, 5 qualified leads in Sprint 1',
    notes: 'Already have 470k followers, need to convert traffic to leads'
  },
  {
    sprint_id: 'sprint-1',
    battle_id: 16, // Facebook Ads - Conversions
    status: 'in_progress',
    priority: 2,
    owner: 'b',
    time_estimate: '12 hours',
    description: 'Launch targeted dealer lead gen campaigns with A/B tested creative',
    deliverable: '3 ad sets running, 2 landing page variants live',
    steps: [
      'Define target audience: GM/Marketing Director at dealerships',
      'Create 3 ad creative variations (video testimonial, case study, offer)',
      'Build 2 landing page variants (long-form vs short-form)',
      'Set up conversion tracking + CRM integration',
      'Launch with $50/day budget per ad set',
      'Daily monitoring + optimization'
    ],
    ai_lever: 'AI generates ad copy variations, suggests bid optimizations',
    metric: 'CPL <$75, 10 qualified leads in Sprint 1',
    notes: 'Focus on Honda/Toyota dealers first (proven niche)'
  },
  {
    sprint_id: 'sprint-1',
    battle_id: 19, // Google Search Ads
    status: 'not_started',
    priority: 3,
    owner: 'b',
    time_estimate: '10 hours',
    description: 'Launch search campaigns targeting dealer marketing keywords',
    deliverable: 'Campaign live with 20+ keyword targets',
    steps: [
      'Keyword research: "car dealership marketing", "dealer social media", etc.',
      'Build negative keyword list (jobs, reviews, etc.)',
      'Create 5 ad groups by intent level',
      'Write responsive search ads (3 headlines, 2 descriptions per)',
      'Set up call tracking + form tracking',
      'Launch with $100/day budget'
    ],
    ai_lever: 'AI suggests long-tail keyword opportunities',
    metric: 'CTR >4%, CVR >8%, 8 qualified leads in Sprint 1',
    notes: 'High-intent channel, expect better conversion than social'
  },
  {
    sprint_id: 'sprint-1',
    battle_id: 36, // Blog - Educational
    status: 'in_progress',
    priority: 4,
    owner: 't',
    time_estimate: '6 hours',
    description: 'Publish 4 SEO-optimized dealership marketing guides',
    deliverable: '4 blog posts published with lead magnets',
    steps: [
      'Keyword research for dealer pain points',
      'Outline 4 posts: "TikTok for Dealers", "Instagram Lead Gen", etc.',
      'AI drafts initial content from outlines',
      'Edit for accuracy + add dealer examples',
      'Create matching lead magnet PDFs',
      'Publish + promote on social'
    ],
    ai_lever: 'GPT generates blog drafts from detailed outlines',
    metric: '500 organic visits, 20 lead magnet downloads in Sprint 1',
    notes: 'Long-term SEO play, compounds over time'
  },
  {
    sprint_id: 'sprint-1',
    battle_id: 66, // ManyChat Automation
    status: 'not_started',
    priority: 5,
    owner: 't',
    time_estimate: '8 hours',
    description: 'Build IG/FB DM automation for lead qualification',
    deliverable: 'Full qualification flow live on IG & FB',
    steps: [
      'Map qualification criteria (dealership, location, role, timeline)',
      'Build conversational flow in ManyChat',
      'Add conditional logic based on answers',
      'Integrate with CRM (Zapier → HubSpot/Pipedrive)',
      'Test all branches thoroughly',
      'Launch + monitor daily'
    ],
    ai_lever: 'Natural language understanding for open-ended responses',
    metric: '50+ DM conversations, 15 qualified leads in Sprint 1',
    notes: 'Critical for handling TikTok/IG inbound volume'
  },
  {
    sprint_id: 'sprint-1',
    battle_id: 81, // Website Redesign
    status: 'in_progress',
    priority: 6,
    owner: 't',
    time_estimate: '20 hours',
    description: 'Launch new conversion-focused website',
    deliverable: 'New site live with clear CTAs and lead capture',
    steps: [
      'Finalize homepage wireframe (hero, social proof, CTA)',
      'Build service pages (TikTok, Instagram, etc.)',
      'Add case study section',
      'Implement Calendly booking widget',
      'Set up GA4 + conversion tracking',
      'Launch + redirect old URLs'
    ],
    ai_lever: 'AI personalizes homepage hero based on traffic source',
    metric: 'Site CVR >3%, 10 demo bookings in Sprint 1',
    notes: 'Website is central hub - high priority'
  },
  {
    sprint_id: 'sprint-1',
    battle_id: 51, // Dealer Referral Program
    status: 'not_started',
    priority: 7,
    owner: 'b',
    time_estimate: '6 hours',
    description: 'Launch referral program for existing dealer clients',
    deliverable: 'Referral portal live + 3 clients enrolled',
    steps: [
      'Define referral incentive (10% recurring commission? Free month?)',
      'Create simple referral landing page',
      'Set up unique referral links per dealer',
      'Build tracking system (Rewardful or manual)',
      'Email current clients with program details',
      'Follow up personally with top 5 clients'
    ],
    ai_lever: 'AI tracks referral attribution across touchpoints',
    metric: '3 referrals generated in Sprint 1',
    notes: 'Easiest channel - leverage existing happy clients'
  },
  {
    sprint_id: 'sprint-1',
    battle_id: 83, // CRM Implementation
    status: 'not_started',
    priority: 8,
    owner: 'b',
    time_estimate: '12 hours',
    description: 'Implement CRM and migrate existing contacts',
    deliverable: 'CRM fully configured with all leads imported',
    steps: [
      'Choose CRM (HubSpot Free vs Pipedrive vs custom)',
      'Set up pipeline stages (Lead, Contacted, Qualified, etc.)',
      'Import existing dealer contacts from spreadsheets',
      'Configure automation rules (lead assignment, follow-up tasks)',
      'Integrate with ManyChat, website forms, ads',
      'Train team on CRM usage'
    ],
    ai_lever: 'AI enriches contact data (company size, revenue, etc.)',
    metric: 'All leads in CRM, 100% team adoption',
    notes: 'Foundation for sales operations'
  }
];

// ============================================
// CRM: SAMPLE DEALER CONTACTS
// ============================================
const CONTACTS = [
  {
    first_name: 'Mike',
    last_name: 'Reynolds',
    email: 'mreynolds@oaklandtoyota.com',
    phone: '(510) 555-0123',
    dealership_name: 'Oakland Toyota',
    dealership_brand: 'Toyota',
    dealership_location: 'Oakland, CA',
    title: 'General Manager',
    stage: 'proposal',
    source: 'quo',
    lead_score: 85,
    priority: 'high',
    tags: ['toyota', 'bay-area', 'high-volume'],
    notes: 'Interested in TikTok + Instagram bundle. Currently spending $8k/mo on traditional ads. Open to test for Q2.'
  },
  {
    first_name: 'Sarah',
    last_name: 'Chen',
    email: 'schen@sunnyvale-honda.com',
    phone: '(408) 555-0456',
    dealership_name: 'Sunnyvale Honda',
    dealership_brand: 'Honda',
    dealership_location: 'Sunnyvale, CA',
    title: 'Marketing Director',
    stage: 'negotiation',
    source: 'cold-outbound',
    lead_score: 92,
    priority: 'urgent',
    tags: ['honda', 'bay-area', 'ready-to-buy'],
    notes: 'Responded to first-to-call campaign. Wants to start Feb 15. Negotiating pricing - offered 10% discount for annual commit.'
  },
  {
    first_name: 'David',
    last_name: 'Martinez',
    email: 'dmartinez@dallasnissan.com',
    phone: '(214) 555-0789',
    dealership_name: 'Dallas Nissan',
    dealership_brand: 'Nissan',
    dealership_location: 'Dallas, TX',
    title: 'Sales Manager',
    stage: 'qualified',
    source: 'manychat',
    lead_score: 78,
    priority: 'high',
    tags: ['nissan', 'texas', 'instagram-lead'],
    notes: 'Came through Instagram DM automation. Likes the case study video. Wants to see similar results for Nissan. Scheduled demo for next week.'
  },
  {
    first_name: 'Jennifer',
    last_name: 'Thompson',
    email: 'jthompson@miamihyundai.com',
    phone: '(305) 555-0234',
    dealership_name: 'Miami Hyundai',
    dealership_brand: 'Hyundai',
    dealership_location: 'Miami, FL',
    title: 'General Manager',
    stage: 'contacted',
    source: 'referral',
    lead_score: 65,
    priority: 'medium',
    tags: ['hyundai', 'florida', 'referral-oakland-toyota'],
    notes: 'Referred by Mike Reynolds at Oakland Toyota. Skeptical about social media ROI but willing to hear pitch. Follow up next week.'
  },
  {
    first_name: 'Robert',
    last_name: 'Johnson',
    email: 'rjohnson@phoenixford.com',
    phone: '(602) 555-0567',
    dealership_name: 'Phoenix Ford',
    dealership_brand: 'Ford',
    dealership_location: 'Phoenix, AZ',
    title: 'Owner',
    stage: 'lead',
    source: 'quo',
    lead_score: 45,
    priority: 'medium',
    tags: ['ford', 'arizona', 'new-lead'],
    notes: 'Inbound Quo message asking about TikTok pricing. Left voicemail, waiting for callback.'
  },
  {
    first_name: 'Lisa',
    last_name: 'Patel',
    email: 'lpatel@atlantabmw.com',
    phone: '(404) 555-0891',
    dealership_name: 'Atlanta BMW',
    dealership_brand: 'BMW',
    dealership_location: 'Atlanta, GA',
    title: 'Marketing Manager',
    stage: 'qualified',
    source: 'cold-outbound',
    lead_score: 72,
    priority: 'high',
    tags: ['bmw', 'georgia', 'luxury'],
    notes: 'Interested in luxury brand positioning on Instagram. Wants premium content strategy. Budget not an issue. Demo scheduled for Thursday.'
  },
  {
    first_name: 'Carlos',
    last_name: 'Rodriguez',
    email: 'crodriguez@austintoyota.com',
    phone: '(512) 555-0345',
    dealership_name: 'Austin Toyota',
    dealership_brand: 'Toyota',
    dealership_location: 'Austin, TX',
    title: 'Digital Marketing Lead',
    stage: 'nurture',
    source: 'website',
    lead_score: 55,
    priority: 'low',
    tags: ['toyota', 'texas', 'long-term'],
    notes: 'Downloaded TikTok guide from website. Not ready now, revisit in Q3 when budget opens up.'
  },
  {
    first_name: 'Amanda',
    last_name: 'White',
    email: 'awhite@sandiegochevy.com',
    phone: '(619) 555-0678',
    dealership_name: 'San Diego Chevrolet',
    dealership_brand: 'Chevrolet',
    dealership_location: 'San Diego, CA',
    title: 'Sales Director',
    stage: 'closed-won',
    source: 'referral',
    lead_score: 95,
    priority: 'high',
    tags: ['chevrolet', 'california', 'client', 'success-story'],
    notes: 'CLOSED! Signed 6-month contract for TikTok + Instagram. Starting Feb 1. Use as case study.'
  },
  {
    first_name: 'James',
    last_name: 'Kim',
    email: 'jkim@seattlemercedes.com',
    phone: '(206) 555-0912',
    dealership_name: 'Seattle Mercedes-Benz',
    dealership_brand: 'Mercedes-Benz',
    dealership_location: 'Seattle, WA',
    title: 'General Manager',
    stage: 'closed-lost',
    source: 'cold-outbound',
    lead_score: 30,
    priority: 'low',
    tags: ['mercedes', 'washington', 'lost'],
    notes: 'Passed. Already working with another agency. Revisit in 6 months when contract is up.'
  }
];

// ============================================
// CRM: SAMPLE COMMUNICATIONS
// ============================================
const SAMPLE_COMMUNICATIONS = [
  // Mike Reynolds (Oakland Toyota)
  {
    contact_lookup: { email: 'mreynolds@oaklandtoyota.com' },
    type: 'sms',
    direction: 'outbound',
    body: 'Hey Mike! This is Tomi from Delivrd. We help Toyota dealers like yours get more leads through TikTok & Instagram. Got 2 min for a quick intro? 📲',
    status: 'delivered',
    created_offset_hours: -72
  },
  {
    contact_lookup: { email: 'mreynolds@oaklandtoyota.com' },
    type: 'sms',
    direction: 'inbound',
    body: 'Sure, tell me more. What kind of results are you seeing?',
    status: 'delivered',
    created_offset_hours: -71
  },
  {
    contact_lookup: { email: 'mreynolds@oaklandtoyota.com' },
    type: 'call',
    direction: 'outbound',
    subject: 'Initial discovery call',
    body: 'Discussed current marketing spend, pain points with traditional advertising. Interested in TikTok viral approach.',
    metadata: { duration_seconds: 1240, phone: '(510) 555-0123' },
    status: 'sent',
    created_offset_hours: -48
  },
  {
    contact_lookup: { email: 'mreynolds@oaklandtoyota.com' },
    type: 'email',
    direction: 'outbound',
    subject: 'Delivrd Partnership Proposal for Oakland Toyota',
    body: 'Hi Mike, great chatting with you! Attached is the custom proposal we discussed. Key highlights: 📱 TikTok viral strategy, 📊 Instagram lead gen system, 💰 Expected 20-30 qualified leads/month',
    status: 'read',
    created_offset_hours: -24
  },

  // Sarah Chen (Sunnyvale Honda)
  {
    contact_lookup: { email: 'schen@sunnyvale-honda.com' },
    type: 'call',
    direction: 'outbound',
    subject: 'First-to-call outreach',
    body: 'Left voicemail introducing Delivrd and our work with Honda dealers.',
    metadata: { duration_seconds: 0, phone: '(408) 555-0456', voicemail: true },
    status: 'sent',
    created_offset_hours: -120
  },
  {
    contact_lookup: { email: 'schen@sunnyvale-honda.com' },
    type: 'sms',
    direction: 'inbound',
    body: 'Got your voicemail. Send me info on pricing.',
    status: 'delivered',
    created_offset_hours: -96
  },
  {
    contact_lookup: { email: 'schen@sunnyvale-honda.com' },
    type: 'call',
    direction: 'outbound',
    subject: 'Pricing discussion & demo',
    body: 'Walked through case studies, showed TikTok results. Sarah very interested, wants to start ASAP. Negotiating annual contract for discount.',
    metadata: { duration_seconds: 1860, phone: '(408) 555-0456' },
    status: 'sent',
    created_offset_hours: -72
  },

  // David Martinez (Dallas Nissan)
  {
    contact_lookup: { email: 'dmartinez@dallasnissan.com' },
    type: 'sms',
    direction: 'inbound',
    body: 'Hey, saw your Instagram post about dealer marketing. Interested in learning more.',
    status: 'delivered',
    metadata: { quo_message_id: 'quo_msg_123456' },
    created_offset_hours: -168
  },
  {
    contact_lookup: { email: 'dmartinez@dallasnissan.com' },
    type: 'sms',
    direction: 'outbound',
    body: 'Thanks for reaching out David! We specialize in TikTok & Instagram for dealerships. Can I send you a quick case study video?',
    status: 'delivered',
    created_offset_hours: -167
  },
  {
    contact_lookup: { email: 'dmartinez@dallasnissan.com' },
    type: 'note',
    direction: 'internal',
    body: 'Scheduled demo for next Tuesday 2pm CT. Prepare Nissan-specific examples.',
    status: 'sent',
    created_offset_hours: -24
  },

  // Amanda White (San Diego Chevy) - CLOSED WON
  {
    contact_lookup: { email: 'awhite@sandiegochevy.com' },
    type: 'email',
    direction: 'outbound',
    subject: 'Welcome to Delivrd! 🎉',
    body: 'Hey Amanda! So excited to start working with San Diego Chevrolet. Here\'s your onboarding checklist and what to expect in the first 30 days.',
    status: 'read',
    created_offset_hours: -12
  },
  {
    contact_lookup: { email: 'awhite@sandiegochevy.com' },
    type: 'call',
    direction: 'outbound',
    subject: 'Kickoff call',
    body: 'Reviewed content strategy, filming logistics, and KPIs. Amanda is pumped! Starting content production next week.',
    metadata: { duration_seconds: 2100, phone: '(619) 555-0678' },
    status: 'sent',
    created_offset_hours: -6
  }
];

// ============================================
// CRM: FOLLOW-UP TASKS
// ============================================
const FOLLOW_UPS = [
  {
    contact_lookup: { email: 'schen@sunnyvale-honda.com' },
    title: 'Follow up on contract proposal',
    description: 'Sarah said she needs to review with her GM. Follow up to close the deal. Offer 10% discount for annual commitment.',
    type: 'call',
    priority: 'urgent',
    status: 'pending',
    due_offset_hours: 12
  },
  {
    contact_lookup: { email: 'dmartinez@dallasnissan.com' },
    title: 'Demo: Dallas Nissan',
    description: 'Product demo scheduled. Prepare Nissan-specific case studies and ROI calculator.',
    type: 'demo',
    priority: 'high',
    status: 'pending',
    due_offset_hours: 72
  },
  {
    contact_lookup: { email: 'lpatel@atlantabmw.com' },
    title: 'Send luxury brand content examples',
    description: 'Lisa wants to see how we position luxury brands on Instagram. Send BMW/Mercedes examples.',
    type: 'email',
    priority: 'high',
    status: 'pending',
    due_offset_hours: 24
  },
  {
    contact_lookup: { email: 'jthompson@miamihyundai.com' },
    title: 'Weekly check-in: Miami Hyundai',
    description: 'Referral from Oakland Toyota. Build rapport before pitching. Ask about current marketing challenges.',
    type: 'call',
    priority: 'medium',
    status: 'pending',
    due_offset_hours: 120
  },
  {
    contact_lookup: { email: 'crodriguez@austintoyota.com' },
    title: 'Q3 follow-up: Austin Toyota',
    description: 'Carlos said to revisit in Q3 when budget opens. Set reminder to check in.',
    type: 'check-in',
    priority: 'low',
    status: 'pending',
    due_offset_hours: 2160 // ~3 months
  }
];

// ============================================
// SEED EXECUTION WITH AUTH
// ============================================
async function main() {
  console.log('🌱 Starting Delivrd War Room data seed (with auth)...\n');

  try {
    // Sign in with existing user
    console.log('🔐 Signing in as tomi@delivrd.com...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'tomi@delivrd.com',
      password: process.env.SEED_PASSWORD || 'delivrd2024!' // Default password, override with env var
    });

    if (authError) {
      console.error('❌ Auth failed:', authError.message);
      console.log('\n💡 Set SEED_PASSWORD environment variable if using custom password:');
      console.log('   SEED_PASSWORD=your_password npx ts-node scripts/seed-data-auth.ts\n');
      process.exit(1);
    }

    console.log('✅ Authenticated successfully\n');

    const userId = authData.user?.id;

    // 1. Insert Battles
    console.log('⚔️  Inserting 95 marketing channel battles...');
    const { error: battlesError } = await supabase.from('battles').upsert(BATTLES, { onConflict: 'id' });
    if (battlesError) throw battlesError;
    console.log(`✅ Inserted ${BATTLES.length} battles\n`);

    // 2. Insert Sprints
    console.log('🏃 Inserting sprints...');
    const { error: sprintsError } = await supabase.from('sprints').upsert(SPRINTS, { onConflict: 'id' });
    if (sprintsError) throw sprintsError;
    console.log(`✅ Inserted ${SPRINTS.length} sprints\n`);

    // 3. Insert Sprint Battles
    console.log('📋 Assigning battles to Sprint 1...');
    const sprintBattlesWithUser = SPRINT_1_BATTLES.map(sb => ({
      ...sb,
      updated_by: userId
    }));
    const { error: sprintBattlesError } = await supabase.from('sprint_battles').insert(sprintBattlesWithUser);
    if (sprintBattlesError) throw sprintBattlesError;
    console.log(`✅ Assigned ${SPRINT_1_BATTLES.length} battles to Sprint 1\n`);

    // 4. Insert CRM Contacts
    console.log('👥 Creating dealer contacts...');
    const contactsWithAssignment = CONTACTS.map(c => ({
      ...c,
      assigned_to: userId
    }));
    const { data: insertedContacts, error: contactsError } = await supabase
      .from('contacts')
      .insert(contactsWithAssignment)
      .select();
    if (contactsError) throw contactsError;
    console.log(`✅ Created ${insertedContacts.length} dealer contacts\n`);

    // 5. Insert Communications
    console.log('💬 Adding sample communications...');
    const communicationsToInsert = [];
    for (const comm of SAMPLE_COMMUNICATIONS) {
      const contact = insertedContacts.find(c => c.email === comm.contact_lookup.email);
      if (contact) {
        const createdAt = new Date();
        createdAt.setHours(createdAt.getHours() + comm.created_offset_hours);
        communicationsToInsert.push({
          contact_id: contact.id,
          type: comm.type,
          direction: comm.direction,
          subject: comm.subject,
          body: comm.body,
          status: comm.status,
          metadata: comm.metadata || {},
          quo_message_id: comm.metadata?.quo_message_id,
          created_by: userId,
          created_at: createdAt.toISOString()
        });
      }
    }
    const { error: communicationsError } = await supabase.from('communications').insert(communicationsToInsert);
    if (communicationsError) throw communicationsError;
    console.log(`✅ Added ${communicationsToInsert.length} communications\n`);

    // 6. Insert Follow-ups
    console.log('📅 Creating follow-up tasks...');
    const followUpsToInsert = [];
    for (const task of FOLLOW_UPS) {
      const contact = insertedContacts.find(c => c.email === task.contact_lookup.email);
      if (contact) {
        const dueDate = new Date();
        dueDate.setHours(dueDate.getHours() + task.due_offset_hours);
        followUpsToInsert.push({
          contact_id: contact.id,
          assigned_to: userId,
          created_by: userId,
          title: task.title,
          description: task.description,
          type: task.type,
          priority: task.priority,
          status: task.status,
          due_date: dueDate.toISOString()
        });
      }
    }
    const { error: followUpsError } = await supabase.from('follow_ups').insert(followUpsToInsert);
    if (followUpsError) throw followUpsError;
    console.log(`✅ Created ${followUpsToInsert.length} follow-up tasks\n`);

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SEED COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   ⚔️  ${BATTLES.length} marketing channel battles`);
    console.log(`   🏃 ${SPRINTS.length} sprints`);
    console.log(`   📋 ${SPRINT_1_BATTLES.length} battles assigned to Sprint 1`);
    console.log(`   👥 ${insertedContacts.length} dealer contacts`);
    console.log(`   💬 ${communicationsToInsert.length} communications`);
    console.log(`   📅 ${followUpsToInsert.length} follow-up tasks\n`);
    console.log('✨ Your War Room is ready for battle!');
    console.log('   📖 Visit /library to see all battles');
    console.log('   🏃 Visit /sprints to see Sprint 1');
    console.log('   📊 Visit /pipeline to see dealer contacts');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Sign out
    await supabase.auth.signOut();

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main();
