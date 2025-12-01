import { createClient } from '@/lib/supabase-client'
import { NextRequest, NextResponse } from 'next/server'
import type { Drop } from '@/types/mvp'

export async function POST(req: NextRequest) {
  try {
    const { title, guardrails, deviceId, campusId } = await req.json()

    if (!title || !guardrails || !Array.isArray(guardrails) || guardrails.length !== 5) {
      return NextResponse.json(
        { error: 'Title and 5 guardrails required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get user
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, campus_id')
      .eq('device_id', deviceId)
      .eq('campus_id', campusId)
      .single()

    if (userErr || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate phase dates (Mon start)
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)

    const submissionStart = new Date(monday)
    submissionStart.setDate(submissionStart.getDate() + 2) // Wednesday
    const submissionEnd = new Date(monday)
    submissionEnd.setDate(submissionEnd.getDate() + 4) // Friday

    const votingStart = new Date(monday)
    votingStart.setDate(votingStart.getDate() + 4) // Friday
    const votingEnd = new Date(monday)
    votingEnd.setDate(votingEnd.getDate() + 6) // Sunday

    // Create drop with status='planning'
    const { data: drop, error: dropErr } = await supabase
      .from('drops')
      .insert({
        campus_id: campusId,
        title,
        guardrails,
        submission_phase_start: submissionStart.toISOString(),
        submission_phase_end: submissionEnd.toISOString(),
        voting_phase_start: votingStart.toISOString(),
        voting_phase_end: votingEnd.toISOString(),
        status: 'planning',
        week_of: monday.toISOString().split('T')[0],
      })
      .select()
      .single()

    if (dropErr || !drop) {
      return NextResponse.json(
        { error: 'Failed to create drop' },
        { status: 500 }
      )
    }

    return NextResponse.json(drop, { status: 201 })
  } catch (error) {
    console.error('Create drop error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const campusId = req.headers.get('x-campus-id')

    if (!campusId) {
      return NextResponse.json(
        { error: 'Campus ID required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get active drops for campus
    const { data: drops, error: dropsErr } = await supabase
      .from('drops')
      .select('*')
      .eq('campus_id', campusId)
      .order('created_at', { ascending: false })

    if (dropsErr) {
      return NextResponse.json(
        { error: 'Failed to fetch drops' },
        { status: 500 }
      )
    }

    return NextResponse.json(drops || [])
  } catch (error) {
    console.error('Get drops error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
