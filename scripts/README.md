# Delivrd War Room - Seed Data

## 📦 What's Included

This seed generates realistic test data for your Delivrd War Room:

### War Room (Marketing Battles)
- ⚔️  **95 marketing channel battles** across all categories:
  - 15 organic social channels (TikTok, Instagram, YouTube, LinkedIn, etc.)
  - 20 paid advertising channels (Facebook Ads, Google Ads, TikTok Ads, etc.)
  - 15 content & SEO initiatives
  - 15 partnerships & referral programs
  - 15 automation & tech systems
  - 15 infrastructure & operations

- 🏃 **2 sprints:**
  - Sprint 1: Foundation (Weeks 1-4)
  - Sprint 2: Scale (Weeks 5-8)

- 📋 **8 battles assigned to Sprint 1** with full execution details:
  - TikTok keyword CTA system
  - Facebook Ads campaigns
  - Google Search Ads
  - Educational blog posts
  - ManyChat automation
  - Website redesign
  - Dealer referral program
  - CRM implementation

### CRM (Pre-Sale Customer Acquisition Funnel)

**Business Model:** Delivrd is a car buying concierge service ($499 fee). This CRM tracks prospects from lead → paid signup. After payment, customers move to production CRM for delivery.

**Pipeline Stages:**
- **NEW** - Fresh lead from TikTok/Instagram
- **CONTACTED** - Reached out to prospect
- **QUALIFIED** - Confirmed they're a good fit for Delivrd
- **CONSULT BOOKED** - Consultation call scheduled
- **CONSULT DONE** - Consultation completed
- **PROPOSAL OUT** - Sent Delivrd pricing ($499 fee)
- **PAID** - Signed up (moves to production CRM)

