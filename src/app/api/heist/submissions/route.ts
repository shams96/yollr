import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/heist/submissions
 * Get all submissions for a heist, ordered by ranking_score
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const heistId = searchParams.get('heistId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!heistId) {
      return NextResponse.json(
        { error: 'heistId is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Get submissions ordered by ranking score
    const { data: submissions, error: submissionsError, count } = await supabase
      .from('heist_submissions')
      .select(`
        *,
        user:profiles(
          id,
          username,
          display_name,
          avatar_url,
          total_xp,
          sport_type
        )
      `, { count: 'exact' })
      .eq('heist_id', heistId)
      .eq('is_active', true)
      .order('ranking_score', { ascending: false })
      .order('vote_count', { ascending: false })
      .order('created_at', { ascending: true }) // Earlier submissions break ties
      .range(offset, offset + limit - 1);

    if (submissionsError) {
      throw submissionsError;
    }

    // Get current user's vote if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    let userVote = null;

    if (user) {
      const { data: vote } = await supabase
        .from('heist_votes')
        .select('submission_id')
        .eq('heist_id', heistId)
        .eq('user_id', user.id)
        .single();

      userVote = vote;
    }

    return NextResponse.json({
      submissions,
      user_voted_for: userVote?.submission_id || null,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching heist submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
