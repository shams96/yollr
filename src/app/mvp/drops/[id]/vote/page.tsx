'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getDrop, voteOnSubmission } from '@/lib/services/drop-service'
import { useDeviceId } from '@/lib/hooks/use-device-id'
import { useCampusStore } from '@/lib/store/campus-store'
import type { DropSubmission } from '@/types/mvp'

function DropVoteContent() {
  const params = useParams()
  const router = useRouter()
  const { deviceId } = useDeviceId()
  const { campusId } = useCampusStore()
  const [submissions, setSubmissions] = useState<(DropSubmission & { vote_count: number })[]>([])
  const [userVoted, setUserVoted] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [voting, setVoting] = useState(false)
  const [dropTitle, setDropTitle] = useState('')

  const dropId = typeof params.id === 'string' ? params.id : params.id?.[0]

  useEffect(() => {
    if (!deviceId || !campusId || !dropId) {
      router.push('/mvp/campus')
      return
    }

    const fetchDropData = async () => {
      try {
        const data = await getDrop(dropId, campusId, deviceId)
        setDropTitle(data.title)
        setSubmissions(
          data.submissions?.map((sub: any) => ({
            ...sub,
            vote_count: sub.vote_count || 0,
          })) || []
        )
        if (data.user_voted_submission) {
          setUserVoted(new Set([data.user_voted_submission]))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load entries')
      } finally {
        setLoading(false)
      }
    }

    fetchDropData()
  }, [dropId, campusId, deviceId, router])

  const handleVote = async (submissionId: string) => {
    if (!dropId || userVoted.has(submissionId)) return

    try {
      setVoting(true)
      await voteOnSubmission(dropId, submissionId, deviceId!, campusId!)
      // Update local state
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === submissionId ? { ...sub, vote_count: sub.vote_count + 1 } : sub
        )
      )
      setUserVoted((prev) => new Set([...prev, submissionId]))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote')
    } finally {
      setVoting(false)
    }
  }

  if (!dropId) {
    return (
      <div className="min-h-screen bg-ink-black text-pure-snow flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-black text-pure-snow flex items-center justify-center">
        <p>Loading entries...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-black text-pure-snow">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-shadow/80 backdrop-blur border-b border-slate-shadow/50 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="text-xl hover:scale-110 transition">
            ←
          </button>
          <div className="flex-1 text-center">
            {dropTitle && <p className="text-sm font-medium">{dropTitle}</p>}
            <p className="text-xs text-slate-shadow/60">{submissions.length} entries</p>
          </div>
          <div className="w-6" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="bg-danger-red/20 border border-danger-red rounded-card px-3 py-2 text-xs text-danger-red">
            {error}
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-slate-shadow">No entries yet. Check back soon!</p>
          </div>
        ) : (
          submissions.map((submission) => (
            <div key={submission.id} className="bg-slate-shadow/40 border border-slate-shadow/50 rounded-card overflow-hidden">
              {/* Video */}
              <div className="aspect-video bg-black">
                <video
                  src={submission.video_url}
                  controls
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Video error:', e)
                  }}
                />
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Description */}
                {submission.text_description && (
                  <p className="text-sm text-pure-snow">{submission.text_description}</p>
                )}

                {/* Vote Count & Button */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-shadow/80">
                    👍 {submission.vote_count} {submission.vote_count === 1 ? 'vote' : 'votes'}
                  </div>
                  <button
                    onClick={() => handleVote(submission.id)}
                    disabled={voting || userVoted.has(submission.id)}
                    className={`px-3 py-1 rounded-card text-xs font-medium transition ${
                      userVoted.has(submission.id)
                        ? 'bg-success-green/40 text-success-green cursor-default'
                        : 'bg-neon-mint hover:bg-neon-mint/90 text-ink-black'
                    }`}
                  >
                    {userVoted.has(submission.id) ? '✓ Voted' : '👍 Vote'}
                  </button>
                </div>

                {/* Time */}
                <p className="text-xs text-slate-shadow/60">
                  {new Date(submission.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="w-full bg-slate-shadow hover:bg-slate-shadow/80 border border-slate-shadow/50 rounded-card px-4 py-3 text-sm font-medium text-pure-snow transition"
        >
          ← Back
        </button>
      </div>
    </div>
  )
}

export default function DropVotePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ink-black text-pure-snow flex items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <DropVoteContent />
    </Suspense>
  )
}
