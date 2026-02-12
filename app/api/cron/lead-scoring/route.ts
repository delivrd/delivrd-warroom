// GET /api/cron/lead-scoring - Recalculate all lead scores (runs daily at 2 AM)
import { NextRequest, NextResponse } from 'next/server';
import { recalculateAllLeadScores } from '@/lib/api/crm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Lead Scoring Cron] Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Lead Scoring Cron] Starting daily recalculation...');

    const result = await recalculateAllLeadScores();

    console.log('[Lead Scoring Cron] Complete:', result);

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error: any) {
    console.error('[Lead Scoring Cron] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