- 👥 **11 service prospects** across pre-sale funnel:
  - Michael Chen (PAID - signed up! 🎉)
  - Jessica Martinez (PROPOSAL OUT - wants Honda Accord, hot!)
  - David Patel (PROPOSAL OUT - BMW X5, comparing options)
  - Emily Rodriguez (CONSULT DONE - RAV4, ready for proposal)
  - Brandon Thompson (CONSULT BOOKED - F-150, call tomorrow)
  - Sarah Kim (CONSULT BOOKED - Nissan Rogue, family)
  - Marcus Johnson (QUALIFIED - needs to book consult)
  - Ashley Davis (CONTACTED - left voicemail)
  - Alex Garcia (CONTACTED - in DM conversation)
  - Jennifer White (NEW - just submitted lead form)
  - Chris Taylor (NEW - haven't contacted yet)

- 💬 **20 sample communications:**
  - Service sales conversations
  - Explaining Delivrd's concierge service
  - Discussing $499 concierge fee
  - Answering objections ("Why not go direct to dealer?")
  - Booking consultation calls

- 📅 **7 follow-up tasks:**
  - Urgent: Close Jessica (proposal out)
  - Urgent: Run Brandon's consultation call
  - High: Send Emily proposal after consult
  - High: Follow up with David on proposal
  - Medium: Book Marcus' consultation
  - Medium: Follow up with Ashley
  - Low: Request testimonial from Michael

## 🚀 How to Run

### Option 1: SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://tqxtkqzswhcyhopkhjam.supabase.co
   - Navigate to **SQL Editor**

2. **Run the Seed Script**
   - Copy the contents of `seed-data.sql`
   - Paste into SQL Editor
   - Click **Run**
   - Wait ~30 seconds for completion

3. **Verify Success**
   - You should see success messages in the output
   - Check the Results tab for confirmation

4. **Test the Application**
   - Visit `/library` - see all 95 battles
   - Visit `/sprints` - see Sprint 1 with 8 assigned battles
   - Visit `/pipeline` - see 9 dealer contacts

### Option 2: TypeScript (Requires Auth)

If you have the user password, you can run the TypeScript version:

```bash
cd ~/.openclaw/workspace/delivrd-warroom
SEED_PASSWORD="your_password" npx ts-node scripts/seed-data-auth.ts
```

**Note:** You need the password for `tomi@delivrd.com` to use this method.

## 📊 Data Summary

| Category | Count | Description |
|----------|-------|-------------|
| **Battles** | 95 | All marketing channels |
| **Sprints** | 2 | Sprint 1 (active), Sprint 2 (planned) |
| **Sprint Battles** | 8 | Sprint 1 assignments |
| **Contacts** | 11 | Service prospects (pre-sale funnel) |
| **Communications** | 20 | Service sales conversations |
| **Follow-ups** | 7 | Sales tasks (close, consult, proposal) |

## ✨ What You'll See

### /library Page
- 95 battles organized by category
- Filter by tier (now, soon, later, monitor)
- Filter by impact (C, H, M, L)
- Search functionality

### /sprints Page
- Sprint 1: Foundation (active)
- 8 battles with full execution details:
  - Status tracking
  - Deliverables
  - Step-by-step plans
  - AI levers
  - Success metrics
  - Notes

### /pipeline Page
- 11 service prospects
- Pre-sale funnel stages (NEW → PAID)
- Service sales communications
- Tasks focused on closing deals
- Lead scoring based on buying intent

## 🎯 Sample Prospect Scenarios

### 🔥 Hot Prospect (Jessica Martinez)
- **Service:** Delivrd concierge ($499 fee)
- **Her Need:** Buy Honda Accord without dealer hassle
- **Stage:** Proposal Out
- **Score:** 88/100
- **Status:** Has pricing, discussing with spouse
- **Task:** Follow up in 12 hours to close

### 📞 Consultation Scheduled (Brandon Thompson)
- **Service:** Delivrd concierge ($499 fee)
- **His Need:** Buy F-150 for contracting business
- **Stage:** Consult Booked
- **Score:** 70/100
- **Pain Point:** Dealers marking up F-150s $5k over MSRP
- **Task:** Run consultation call tomorrow 2pm CT

### 🎉 Paid Customer (Michael Chen)
- **Service:** Paid $499 for Delivrd concierge
- **His Need:** Buy Honda CR-V in Bay Area
- **Stage:** Closed-Won (PAID)
- **Score:** 98/100
- **Status:** Moving to production CRM for delivery
- **Use as:** Testimonial opportunity

## 🔧 Troubleshooting

### "Row-level security policy" Error
- Use the SQL Editor method (Option 1)
- SQL Editor runs with admin privileges and bypasses RLS

### "Invalid login credentials" Error
- You need the correct password for TypeScript method
- Fallback to SQL Editor method

### No Data Showing
- Check that you're logged in as `tomi@delivrd.com` or `schalaschly@delivrd.com`
- Verify the seed script completed successfully
- Check browser console for errors

## 🗑️ Reset Data

To clear all seed data and start fresh:

```sql
-- Run in Supabase SQL Editor
BEGIN;
DELETE FROM follow_ups;
DELETE FROM communications;
DELETE FROM contacts;
DELETE FROM sprint_battles;
DELETE FROM sprints;
DELETE FROM battles;
COMMIT;
```

Then re-run the seed script.

## 📝 Notes

- All data is realistic for car buying concierge service sales
- **CRM tracks PRE-SALE FUNNEL ONLY** (marketing → paid signup)
- **Contacts are prospects** considering signing up for Delivrd's service
- Communications discuss **Delivrd's $499 concierge service**, not specific cars
- After PAID stage, customers move to production CRM for delivery
- Contact emails use common email providers (Gmail, Yahoo, etc.)
- `dealership_name` field is NULL (not relevant in pre-sale)
- Phone numbers are in valid format but not real
- Timestamps are relative to current time (e.g., "-72 hours ago")
- Battle IDs are consistent (1-95)

## 🎨 Customization

Want to modify the data? Edit `seed-data.sql`:

- **Add more prospects:** Duplicate and modify the INSERT INTO contacts section
- **Change battle priorities:** Update the `tier`, `impact`, or `effort` values
- **Add battles to Sprint 2:** Create new sprint_battles entries
- **Customize sales scenarios:** Modify prospect needs, objections, pipeline stages
- **Add more communications:** Create realistic service sales conversations
- **Adjust follow-ups:** Add tasks for closing deals, booking consults, sending proposals

## ✅ Success Checklist

After seeding, you should have:

- [x] 95 battles visible in /library
- [x] Sprint 1 active with 8 assigned battles in /sprints
- [x] 11 service prospects in pre-sale funnel in /pipeline
- [x] Pipeline stages: NEW → CONTACTED → QUALIFIED → CONSULT BOOKED → CONSULT DONE → PROPOSAL OUT → PAID
- [x] Communications showing service sales conversations
- [x] 7 follow-up tasks focused on closing deals
- [x] Realistic pre-sale customer acquisition scenarios

Your War Room is ready for battle! 🚀
