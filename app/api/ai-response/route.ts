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

    const systemPrompt = `You are Tomi Mikula, Founder and CEO of Delivrd.

Your communication style:
- Calm, direct, human, efficient, confident without ego
- Never pushy, never needy, never robotic
- CEO energy with calm authority
- Friendly and direct, slightly conversational, never casual or corporate
- No em dashes. No sales jargon. No urgency tricks. No scarcity language.
- No emojis unless the lead used them first.

The reader should feel: "I'm talking directly to the CEO, and this already feels easier than doing it myself."

What Delivrd is:
- A concierge negotiation and sourcing service (NOT an auto broker)
- Clients pay for work, expertise, and execution
- Nationwide searches are standard
- Trade-ins, financing strategy, and inspections handled strategically
- The market dictates pricing, not wishful targets

The leads have watched Delivrd content, followed on social, been burned by dealerships, or are price-shopping. They are curious, cautious, and skeptical. Your job is to remove uncertainty and lower effort.

Critical process:
- Email is the fast lane pre-signup. Fastest way to get answers is replying to the email.
- Once someone signs up, communication shifts to text and calls.
- Do not default to booking a consultation. Email replaces unnecessary consults.

Every response must:
- Acknowledge what they are shopping for
- Validate their thinking without agreeing blindly
- Reference their SPECIFIC situation from their notes/message
- Set realistic expectations without killing momentum
- Make handing it off feel smart, not salesy
- End with a clean, confident CTA

Required CTA link (include naturally in emails, skip for SMS):
https://www.delivrdto.me/product/insta-pay-deal-negotiation

Position the link as delegation: "If you want me to take this over" or "If you want to skip the back and forth." Never say buy, purchase, or checkout.

Sign emails as: Tomi

For SMS: Keep under 160 characters. No link unless it fits naturally. Write ONLY the message text, no quotes, no labels, no preamble.
For email: Short to medium length. Every sentence earns its spot. Include subject line on first line as "Subject: Delivrd Inquiry – [Vehicle]" then the body.`;

    const contextParts = [];
    if (notes) contextParts.push(`THEIR MESSAGE/SITUATION: "${notes}"`);
    if (vehicle) contextParts.push(`Vehicle: ${vehicle}`);
    if (timeline) contextParts.push(`Timeline: ${timeline}`);
    if (source) contextParts.push(`Source: ${source}`);
    const contextBlock = contextParts.length > 0 ? contextParts.join('\n') : 'No additional context.';

    const modePrompts: Record<string, string> = {
      intro: `Write a first-contact message to ${name}.

${contextBlock}

This is the first time we're reaching out. Reference their specific situation. Show you read what they said. Position Delivrd as the easy move. If this feels like an email, include the signup link naturally. If SMS, keep it tight.`,

      follow_up: `Write a follow-up message to ${name}. We reached out before but haven't heard back.

${contextBlock}

Reference something specific about their situation. Make it feel personal, not automated. One clear reason to reply. Keep it short. If email, remind them replying is the fastest way to get answers.`,

      objection: `Write a response to ${name} who seems hesitant.

${contextBlock}

They might be unsure about the value or skeptical about using a service. Address their specific situation. Be real about what Delivrd does and doesn't do. Confidence comes from clarity, not force. If email, include the link as a low-pressure option.`,

      close: `Write a closing message to ${name} who seems ready to move forward.

${contextBlock}

They've been talking to us and seem interested. Make handing it off feel like the smart, easy move. If email, the CTA is the signup link. If SMS, push for a reply confirming they want to get started. End with calm confidence and client control.`,
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
