'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CameraCapture } from '@/components/camera-capture'
import { submitEntry, getDrop } from '@/lib/services/drop-service'
import { useDeviceId } from '@/lib/hooks/use-device-id'
import { useCampusStore } from '@/lib/store/campus-store'

function DropSubmitContent() {
  const params = useParams()
  const router = useRouter()
  const { deviceId } = useDeviceId()
  const { campusId } = useCampusStore()
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dropTitle, setDropTitle] = useState('')

  const dropId = typeof params.id === 'string' ? params.id : params.id?.[0]

  useEffect(() => {
    if (!deviceId || !campusId || !dropId) {
      router.push('/mvp/campus')
      return
    }

    // Fetch drop title
    const fetchDrop = async () => {
      try {
        const drop = await getDrop(dropId, campusId, deviceId)
        setDropTitle(drop.title)
      } catch (err) {
        console.error('Failed to fetch drop:', err)
      }
    }

    fetchDrop()
  }, [deviceId, campusId, dropId, router])

  const handleVideoCapture = (video: Blob) => {
    setRecordedVideo(video)
  }

  const handleSubmit = async () => {
    if (!recordedVideo || !description || !deviceId || !campusId || !dropId) {
      setError('Missing required data')
      return
    }

    try {
      setUploading(true)
      setError(null)
      await submitEntry(dropId, recordedVideo, description, deviceId, campusId)
      // Redirect back to drop details after successful submission
      router.push(`/mvp/drops/${dropId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit entry')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setRecordedVideo(null)
    setDescription('')
    setError(null)
  }

  if (!dropId) {
    return (
      <div className="min-h-screen bg-ink-black text-pure-snow flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-black text-pure-snow">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-ink-black/80 backdrop-blur border-b border-slate-shadow/20 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-semibold">Submit Entry</h1>
          {dropTitle && <p className="text-xs text-slate-shadow/60">{dropTitle}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {!recordedVideo ? (
          // Camera Capture Phase
          <div className="space-y-4">
            <p className="text-sm text-slate-shadow/80">Record your entry (15 seconds max)</p>
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

            {/* Description Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-pure-snow">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain your entry, share your thoughts, or tell the story..."
                className="w-full bg-slate-shadow border border-slate-shadow/50 rounded-card px-3 py-2 text-sm text-pure-snow placeholder-slate-shadow/50 focus:outline-none focus:border-neon-mint resize-none"
                rows={4}
                maxLength={280}
              />
              <p className="text-xs text-slate-shadow/60">{description.length}/280</p>
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
                onClick={handleSubmit}
                disabled={uploading}
                className="flex-1 bg-neon-mint hover:bg-neon-mint/90 rounded-card px-4 py-3 text-sm font-medium text-ink-black transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? '⏳ Uploading...' : '🚀 Submit Entry'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DropSubmitPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ink-black text-pure-snow flex items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <DropSubmitContent />
    </Suspense>
  )
}
