import { createClient } from '@/lib/supabase-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dropId } = await params
    const formData = await req.formData()
    const video = formData.get('video') as File
    const description = formData.get('description') as string
    const deviceId = req.headers.get('x-device-id')
    const campusId = req.headers.get('x-campus-id')

    if (!video || !description || !deviceId || !campusId) {
      return NextResponse.json(
        { error: 'Video, description, deviceId, and campusId required' },
        { status: 400 }
      )
    }

    if (video.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Video must be under 50MB' },
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

    // Check if in submission phase
    const now = new Date()
    const submissionStart = new Date(drop.submission_phase_start)
    const submissionEnd = new Date(drop.submission_phase_end)

    if (now < submissionStart || now > submissionEnd) {
      return NextResponse.json(
        { error: 'Not in submission phase' },
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

    // Upload video to storage
    const filename = `${campusId}/${user.id}/${Date.now()}-${video.name}`
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('drops')
      .upload(filename, video, {
        contentType: video.type,
      })

    if (uploadErr) {
      return NextResponse.json(
        { error: 'Failed to upload video' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('drops').getPublicUrl(filename)

    // Create submission
    const { data: submission, error: submissionErr } = await supabase
      .from('drop_submissions')
      .insert({
        drop_id: dropId,
        user_id: user.id,
        video_url: urlData.publicUrl,
        text_description: description,
      })
      .select()
      .single()

    if (submissionErr) {
      return NextResponse.json(
        { error: 'Failed to create submission' },
        { status: 500 }
      )
    }

    // Award points
    await supabase.from('points').insert({
      user_id: user.id,
      campus_id: campusId,
      action: 'drop_submit',
      points_earned: 50,
      week_of: new Date().toISOString().split('T')[0],
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Submit entry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
