// POST /api/webhooks/manychat - Handle ManyChat lead webhooks
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatPhoneE164 } from '@/lib/api/quo';
import { calculateLeadScore } from '@/lib/api/crm';
import { sendSlackAlert } from '@/lib/api/slack';

export const dynamic = 'force-dynamic';

interface ManyChatWebhook {
  subscriber_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  source?: string; // e.g., "tiktok_dm", "instagram_story", "youtube_comment"
  vehicle_interest?: string; // e.g., "2025 RAV4 Hybrid"
  timeline?: string; // e.g., "this_month", "1-3mo", "3-6mo", "6+mo"
  budget?: string; // e.g., "under_30k", "30-50k", "50-75k", "75k+"
  custom_fields?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const webhook: ManyChatWebhook = await request.json();

    console.log('[ManyChat Webhook] Received:', {
      subscriber_id: webhook.subscriber_id,
      name: `${webhook.first_name} ${webhook.last_name}`,
      phone: webhook.phone,
      source: webhook.source,
      vehicle: webhook.vehicle_interest,
    });

    // Validate required fields
    if (!webhook.subscriber_id) {
      return NextResponse.json(
        { error: 'Missing subscriber_id' },
        { status: 400 }
      );
    }

    // Format phone if provided
    let formattedPhone = null;
    if (webhook.phone) {
      try {
        formattedPhone = formatPhoneE164(webhook.phone);
      } catch (error) {
        console.warn('[ManyChat] Invalid phone format:', webhook.phone);
      }
    }

    // Check if contact exists by phone OR manychat_id
    let { data: existingContact } = await supabase
      .from('contacts')
      .select('*')
      .is('deleted_at', null)
      .or(`phone.eq.${formattedPhone},metadata->manychat_id.eq.${webhook.subscriber_id}`)
      .single();

    let contact;
    let isNewContact = false;

    if (existingContact) {
      console.log('[ManyChat] Updating existing contact:', existingContact.id);

      // Update fields (don't overwrite notes)
      const updates: any = {
        updated_at: new Date().toISOString(),
        metadata: {
          ...existingContact.metadata,
          manychat_id: webhook.subscriber_id,
          manychat_source: webhook.source,
          last_manychat_sync: new Date().toISOString(),
        },
      };

      // Update fields if provided and not already set
      if (webhook.first_name && !existingContact.first_name) {
        updates.first_name = webhook.first_name;
      }
      if (webhook.last_name && !existingContact.last_name) {
        updates.last_name = webhook.last_name;
      }
      if (webhook.email && !existingContact.email) {
        updates.email = webhook.email;
      }
      if (formattedPhone && !existingContact.phone) {
        updates.phone = formattedPhone;
      }

      // Always update vehicle interest, timeline, budget if provided
      if (webhook.vehicle_interest) {
        updates.metadata.vehicle_interest = webhook.vehicle_interest;
      }
      if (webhook.timeline) {
        updates.metadata.timeline = webhook.timeline;
      }
      if (webhook.budget) {
        updates.metadata.budget = webhook.budget;
      }

      const { data: updated, error: updateError } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', existingContact.id)
        .select()
        .single();

      if (updateError) {
        console.error('[ManyChat] Update failed:', updateError);
        return NextResponse.json(
          { error: 'Failed to update contact' },
          { status: 500 }
        );
      }

      contact = updated;

    } else {
      console.log('[ManyChat] Creating new contact from webhook');
      isNewContact = true;

      // Determine source
      let source: 'manychat' | 'referral' = 'manychat';
      if (webhook.source?.includes('referral')) {
        source = 'referral';
      }

      // Create new contact
      const { data: newContact, error: createError } = await supabase
        .from('contacts')
        .insert({
          first_name: webhook.first_name || 'ManyChat Lead',
          last_name: webhook.last_name || null,
          email: webhook.email || null,
          phone: formattedPhone,
          dealership_name: webhook.first_name 
            ? `${webhook.first_name}'s Interest` 
            : 'ManyChat Lead',
          source,
          stage: 'lead',
          priority: 'medium',
          status: 'active',
          metadata: {
            manychat_id: webhook.subscriber_id,
            manychat_source: webhook.source,
            vehicle_interest: webhook.vehicle_interest,
            timeline: webhook.timeline,
            budget: webhook.budget,
            custom_fields: webhook.custom_fields,
            created_from_webhook: true,
          },
        })
        .select()
        .single();

      if (createError) {
        console.error('[ManyChat] Create failed:', createError);
        return NextResponse.json(
          { error: 'Failed to create contact' },
          { status: 500 }
        );
      }

      contact = newContact;
    }

    // Calculate lead score
    const leadScore = await calculateLeadScore(contact.id);
    console.log('[ManyChat] Lead score calculated:', leadScore);

    // Update contact with lead score
    await supabase
      .from('contacts')
      .update({ lead_score: leadScore })
      .eq('id', contact.id);

    // Handle hot leads (score > 70)
    if (leadScore > 70) {
      console.log('[ManyChat] 🔥 HOT LEAD detected!');

      // Update stage to qualified
      await supabase
        .from('contacts')
        .update({ stage: 'qualified' })
        .eq('id', contact.id);

      // Send Slack alert
      try {
        await sendSlackAlert('hot_lead', {
          name: contact.full_name || contact.first_name,
          vehicle: webhook.vehicle_interest || 'N/A',
          score: leadScore,
          source: webhook.source || 'ManyChat',
          contactId: contact.id,
        });
      } catch (slackError) {
        console.error('[ManyChat] Slack alert failed:', slackError);
        // Don't fail the webhook
      }
    } 
    // Handle warm leads - enroll in nurture sequence
    else if (leadScore >= 40) {
      console.log('[ManyChat] Warm lead - enrolling in nurture sequence');

      // Find default nurture sequence
      const { data: sequence } = await supabase
        .from('sequences')
        .select('id')
        .eq('name', 'Nurture - New Lead')
        .eq('active', true)
        .single();

      if (sequence) {
        // Check if already enrolled
        const { data: existing } = await supabase
          .from('sequence_enrollments')
          .select('id')
          .eq('sequence_id', sequence.id)
          .eq('contact_id', contact.id)
          .single();

        if (!existing) {
          await supabase
            .from('sequence_enrollments')
            .insert({
              sequence_id: sequence.id,
              contact_id: contact.id,
              status: 'active',
              current_step: 0,
              metadata: {
                enrolled_from: 'manychat_webhook',
                lead_score: leadScore,
              },
            });

          console.log('[ManyChat] Enrolled in nurture sequence');
        }
      }
    }

    console.log('[ManyChat] Webhook processed successfully:', {
      contactId: contact.id,
      isNewContact,
      leadScore,
      stage: contact.stage,
    });

    return NextResponse.json({
      success: true,
      contactId: contact.id,
      isNewContact,
      leadScore,
      stage: contact.stage,
    });

  } catch (error: any) {
    console.error('[ManyChat Webhook] Error:', error);
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
    endpoint: '/api/webhooks/manychat',
    status: 'active',
    timestamp: new Date().toISOString(),
  });
}
