# DELIVRD WAR ROOM

Command center for scaling Delivrd from $2M to $6M in revenue.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Database:** Supabase (Postgres)
- **Hosting:** Vercel
- **Styling:** Tailwind CSS
- **Cost:** $0/month (free tiers)

## Quick Start

### 1. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create account
2. Click **"New Project"**
   - Name: `delivrd-warroom`
   - Database Password: (generate strong one, save it)
   - Region: **US East (North Virginia)**
3. Wait 2 minutes for provisioning
4. Go to **Project Settings** → **API**
5. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJhbGci...`)

### 2. Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy contents of `supabase/migrations/001_initial.sql`
4. Paste and click **"Run"**
5. Verify: You should see tables created (battles, sprints, sprint_battles, etc.)

### 3. Create Users

In Supabase dashboard:
1. Go to **Authentication** → **Users**
2. Click **"Add User"** → **"Create new user"**
3. Create:
   - Email: `tomi@delivrd.com`
   - Password: (set a strong password)
   - Auto Confirm: **Yes**
4. Repeat for:
   - Email: `schalaschly@delivrd.com`
   - Password: (set a strong password)

### 4. Add Profile Records

In Supabase **SQL Editor**, run:

```sql
-- Get user IDs first
SELECT id, email FROM auth.users;

-- Insert profiles (replace UUIDs with actual user IDs from above)
INSERT INTO profiles (id, name, role) VALUES
('USER_ID_FROM_ABOVE_FOR_TOMI', 'Tomi', 'admin'),
('USER_ID_FROM_ABOVE_FOR_SCHALASCHLY', 'Schalaschly', 'admin');
```

### 5. Seed Battle Data

**IMPORTANT:** You need to provide the full 95 battles from your React artifacts.

1. Extract battle data from `warroom-v2.jsx`
2. Format as INSERT statements
3. Run in SQL Editor

Template:
```sql
INSERT INTO battles (id, name, category, tier, impact, effort, owner, description, why_this_tier, next_action, ai_play, success_metric) VALUES
(1, 'TikTok', 'organic', 'now', 'C', 'L', 't', 'Description...', 'Why...', 'Next...', 'AI...', 'Metric...'),
-- ... repeat for all 95 battles
```

### 6. Configure Environment

Create `.env.local` file in project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 7. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Login with `tomi@delivrd.com` or `schalaschly@delivrd.com`

### 8. Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **"Import Project"**
4. Select your GitHub repo
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **"Deploy"**
7. Done! Your app is live at `https://your-project.vercel.app`

## Project Structure

```
delivrd-warroom/
├── app/
│   ├── layout.tsx          # Root layout with nav
│   ├── page.tsx            # Home (redirects to /library)
│   ├── login/              # Login page
│   ├── library/            # Battle Library (95 channels)
│   ├── sprints/            # Execution System
│   └── map/                # Battle Map (Phase 2)
├── components/
│   └── Nav.tsx             # Top navigation
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── types.ts            # TypeScript types
│   └── data/
│       └── battles.ts      # Battle seed data (needs full data)
├── supabase/
│   └── migrations/
│       └── 001_initial.sql # Database schema
└── .env.local              # Environment variables (create this)
```

## Features

### Phase 1 (Complete)
- ✅ Authentication (Tomi + Schalaschly)
- ✅ Battle Library view (search, filter, tier editing)
- ✅ Execution System (3 sprints, status tracking, notes)
- ✅ Database schema with RLS policies

### Phase 2 (Next)
- [ ] Battle Map visual view
- [ ] Notes/comments on battles
- [ ] Sprint progress tracking
- [ ] Mobile responsive pass

### Phase 3 (Later)
- [ ] Slack notifications
- [ ] GHL/CRM data pull
- [ ] Automated metric tracking

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and has both variables
- Restart dev server after adding env vars

### "Failed to load battles"
- Check Supabase project is running
- Verify database migration ran successfully
- Check browser console for errors

### Login not working
- Verify users were created in Supabase Auth
- Check email/password are correct
- Ensure "Auto Confirm" was enabled when creating users

## Next Steps

1. **Seed Full Battle Data:** Import all 95 battles from your React artifact
2. **Seed Sprint Data:** Add 3 sprints with battle assignments
3. **Test:** Login and verify all features work
4. **Deploy:** Push to Vercel for production access
5. **Phase 2:** Build Battle Map view

## Support

Questions? Check:
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
- Vercel docs: https://vercel.com/docs
