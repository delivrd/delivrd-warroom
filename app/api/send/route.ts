import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
};

export async function POST(request: Request) {
  const QUO_API_KEY = process.env.QUO_API_KEY || '';
  const QUO_FROM_NUMBER = process.env.QUO_FROM_NUMBER || '+19804462514';
  const GMAIL_SCRIPT_URL = process.env.GMAIL_SCRIPT_URL || '';
  try {
    const body = await request.json();
    const { type, contact_id, to, content, subject } = body;

    if (!type || !contact_id || !content) {
      return NextResponse.json({ error: 'Missing type, contact_id, or content' }, { status: 400 });
    }

    let result: any = {};

    // ═══ SEND SMS VIA QUO ═══
    if (type === 'sms') {
      if (!to) return NextResponse.json({ error: 'Missing phone number' }, { status: 400 });
      if (!QUO_API_KEY) return NextResponse.json({ error: 'Quo API key not configured' }, { status: 500 });

      // Format phone to E.164
      const phone = formatE164(to);

      const quoRes = await fetch('https://api.openphone.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': QUO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          from: QUO_FROM_NUMBER,
          to: [phone],
        }),
      });

      const quoData = await quoRes.json();

      if (!quoRes.ok) {
        return NextResponse.json({ error: 'Quo API error', details: quoData }, { status: quoRes.status });
      }

      result = { provider: 'quo', messageId: quoData.data?.id, status: 'sent' };
    }

    // ═══ SEND EMAIL VIA GMAIL APPS SCRIPT ═══
    else if (type === 'email') {
      if (!to) return NextResponse.json({ error: 'Missing email address' }, { status: 400 });
      if (!GMAIL_SCRIPT_URL) return NextResponse.json({ error: 'Gmail script URL not configured' }, { status: 500 });

      const emailRes = await fetch(GMAIL_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_email',
          to,
          subject: subject || 'Delivrd - Your Car Buying Concierge',
          body: content,
        }),
      });

      const emailData = await emailRes.json();

      if (!emailRes.ok) {
        return NextResponse.json({ error: 'Gmail send error', details: emailData }, { status: emailRes.status });
      }

      result = { provider: 'gmail', status: 'sent' };
    }

    else {
      return NextResponse.json({ error: 'Invalid type. Use "sms" or "email"' }, { status: 400 });
    }

    // Log the communication in Supabase
    await getSupabase().from('communications').insert({
      contact_id,
      type: type === 'sms' ? 'sms' : 'email',
      direction: 'outbound',
      content,
    });

    // Update last_contact_at
    await getSupabase().from('contacts').update({
      last_contact_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', contact_id);

    return NextResponse.json({ success: true, ...result });

  } catch (err: any) {
    console.error('Send error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

function formatE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`;
  return `+${digits}`;
}
