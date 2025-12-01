import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/heist/submit
 * Submit a heist idea (one per user per heist)
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
    const { heist_id, title, description, image_url } = body;

    // Validate required fields
    if (!heist_id || !title || !description) {
      return NextResponse.json(
        { error: 'heist_id, title, and description are required' },
        { status: 400 }
      );
    }

    // Check if heist exists and is in submission phase
    const { data: heist, error: heistError } = await supabase
      .from('heists')
      .select('*')
      .eq('id', heist_id)
      .eq('phase', 'submitting')
      .eq('is_active', true)
      .single();

    if (heistError || !heist) {
      return NextResponse.json(
        { error: 'Heist not found or not accepting submissions' },
        { status: 400 }
      );
    }

    // Check if submission window is open
    const now = new Date();
    const opensAt = new Date(heist.submission_opens_at);
    const closesAt = new Date(heist.submission_closes_at);

    if (now < opensAt || now > closesAt) {
      return NextResponse.json(
        { error: 'Submission window is closed' },
        { status: 400 }
      );
    }

    // Check if user already submitted
    const { data: existingSubmission } = await supabase
      .from('heist_submissions')
      .select('id')
      .eq('heist_id', heist_id)
      .eq('user_id', user.id)
      .single();

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted to this heist' },
        { status: 400 }
      );
    }

    // Create submission
    const { data: submission, error: submissionError } = await supabase
      .from('heist_submissions')
      .insert({
        heist_id,
        user_id: user.id,
        title,
        description,
        image_url: image_url || null,
      })
      .select(`
        *,
        user:profiles(
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (submissionError) {
      throw submissionError;
    }

    // Award XP to user for submission
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_xp')
      .eq('id', user.id)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ total_xp: (profile.total_xp || 0) + 50 })
        .eq('id', user.id);
    }

    return NextResponse.json({
      submission,
      message: 'Heist submitted successfully! +50 XP',
    });
  } catch (error) {
    console.error('Error submitting heist:', error);
    return NextResponse.json(
      { error: 'Failed to submit heist' },
      { status: 500 }
    );
  }
}
