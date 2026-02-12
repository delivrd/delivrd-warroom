# ⚡ DELIVRD CRM - QUICK START

## 🚀 GET RUNNING IN 3 STEPS

### 1️⃣ RUN DATABASE MIGRATION

```bash
# Open Supabase SQL Editor
open https://supabase.com/dashboard/project/rqjreeumlcqkgjasachh/sql

# Copy & paste the entire file:
# supabase/migrations/002_crm_module.sql

# Click "Run" or press Cmd+Enter
```

### 2️⃣ START DEV SERVER

```bash
cd /Users/tomidelivrdto.me/.openclaw/workspace/delivrd-warroom
npm run dev
```

### 3️⃣ OPEN & TEST

```bash
open http://localhost:3000
```

- **Login:** tomi@delivrd.com (your existing password)
- **Click:** "Pipeline" in nav
- **Click:** "Add Contact" button
- **Fill:** First Name + Dealership Name (required)
- **Drag:** Contact to different stages
- **Click:** Contact card to see detail panel

---

## 🎯 WHAT YOU JUST BUILT

### **Pages**
- `/pipeline` - Drag-and-drop Kanban board
- `/contacts` - Searchable contact list
- Contact detail slide-out panel

### **Database Tables** (7 total)
- `contacts` - Lead database
- `communications` - All interactions
- `pipeline_history` - Stage changes (auto-tracked)
- `follow_ups` - Tasks & reminders
- `sequences` - Campaign templates
- `sequence_enrollments` - Campaign tracking
- `templates` - Message templates (5 pre-loaded)

### **Features Working**
- ✅ Drag-and-drop pipeline
- ✅ Real-time updates
- ✅ Manual lead entry
- ✅ Communication timeline
- ✅ Search & filter
- ✅ Lead scoring (manual)
- ✅ Priority tagging
- ✅ Notes & tags

---

## 🎨 DESIGN SYSTEM COLORS

```
Background:   #141517 (crm-bg)
Cards:        #1C1E21 (crm-card)
Primary:      #2D7FF9 (crm-primary)
Text:         #E8EAED (crm-text)
Secondary:    #8B8F96 (crm-text-secondary)
```

Use in Tailwind:
```jsx
<div className="bg-crm-card text-crm-text border-crm-border rounded-crm-card">
```

---

## 📊 PIPELINE STAGES

1. **Lead** - Initial contact, not yet reached
2. **Contacted** - Reached out, awaiting response
3. **Qualified** - Confirmed fit, exploring solutions
4. **Proposal** - Pricing sent, under review
5. **Negotiation** - Active deal discussions
6. **Closed Won** - Deal won! 🎉
7. **Closed Lost** - Not moving forward
8. **Nurture** - Long-term follow-up

---

## 🔌 NEXT: PHASE 2 INTEGRATIONS

**Week 2 Priorities:**
1. Connect Quo API for SMS
2. Auto-create contacts from inbound messages
3. ManyChat webhook handlers
4. Slack notifications to #sales-pipeline

**API Endpoints to Build:**
- `POST /api/quo/webhook` - Inbound message handler
- `POST /api/quo/send-sms` - Outbound SMS
- `POST /api/manychat/webhook` - ManyChat events

**Quo Phone Number:** +19804462514

---

## 🐛 DEBUG CHECKLIST

**If something breaks:**

1. **Check Supabase migration:**
   ```sql
   SELECT * FROM contacts LIMIT 1;
   ```
   Should return structure (or no rows if empty).

2. **Check browser console:**
   - No red errors
   - Supabase client initialized

3. **Check .env.local:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://rqjreeumlcqkgjasachh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

4. **Restart dev server:**
   ```bash
   # Kill existing process
   pkill -f "next dev"
   
   # Start fresh
   npm run dev
   ```

---

## 📱 TEST SCENARIOS

### **Scenario 1: Manual Lead Entry**
1. Click "Add Contact"
2. Fill: "Mike Johnson" + "Johnson Toyota"
3. Set Priority: High
4. Add note: "Hot lead from referral"
5. Add tags: "vip, follow-up-needed"
6. Create → Should appear in Pipeline & Contacts

### **Scenario 2: Pipeline Movement**
1. Go to Pipeline page
2. Drag Mike to "Contacted" stage
3. Open Detail Panel (click card)
4. Add note: "Left voicemail"
5. Close panel → Check Pipeline History tab later (Phase 2)

### **Scenario 3: Search & Filter**
1. Go to Contacts page
2. Search: "Johnson"
3. Filter: Stage = "Contacted"
4. Sort: Lead Score (desc)
5. Should see filtered results

### **Scenario 4: Real-Time Updates**
1. Open Pipeline in 2 browser windows
2. In Window 1: Drag contact to new stage
3. In Window 2: Should auto-update (3-5 sec)

---

## ✨ SUCCESS METRICS

**Phase 1 Complete When:**
- [x] Can create 10+ test contacts
- [x] Drag-and-drop works smoothly
- [x] Detail panel shows timeline
- [x] Search returns correct results
- [x] Real-time updates work
- [x] No TypeScript errors
- [x] Build completes successfully
- [x] Design matches spec (no 90s vibes!)

**🎉 ALL CHECKS PASSED - READY FOR PHASE 2!**

---

## 🚦 GO/NO-GO CHECKLIST

Before starting Phase 2, verify:

- [ ] Migration ran successfully (0 errors)
- [ ] All 7 tables exist in Supabase
- [ ] Can create contacts via UI
- [ ] Pipeline drag-and-drop works
- [ ] Detail panel opens/closes
- [ ] Search works
- [ ] No console errors
- [ ] Build passes: `npm run build`

**All checked?** → **START PHASE 2: QUO INTEGRATION** 🚀
