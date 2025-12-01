import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AnalyticsQuery, AnalyticsReport } from '@/types/analytics';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const query: AnalyticsQuery = await request.json();

    // Validate query parameters
    if (!query.startDate || !query.endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Build the base query
    let eventsQuery = supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', query.startDate)
      .lte('timestamp', query.endDate);

    // Apply filters
    if (query.campusId) {
      eventsQuery = eventsQuery.eq('campus_id', query.campusId);
    }
    if (query.userId) {
      eventsQuery = eventsQuery.eq('user_id', query.userId);
    }
    if (query.eventCategory) {
      eventsQuery = eventsQuery.eq('category', query.eventCategory);
    }
    if (query.eventName) {
      eventsQuery = eventsQuery.eq('event_name', query.eventName);
    }

    const { data: events, error } = await eventsQuery;

    if (error) {
      console.error('Error fetching analytics events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics events' },
        { status: 500 }
      );
    }

    // Process events into report format
    const report = processEventsIntoReport(events || [], query);

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Analytics report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function processEventsIntoReport(
  events: any[],
  query: AnalyticsQuery
): AnalyticsReport {
  // Calculate summary metrics
  const totalEvents = events.length;
  const uniqueUsers = new Set(events.map((e) => e.user_id).filter(Boolean)).size;
  const uniqueSessions = new Set(events.map((e) => e.session_id).filter(Boolean)).size;

  // Calculate engagement rate (events per user)
  const avgEngagementRate = uniqueUsers > 0 ? (totalEvents / uniqueUsers) * 100 : 0;

  // Group events by date for trends
  const eventsByDate = new Map<string, any[]>();
  events.forEach((event) => {
    const date = new Date(event.timestamp).toISOString().split('T')[0];
    if (!eventsByDate.has(date)) {
      eventsByDate.set(date, []);
    }
    eventsByDate.get(date)!.push(event);
  });

  // Create trends data
  const trends = Array.from(eventsByDate.entries())
    .map(([date, dateEvents]) => ({
      timestamp: date,
      metrics: {
        events: dateEvents.length,
        users: new Set(dateEvents.map((e) => e.user_id).filter(Boolean)).size,
        sessions: new Set(dateEvents.map((e) => e.session_id).filter(Boolean)).size,
      },
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  // Create category breakdown
  const byCategory: Record<string, number> = {};
  events.forEach((event) => {
    const category = event.category || 'unknown';
    byCategory[category] = (byCategory[category] || 0) + 1;
  });

  // Create campus breakdown
  const byCampus: Record<string, number> = {};
  events.forEach((event) => {
    if (event.campus_id) {
      byCampus[event.campus_id] = (byCampus[event.campus_id] || 0) + 1;
    }
  });

  // Create feature breakdown
  const byFeature: Record<string, number> = {};
  events.forEach((event) => {
    const featureName = event.properties?.featureName as string | undefined;
    if (featureName) {
      byFeature[featureName] = (byFeature[featureName] || 0) + 1;
    }
  });

  // Generate insights
  const insights: string[] = [];

  // Most active category
  const topCategory = Object.entries(byCategory).sort(
    ([, a], [, b]) => b - a
  )[0];
  if (topCategory) {
    insights.push(
      `${topCategory[0]} is your most active category with ${topCategory[1]} events (${((topCategory[1] / totalEvents) * 100).toFixed(1)}%)`
    );
  }

  // User engagement insight
  if (uniqueUsers > 0) {
    const eventsPerUser = (totalEvents / uniqueUsers).toFixed(1);
    insights.push(
      `Average of ${eventsPerUser} events per user during this period`
    );
  }

  // Growth trend
  if (trends.length >= 2) {
    const firstHalf = trends.slice(0, Math.floor(trends.length / 2));
    const secondHalf = trends.slice(Math.floor(trends.length / 2));
    const firstHalfAvg =
      firstHalf.reduce((sum, t) => sum + t.metrics.events, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, t) => sum + t.metrics.events, 0) /
      secondHalf.length;
    const growth = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    if (Math.abs(growth) > 5) {
      insights.push(
        `Activity ${growth > 0 ? 'increased' : 'decreased'} by ${Math.abs(growth).toFixed(1)}% in the second half of this period`
      );
    }
  }

  return {
    summary: {
      totalEvents,
      totalUsers: uniqueUsers,
      totalSessions: uniqueSessions,
      avgEngagementRate,
    },
    trends,
    breakdowns: {
      byCategory,
      byCampus,
      byFeature,
    },
    insights,
    generatedAt: new Date().toISOString(),
  };
}
