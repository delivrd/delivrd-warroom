// POST /api/webhooks/quo - Handle inbound Quo/OpenPhone messages
import { NextRequest, NextResponse } from 'next/server';
import { validateQuoWebhook, extractPhoneFromWebhook, type QuoInboundWebhook } from '@/lib/api/quo';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const webhook: QuoInboundWebhook = await request.json();

    console.log('[Quo Webhook] Received:', {
      id: webhook.id,
      from: webhook.from,
      direction: webhook.direction,
      contentPreview: webhook.content?.substring(0, 50),
    });

    // Validate webhook payload
    if (!validateQuoWebhook(webhook)) {
      console.error('[Quo Webhook] Invalid payload:', webhook);
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Only process incoming messages
    if (webhook.direction !== 'incoming') {
      console.log('[Quo Webhook] Ignoring outgoing message:', webhook.id);
      return NextResponse.json({ success: true, action: 'ignored_outgoing' });
    }

    // Extract phone number
    const phone = extractPhoneFromWebhook(webhook);

    // Check for duplicate message (idempotency)
    const { data: existingComm } = await supabase
      .from('communications')
      .select('id')
      .eq('quo_message_id', webhook.id)
      .single();

    if (existingComm) {
      console.log('[Quo Webhook] Duplicate message:', webhook.id);
      return NextResponse.json({ success: true, action: 'duplicate' });
    }

    // Look up contact by phone
    let { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('phone', phone)
      .is('deleted_at', null)
      .single();

    let isNewContact = false;

    // If no contact exists, create one
    if (!contact) {
      console.log('[Quo Webhook] Creating new contact from inbound:', phone);
      
      const { data: newContact, error: createError } = await supabase
        .from('contacts')
        .insert({
          first_name: phone, // Placeholder - will be updated later
          dealership_name: `Inbound ${phone}`,
          phone,
          source: 'quo',
          stage: 'lead',
          lead_score: 10, // Base score for inbound
          priority: 'medium',
          status: 'active',
          metadata: {
            created_from_webhook: true,
            first_message_id: webhook.id,
          },
        })
        .select()
        .single();

      if (createError) {
        console.error('[Quo Webhook] Failed to create contact:', createError);
        return NextResponse.json(
          { error: 'Failed to create contact' },
          { status: 500 }
        );
      }

      contact = newContact;
      isNewContact = true;
    }

    // Log communication
    const { data: communication, error: commError } = await supabase
      .from('communications')
      .insert({
        contact_id: contact.id,
        type: 'sms',
        direction: 'inbound',
        body: webhook.content,
        status: 'delivered',
        quo_message_id: webhook.id,
        metadata: {
          from: webhook.from,
          to: webhook.to,
          webhook_received_at: new Date().toISOString(),
          phone_number_id: webhook.phoneNumberId,
        },
      })
      .select()
      .single();

    if (commError) {
      console.error('[Quo Webhook] Failed to log communication:', commError);
      return NextResponse.json(
        { error: 'Failed to log communication' },
        { status: 500 }
      );
    }

    // Update contact last_contact_at
    await supabase
      .from('contacts')
      .update({
        updated_at: new Date().toISOString(),
        metadata: {
          ...contact.metadata,
          last_contact_at: new Date().toISOString(),
        },
      })
      .eq('id', contact.id);

    // CRITICAL: If contact is in active sequence, PAUSE it
    const { data: activeEnrollments } = await supabase
      .from('sequence_enrollments')
      .select('id, sequence_id')
      .eq('contact_id', contact.id)
      .eq('status', 'active');

    if (activeEnrollments && activeEnrollments.length > 0) {
      console.log('[Quo Webhook] Pausing active sequences for contact:', contact.id);
      
      await supabase
        .from('sequence_enrollments')
        .update({ 
          status: 'paused',
          metadata: {
            paused_reason: 'inbound_reply',
            paused_at: new Date().toISOString(),
            message_id: webhook.id,
          }
        })
        .eq('contact_id', contact.id)
        .eq('status', 'active');
    }

    console.log('[Quo Webhook] Processed successfully:', {
      contactId: contact.id,
      communicationId: communication.id,
      isNewContact,
      pausedSequences: activeEnrollments?.length || 0,
    });

    return NextResponse.json({
      success: true,
      contactId: contact.id,
      communicationId: communication.id,
      isNewContact,
      pausedSequences: activeEnrollments?.length || 0,
    });

  } catch (error: any) {
    console.error('[Quo Webhook] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/webhooks/quo',
    status: 'active',
    timestamp: new Date().toISOString(),
  });
}
