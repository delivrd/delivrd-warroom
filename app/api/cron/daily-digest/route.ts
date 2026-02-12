// GET /api/cron/daily-digest - Send daily Slack digest (runs at 9 AM)
import { NextRequest, NextResponse } from 'next/server';
import { sendDailyDigest } from '@/lib/api/slack';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Daily Digest Cron] Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Daily Digest Cron] Sending daily digest...');

    await sendDailyDigest();

    console.log('[Daily Digest Cron] Sent successfully');

    return NextResponse.json({
      success: true,
      message: 'Daily digest sent',
    });

  } catch (error: any) {
    console.error('[Daily Digest Cron] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
