import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/heist/cycle
 * Cron job to automatically transition heist phases
 * This should be called hourly via Vercel Cron or Supabase Edge Functions
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret (optional security measure)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createServerClient();

    // Call the database function to transition phases
    // @ts-ignore - RPC function needs to be created in database
    const { error } = await supabase.rpc('transition_heist_phases');

    if (error) {
      console.error('RPC error:', error);
      return NextResponse.json({
        error: 'Database function not yet implemented. Please create the transition_heist_phases() function in Supabase.',
        timestamp: new Date().toISOString(),
      }, { status: 501 });
    }

    return NextResponse.json({
      message: 'Heist phases transitioned successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error transitioning heist phases:', error);
    return NextResponse.json(
      { error: 'Failed to transition heist phases' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/heist/cycle
 * Manual trigger for phase transitions (for testing)
 */
export async function GET() {
  return POST(new Request('http://localhost', { method: 'POST' }));
}
