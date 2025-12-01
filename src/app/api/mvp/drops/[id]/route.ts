import { createClient } from '@/lib/supabase-client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dropId } = await params
    const campusId = req.headers.get('x-campus-id')
    const deviceId = req.headers.get('x-device-id')

    if (!dropId) {
      return NextResponse.json(
        { error: 'Drop ID required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get drop
    const { data: drop, error: dropErr } = await supabase
      .from('drops')
      .select('*')
      .eq('id', dropId)
      .eq('campus_id', campusId)
      .single()

    if (dropErr || !drop) {
      return NextResponse.json(
        { error: 'Drop not found' },
        { status: 404 }
      )
    }

    // Get submissions with vote counts
    const { data: submissions, error: submissionsErr } = await supabase
      .from('drop_submissions')
      .select(`
        *,
        drop_votes(count)
      `)
      .eq('drop_id', dropId)

    if (submissionsErr) {
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      )
    }

    // Get user's vote (if exists)
    let userVotedSubmission: string | null = null
    if (deviceId) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('device_id', deviceId)
        .single()

      if (user) {
        const { data: userVotes } = await supabase
          .from('drop_votes')
          .select('submission_id')
          .eq('drop_id', dropId)
          .eq('user_id', user.id)
          .limit(1)

        if (userVotes && userVotes.length > 0) {
          userVotedSubmission = userVotes[0].submission_id
        }
      }
    }

    return NextResponse.json({
      drop,
      submissions: submissions?.map((sub: any) => ({
        ...sub,
        vote_count: sub.drop_votes?.[0]?.count || 0,
        drop_votes: undefined,
      })) || [],
      user_voted_submission: userVotedSubmission,
    })
  } catch (error) {
    console.error('Get drop error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
