// Slack Notifications API
// Sends alerts to #sales-pipeline channel

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

export type SlackAlertType = 
  | 'hot_lead'
  | 'inbound_sms'
  | 'inbound_call'
  | 'stage_paid'
  | 'followup_overdue'
  | 'daily_digest';

interface HotLeadData {
  name: string;
  vehicle: string;
  score: number;
  source: string;
  contactId: string;
}

interface InboundCommData {
  name: string;
  type: 'sms' | 'call';
  message?: string;
  contactId: string;
}

interface StagePaidData {
  name: string;
  amount: number;
  vehicle: string;
  contactId: string;
}

interface FollowupOverdueData {
  name: string;
  title: string;
  dueDate: string;
  hoursOverdue: number;
  contactId: string;
}

interface DailyDigestData {
  newLeads: number;
  hotLeads: number;
  inPipeline: number;
  closedToday: number;
  overdueFollowups: number;
  totalRevenue: number;
}

export async function sendSlackAlert(
  type: SlackAlertType,
  data: HotLeadData | InboundCommData | StagePaidData | FollowupOverdueData | DailyDigestData
): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('[Slack] SLACK_WEBHOOK_URL not configured - skipping alert');
    return;
  }

  let message: string;
  let emoji: string;

  switch (type) {
    case 'hot_lead':
      const hotData = data as HotLeadData;
      emoji = '🔥';
      message = `${emoji} NEW HOT LEAD: ${hotData.name} — ${hotData.vehicle} — Score: ${hotData.score} — ${hotData.source}\n<${getContactUrl(hotData.contactId)}|View Contact>`;
      break;

    case 'inbound_sms':
    case 'inbound_call':
      const inboundData = data as InboundCommData;
      emoji = inboundData.type === 'sms' ? '💬' : '📞';
      message = `${emoji} INBOUND ${inboundData.type.toUpperCase()}: ${inboundData.name}`;
      if (inboundData.message) {
        message += `\n> ${truncate(inboundData.message, 100)}`;
      }
      message += `\n<${getContactUrl(inboundData.contactId)}|View Contact>`;
      break;

    case 'stage_paid':
      const paidData = data as StagePaidData;
      emoji = '💰';
      message = `${emoji} PAID: ${paidData.name} — $${paidData.amount.toLocaleString()} — ${paidData.vehicle}\n<${getContactUrl(paidData.contactId)}|View Contact>`;
      break;

    case 'followup_overdue':
      const overdueData = data as FollowupOverdueData;
      emoji = '⚠️';
      message = `${emoji} FOLLOW-UP OVERDUE: ${overdueData.name}\n"${overdueData.title}" — ${overdueData.hoursOverdue}h overdue\n<${getContactUrl(overdueData.contactId)}|View Contact>`;
      break;

    case 'daily_digest':
      const digest = data as DailyDigestData;
      emoji = '📊';
      message = `${emoji} DAILY DIGEST — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}\n\n` +
        `• 🆕 New Leads: ${digest.newLeads}\n` +
        `• 🔥 Hot Leads: ${digest.hotLeads}\n` +
        `• 🎯 In Pipeline: ${digest.inPipeline}\n` +
        `• ✅ Closed Today: ${digest.closedToday}\n` +
        `• ⚠️ Overdue Follow-ups: ${digest.overdueFollowups}\n` +
        `• 💰 Revenue: $${digest.totalRevenue.toLocaleString()}`;
      break;

    default:
      console.error('[Slack] Unknown alert type:', type);
      return;
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
        username: 'Delivrd CRM',
        icon_emoji: ':rocket:',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Slack] Failed to send alert:', response.status, error);
      throw new Error(`Slack webhook failed: ${response.status}`);
    }

    console.log('[Slack] Alert sent:', type);
  } catch (error: any) {
    console.error('[Slack] Error sending alert:', error);
    throw error;
  }
}

/**
 * Helper: Get contact URL (adjust domain as needed)
 */
function getContactUrl(contactId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/contacts?id=${contactId}`;
}

/**
 * Helper: Truncate text
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Send batch Slack notification (for daily digest)
 */
export async function sendDailyDigest(): Promise<void> {
  // This will be called by cron job
  // For now, just a placeholder that calculates stats and sends
  
  const { supabase } = await import('@/lib/supabase');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get stats for today
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, stage, lead_score, created_at')
    .is('deleted_at', null);
  
  const { data: followups } = await supabase
    .from('follow_ups')
    .select('id, status, due_date')
    .eq('status', 'overdue');
  
  const todayIso = today.toISOString();
  
  const stats: DailyDigestData = {
    newLeads: contacts?.filter(c => c.created_at >= todayIso).length || 0,
    hotLeads: contacts?.filter(c => c.lead_score > 70).length || 0,
    inPipeline: contacts?.filter(c => !['closed-won', 'closed-lost', 'nurture'].includes(c.stage)).length || 0,
    closedToday: contacts?.filter(c => c.stage === 'closed-won' && c.created_at >= todayIso).length || 0,
    overdueFollowups: followups?.length || 0,
    totalRevenue: 0, // TODO: Calculate from deals table when implemented
  };
  
  await sendSlackAlert('daily_digest', stats);
}
