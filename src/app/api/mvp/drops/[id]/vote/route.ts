import { createClient } from '@/lib/supabase-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dropId } = await params
    const { submissionId } = await req.json()
    const deviceId = req.headers.get('x-device-id')
    const campusId = req.headers.get('x-campus-id')

    if (!submissionId || !deviceId || !campusId) {
      return NextResponse.json(
        { error: 'Submission ID, deviceId, and campusId required' },
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

    // Check if in voting phase
    const now = new Date()
    const votingStart = new Date(drop.voting_phase_start)
    const votingEnd = new Date(drop.voting_phase_end)

    if (now < votingStart || now > votingEnd) {
      return NextResponse.json(
        { error: 'Not in voting phase' },
        { status: 400 }
      )
    }

    // Get user
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id')
      .eq('device_id', deviceId)
      .eq('campus_id', campusId)
      .single()

    if (userErr || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create vote (will fail with 409 if duplicate)
    const { data: vote, error: voteErr } = await supabase
      .from('drop_votes')
      .insert({
        drop_id: dropId,
        submission_id: submissionId,
        user_id: user.id,
      })
      .select()
      .single()

    if (voteErr) {
      if (voteErr.code === '23505') {
        // Unique constraint violation
        return NextResponse.json(
          { error: 'Already voted on this submission' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to cast vote' },
        { status: 500 }
      )
    }

    // Award points
    await supabase.from('points').insert({
      user_id: user.id,
      campus_id: campusId,
      action: 'drop_vote_received',
      points_earned: 5,
      week_of: new Date().toISOString().split('T')[0],
    })

    return NextResponse.json(vote, { status: 201 })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
