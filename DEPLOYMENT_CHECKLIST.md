# 🚀 DEPLOYMENT CHECKLIST

Use this checklist to deploy CRM Phase 2 integrations.

---

## PRE-DEPLOYMENT

### 1. Environment Variables
- [ ] Copy `.env.example` to `.env.local`
- [ ] Get Quo API key from dashboard
- [ ] Create Slack webhook URL
- [ ] Generate CRON_SECRET: `openssl rand -base64 32`
- [ ] Add all vars to Vercel dashboard

### 2. Test Locally (Optional)
- [ ] `npm install`
- [ ] `npm run dev`
- [ ] Test SMS modal in UI
- [ ] Test webhook with ngrok (see INTEGRATION_README.md)

---

## DEPLOYMENT

### 3. Database Migration
- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Paste: `supabase/migrations/003_default_sequences.sql`
- [ ] Run SQL
- [ ] Verify 3 templates created
- [ ] Verify "Nurture - New Lead" sequence exists

### 4. Deploy to Vercel
```bash
cd delivrd-warroom
vercel --prod
```

- [ ] Build successful
- [ ] Check deployment URL
- [ ] Verify environment variables are set

### 5. Configure Webhooks

**Quo/OpenPhone:**
- [ ] Go to Quo Settings → Webhooks
- [ ] Add webhook: `https://warroom.delivrd.com/api/webhooks/quo`
- [ ] Select event: `message.received`
- [ ] Save & test

**ManyChat:**
- [ ] Go to ManyChat → Integrations
- [ ] Add webhook: `https://warroom.delivrd.com/api/webhooks/manychat`
- [ ] Configure fields: subscriber_id, first_name, last_name, phone, source, vehicle_interest, timeline, budget
- [ ] Save & test

---

## TESTING

### 6. Smoke Tests

**Test webhook health:**
```bash
curl https://warroom.delivrd.com/api/webhooks/quo
curl https://warroom.delivrd.com/api/webhooks/manychat
```
- [ ] Both return status: active

**Test Quo webhook (send SMS to +19804462514):**
- [ ] Send text from your phone
- [ ] Check Vercel logs: `vercel logs --prod --filter=api/webhooks/quo`
- [ ] Verify contact created/updated in Supabase
- [ ] Check SMS logged in communications table
- [ ] Check Slack notification sent

**Test ManyChat webhook:**
```bash
curl -X POST https://warroom.delivrd.com/api/webhooks/manychat \
  -H "Content-Type: application/json" \
  -d '{
    "subscriber_id": "test-123",
    "first_name": "Test",
    "phone": "+14155551234",
    "source": "tiktok_live",
    "vehicle_interest": "2025 RAV4",
    "timeline": "this_month",
    "budget": "50-75k"
  }'
```
- [ ] Contact created with lead score
- [ ] Slack alert sent (if hot lead)
- [ ] Enrolled in nurture sequence (if warm)

**Test SMS sending from UI:**
- [ ] Open CRM → Contacts
- [ ] Click a contact with phone number
- [ ] Click "Send SMS"
- [ ] Type message
- [ ] Send
- [ ] Verify SMS received on phone
- [ ] Check timeline updated in UI

**Test sequence processor:**
```bash
curl https://warroom.delivrd.com/api/cron/sequences
```
- [ ] Check response (processed count)
- [ ] Verify SMS sent to active enrollments
- [ ] Check Vercel logs for any errors

---

## MONITORING SETUP

### 7. Set Up Alerts (Optional)

**Vercel:**
- [ ] Go to Vercel → Project → Settings → Integrations
- [ ] Connect Slack for deployment alerts
- [ ] Enable error notifications

**Supabase:**
- [ ] Go to Supabase → Database → Webhooks
- [ ] Add webhook for failed crons (optional)

**Slack:**
- [ ] Create dedicated channel: #crm-alerts
- [ ] Update SLACK_WEBHOOK_URL to post there
- [ ] Pin important message format examples

---

## POST-DEPLOYMENT

### 8. Monitor First 24 Hours

**Check hourly:**
- [ ] Vercel logs: `vercel logs --prod --since 1h`
- [ ] Slack notifications working
- [ ] SMS delivery (Quo dashboard)
- [ ] No TypeScript/runtime errors

**Check database:**
```sql
-- Recent communications
SELECT COUNT(*) FROM communications WHERE created_at > NOW() - INTERVAL '24 hours';

-- Active sequences
SELECT COUNT(*) FROM sequence_enrollments WHERE status = 'active';

-- Hot leads today
SELECT COUNT(*) FROM contacts WHERE lead_score > 70 AND created_at::date = CURRENT_DATE;
```

### 9. Verify Cron Jobs

**Wait for cron runs:**
- [ ] Sequences (runs every 15 min)
- [ ] Lead scoring (runs 2 AM)
- [ ] Daily digest (runs 9 AM)

**Check logs:**
```bash
vercel logs --prod --filter=api/cron/sequences
vercel logs --prod --filter=api/cron/lead-scoring
vercel logs --prod --filter=api/cron/daily-digest
```

### 10. Train Team

- [ ] Show "Send SMS" feature
- [ ] Explain Slack alerts
- [ ] Demo sequence pausing on reply
- [ ] Share monitoring queries
- [ ] Document common issues

---

## ROLLBACK PLAN

If something breaks:

### Quick fixes:
- [ ] Disable sequence cron in Vercel (Settings → Cron Jobs)
- [ ] Pause all sequences: `UPDATE sequence_enrollments SET status = 'paused'`
- [ ] Remove Quo webhook (stops inbound)

### Full rollback:
```bash
# Revert to previous deployment
vercel rollback

# Or redeploy previous version
git checkout <previous-commit>
vercel --prod
```

---

## SUCCESS! 🎉

If all checkboxes are ✅, you're live!

### Expected behavior:
- SMS sent/received automatically
- Slack alerts in #sales-pipeline
- Sequences running every 15 min
- Lead scores updating daily
- Hot leads flagged immediately
- UI responsive on mobile

---

## SUPPORT

- **Logs:** `vercel logs --prod`
- **Docs:** See `INTEGRATION_README.md`
- **Troubleshooting:** See `DEPLOYMENT_SUMMARY.md`
- **Database:** Supabase Dashboard → SQL Editor

---

**Total time:** ~30 minutes
**Risk:** Low (all features independent)
**Rollback:** Easy (disable webhooks/crons)

You got this! 💪
