// GET /api/cron/sequences - Process active sequences (runs every 15 min)
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendSMS } from '@/lib/api/quo';

export const dynamic = 'force-dynamic';

/**
 * Vercel Cron Job: Process sequence enrollments
 * 
 * Configured in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/sequences",
 *     "schedule": "* /15 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional security layer)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Sequences Cron] Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Sequences Cron] Starting sequence processor...');

    // Get all active enrollments where next_step_at <= NOW
    const now = new Date().toISOString();
    
    const { data: enrollments, error: enrollError } = await supabase
      .from('sequence_enrollments')
      .select(`
        *,
        sequences (
          id,
          name,
          steps,
          active
        ),
        contacts (
          id,
          first_name,
          last_name,
          phone,
          stage
        )
      `)
      .eq('status', 'active')
      .lte('metadata->next_step_at', now);

    if (enrollError) {
      console.error('[Sequences Cron] Query error:', enrollError);
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      );
    }

    if (!enrollments || enrollments.length === 0) {
      console.log('[Sequences Cron] No enrollments ready to process');
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No enrollments due',
      });
    }

    console.log('[Sequences Cron] Found enrollments to process:', enrollments.length);

    let processed = 0;
    let errors = 0;
    const results = [];

    for (const enrollment of enrollments as any[]) {
      try {
        const sequence = enrollment.sequences;
        const contact = enrollment.contacts;

        // Skip if sequence inactive
        if (!sequence.active) {
          console.log('[Sequences Cron] Skipping inactive sequence:', sequence.id);
          await supabase
            .from('sequence_enrollments')
            .update({ 
              status: 'cancelled',
              metadata: {
                ...enrollment.metadata,
                cancelled_reason: 'sequence_deactivated',
              }
            })
            .eq('id', enrollment.id);
          continue;
        }

        // Skip if contact has no phone
        if (!contact.phone) {
          console.warn('[Sequences Cron] Contact has no phone:', contact.id);
          errors++;
          results.push({
            enrollmentId: enrollment.id,
            contactId: contact.id,
            error: 'No phone number',
          });
          continue;
        }

        // Get current step
        const steps = sequence.steps || [];
        const currentStepIndex = enrollment.current_step;

        if (currentStepIndex >= steps.length) {
          // Sequence completed
          console.log('[Sequences Cron] Completing sequence:', enrollment.id);
          await supabase
            .from('sequence_enrollments')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', enrollment.id);
          
          processed++;
          results.push({
            enrollmentId: enrollment.id,
            contactId: contact.id,
            action: 'completed',
          });
          continue;
        }

        const currentStep = steps[currentStepIndex];

        // Get template
        const { data: template, error: templateError } = await supabase
          .from('templates')
          .select('*')
          .eq('id', currentStep.template_id)
          .single();

        if (templateError || !template) {
          console.error('[Sequences Cron] Template not found:', currentStep.template_id);
          errors++;
          continue;
        }

        // Render template with variables
        let message = template.body;
        message = message.replace(/\{\{first_name\}\}/g, contact.first_name || 'there');
        message = message.replace(/\{\{last_name\}\}/g, contact.last_name || '');
        message = message.replace(/\{\{full_name\}\}/g, 
          contact.last_name ? `${contact.first_name} ${contact.last_name}` : contact.first_name
        );

        // Send message based on type
        if (currentStep.type === 'sms') {
          console.log('[Sequences Cron] Sending SMS:', {
            enrollmentId: enrollment.id,
            contactId: contact.id,
            phone: contact.phone,
            step: currentStepIndex,
          });

          try {
            const quoResponse = await sendSMS({
              to: contact.phone,
              content: message,
            });

            // Log communication
            await supabase
              .from('communications')
              .insert({
                contact_id: contact.id,
                type: 'sms',
                direction: 'outbound',
                body: message,
                status: 'sent',
                quo_message_id: quoResponse.id,
                metadata: {
                  sequence_id: sequence.id,
                  sequence_name: sequence.name,
                  enrollment_id: enrollment.id,
                  step_index: currentStepIndex,
                  template_id: template.id,
                },
              });

            // Update contact last_contact_at
            await supabase
              .from('contacts')
              .update({
                metadata: {
                  ...contact.metadata,
                  last_contact_at: new Date().toISOString(),
                }
              })
              .eq('id', contact.id);

          } catch (smsError: any) {
            console.error('[Sequences Cron] SMS send failed:', smsError);
            errors++;
            results.push({
              enrollmentId: enrollment.id,
              contactId: contact.id,
              error: smsError.message,
            });
            continue;
          }
        }

        // Advance to next step
        const nextStepIndex = currentStepIndex + 1;
        const isComplete = nextStepIndex >= steps.length;

        if (isComplete) {
          // Mark as completed
          await supabase
            .from('sequence_enrollments')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              current_step: nextStepIndex,
            })
            .eq('id', enrollment.id);
        } else {
          // Calculate next step time
          const nextStep = steps[nextStepIndex];
          const nextStepDate = new Date();
          nextStepDate.setDate(nextStepDate.getDate() + (nextStep.day || 1));

          await supabase
            .from('sequence_enrollments')
            .update({
              current_step: nextStepIndex,
              metadata: {
                ...enrollment.metadata,
                next_step_at: nextStepDate.toISOString(),
                last_step_sent: new Date().toISOString(),
              },
            })
            .eq('id', enrollment.id);
        }

        processed++;
        results.push({
          enrollmentId: enrollment.id,
          contactId: contact.id,
          contactName: contact.first_name,
          sequenceName: sequence.name,
          step: currentStepIndex,
          action: isComplete ? 'completed' : 'advanced',
          nextStep: isComplete ? null : nextStepIndex,
        });

      } catch (error: any) {
        console.error('[Sequences Cron] Error processing enrollment:', error);
        errors++;
        results.push({
          enrollmentId: enrollment.id,
          error: error.message,
        });
      }
    }

    console.log('[Sequences Cron] Processing complete:', {
      total: enrollments.length,
      processed,
      errors,
    });

    return NextResponse.json({
      success: true,
      processed,
      errors,
      total: enrollments.length,
      results,
    });

  } catch (error: any) {
    console.error('[Sequences Cron] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
