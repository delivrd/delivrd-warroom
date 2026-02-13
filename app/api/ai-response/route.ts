import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
  }

  try {
    const { context, mode, contact } = await request.json();

    if (!mode || !contact) {
      return NextResponse.json({ error: 'Missing mode or contact' }, { status: 400 });
    }

    const name = contact.first_name || 'there';
    const vehicle = contact.vehicle_interest || '';
    const timeline = contact.timeline || '';
    const source = contact.source_detail || contact.source || '';
    const notes = contact.notes || '';

    const systemPrompt = `You are a sales rep for Delivrd, a car buying negotiation service. You negotiate the best price on new and used cars for customers. You are texting or emailing leads.

Rules:
- Keep messages under 160 characters for SMS, under 200 words for email
- Sound human, not like a bot
- Be direct and confident
- Never use exclamation marks more than once
- No emojis unless the lead used them first
- Reference their specific car/situation when available
- Delivrd negotiates the price, handles the back-and-forth with dealers, saves customers thousands
- The tone is: helpful, no-pressure, confident, slightly casual`;

    const modePrompts: Record<string, string> = {
      intro: `Write a first-contact SMS to ${name}. ${vehicle ? `They're interested in a ${vehicle}.` : ''} ${timeline ? `Timeline: ${timeline}.` : ''} ${source ? `They came from ${source}.` : ''} ${notes ? `Context: ${notes}` : ''}
Keep it short. Introduce yourself, reference what they're looking for, and offer to help. Don't be salesy.`,

      follow_up: `Write a follow-up SMS to ${name}. ${vehicle ? `They were looking at a ${vehicle}.` : ''} We reached out before but haven't heard back. ${notes ? `Context: ${notes}` : ''}
Keep it casual and short. One clear reason to reply. No guilt trips.`,

      objection: `Write an objection-handling SMS to ${name}. ${vehicle ? `They're interested in a ${vehicle}.` : ''} They might be hesitant about using a service or unsure about the value. ${notes ? `Context: ${notes}` : ''}
Address the hesitation directly. Keep it real. Mention that we save people $2k-5k+ on average and it costs nothing upfront.`,

      close: `Write a closing SMS to ${name}. ${vehicle ? `They want a ${vehicle}.` : ''} They've been talking to us and seem ready. ${notes ? `Context: ${notes}` : ''}
Push for next step: getting their pre-approval info or target price so we can start negotiating. Be direct.`,
    };

    const userPrompt = modePrompts[mode] || modePrompts.intro;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: 'Claude API error', details: data }, { status: res.status });
    }

    const message = data.content?.[0]?.text || '';

    return NextResponse.json({ success: true, message });

  } catch (err: any) {
    console.error('AI response error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
