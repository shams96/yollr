import { createClient } from '@/lib/supabase-client'
import { NextRequest, NextResponse } from 'next/server'

interface VoteRequest {
  poll_id: string
  option_index: number
}

export async function POST(req: NextRequest) {
  try {
    const body: VoteRequest = await req.json()

    // Validation
    if (!body.poll_id || body.option_index === undefined) {
      return NextResponse.json(
        { error: 'Poll ID and option index required' },
        { status: 400 }
      )
    }

    if (body.option_index < 0 || body.option_index > 3) {
      return NextResponse.json(
        { error: 'Option index must be 0-3' },
        { status: 400 }
      )
    }

    // Get user ID from auth header
    const deviceId = req.headers.get('x-device-id')
    const campusId = req.headers.get('x-campus-id')

    if (!deviceId || !campusId) {
      return NextResponse.json(
        { error: 'Device ID and campus ID required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

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

    // Check if poll exists and is active
    const { data: poll, error: pollErr } = await supabase
      .from('polls')
      .select('*')
      .eq('id', body.poll_id)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (pollErr || !poll) {
      return NextResponse.json(
        { error: 'Poll not found or expired' },
        { status: 404 }
      )
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', body.poll_id)
      .eq('user_id', user.id)
      .single()

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted on this poll' },
        { status: 409 }
      )
    }

    // Insert vote
    const { data: vote, error: voteErr } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: body.poll_id,
        user_id: user.id,
        option_index: body.option_index,
      })
      .select()
      .single()

    if (voteErr) {
      return NextResponse.json(
        { error: 'Failed to record vote' },
        { status: 500 }
      )
    }

    // Award points
    await supabase.from('points').insert({
      user_id: user.id,
      campus_id: campusId,
      action: 'poll_vote',
      points_earned: 5,
      week_of: new Date(Date.now() - (Date.now() % (7 * 24 * 60 * 60 * 1000)))
        .toISOString()
        .split('T')[0],
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
