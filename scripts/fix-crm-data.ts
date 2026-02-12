import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tqxtkqzswhcyhopkhjam.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxeHRrcXpzd2hjeWhvcGtoamFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzU0MjMsImV4cCI6MjA4NjUxMTQyM30.Iam6qQ715n_q1_z8yISvxom0SvyVEhvAYMNo5zMSR8Q'

const supabase = createClient(supabaseUrl, supabaseKey)

// Customer leads for Delivrd's car concierge service
// Mapping: NEW=lead, CONTACTED=contacted, QUALIFIED=qualified, CONSULT BOOKED=qualified, CONSULT DONE=proposal, PROPOSAL OUT=proposal, PAID=closed-won
const customerLeads = [
  // LEAD stage (new inquiries) - 2 leads
  {
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@gmail.com',
    phone: '+1 (415) 234-5678',
    dealership_name: 'Individual Customer', // Required field, but this is a customer not dealer
    dealership_brand: null,
    dealership_location: 'San Francisco, CA',
    title: null,
    stage: 'lead',
    source: 'manychat', // TikTok -> ManyChat
    priority: 'medium',
    status: 'active',
    lead_score: 65,
    tags: ['2025 Honda CR-V', 'first-time-buyer', 'tiktok'],
    notes: 'Interested in finding the best deal on a 2025 Honda CR-V in the Bay Area. Saw our TikTok about dealer concierge services.',
    metadata: {
      vehicle_interest: '2025 Honda CR-V EX',
      budget: '$35,000',
      timeline: '2-3 weeks',
      trade_in: false,
      lead_source_detail: 'TikTok comment'
    }
  },
  {
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sjohnson@yahoo.com',
    phone: '+1 (510) 987-6543',
    dealership_name: 'Individual Customer',
    dealership_brand: null,
    dealership_location: 'Oakland, CA',
    title: null,
    stage: 'lead',
    source: 'manychat',
    priority: 'high',
    status: 'active',
    lead_score: 72,
    tags: ['2024 Toyota RAV4', 'urgent', 'instagram'],
    notes: 'Lease ending in 3 weeks. Looking for 2024 Toyota RAV4 Hybrid. Needs fast turnaround.',
    metadata: {
      vehicle_interest: '2024 Toyota RAV4 Hybrid XLE',
      budget: '$40,000',
      timeline: '1-2 weeks',
      trade_in: true,
      trade_in_vehicle: '2021 RAV4',
      lead_source_detail: 'Instagram DM'
    }
  },
  
  // CONTACTED stage - 2 leads
  {
    first_name: 'Mike',
    last_name: 'Rodriguez',
    email: 'mike.r@outlook.com',
    phone: '+1 (408) 555-1234',
    dealership_name: 'Individual Customer',
    dealership_brand: null,
    dealership_location: 'San Jose, CA',
    title: null,
    stage: 'contacted',
    source: 'website',
    priority: 'medium',
    status: 'active',
    lead_score: 68,
    tags: ['2025 Tesla Model Y', 'tech-savvy', 'ev-buyer'],
    notes: 'Filled out inquiry form on website. Looking for best price on Tesla Model Y. Open to EV incentives.',
    metadata: {
      vehicle_interest: '2025 Tesla Model Y Long Range',
      budget: '$52,000',
      timeline: '3-4 weeks',
      trade_in: false
    }
  },
  {
    first_name: 'Emily',
    last_name: 'Chen',
    email: 'emily.chen@icloud.com',
    phone: '+1 (650) 321-7890',
    dealership_name: 'Individual Customer',
    dealership_brand: null,
    dealership_location: 'Palo Alto, CA',
    title: null,
    stage: 'contacted',
    source: 'referral',
    priority: 'high',
    status: 'active',
    lead_score: 78,
    tags: ['2025 BMW X5', 'high-budget', 'referral', 'luxury'],
    notes: 'Referred by previous client David Wu. Looking for luxury SUV with custom options. Price not a major concern.',
    metadata: {
      vehicle_interest: '2025 BMW X5 xDrive40i M Sport',
      budget: '$75,000+',
      timeline: '4-6 weeks',
      trade_in: true,
      trade_in_vehicle: '2020 BMW X3',
      referred_by: 'David Wu'
    }
  },
  
  // QUALIFIED stage - 2 leads (representing "CONSULT BOOKED")
  {
    first_name: 'David',
    last_name: 'Martinez',
    email: 'dmartinez@gmail.com',
    phone: '+1 (925) 444-5555',
    dealership_name: 'Individual Customer',
    dealership_brand: null,
    dealership_location: 'Walnut Creek, CA',
    title: null,
    stage: 'qualified',
    source: 'manychat',
    priority: 'high',
    status: 'active',
    lead_score: 82,
    tags: ['2025 Ford F-150', 'business-use', 'qualified', 'tiktok'],
    notes: 'Consultation booked for Feb 15 at 2pm. Business owner needing work truck. Ready to buy, comparing lease vs finance options.',
    metadata: {
      vehicle_interest: '2025 Ford F-150 Lariat 4WD',
      budget: '$60,000',
      timeline: '1-2 weeks',
      trade_in: false,
      business_purchase: true,
      consult_date: '2026-02-15T14:00:00'
    }
  },
  {
    first_name: 'Jessica',
    last_name: 'Kim',
    email: 'jessica.kim@gmail.com',
    phone: '+1 (669) 777-8888',
    dealership_name: 'Individual Customer',
    dealership_brand: null,
    dealership_location: 'Sunnyvale, CA',
    title: null,
    stage: 'qualified',
    source: 'manychat',
    priority: 'medium',
    status: 'active',
    lead_score: 75,
    tags: ['2025 Mazda CX-5', 'family-vehicle', 'instagram'],
    notes: 'Consultation booked for Feb 14 at 10am. Growing family needs reliable SUV. Likes Mazda\'s safety features.',
    metadata: {
      vehicle_interest: '2025 Mazda CX-5 Grand Touring',
      budget: '$38,000',
      timeline: '2-3 weeks',
      trade_in: true,
      trade_in_vehicle: '2018 Honda Civic',
      family_size: 4,
      consult_date: '2026-02-14T10:00:00'
    }
  },
  
  // PROPOSAL stage (representing "CONSULT DONE" and "PROPOSAL OUT") - 3 leads
  {
    first_name: 'Robert',
    last_name: 'Taylor',
    email: 'rtaylor@me.com',
    phone: '+1 (831) 999-0000',
    dealership_name: 'Individual Customer',
    dealership_brand: null,
    dealership_location: 'Santa Cruz, CA',
    title: null,
    stage: 'proposal',
    source: 'website',
    priority: 'high',
    status: 'active',
    lead_score: 85,
    tags: ['2025 Subaru Outback', 'outdoor-enthusiast', 'proposal-sent'],
    notes: 'Consultation completed Feb 10. Proposal sent for Outback Wilderness at Santa Cruz dealer. Test drives arranged at 3 dealers.',
    metadata: {
      vehicle_interest: '2025 Subaru Outback Wilderness',
      budget: '$45,000',
      timeline: '2 weeks',
      trade_in: true,
      trade_in_vehicle: '2017 Outback',
      consult_date: '2026-02-10T14:00:00',
      proposal_sent: '2026-02-11T10:00:00'
    }
  },
  {
    first_name: 'Amanda',
    last_name: 'Foster',
    email: 'afoster@proton.me',
    phone: '+1 (707) 111-2222',
    dealership_name: 'Individual Customer',
    dealership_brand: null,
    dealership_location: 'Napa, CA',
    title: null,
    stage: 'proposal',
    source: 'referral',
    priority: 'medium',
    status: 'active',
    lead_score: 79,
    tags: ['2024 Lexus RX', 'luxury-seeker', 'proposal-sent'],
    notes: 'Consultation completed Feb 9. Comparing Lexus RX vs Acura MDX. Sent proposals for both vehicles from dealers in Walnut Creek.',
    metadata: {
      vehicle_interest: '2024 Lexus RX 350 F Sport',
      budget: '$55,000',
      timeline: '3 weeks',
      trade_in: false,
      consult_date: '2026-02-09T10:00:00',
      proposal_sent: '2026-02-10T15:00:00',
      comparing: 'Lexus RX vs Acura MDX'
    }
  },
  {
    first_name: 'Marcus',
    last_name: 'Washington',
    email: 'mwashington@gmail.com',
    phone: '+1 (415) 333-4444',
    dealership_name: 'Individual Customer',
    dealership_brand: null,
    dealership_location: 'San Francisco, CA',
    title: null,
    stage: 'proposal',
    source: 'manychat',
    priority: 'high',
    status: 'active',
    lead_score: 88,
    tags: ['2025 Porsche Macan', 'high-end', 'hot-lead', 'tiktok'],
    notes: 'Consultation completed Feb 8. VERY hot lead - ready to buy. Proposal sent for Macan S at Fremont Porsche. Expecting decision this week.',
    metadata: {
      vehicle_interest: '2025 Porsche Macan S',
      budget: '$72,000',
      timeline: 'ASAP',
      trade_in: true,
      trade_in_vehicle: '2021 Audi Q5',
      consult_date: '2026-02-08T15:00:00',
      proposal_sent: '2026-02-09T09:00:00',
      consult_outcome: 'Very positive - ready to buy'
    }
  },
  
  // CLOSED-WON stage (representing "PAID") - 1 lead
  {
    first_name: 'Lauren',
    last_name: 'Anderson',
    email: 'lauren.anderson@gmail.com',
    phone: '+1 (408) 666-7777',
    dealership_name: 'Individual Customer',
    dealership_brand: null,
    dealership_location: 'San Jose, CA',
    title: null,
    stage: 'closed-won',
    source: 'manychat',
    priority: 'high',
    status: 'active',
    lead_score: 95,
    tags: ['2025 Kia EV6', 'ev-buyer', 'paid-customer', 'success', 'instagram'],
    notes: '🎉 CLOSED! Lauren picked up her EV6 GT-Line on Feb 11. Found amazing deal at Stevens Creek Kia - $3,200 under MSRP + EV rebates. Very happy customer!',
    metadata: {
      vehicle_interest: '2025 Kia EV6 GT-Line AWD',
      budget: '$50,000',
      actual_price: '$46,800',
      savings: '$3,200 under MSRP + $7,500 federal credit',
      timeline: 'Completed',
      trade_in: false,
      consult_date: '2026-02-06T11:00:00',
      proposal_sent: '2026-02-07T09:30:00',
      deal_closed: '2026-02-11T14:00:00',
      dealer: 'Stevens Creek Kia',
      revenue: '$1,500' // Delivrd's commission
    }
  }
]

