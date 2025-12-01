import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Trigger Yollr Bell for a campus
// This should be called via cron job at designated times (e.g., 12pm, 6pm daily)
export async function POST(request: NextRequest) {
  try {
    const { campusId, triggerTime } = await request.json();

    if (!campusId) {
      return NextResponse.json(
        { error: 'Campus ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Create a Bell event record
    const { data: bellEvent, error: bellError } = await supabase
      .from('bell_events')
      .insert({
        campus_id: campusId,
        triggered_at: triggerTime || new Date().toISOString(),
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
      })
      .select()
      .single();

    if (bellError) {
      console.error('Error creating Bell event:', bellError);
      return NextResponse.json(
        { error: 'Failed to create Bell event' },
        { status: 500 }
      );
    }

    // Get all users on this campus for push notifications
    const { data: members } = await supabase
      .from('campus_memberships')
      .select('user_id, users(id, fcm_token)')
      .eq('campus_id', campusId)
      .is('left_at', null);

    // Send push notifications to all campus members
    if (members && members.length > 0) {
      const tokens = members
        .map((m: any) => m.users?.fcm_token)
        .filter(Boolean);

      if (tokens.length > 0) {
        // TODO: Implement Firebase Cloud Messaging batch send
        console.log(`Would send Bell notification to ${tokens.length} users`);
        // This would integrate with Firebase Admin SDK in production
      }
    }

    return NextResponse.json({
      success: true,
      bellEvent,
      notificationsSent: members?.length || 0,
    });
  } catch (error) {
    console.error('Error triggering Yollr Bell:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Check if Bell is currently active for a campus
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get('campusId');

    if (!campusId) {
      return NextResponse.json(
        { error: 'Campus ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Check for active Bell event (within last 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const { data: activeBell } = await supabase
      .from('bell_events')
      .select('*')
      .eq('campus_id', campusId)
      .gte('triggered_at', twoHoursAgo)
      .lte('expires_at', new Date().toISOString())
      .order('triggered_at', { ascending: false })
      .limit(1)
      .single();

    if (!activeBell) {
      return NextResponse.json({
        active: false,
        message: 'No active Bell event',
      });
    }

    // Calculate time remaining
    const expiresAt = new Date(activeBell.expires_at).getTime();
    const now = Date.now();
    const secondsRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

    return NextResponse.json({
      active: true,
      bellEvent: activeBell,
      secondsRemaining,
    });
  } catch (error) {
    console.error('Error checking Bell status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
