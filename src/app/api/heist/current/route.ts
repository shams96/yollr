import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/heist/current
 * Get the current active heist for a campus
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get('campusId');

    if (!campusId) {
      return NextResponse.json(
        { error: 'campusId is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Get current active heist for campus
    const { data: heist, error: heistError } = await supabase
      .from('heists')
      .select(`
        *,
        winner_submission:heist_submissions!winner_submission_id(
          id,
          title,
          description,
          image_url,
          vote_count,
          ranking_score,
          user:profiles(
            id,
            username,
            display_name,
            avatar_url
          )
        )
      `)
      .eq('campus_id', campusId)
      .eq('is_active', true)
      .single();

    if (heistError) {
      if (heistError.code === 'PGRST116') {
        // No active heist found
        return NextResponse.json(
          { heist: null, message: 'No active heist found' },
          { status: 200 }
        );
      }
      throw heistError;
    }

    // Get submission count
    const { count: submissionCount } = await supabase
      .from('heist_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('heist_id', heist.id)
      .eq('is_active', true);

    // Get vote count
    const { count: voteCount } = await supabase
      .from('heist_votes')
      .select('*', { count: 'exact', head: true })
      .eq('heist_id', heist.id);

    // Get current user's submission if exists
    const { data: { user } } = await supabase.auth.getUser();
    let userSubmission = null;

    if (user) {
      const { data: submission } = await supabase
        .from('heist_submissions')
        .select('*')
        .eq('heist_id', heist.id)
        .eq('user_id', user.id)
        .single();

      userSubmission = submission;
    }

    // Get current user's vote if exists
    let userVote = null;
    if (user) {
      const { data: vote } = await supabase
        .from('heist_votes')
        .select('*, submission:heist_submissions(*)')
        .eq('heist_id', heist.id)
        .eq('user_id', user.id)
        .single();

      userVote = vote;
    }

    return NextResponse.json({
      heist: {
        ...heist,
        submission_count: submissionCount || 0,
        vote_count: voteCount || 0,
      },
      user_submission: userSubmission,
      user_vote: userVote,
    });
  } catch (error) {
    console.error('Error fetching current heist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current heist' },
      { status: 500 }
    );
  }
}