// Communication templates for each lead
const communicationTemplates: Record<string, Array<{type: string, direction: string, subject?: string, body: string, created_offset_days: number}>> = {
  'John Smith': [
    {
      type: 'note',
      direction: 'internal',
      body: 'New lead from TikTok. Commented on video about dealer markups. Interested in Honda CR-V.',
      created_offset_days: -2
    },
    {
      type: 'sms',
      direction: 'outbound',
      body: 'Hi John! This is Tomi from Delivrd. Saw your comment about finding a 2025 CR-V. I can help you get dealer pricing and handle the entire search. Mind if I give you a quick call?',
      created_offset_days: -1
    }
  ],
  'Sarah Johnson': [
    {
      type: 'note',
      direction: 'internal',
      body: 'Instagram DM inquiry. Lease ending soon, time-sensitive.',
      created_offset_days: -1
    },
    {
      type: 'sms',
      direction: 'outbound',
      body: 'Hi Sarah! Got your message about the RAV4 Hybrid. Since your lease is ending soon, I can fast-track your search. When\'s a good time to chat?',
      created_offset_days: -1
    }
  ],
  'Mike Rodriguez': [
    {
      type: 'note',
      direction: 'internal',
      body: 'Website form submission. Interested in Tesla Model Y.',
      created_offset_days: -3
    },
    {
      type: 'email',
      direction: 'outbound',
      subject: 'Your Tesla Model Y Search - Delivrd Can Help',
      body: 'Hi Mike,\n\nThanks for reaching out! I saw you\'re looking for a Model Y. I work with Tesla dealers across the Bay Area and can get you the best available price + help with EV incentives.\n\nWould you be open to a quick 15-min call this week?\n\nBest,\nTomi',
      created_offset_days: -3
    },
    {
      type: 'sms',
      direction: 'inbound',
      body: 'Yes definitely interested. Friday afternoon works for me.',
      created_offset_days: -2
    },
    {
      type: 'call',
      direction: 'outbound',
      body: 'Called Mike - discussed budget, timeline, and EV incentives. He\'s interested in Long Range model. Following up with next steps.',
      created_offset_days: -1
    }
  ],
  'Emily Chen': [
    {
      type: 'note',
      direction: 'internal',
      body: 'Referral from David Wu. High-value lead - luxury buyer.',
      created_offset_days: -4
    },
    {
      type: 'sms',
      direction: 'outbound',
      body: 'Hi Emily! David Wu recommended I reach out about your BMW X5 search. He raved about how we helped him last year. Would love to chat about what you\'re looking for.',
      created_offset_days: -3
    },
    {
      type: 'sms',
      direction: 'inbound',
      body: 'Hi Tomi! David had great things to say. Looking for X5 with M Sport package and premium sound. Can you help?',
      created_offset_days: -2
    },
    {
      type: 'call',
      direction: 'outbound',
      body: 'Great call with Emily. She wants fully loaded X5. Budget flexible. Connecting her with BMW dealers in SF and Peninsula.',
      created_offset_days: -1
    }
  ],
  'David Martinez': [
    {
      type: 'note',
      direction: 'internal',
      body: 'TikTok lead - business owner needs work truck.',
      created_offset_days: -5
    },
    {
      type: 'sms',
      direction: 'outbound',
      body: 'Hi David! Saw you\'re looking for an F-150 for your business. I can help you compare lease vs finance options and find the best dealer pricing. Interested?',
      created_offset_days: -4
    },
    {
      type: 'call',
      direction: 'outbound',
      body: 'Spoke with David - construction business needs reliable truck. Qualified buyer. Discussing tax benefits of lease vs purchase.',
      created_offset_days: -3
    },
    {
      type: 'email',
      direction: 'outbound',
      subject: 'F-150 Lariat - Lease vs Finance Comparison',
      body: 'Hi David,\n\nAs discussed, here\'s the breakdown:\n\nLease: $689/mo (36 months, 12k miles/year)\nFinance: $1,124/mo (60 months at 6.9% APR)\n\nWith your business, the lease has Section 179 advantages. Let me know if you want to move forward!\n\nTomi',
      created_offset_days: -2
    }
  ],
  'Jessica Kim': [
    {
      type: 'note',
      direction: 'internal',
      body: 'Instagram inquiry - family needs reliable SUV.',
      created_offset_days: -6
    },
    {
      type: 'sms',
      direction: 'outbound',
      body: 'Hi Jessica! Got your message about the CX-5. Mazda\'s are great family vehicles. Can we hop on a quick call to discuss what features are most important to you?',
      created_offset_days: -5
    },
    {
      type: 'call',
      direction: 'outbound',
      body: 'Qualified Jessica - safety is top priority (has 2 young kids). Looking at Grand Touring trim. Trade-in value discussed. Consultation booked.',
      created_offset_days: -3
    }
  ],
  'Robert Taylor': [
    {
      type: 'note',
      direction: 'internal',
      body: 'Website inquiry - outdoor enthusiast needs AWD.',
      created_offset_days: -8
    },
    {
      type: 'email',
      direction: 'outbound',
      subject: 'Your Subaru Outback Search',
      body: 'Hi Robert,\n\nSaw you\'re looking for a Wilderness trim. Perfect for mountain adventures! I can help you find one and arrange test drives at multiple dealers.\n\nWhen\'s a good time to discuss?\n\nTomi',
      created_offset_days: -7
    },
    {
      type: 'call',
      direction: 'outbound',
      body: 'Great call with Robert. He goes to Tahoe often, needs AWD. Qualified buyer with trade-in. Consultation completed.',
      created_offset_days: -5
    },
    {
      type: 'sms',
      direction: 'outbound',
      body: 'Hi Robert! Found 3 Outback Wilderness models in your color at Bay Area dealers. Proposal sent with pricing - check your email!',
      created_offset_days: -2
    }
  ],
  'Amanda Foster': [
    {
      type: 'note',
      direction: 'internal',
      body: 'Referral lead - wants luxury SUV.',
      created_offset_days: -7
    },
    {
      type: 'sms',
      direction: 'outbound',
      body: 'Hi Amanda! Your friend mentioned you\'re looking for a Lexus RX. I can help you compare dealers and get the best price. Want to chat?',
      created_offset_days: -6
    },
    {
      type: 'call',
      direction: 'outbound',
      body: 'Consultation complete. Amanda wants quiet, comfortable ride. Comparing Lexus RX vs Acura MDX. Proposals sent for both.',
      created_offset_days: -4
    }
  ],
  'Marcus Washington': [
    {
      type: 'note',
      direction: 'internal',
      body: 'TikTok lead - high-end buyer interested in Macan.',
      created_offset_days: -10
    },
    {
      type: 'call',
      direction: 'outbound',
      body: 'Great conversation with Marcus. Finance professional, ready to buy. Loves Porsche brand. Booking consultation.',
      created_offset_days: -8
    },
    {
      type: 'sms',
      direction: 'outbound',
      body: 'Hi Marcus! Looking forward to our consultation Feb 8. I\'ve identified 3 Macan S models in your color preference at Bay Area dealers.',
      created_offset_days: -5
    },
    {
      type: 'note',
      direction: 'internal',
      body: 'Consultation complete. Marcus loved the service. Found perfect Macan at Fremont Porsche. Preparing deal proposal - HOT LEAD.',
      created_offset_days: -4
    },
    {
      type: 'email',
      direction: 'outbound',
      subject: 'Your Porsche Macan S Proposal',
      body: 'Marcus,\n\n Great news! Found your perfect Macan S at Fremont Porsche:\n\n2025 Macan S - Jet Black Metallic\nMSRP: $72,000\nDealer price: $70,500\n\nCar is in stock and ready. Let me know if you want to move forward!\n\nTomi',
      created_offset_days: -3
    }
  ],
  'Lauren Anderson': [
    {
      type: 'note',
      direction: 'internal',
      body: 'Instagram DM - interested in EV6.',
      created_offset_days: -12
    },
    {
      type: 'call',
      direction: 'outbound',
      body: 'Qualified Lauren - first EV purchase, nervous about charging. Educated her on home charging + public network. She\'s excited!',
      created_offset_days: -9
    },
    {
      type: 'sms',
      direction: 'outbound',
      body: 'Hi Lauren! Consultation went great. Found an EV6 GT-Line at Stevens Creek Kia - $3,200 under MSRP + you qualify for $7,500 federal credit!',
      created_offset_days: -7
    },
    {
      type: 'email',
      direction: 'outbound',
      subject: 'Your EV6 Proposal - $46,800 Final Price',
      body: 'Hi Lauren,\n\nAttached is your full proposal:\n\n2025 Kia EV6 GT-Line AWD\nMSRP: $50,000\nDiscounted Price: $46,800\nFederal Credit: $7,500\nNet Cost: $39,300\n\nThis is an incredible deal. The dealer has 2 in stock. Let me know if you want to move forward!\n\nBest,\nTomi',
      created_offset_days: -5
    },
    {
      type: 'sms',
      direction: 'inbound',
      body: 'This is amazing! I want to move forward. When can we schedule the purchase?',
      created_offset_days: -4
    },
    {
      type: 'call',
      direction: 'outbound',
      body: 'Lauren is ready to buy! Scheduled pickup for Feb 11 at Stevens Creek Kia. Coordinating paperwork with dealer.',
      created_offset_days: -3
    },
    {
      type: 'note',
      direction: 'internal',
      body: '🎉 DEAL CLOSED! Lauren picked up her EV6 today. Super happy customer. Paid $1,500 commission.',
      created_offset_days: -1
    }
  ]
}

