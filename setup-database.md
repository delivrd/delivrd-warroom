# Database Setup Instructions

## Step 1: Run Database Migration

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/rqjreeumlcqkgjasachh
2. Click **SQL Editor** in the left sidebar
3. Click **"New Query"**
4. Copy the ENTIRE contents of `supabase/migrations/001_initial.sql`
5. Paste into the SQL Editor
6. Click **"Run"** (or press Cmd+Enter)
7. You should see: "Success. No rows returned"

## Step 2: Create User Accounts

Still in SQL Editor, run this query:

```sql
-- Check if users exist (they might from email signup)
SELECT id, email FROM auth.users;
```

If no users exist, you need to create them via the Supabase Dashboard:

1. Go to **Authentication** → **Users**
2. Click **"Add User"** → **"Create new user"**
3. Create first user:
   - Email: `tomi@delivrd.com`
   - Password: `Delivrd2026!` (change this after first login)
   - **Auto Confirm User**: Check this box
4. Click **"Create User"**
5. Repeat for second user:
   - Email: `schalaschly@delivrd.com`
   - Password: `Delivrd2026!` (change this after first login)
   - **Auto Confirm User**: Check this box

## Step 3: Add Profile Records

After creating users, go back to SQL Editor and run:

```sql
-- Get the user IDs
SELECT id, email FROM auth.users;
```

Copy the UUIDs, then run (replace the UUIDs with actual values):

```sql
-- Replace these UUIDs with the actual ones from above query
INSERT INTO profiles (id, name, role) VALUES
('UUID-FOR-TOMI-HERE', 'Tomi', 'admin'),
('UUID-FOR-SCHALASCHLY-HERE', 'Schalaschly', 'admin');
```

## Step 4: Seed Sample Battle Data

Run this in SQL Editor to add a few sample battles:

```sql
INSERT INTO battles (id, name, category, tier, impact, effort, owner, description, why_this_tier, next_action, ai_play, success_metric) VALUES
(1, 'TikTok', 'organic', 'now', 'C', 'L', 't', 'Short-form vertical video discovery engine. 470k followers, highest volume channel.', '#1 channel. 470k. Highest volume. Priority infrastructure build.', 'Keyword CTA system on every video. AI comment monitor for buying signals.', 'AI monitors comments for buying signals, auto-DMs qualified leads with booking link.', 'DM-to-qualified rate. Revenue from TikTok weekly.'),
(2, 'Instagram', 'organic', 'now', 'C', 'M', 't', 'Visual storytelling platform. Strong brand presence, moderate engagement.', 'Major channel, needs systematic posting + story automation.', 'Build content calendar automation + story link system.', 'AI generates caption variants, auto-schedules optimal posting times.', 'Story link clicks, DM conversations started.'),
(3, 'YouTube', 'organic', 'soon', 'H', 'H', 't', 'Long-form video content. High trust-building potential, labor-intensive.', 'High impact but requires production infrastructure first.', 'Define video series format + production workflow.', 'AI generates video outlines, auto-creates timestamps + descriptions.', 'Watch time, subscriber conversion rate.');
```

## Step 5: Test Login

1. In terminal, run: `npm run dev`
2. Open http://localhost:3000
3. Should redirect to `/login`
4. Login with `tomi@delivrd.com` / `Delivrd2026!`
5. Should see the Battle Library with 3 sample battles

✅ If you can see battles and edit their tier, database is working!

## Next: Seed All 95 Battles

You'll need to provide the full battle data from your React artifacts to populate all 95 channels.
