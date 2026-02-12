// POST /api/sms/send - Send SMS via Quo
import { NextRequest, NextResponse } from 'next/server';
import { sendSMS, formatPhoneE164 } from '@/lib/api/quo';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface SendSMSBody {
  contactId: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendSMSBody = await request.json();
    const { contactId, message } = body;

    // Validate input
    if (!contactId || !message) {
      return NextResponse.json(
        { error: 'Missing contactId or message' },
        { status: 400 }
      );
    }

    // Get contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, phone, dealership_name, metadata')
      .eq('id', contactId)
      .is('deleted_at', null)
      .single();

    if (contactError || !contact) {
      console.error('[Send SMS] Contact not found:', contactId, contactError);
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Check phone number
    if (!contact.phone) {
      return NextResponse.json(
        { error: 'Contact has no phone number' },
        { status: 400 }
      );
    }

    // Format phone
    const formattedPhone = formatPhoneE164(contact.phone);

    // Send SMS via Quo
    const quoResponse = await sendSMS({
      to: formattedPhone,
      content: message,
    });

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Log to communications table
    const { data: communication, error: commError } = await supabase
      .from('communications')
      .insert({
        contact_id: contactId,
        type: 'sms',
        direction: 'outbound',
        body: message,
        status: 'sent',
        quo_message_id: quoResponse.id,
        created_by: user?.id || null,
        metadata: {
          to: formattedPhone,
          from: quoResponse.from,
          quo_status: quoResponse.status,
        },
      })
      .select()
      .single();

    if (commError) {
      console.error('[Send SMS] Failed to log communication:', commError);
      // Don't fail the request - message was sent
    }

    // Update contact.last_contact_at
    const { error: updateError } = await supabase
      .from('contacts')
      .update({ 
        updated_at: new Date().toISOString(),
        metadata: {
          ...contact.metadata,
          last_contact_at: new Date().toISOString(),
        }
      })
      .eq('id', contactId);

    if (updateError) {
      console.error('[Send SMS] Failed to update contact:', updateError);
    }

    console.log('[Send SMS] Success:', {
      contactId,
      phone: formattedPhone,
      messageId: quoResponse.id,
      commId: communication?.id,
    });

    return NextResponse.json({
      success: true,
      messageId: quoResponse.id,
      communicationId: communication?.id,
      quoResponse,
    });

  } catch (error: any) {
    console.error('[Send SMS] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send SMS',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
