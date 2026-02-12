# CRM Phase 2: Integrations

## 🚀 Features Implemented

### 1. ✅ Quo/OpenPhone SMS Integration
- **Outbound SMS:** Send SMS from UI via `/api/sms/send`
- **Inbound Webhook:** Receive SMS at `/api/webhooks/quo`
- **Auto-pause sequences:** When contact replies, active sequences pause automatically
- **E.164 phone formatting:** All numbers stored consistently
- **Deduplication:** Prevents duplicate message logging

**Files Created:**
- `lib/api/quo.ts` - Quo API client
- `app/api/sms/send/route.ts` - Send SMS endpoint
- `app/api/webhooks/quo/route.ts` - Inbound webhook handler
- Updated `components/crm/ContactDetailPanel.tsx` - Send SMS button + modal

---

### 2. ✅ ManyChat Webhook Integration
- **Auto-create contacts:** From ManyChat subscriber data
- **Lead scoring:** Automatic calculation on webhook receipt
- **Hot lead detection:** Score >70 → set to `qualified` + send Slack alert
- **Warm lead nurture:** Score 40-70 → auto-enroll in nurture sequence
- **Deduplication:** Matches by phone OR `manychat_id`

**Files Created:**
- `app/api/webhooks/manychat/route.ts`

**Webhook Payload Example:**
```json
{
  "subscriber_id": "1234567890",
  "first_name": "Sarah",
  "last_name": "Chen",
  "phone": "+14155551234",
  "source": "tiktok_live",
  "vehicle_interest": "2025 RAV4 Hybrid",
  "timeline": "this_month",
  "budget": "50-75k"
}
```

---

### 3. ✅ Slack Notifications
- **Hot lead alerts** (score >70)
- **Inbound SMS/call** notifications
- **Stage change to PAID** celebrations
- **Follow-up overdue** warnings (>24h)
- **Daily digest** (morning summary at 9 AM)

**Files Created:**
- `lib/api/slack.ts`

**Message Examples:**
```
🔥 NEW HOT LEAD: Sarah Chen — 2025 RAV4 — Score: 85 — TikTok
💰 PAID: James Park — $1,000 — 2025 Honda CR-V
⚠️ FOLLOW-UP OVERDUE: Mike Johnson — "Send pricing" — 36h overdue
```

---

### 4. ✅ Auto-Response System (Sequences)
- **Cron processor:** Runs every 15 minutes (`/api/cron/sequences`)
- **Template rendering:** Supports `{{first_name}}`, `{{last_name}}`, etc.
- **Auto-pause on reply:** If contact responds, sequence immediately pauses
- **New lead auto-text:** Immediate welcome SMS on contact creation
- **Multi-step sequences:** Day-based progression

**Files Created:**
- `app/api/cron/sequences/route.ts` - Sequence processor
- `supabase/migrations/003_default_sequences.sql` - Default sequences + trigger
- `vercel.json` - Cron job configuration

**Default Sequence: "Nurture - New Lead"**
- **Day 0:** "Hey {{first_name}}! Thanks for reaching out to Delivrd. Quick question — what vehicle are you looking at and when are you looking to buy?"
- **Day 2:** Follow-up check-in
- **Day 5:** Final check-in

**Triggers:**
- New contact created with source: `manychat`, `quo`, `website`, `referral`
- Stage: `lead`

---

### 5. ✅ Lead Scoring Calculator
- **Formula:** 0-100 score based on:
  - **Timeline:** +25 (this month), +15 (1-3mo), +5 (3-6mo)
  - **Budget:** +20 ($75k+), +15 ($50-75k), +10 ($30-50k), +5 (<$30k)
  - **Source:** +15 (referral), +10 (YouTube/TikTok), +5 (DM/form), +3 (phone)
  - **Engagement:** +10 (has phone), +5 (responded <1hr), +5 (specific vehicle)
  - **Decay:** -10 (7+ days no response), -20 (14+ days)
  - **Stage bonus:** +10 (qualified), +15 (proposal/negotiation)
- **Recalculation:** Daily at 2 AM + on contact data change

**Files Updated:**
- `lib/api/crm.ts` - Added `calculateLeadScore()` and `recalculateAllLeadScores()`

**Cron Jobs:**
- `app/api/cron/lead-scoring/route.ts` - Daily recalc (2 AM)
- `app/api/cron/daily-digest/route.ts` - Slack digest (9 AM)

---

## 🔧 Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

**Required:**
- `QUO_API_KEY` - Get from Quo/OpenPhone dashboard
- `QUO_OUTBOUND_NUMBER` - Your SMS sending number (+19804462514)
- `SLACK_WEBHOOK_URL` - Create at https://api.slack.com/messaging/webhooks

**Optional:**
- `MANYCHAT_WEBHOOK_SECRET` - For webhook validation
- `CRON_SECRET` - Protect cron endpoints (generate with `openssl rand -base64 32`)

### 2. Database Migrations
Run the new migration to create default sequences:

```bash
# If using Supabase CLI:
supabase db push

# Or manually run SQL:
supabase/migrations/003_default_sequences.sql
```

### 3. Webhook Configuration

#### Quo/OpenPhone Webhook
1. Go to Quo/OpenPhone Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/quo`
3. Select events: `message.received`
4. Save

#### ManyChat Webhook
1. Go to ManyChat → Settings → Integrations → Webhook
2. Add webhook URL: `https://your-domain.com/api/webhooks/manychat`
3. Configure which fields to send (see payload example above)
4. Test with a sample payload

### 4. Deploy to Vercel
```bash
vercel --prod
```

Vercel will automatically:
- Configure cron jobs from `vercel.json`
- Enable edge functions
- Set up environment variables (add them in Vercel dashboard first)

