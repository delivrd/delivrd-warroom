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
    // From Zapier/Make: { source: "email", from_name, from_email, subject, body_text }
    else if (source === 'email') {
      const fromName = body.from_name || body.sender_name || '';
      const nameParts = fromName.split(' ');
      contact.first_name = nameParts[0] || null;
      contact.last_name = nameParts.slice(1).join(' ') || null;
      contact.email = body.from_email || body.sender_email || body.email || null;
      contact.phone = body.phone || null;
      contact.source_detail = body.subject || 'email';
      contact.notes = body.body_text || body.body || body.message || null;

      // Try to extract vehicle info from subject/body
      const text = `${body.subject || ''} ${body.body_text || ''}`.toLowerCase();
      const makes = ['bmw', 'mercedes', 'audi', 'lexus', 'toyota', 'honda', 'tesla', 'porsche', 'land rover', 'range rover', 'ford', 'chevrolet', 'jeep', 'hyundai', 'kia', 'nissan', 'subaru', 'volkswagen', 'volvo', 'acura', 'infiniti', 'cadillac', 'lincoln', 'genesis', 'mazda'];
      for (const make of makes) {
        if (text.includes(make)) {
          contact.vehicle_make = make.charAt(0).toUpperCase() + make.slice(1);
          break;
        }
      }

      contact.lead_score = 5; // low confidence from email
      if (contact.phone) contact.lead_score += 10;
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

    // ═══ TIKTOK / INSTAGRAM ═══
    else if (source === 'tiktok' || source === 'instagram' || source === 'youtube') {
      contact.first_name = body.first_name || body.name?.split(' ')[0] || body.username || null;
      contact.last_name = body.last_name || body.name?.split(' ').slice(1).join(' ') || null;
      contact.phone = body.phone || null;
      contact.email = body.email || null;
      contact.source_detail = body.platform || source;
      contact.vehicle_interest = body.vehicle_interest || body.vehicle || null;
      contact.lead_score = 10;
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

    return NextResponse.json({ success: true, action: 'created', id: data?.id });

  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
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