async function fixCRMData() {
  console.log('🚀 Starting CRM data fix...\n')

  // Step 1: Delete existing contacts
  console.log('1️⃣ Deleting existing contacts...')
  const { error: deleteError } = await supabase
    .from('contacts')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
  
  if (deleteError) {
    console.error('❌ Error deleting contacts:', deleteError)
    process.exit(1)
  }
  console.log(`✅ Deleted all existing contacts\n`)

  // Step 2: Insert customer leads
  console.log('2️⃣ Creating realistic customer leads...')
  
  for (const lead of customerLeads) {
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .insert(lead)
      .select()
      .single()
    
    if (contactError) {
      console.error(`❌ Error creating contact ${lead.first_name} ${lead.last_name}:`, contactError)
      continue
    }
    
    console.log(`✅ Created: ${contact.first_name} ${contact.last_name} (${contact.stage})`)

    // Step 3: Add communications for this contact
    const fullName = `${lead.first_name} ${lead.last_name}`
    const comms = communicationTemplates[fullName] || []
    
    for (const comm of comms) {
      const createdAt = new Date()
      createdAt.setDate(createdAt.getDate() + comm.created_offset_days)
      
      const { error: commError } = await supabase
        .from('communications')
        .insert({
          contact_id: contact.id,
          type: comm.type,
          direction: comm.direction,
          subject: comm.subject,
          body: comm.body,
          status: 'delivered',
          created_at: createdAt.toISOString()
        })
      
      if (commError) {
        console.error(`  ⚠️ Warning: Could not add ${comm.type} for ${fullName}:`, commError)
      }
    }
    
    if (comms.length > 0) {
      console.log(`  📝 Added ${comms.length} communications`)
    }
  }

  console.log('\n✨ CRM data fix complete!')
  console.log(`\n📊 Summary:`)
  console.log(`   - Total leads created: ${customerLeads.length}`)
  console.log(`   - LEAD (New): 2 leads`)
  console.log(`   - CONTACTED: 2 leads`)
  console.log(`   - QUALIFIED (Consult Booked): 2 leads`)
  console.log(`   - PROPOSAL (Consult Done / Proposal Out): 3 leads`)
  console.log(`   - CLOSED-WON (Paid): 1 lead`)
  console.log(`\n🎯 CRM now shows realistic car buyers progressing through Delivrd's sales funnel!`)
  console.log(`\n💡 Note: Customer leads use "Individual Customer" as dealership_name since`)
  console.log(`   this is B2C sales (helping customers buy cars), not B2B dealer sales.`)
}

// Run it
fixCRMData().catch(console.error)
