const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tqxtkqzswhcyhopkhjam.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxeHRrcXpzd2hjeWhvcGtoamFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkzNTQyMywiZXhwIjoyMDg2NTExNDIzfQ.qbqdjRB0oL-gr_Bi8VL5PLy8qj1I79LsXIfgR4GLmRk'
);

async function loadData() {
  console.log('🌱 Loading War Room + CRM data...\n');

  // Get user ID for assignments
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
  const userId = profiles?.[0]?.id || null;

  // Load battles (just first 10 for speed)
  console.log('⚔️  Loading battles...');
  const battles = [
    { id: 1, name: 'TikTok', category: 'organic', tier: 'now', impact: 'C', effort: 'L', owner: 't', description: 'Short-form vertical video discovery. 470k followers, highest volume channel.' },
    { id: 2, name: 'Instagram Reels', category: 'organic', tier: 'now', impact: 'C', effort: 'M', owner: 't', description: 'Vertical video on Instagram. Strong engagement, cross-post from TikTok.' },
    { id: 3, name: 'YouTube Shorts', category: 'organic', tier: 'now', impact: 'H', effort: 'L', owner: 't', description: 'TikTok competitor. Easy cross-post, growing discovery.' },
    { id: 4, name: 'Facebook Ads', category: 'paid', tier: 'now', impact: 'C', effort: 'M', owner: 'b', description: 'Lead gen campaigns. Dealer targeting.' },
    { id: 5, name: 'Google Search Ads', category: 'paid', tier: 'now', impact: 'C', effort: 'M', owner: 'b', description: 'Intent-based. Dealer marketing keywords.' },
    { id: 6, name: 'Blog - Educational', category: 'content', tier: 'now', impact: 'H', effort: 'M', owner: 't', description: 'Dealership marketing guides. SEO + lead magnets.' },
    { id: 7, name: 'ManyChat Automation', category: 'automation', tier: 'now', impact: 'C', effort: 'M', owner: 't', description: 'IG/FB DM automation. Lead qualification.' },
    { id: 8, name: 'Website Redesign', category: 'infrastructure', tier: 'now', impact: 'C', effort: 'H', owner: 't', description: 'Modern, fast, conversion-focused site.' },
    { id: 9, name: 'CRM Implementation', category: 'infrastructure', tier: 'now', impact: 'C', effort: 'H', owner: 'b', description: 'HubSpot/Pipedrive setup.' },
    { id: 10, name: 'Dealer Referral Program', category: 'referral', tier: 'now', impact: 'C', effort: 'M', owner: 'b', description: 'Current dealers refer others. Revenue share.' },
  ];
  
  const { error: battlesError } = await supabase.from('battles').insert(battles);
  if (battlesError) console.error('Battles error:', battlesError);
  else console.log('✅ Loaded 10 battles');

  // Load sprints
  console.log('🏃 Loading sprints...');
  const sprints = [
    { id: 'sprint-1', name: 'Sprint 1: Foundation', subtitle: 'Core Infrastructure & Quick Wins', weeks: 'Weeks 1-4', goal: 'Establish core marketing infrastructure', status: 'active', sort_order: 1 },
    { id: 'sprint-2', name: 'Sprint 2: Scale', subtitle: 'Automation & Channel Expansion', weeks: 'Weeks 5-8', goal: 'Automate lead nurture, expand channels', status: 'planned', sort_order: 2 },
  ];
  
  const { error: sprintsError } = await supabase.from('sprints').insert(sprints);
  if (sprintsError) console.error('Sprints error:', sprintsError);
  else console.log('✅ Loaded 2 sprints');

  // Load contacts (customer leads)
  console.log('👥 Loading customer leads...');
  const contacts = [
    { first_name: 'Jessica', last_name: 'Martinez', email: 'jessica.m@gmail.com', phone: '(408) 555-2847', dealership_name: 'Honda Accord Sport', stage: 'proposal', source: 'tiktok', lead_score: 88, priority: 'urgent', tags: ['honda', 'accord', 'hot'], notes: 'Sent pricing. Wants Accord Sport. Budget $35k. Very interested.', assigned_to: userId },
    { first_name: 'Emily', last_name: 'Rodriguez', email: 'emily.rod@gmail.com', phone: '(512) 555-3892', dealership_name: 'Toyota RAV4 Hybrid', stage: 'qualified', source: 'tiktok', lead_score: 75, priority: 'high', tags: ['toyota', 'rav4'], notes: 'First-time buyer. Consult call completed. Budget $38k.', assigned_to: userId },
    { first_name: 'Brandon', last_name: 'Thompson', email: 'b_thompson@yahoo.com', phone: '(214) 555-7234', dealership_name: 'Ford F-150', stage: 'qualified', source: 'instagram', lead_score: 70, priority: 'high', tags: ['ford', 'f150'], notes: 'Contractor needs F-150. Budget $45k. Consult booked tomorrow.', assigned_to: userId },
    { first_name: 'Michael', last_name: 'Chen', email: 'mchen@gmail.com', phone: '(415) 555-8291', dealership_name: 'Honda CR-V', stage: 'closed-won', source: 'tiktok', lead_score: 98, priority: 'high', tags: ['paid', 'honda', 'success'], notes: 'PAID! Signed up for Delivrd service ($499). Moving to production.', assigned_to: userId },
    { first_name: 'Marcus', last_name: 'Johnson', email: 'mjohnson@gmail.com', phone: '(305) 555-1923', dealership_name: 'Hyundai Tucson', stage: 'contacted', source: 'instagram', lead_score: 65, priority: 'medium', tags: ['hyundai', 'tucson'], notes: 'Qualified lead. Budget $32k. Need to book consult.', assigned_to: userId },
  ];
  
  const { error: contactsError } = await supabase.from('contacts').insert(contacts);
  if (contactsError) console.error('Contacts error:', contactsError);
  else console.log('✅ Loaded 5 customer leads');

  console.log('\n🎉 Done! Refresh http://192.168.68.99:3000 to see data.');
}

loadData().catch(console.error);
