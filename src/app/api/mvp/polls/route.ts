import { createClient } from '@/lib/supabase-client'
import { NextRequest, NextResponse } from 'next/server'

interface CreatePollRequest {
  question: string
  options: [string, string, string, string]
}

export async function POST(req: NextRequest) {
  try {
    const body: CreatePollRequest = await req.json()

    // Validation
    if (!body.question || !body.options || body.options.length !== 4) {
      return NextResponse.json(
        { error: 'Question and 4 options are required' },
        { status: 400 }
      )
    }

    if (body.options.some((opt) => !opt || opt.trim().length === 0)) {
      return NextResponse.json(
        { error: 'All options must be non-empty' },
        { status: 400 }
      )
    }

    // Get user ID from auth header (or device ID)
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

    // Create poll
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { data: poll, error: pollErr } = await supabase
      .from('polls')
      .insert({
        campus_id: campusId,
        creator_user_id: user.id,
        question: body.question,
        options: body.options,
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (pollErr) {
      return NextResponse.json(
        { error: 'Failed to create poll' },
        { status: 500 }
      )
    }

    return NextResponse.json(poll, { status: 201 })
  } catch (error) {
    console.error('Create poll error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const campusId = req.nextUrl.searchParams.get('campus_id')

    if (!campusId) {
      return NextResponse.json(
        { error: 'Campus ID required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get active polls
    const { data: polls, error } = await supabase
      .from('polls')
      .select('*')
      .eq('campus_id', campusId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch polls' },
        { status: 500 }
      )
    }

    return NextResponse.json(polls)
  } catch (error) {
    console.error('Get polls error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
