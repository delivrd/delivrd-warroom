import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
  }

  try {
    const { context, mode, contact, model } = await request.json();

    if (!mode || !contact) {
      return NextResponse.json({ error: 'Missing mode or contact' }, { status: 400 });
    }

    const useModel = model === 'opus' ? 'claude-sonnet-4-5-20250929' : 'claude-haiku-4-5-20251001';

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
- ALWAYS reference the lead's specific situation from their notes/message. This is the most important thing. They reached out for a reason, acknowledge it.
- Delivrd negotiates the price, handles the back-and-forth with dealers, saves customers thousands
- The tone is: helpful, no-pressure, confident, slightly casual
- Write ONLY the message text. No quotes, no labels, no preamble.`;

    // Build context block with notes as the priority
    const contextParts = [];
    if (notes) contextParts.push(`THEIR MESSAGE/SITUATION: "${notes}"`);
    if (vehicle) contextParts.push(`Vehicle: ${vehicle}`);
    if (timeline) contextParts.push(`Timeline: ${timeline}`);
    if (source) contextParts.push(`Source: ${source}`);
    const contextBlock = contextParts.length > 0 ? contextParts.join('\n') : 'No additional context.';

    const modePrompts: Record<string, string> = {
      intro: `Write a first-contact SMS to ${name}.

${contextBlock}

Reference their specific situation directly. Show you actually read what they said. Then briefly mention how Delivrd can help. Keep it under 160 chars if possible.`,

      follow_up: `Write a follow-up SMS to ${name}. We reached out before but haven't heard back.

${contextBlock}

Reference something specific about their situation to show this isn't a mass text. One clear reason to reply. Keep it short.`,

      objection: `Write an objection-handling SMS to ${name}.

${contextBlock}

They might be hesitant. Address their specific situation and explain how we help. We save people $2k-5k+ on average. No upfront cost. Keep it real and direct.`,

      close: `Write a closing SMS to ${name}.

${contextBlock}

They seem ready to move forward. Push for the next step: getting their pre-approval info or target price so we can start negotiating. Be direct.`,
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
        model: useModel,
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
