import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { AnalyticsEvent } from '@/types/analytics';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const event: AnalyticsEvent = await request.json();

    // Validate required fields
    if (!event.eventName || !event.category) {
      return NextResponse.json(
        { error: 'Missing required fields: eventName and category' },
        { status: 400 }
      );
    }

    // Insert the event
    const { data, error } = await (supabase as any)
      .from('analytics_events')
      .insert({
        event_name: event.eventName,
        category: event.category,
        user_id: event.userId,
        campus_id: event.campusId,
        session_id: event.sessionId,
        properties: event.properties || {},
        timestamp: event.timestamp || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing analytics event:', error);
      return NextResponse.json(
        { error: 'Failed to store analytics event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in analytics events API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    
    // Build query based on parameters
    let query = (supabase as any)
      .from('analytics_events')
      .select('*');

    // Apply filters
    const userId = searchParams.get('userId');
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const campusId = searchParams.get('campusId');
    if (campusId) {
      query = query.eq('campus_id', campusId);
    }

    const category = searchParams.get('category');
    if (category) {
      query = query.eq('category', category);
    }

    const eventName = searchParams.get('eventName');
    if (eventName) {
      query = query.eq('event_name', eventName);
    }

    const startDate = searchParams.get('startDate');
    if (startDate) {
      query = query.gte('timestamp', startDate);
    }

    const endDate = searchParams.get('endDate');
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const limit = parseInt(searchParams.get('limit') || '100');
    query = query.order('timestamp', { ascending: false }).limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching analytics events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics events' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in analytics events API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}