'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CameraCapture } from '@/components/camera-capture'
import { uploadMoment } from '@/lib/services/moments-service'
import { useDeviceId } from '@/lib/hooks/use-device-id'
import { useCampusStore } from '@/lib/store/campus-store'

export default function CreateMomentPage() {
  const router = useRouter()
  const { deviceId } = useDeviceId()
  const { campusId } = useCampusStore()
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!deviceId || !campusId) {
      router.push('/mvp/campus')
    }
  }, [deviceId, campusId, router])

  const handleVideoCapture = (video: Blob) => {
    setRecordedVideo(video)
  }

  const handleUpload = async () => {
    if (!recordedVideo || !deviceId || !campusId) {
      setError('Missing required data')
      return
    }

    try {
      setUploading(true)
      setError(null)
      await uploadMoment(recordedVideo, caption, deviceId, campusId)
      // Redirect back to feed after successful upload
      router.push('/mvp/feed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload moment')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setRecordedVideo(null)
    setCaption('')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-ink-black text-pure-snow">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-ink-black/80 backdrop-blur border-b border-slate-shadow/20 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-semibold">Create Moment</h1>
          <p className="text-xs text-slate-shadow/60">Record and share a 15-second moment</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {!recordedVideo ? (
          // Camera Capture Phase
          <div className="space-y-4">
            <CameraCapture onVideoCapture={handleVideoCapture} />
          </div>
        ) : (
          // Upload Phase
          <div className="space-y-4">
            {/* Video Preview */}
            <div className="rounded-card overflow-hidden bg-slate-shadow">
              <video
                src={URL.createObjectURL(recordedVideo)}
                controls
                className="w-full aspect-square object-cover"
              />
            </div>

            {/* Caption Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-pure-snow">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption to your moment..."
                className="w-full bg-slate-shadow border border-slate-shadow/50 rounded-card px-3 py-2 text-sm text-pure-snow placeholder-slate-shadow/50 focus:outline-none focus:border-neon-mint resize-none"
                rows={3}
                maxLength={280}
              />
              <p className="text-xs text-slate-shadow/60">{caption.length}/280</p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-danger-red/20 border border-danger-red rounded-card px-3 py-2 text-xs text-danger-red">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={uploading}
                className="flex-1 bg-slate-shadow hover:bg-slate-shadow/80 border border-slate-shadow/50 rounded-card px-4 py-3 text-sm font-medium text-pure-snow transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? '⏳' : '↩️'} Re-record
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 bg-neon-mint hover:bg-neon-mint/90 rounded-card px-4 py-3 text-sm font-medium text-ink-black transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? '⏳ Uploading...' : '🚀 Share Moment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
