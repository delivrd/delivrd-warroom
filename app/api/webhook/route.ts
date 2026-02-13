import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
};

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'delivrd-webhook-2024';

export async function POST(request: Request) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization');
    const urlSecret = new URL(request.url).searchParams.get('secret');
    const token = authHeader?.replace('Bearer ', '') || urlSecret;

    if (token !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const source = body.source || 'manual';

    let contact: Record<string, any> = {
      pipeline_stage: 'new',
      lead_score: 0,
      source,
    };

    // ═══ MANYCHAT FORMAT ═══
    // ManyChat sends: { source: "manychat", first_name, last_name, phone, email, custom_fields: {...} }
    if (source === 'manychat') {
      contact.first_name = body.first_name || body.name?.split(' ')[0] || null;
      contact.last_name = body.last_name || body.name?.split(' ').slice(1).join(' ') || null;
      contact.phone = body.phone || body.phone_number || null;
      contact.email = body.email || null;
      contact.manychat_id = body.subscriber_id || body.manychat_id || null;
      contact.source_detail = body.flow_name || body.tag || 'manychat';

      // ManyChat custom fields
      const cf = body.custom_fields || body;
      contact.vehicle_interest = cf.vehicle_interest || cf.vehicle || cf.car || null;
      contact.vehicle_make = cf.vehicle_make || cf.make || null;
      contact.timeline = cf.timeline || cf.timeframe || null;
      contact.budget_range = cf.budget || cf.budget_range || null;

      // Auto-score based on data completeness
      let score = 10; // base for ManyChat lead
      if (contact.phone) score += 15;
      if (contact.vehicle_interest) score += 10;
      if (contact.timeline) score += 10;
      if (contact.budget_range) score += 5;
      contact.lead_score = score;
    }

    // ═══ EMAIL FORMAT ═══
    // From Apps Script: { source: "email", first_name, last_name, phone, email, vehicle_interest, vehicle_make, timeline, notes, source_detail }
    // From Zapier/Make: { source: "email", from_name, from_email, subject, body_text }
    else if (source === 'email') {
      // Direct fields (from Apps Script)
      if (body.first_name || body.last_name) {
        contact.first_name = body.first_name || null;
        contact.last_name = body.last_name || null;
      } else {
        // Legacy: parse from from_name
        const fromName = body.from_name || body.sender_name || '';
        const nameParts = fromName.split(' ');
        contact.first_name = nameParts[0] || null;
        contact.last_name = nameParts.slice(1).join(' ') || null;
      }

      contact.email = body.email || body.from_email || body.sender_email || null;
      contact.phone = body.phone || null;
      contact.vehicle_interest = body.vehicle_interest || null;
      contact.vehicle_make = body.vehicle_make || null;
      contact.timeline = body.timeline || null;
      contact.budget_range = body.budget_range || null;
      contact.source_detail = body.source_detail || body.subject || 'email';
      contact.notes = body.notes || body.body_text || body.body || body.message || null;

      // Try to extract vehicle make from vehicle_interest if not set
      if (!contact.vehicle_make && contact.vehicle_interest) {
        const text = contact.vehicle_interest.toLowerCase();
        const makes = ['bmw', 'mercedes', 'audi', 'lexus', 'toyota', 'honda', 'tesla', 'porsche', 'land rover', 'range rover', 'ford', 'chevrolet', 'jeep', 'hyundai', 'kia', 'nissan', 'subaru', 'volkswagen', 'volvo', 'acura', 'infiniti', 'cadillac', 'lincoln', 'genesis', 'mazda', 'dodge', 'ram', 'chrysler', 'buick', 'gmc', 'rivian', 'lucid'];
        for (const make of makes) {
          if (text.includes(make)) {
            contact.vehicle_make = make.charAt(0).toUpperCase() + make.slice(1);
            break;
          }
        }
      }

      // Score based on data completeness
      let score = 10; // base for email lead
      if (contact.phone) score += 15;
      if (contact.vehicle_interest) score += 10;
      if (contact.timeline) score += 10;
      if (contact.email) score += 5;
      contact.lead_score = score;
    }

    // ═══ QUO FORMAT ═══
    // From Quo webhook: { source: "quo", phone, name, direction, message }
    else if (source === 'quo') {
      const name = body.name || body.contact_name || '';
      contact.first_name = name.split(' ')[0] || null;
      contact.last_name = name.split(' ').slice(1).join(' ') || null;
      contact.phone = body.phone || body.phone_number || null;
      contact.quo_contact_id = body.contact_id || body.quo_id || null;
      contact.source_detail = body.direction === 'inbound' ? 'inbound call/text' : 'outbound';
      contact.notes = body.message || body.transcript || null;
      contact.lead_score = 15; // phone contact is decent signal
    }

    // ═══ TIKTOK / INSTAGRAM / MANYCHAT ═══
    else if (source === 'tiktok' || source === 'instagram' || source === 'youtube') {
      contact.first_name = body.first_name || body.name?.split(' ')[0] || body.username || null;
      contact.last_name = body.last_name || body.name?.split(' ').slice(1).join(' ') || null;
      contact.phone = body.phone || null;
      contact.email = body.email || null;
      contact.manychat_id = body.subscriber_id || null;
      contact.source_detail = body.source_detail || body.platform || source;
      contact.vehicle_interest = body.vehicle_interest || body.vehicle || null;

      // Parse ManyChat tags into CRM fields
      const tags = typeof body.tags === 'string' ? body.tags.split(',').map((t: string) => t.trim().toLowerCase()) : 
                   Array.isArray(body.tags) ? body.tags.map((t: string) => t.toLowerCase()) : [];

      if (tags.length > 0) {
        // Timeline from tags
        if (tags.includes('timeline_0-30')) contact.timeline = 'Less than 30 days';
        else if (tags.includes('timeline_1-3mo')) contact.timeline = '1-3 months';

        // Vehicle preference from tags
        if (tags.includes('vehicle_new')) contact.vehicle_interest = contact.vehicle_interest || 'New vehicle';
        else if (tags.includes('vehicle_used')) contact.vehicle_interest = contact.vehicle_interest || 'Used vehicle';

        // Intent-based scoring
        let score = 15; // base for IG lead
        if (tags.includes('high_intent') || tags.includes('intern_signup')) score = 85;
        else if (tags.includes('intent_sales')) score += 25;
        else if (tags.includes('intent_questionsservice')) score += 10;
        else if (tags.includes('intent_questionadvice')) score += 5;

        if (tags.includes('human_handoff')) score += 15;
        if (tags.includes('timeline_0-30')) score += 15;
        else if (tags.includes('timeline_1-3mo')) score += 5;
        if (contact.phone) score += 10;

        contact.lead_score = Math.min(score, 100);
        contact.notes = `ManyChat tags: ${tags.join(', ')}`;

        // Set pipeline stage based on intent
        if (tags.includes('high_intent') || tags.includes('human_handoff')) {
          contact.pipeline_stage = 'qualified';
        } else if (tags.includes('intent_sales')) {
          contact.pipeline_stage = 'contacted';
        }
      } else {
        contact.lead_score = 10;
      }
    }

    // ═══ GENERIC ═══
    else {
      contact.first_name = body.first_name || body.name?.split(' ')[0] || null;
      contact.last_name = body.last_name || body.name?.split(' ').slice(1).join(' ') || null;
      contact.phone = body.phone || body.phone_number || null;
      contact.email = body.email || null;
      contact.vehicle_interest = body.vehicle_interest || body.vehicle || null;
      contact.notes = body.notes || body.message || null;
    }

    // Dedup check: if phone or email exists, update instead of create
    let existingId: string | null = null;

    if (contact.phone) {
      const { data } = await getSupabase().from('contacts')
        .select('id')
        .eq('phone', contact.phone)
        .limit(1);
      if (data && data.length > 0) existingId = data[0].id;
    }

    if (!existingId && contact.email) {
      const { data } = await getSupabase().from('contacts')
        .select('id')
        .eq('email', contact.email)
        .limit(1);
      if (data && data.length > 0) existingId = data[0].id;
    }

    if (existingId) {
      // Update existing contact with new info (don't overwrite with nulls)
      const updates: Record<string, any> = { updated_at: new Date().toISOString(), last_contact_at: new Date().toISOString() };
      Object.entries(contact).forEach(([k, v]) => {
        if (v !== null && v !== undefined && k !== 'pipeline_stage' && k !== 'lead_score') {
          updates[k] = v;
        }
      });

      const { error } = await getSupabase().from('contacts').update(updates).eq('id', existingId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Log communication if there's a message
      if (body.message || body.body_text) {
        await getSupabase().from('communications').insert({
          contact_id: existingId,
          type: source === 'quo' ? (body.type || 'sms') : source === 'email' ? 'email' : 'note',
          direction: body.direction || 'inbound',
          content: body.message || body.body_text || body.body || null,
        });
      }

      return NextResponse.json({ success: true, action: 'updated', id: existingId });
    }

    // Create new contact
    const { data, error } = await getSupabase().from('contacts').insert(contact).select('id').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Log initial communication if there's a message
    if (data && (body.message || body.body_text)) {
      await getSupabase().from('communications').insert({
        contact_id: data.id,
        type: source === 'quo' ? (body.type || 'sms') : source === 'email' ? 'email' : 'note',
        direction: body.direction || 'inbound',
        content: body.message || body.body_text || body.body || null,
      });
    }

    // Auto-generate draft email response (fire and forget)
    if (data) {
      generateDraft(data.id, contact).catch(err => console.error('Draft generation failed:', err));
    }

    return NextResponse.json({ success: true, action: 'created', id: data?.id });

  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// Auto-generate draft intro email for new leads
async function generateDraft(contactId: string, contact: Record<string, any>) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return;

  const name = contact.first_name || 'there';
  const vehicle = contact.vehicle_interest || '';
  const timeline = contact.timeline || '';
  const source = contact.source_detail || contact.source || '';
  const notes = contact.notes || '';

  // Only generate if we have something to work with
  if (!notes && !vehicle) return;

  const contextParts = [];
  if (notes) contextParts.push(`THEIR MESSAGE/SITUATION: "${notes}"`);
  if (vehicle) contextParts.push(`Vehicle: ${vehicle}`);
  if (timeline) contextParts.push(`Timeline: ${timeline}`);
  if (source) contextParts.push(`Source: ${source}`);
  const contextBlock = contextParts.join('\n');

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: `You are Tomi Mikula, Founder and CEO of Delivrd.

Your communication style: Calm, direct, human, efficient, confident without ego. Never pushy, never needy, never robotic. CEO energy with calm authority. Friendly and direct, slightly conversational, never casual or corporate. No em dashes. No sales jargon. No urgency tricks. No emojis.

What Delivrd is: A concierge negotiation and sourcing service (NOT an auto broker). Clients pay for work, expertise, and execution. Nationwide searches standard. The market dictates pricing, not wishful targets.

Critical: Email is the fast lane pre-signup. The fastest way to get answers is replying to the email. Once signed up, communication shifts to text and calls.

Every email must: Acknowledge what they're shopping for, reference their SPECIFIC situation, validate their thinking, set realistic expectations, make handing it off feel smart not salesy, end with a clean CTA.

Required CTA link (include naturally): https://www.delivrdto.me/product/insta-pay-deal-negotiation
Position as delegation: "If you want me to take this over" not "buy now."

Format: First line must be "Subject: Delivrd Inquiry – [Vehicle]" then blank line then email body. Sign as Tomi. Keep it short to medium. Every sentence earns its spot.`,
        messages: [{
          role: 'user',
          content: `Write a first-contact email to ${name}.

${contextBlock}

This is the first outreach. Reference their specific situation. Show you read what they said. Position Delivrd as the easy, smart move. Include the signup link naturally.`,
        }],
      }),
    });

    if (!res.ok) return;

    const data = await res.json();
    const msg = data.content?.[0]?.text || '';
    if (!msg) return;

    // Parse subject and body
    let draftSubject = '';
    let draftEmail = msg;
    const subjectMatch = msg.match(/^Subject:\s*(.+)\n/i);
    if (subjectMatch) {
      draftSubject = subjectMatch[1].trim();
      draftEmail = msg.replace(/^Subject:\s*.+\n+/i, '').trim();
    }

    // Save to contact record
    await getSupabase().from('contacts').update({
      draft_subject: draftSubject,
      draft_email: draftEmail,
    }).eq('id', contactId);

  } catch (err) {
    console.error('Draft generation error:', err);
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/webhook',
    accepted_sources: ['manychat', 'email', 'quo', 'tiktok', 'instagram', 'youtube', 'manual'],
    auth: 'Bearer token or ?secret= query param',
  });
}
