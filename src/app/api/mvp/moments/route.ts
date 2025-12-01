import { createClient } from '@/lib/supabase-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const video = formData.get('video') as File
    const caption = formData.get('caption') as string || ''
    const deviceId = req.headers.get('x-device-id')
    const campusId = req.headers.get('x-campus-id')

    // Validation
    if (!video) {
      return NextResponse.json(
        { error: 'Video file required' },
        { status: 400 }
      )
    }

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

    // Validate file size (max 50MB for video)
    const MAX_SIZE = 50 * 1024 * 1024
    if (video.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Video file too large (max 50MB)' },
        { status: 413 }
      )
    }

    // Upload to Supabase Storage
    const fileExt = 'webm'
    const fileName = `${campusId}/${user.id}/${Date.now()}.${fileExt}`
    const bucket = 'moments'

    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(fileName, video, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadErr) {
      console.error('Upload error:', uploadErr)
      return NextResponse.json(
        { error: 'Failed to upload video' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    const videoUrl = urlData.publicUrl

    // Create moment record
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { data: moment, error: momentErr } = await supabase
      .from('moments')
      .insert({
        campus_id: campusId,
        creator_user_id: user.id,
        video_url: videoUrl,
        caption: caption || null,
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (momentErr) {
      console.error('Moment creation error:', momentErr)
      return NextResponse.json(
        { error: 'Failed to create moment' },
        { status: 500 }
      )
    }

    // Award points
    await supabase.from('points').insert({
      user_id: user.id,
      campus_id: campusId,
      action: 'moment_post',
      points_earned: 10,
      week_of: new Date(Date.now() - (Date.now() % (7 * 24 * 60 * 60 * 1000)))
        .toISOString()
        .split('T')[0],
    })

    return NextResponse.json(moment, { status: 201 })
  } catch (error) {
    console.error('Create moment error:', error)
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

    // Get active moments
    const { data: moments, error } = await supabase
      .from('moments')
      .select('*')
      .eq('campus_id', campusId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch moments' },
        { status: 500 }
      )
    }

    return NextResponse.json(moments)
  } catch (error) {
    console.error('Get moments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
