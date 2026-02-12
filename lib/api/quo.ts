// Quo/OpenPhone API Client
// API Documentation: https://www.openphone.com/docs/api

const QUO_API_KEY = process.env.QUO_API_KEY;
const QUO_API_BASE = 'https://api.openphone.com/v1';
const QUO_OUTBOUND_NUMBER = process.env.QUO_OUTBOUND_NUMBER || '+19804462514';

export interface QuoSendSMSParams {
  to: string; // E.164 format: +1XXXXXXXXXX
  content: string;
  from?: string; // Defaults to QUO_OUTBOUND_NUMBER
}

export interface QuoSendSMSResponse {
  id: string;
  object: 'message';
  createdAt: string;
  from: string;
  to: string[];
  direction: 'outgoing';
  status: string;
  content: string;
}

export interface QuoInboundWebhook {
  id: string;
  object: 'message';
  createdAt: string;
  from: string;
  to: string[];
  direction: 'incoming';
  status: string;
  content: string;
  phoneNumberId?: string;
  userId?: string;
}

/**
 * Send SMS via Quo/OpenPhone API
 */
export async function sendSMS(params: QuoSendSMSParams): Promise<QuoSendSMSResponse> {
  if (!QUO_API_KEY) {
    throw new Error('QUO_API_KEY not configured');
  }

  const { to, content, from = QUO_OUTBOUND_NUMBER } = params;

  // Validate phone format
  if (!to.startsWith('+1') || to.length !== 12) {
    throw new Error(`Invalid phone format: ${to}. Must be E.164 format (+1XXXXXXXXXX)`);
  }

  const response = await fetch(`${QUO_API_BASE}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': QUO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      to: [to],
      from,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Quo API Error]', response.status, error);
    throw new Error(`Quo API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  console.log('[Quo SMS Sent]', { to, messageId: data.id });
  return data as QuoSendSMSResponse;
}

/**
 * Format phone number to E.164
 */
export function formatPhoneE164(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If 10 digits, add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If 11 digits starting with 1, add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // Already formatted or invalid
  return digits.startsWith('+') ? phone : `+${digits}`;
}

/**
 * Validate Quo webhook signature (if provided)
 * Note: OpenPhone webhook security depends on their implementation
 */
export function validateQuoWebhook(payload: any): boolean {
  // Basic validation - check required fields
  if (!payload.id || !payload.from || !payload.to || !payload.content) {
    return false;
  }
  
  // Check it's actually a message object
  if (payload.object !== 'message') {
    return false;
  }
  
  return true;
}

/**
 * Extract phone number from Quo webhook
 */
export function extractPhoneFromWebhook(webhook: QuoInboundWebhook): string {
  return formatPhoneE164(webhook.from);
}
