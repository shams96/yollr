import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/heist/vote
 * Vote on a heist submission (one vote per user per heist)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { heist_id, submission_id, reaction_type = 'fire' } = body;

    // Validate required fields
    if (!heist_id || !submission_id) {
      return NextResponse.json(
        { error: 'heist_id and submission_id are required' },
        { status: 400 }
      );
    }

    // Check if heist exists and is in voting phase
    const { data: heist, error: heistError } = await supabase
      .from('heists')
      .select('*')
      .eq('id', heist_id)
      .eq('phase', 'voting')
      .eq('is_active', true)
      .single();

    if (heistError || !heist) {
      return NextResponse.json(
        { error: 'Heist not found or not accepting votes' },
        { status: 400 }
      );
    }

    // Check if voting window is open
    const now = new Date();
    const opensAt = new Date(heist.voting_opens_at);
    const closesAt = new Date(heist.voting_closes_at);

    if (now < opensAt || now > closesAt) {
      return NextResponse.json(
        { error: 'Voting window is closed' },
        { status: 400 }
      );
    }

    // Check if submission exists
    const { data: submission, error: submissionError } = await supabase
      .from('heist_submissions')
      .select('*')
      .eq('id', submission_id)
      .eq('heist_id', heist_id)
      .eq('is_active', true)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check if user is voting for their own submission
    if (submission.user_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot vote for your own submission' },
        { status: 400 }
      );
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('heist_votes')
      .select('id')
      .eq('heist_id', heist_id)
      .eq('user_id', user.id)
      .single();

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted on this heist' },
        { status: 400 }
      );
    }

    // Calculate momentum score (recent votes have higher weight)
    const momentumScore = 1.0; // Will be calculated by trigger

    // Create vote
    const { data: vote, error: voteError } = await supabase
      .from('heist_votes')
      .insert({
        heist_id,
        submission_id,
        user_id: user.id,
        reaction_type,
        momentum_score: momentumScore,
        points_awarded: reaction_type === 'fire' ? 2 : reaction_type === 'heart' ? 1.5 : 1,
      })
      .select(`
        *,
        submission:heist_submissions(
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
      .single();

    if (voteError) {
      throw voteError;
    }

    // The trigger will automatically update submission rankings

    // Award XP to user for voting
    const { data: voterProfile } = await supabase
      .from('profiles')
      .select('total_xp')
      .eq('id', user.id)
      .single();

    if (voterProfile) {
      await supabase
        .from('profiles')
        .update({ total_xp: (voterProfile.total_xp || 0) + 10 })
        .eq('id', user.id);
    }

    // Award XP to submission author for receiving vote
    const xpReward = reaction_type === 'fire' ? 20 : reaction_type === 'heart' ? 15 : 10;
    const { data: authorProfile } = await supabase
      .from('profiles')
      .select('total_xp')
      .eq('id', submission.user_id)
      .single();

    if (authorProfile) {
      await supabase
        .from('profiles')
        .update({ total_xp: (authorProfile.total_xp || 0) + xpReward })
        .eq('id', submission.user_id);
    }

    return NextResponse.json({
      vote,
      message: `Vote recorded! +10 XP`,
    });
  } catch (error) {
    console.error('Error voting on heist:', error);
    return NextResponse.json(
      { error: 'Failed to vote on heist' },
      { status: 500 }
      );
  }
}
