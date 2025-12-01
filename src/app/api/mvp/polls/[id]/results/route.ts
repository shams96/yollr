import { createClient } from '@/lib/supabase-client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params
    const deviceId = req.headers.get('x-device-id')

    if (!pollId) {
      return NextResponse.json(
        { error: 'Poll ID required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get poll
    const { data: poll, error: pollErr } = await supabase
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .single()

    if (pollErr || !poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }

    // Get vote counts per option
    const { data: votes, error: votesErr } = await supabase
      .from('poll_votes')
      .select('option_index')
      .eq('poll_id', pollId)

    if (votesErr) {
      return NextResponse.json(
        { error: 'Failed to fetch results' },
        { status: 500 }
      )
    }

    // Count votes per option
    const voteCounts = [0, 0, 0, 0]
    votes?.forEach((vote) => {
      voteCounts[vote.option_index]++
    })

    const totalVotes = votes?.length || 0

    // Check if user voted
    let userVote: number | null = null
    if (deviceId) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('device_id', deviceId)
        .single()

      if (user) {
        const { data: userVoteData } = await supabase
          .from('poll_votes')
          .select('option_index')
          .eq('poll_id', pollId)
          .eq('user_id', user.id)
          .single()

        if (userVoteData) {
          userVote = userVoteData.option_index
        }
      }
    }

    return NextResponse.json({
      poll,
      results: {
        option_0: { votes: voteCounts[0], percentage: totalVotes > 0 ? Math.round((voteCounts[0] / totalVotes) * 100) : 0 },
        option_1: { votes: voteCounts[1], percentage: totalVotes > 0 ? Math.round((voteCounts[1] / totalVotes) * 100) : 0 },
        option_2: { votes: voteCounts[2], percentage: totalVotes > 0 ? Math.round((voteCounts[2] / totalVotes) * 100) : 0 },
        option_3: { votes: voteCounts[3], percentage: totalVotes > 0 ? Math.round((voteCounts[3] / totalVotes) * 100) : 0 },
        total_votes: totalVotes,
      },
      user_vote: userVote,
      is_active: poll.expires_at > new Date().toISOString(),
    })
  } catch (error) {
    console.error('Get results error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