---

## 🧪 Testing

### Test Quo SMS Integration

**1. Send Outbound SMS:**
```bash
curl -X POST https://your-domain.com/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "uuid-here",
    "message": "Test message from CRM"
  }'
```

**2. Test Inbound Webhook (ngrok for local):**
```bash
# Terminal 1: Start ngrok
ngrok http 3000

# Terminal 2: Send test webhook
curl -X POST https://your-ngrok-url.ngrok.io/api/webhooks/quo \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-123",
    "object": "message",
    "from": "+14155551234",
    "to": ["+19804462514"],
    "direction": "incoming",
    "content": "Test inbound message",
    "createdAt": "2024-02-12T12:00:00Z"
  }'
```

### Test ManyChat Webhook
```bash
curl -X POST https://your-domain.com/api/webhooks/manychat \
  -H "Content-Type: application/json" \
  -d '{
    "subscriber_id": "test-subscriber-123",
    "first_name": "Sarah",
    "last_name": "Chen",
    "phone": "+14155551234",
    "source": "tiktok_live",
    "vehicle_interest": "2025 RAV4 Hybrid",
    "timeline": "this_month",
    "budget": "50-75k"
  }'
```

**Expected result:** Hot lead created (score >70) → Slack alert sent

### Test Slack Notifications
```bash
# In your app console or API route:
import { sendSlackAlert } from '@/lib/api/slack';

await sendSlackAlert('hot_lead', {
  name: 'Test User',
  vehicle: '2025 RAV4',
  score: 85,
  source: 'TikTok',
  contactId: 'test-id'
});
```

### Test Sequence Processor (Manual)
```bash
curl https://your-domain.com/api/cron/sequences
```

**What it does:**
1. Finds active enrollments due for next step
2. Sends SMS via Quo API
3. Logs communication
4. Advances to next step or completes sequence

### Test Lead Scoring (Manual)
```bash
curl https://your-domain.com/api/cron/lead-scoring
```

---

## 📊 Monitoring

### Check Sequence Status
```sql
-- Active enrollments
SELECT 
  se.id,
  c.first_name,
  c.phone,
  s.name as sequence_name,
  se.current_step,
  se.metadata->>'next_step_at' as next_step
FROM sequence_enrollments se
JOIN contacts c ON c.id = se.contact_id
JOIN sequences s ON s.id = se.sequence_id
WHERE se.status = 'active'
ORDER BY se.metadata->>'next_step_at' ASC;
```

### Check Recent Communications
```sql
-- Last 20 communications
SELECT 
  c.first_name,
  c.phone,
  cm.type,
  cm.direction,
  LEFT(cm.body, 50) as preview,
  cm.created_at
FROM communications cm
JOIN contacts c ON c.id = cm.contact_id
ORDER BY cm.created_at DESC
LIMIT 20;
```

### Lead Score Distribution
```sql
-- Score distribution
SELECT 
  CASE 
    WHEN lead_score >= 70 THEN 'Hot (70+)'
    WHEN lead_score >= 40 THEN 'Warm (40-69)'
    ELSE 'Cold (<40)'
  END as category,
  COUNT(*) as count,
  ROUND(AVG(lead_score)) as avg_score
FROM contacts
WHERE deleted_at IS NULL
GROUP BY category
ORDER BY avg_score DESC;
```

---

## 🐛 Troubleshooting

### SMS Not Sending
1. Check `QUO_API_KEY` is set correctly
2. Verify phone number is in E.164 format (+1XXXXXXXXXX)
3. Check Quo API dashboard for error logs
4. Verify contact has a phone number

### Webhook Not Receiving
1. Check webhook URL is publicly accessible (use ngrok for local)
2. Verify webhook is registered in Quo/ManyChat dashboard
3. Check Vercel logs: `vercel logs`
4. Test with manual curl (see testing section)

### Sequences Not Running
1. Verify Vercel cron jobs are enabled (Hobby plan or higher)
2. Check `vercel.json` is in root directory
3. Manually trigger: `curl https://your-domain.com/api/cron/sequences`
4. Check logs for errors
5. Verify `next_step_at` is in the past

### Slack Alerts Not Sending
1. Check `SLACK_WEBHOOK_URL` is set
2. Test webhook directly: `curl -X POST $SLACK_WEBHOOK_URL -d '{"text": "Test"}'`
3. Verify webhook is active in Slack settings

---

## 🎯 Next Steps (Phase 3 - Optional)

- [ ] Email integration (Resend/SendGrid)
- [ ] Call tracking (Twilio)
- [ ] Advanced sequence builder UI
- [ ] Template library management
- [ ] A/B testing for messages
- [ ] SMS delivery tracking
- [ ] Bulk SMS campaigns
- [ ] Custom fields management

---

## 📱 Production Checklist

Before going live:

- [ ] Environment variables set in Vercel
- [ ] Supabase RLS policies tested
- [ ] Webhook URLs updated (production domain)
- [ ] Slack webhook tested
- [ ] Quo API key has production permissions
- [ ] Cron secret configured (optional but recommended)
- [ ] Error monitoring setup (Sentry, LogRocket, etc.)
- [ ] Backup strategy for database
- [ ] Test with real phone numbers (not test mode)
- [ ] Verify SMS delivery (send to your phone)

---

## 🙋 Support

- **Quo/OpenPhone Docs:** https://www.openphone.com/docs/api
- **Supabase Docs:** https://supabase.com/docs
- **Vercel Cron:** https://vercel.com/docs/cron-jobs
- **Slack Webhooks:** https://api.slack.com/messaging/webhooks

---

Built with ❤️ by the Delivrd team. Mobile-first, production-ready. 🚀
