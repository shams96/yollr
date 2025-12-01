'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getDrop, getDropPhase } from '@/lib/services/drop-service'
import { useDeviceId } from '@/lib/hooks/use-device-id'
import { useCampusStore } from '@/lib/store/campus-store'
import type { Drop } from '@/types/mvp'

function DropDetailsContent() {
  const params = useParams()
  const router = useRouter()
  const { deviceId } = useDeviceId()
  const { campusId } = useCampusStore()
  const [drop, setDrop] = useState<Drop | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dropId = typeof params.id === 'string' ? params.id : params.id?.[0]

  useEffect(() => {
    if (!campusId || !dropId) return

    const fetchDrop = async () => {
      try {
        const data = await getDrop(dropId, campusId, deviceId)
        setDrop(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load challenge')
      } finally {
        setLoading(false)
      }
    }

    fetchDrop()
  }, [dropId, campusId, deviceId])

  if (!campusId || !dropId) {
    return (
      <div className="min-h-screen bg-ink-black text-pure-snow flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-black text-pure-snow flex items-center justify-center">
        <p>Loading challenge...</p>
      </div>
    )
  }

  if (error || !drop) {
    return (
      <div className="min-h-screen bg-ink-black text-pure-snow flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-danger-red mb-4">{error || 'Challenge not found'}</p>
          <button
            onClick={() => router.push('/mvp/feed')}
            className="bg-neon-mint hover:bg-neon-mint/90 rounded-card px-4 py-2 text-sm font-medium text-ink-black"
          >
            Back to Feed
          </button>
        </div>
      </div>
    )
  }

  const phase = getDropPhase(drop)
  const phaseEmojis: Record<string, string> = {
    planning: '📋',
    submission: '📹',
    voting: '🗳️',
    execution: '🏆',
    closed: '✅',
  }

  return (
    <div className="min-h-screen bg-ink-black text-pure-snow">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-shadow/80 backdrop-blur border-b border-slate-shadow/50 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-xl hover:scale-110 transition"
          >
            ←
          </button>
          <div className="flex-1 text-center">
            <p className="text-xs text-slate-shadow/60">
              {phaseEmojis[phase.phase]} {phase.phase.toUpperCase()}
            </p>
          </div>
          <button className="text-xl hover:scale-110 transition">⚙️</button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Challenge Title & Info */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-pure-snow">{drop.title}</h1>
          <p className="text-sm text-slate-shadow/80">
            Week of {new Date(drop.week_of).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <p className="text-sm font-medium text-neon-mint">{phase.timeRemaining}</p>
        </div>

        {/* Guardrails */}
        <div className="space-y-2 bg-slate-shadow/40 border border-slate-shadow/50 rounded-card p-4">
          <h2 className="text-sm font-semibold text-pure-snow">📋 Guardrails</h2>
          <ul className="space-y-1">
            {drop.guardrails.map((guardrail, index) => (
              <li key={index} className="text-xs text-slate-shadow/80 flex gap-2">
                <span>•</span>
                <span>{guardrail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Phase-specific Content */}
        {phase.phase === 'planning' && (
          <div className="bg-soft-lavender/20 border border-soft-lavender rounded-card p-4 text-center space-y-3">
            <p className="text-sm text-soft-lavender">Challenge coming soon!</p>
            <p className="text-xs text-soft-lavender/80">
              Submissions will open {phase.timeRemaining}
            </p>
          </div>
        )}

        {phase.phase === 'submission' && (
          <button
            onClick={() => router.push(`/mvp/drops/${dropId}/submit`)}
            className="w-full bg-neon-mint hover:bg-neon-mint/90 rounded-card px-4 py-3 text-sm font-medium text-ink-black transition"
          >
            📹 Submit Your Entry
          </button>
        )}

        {phase.phase === 'voting' && (
          <button
            onClick={() => router.push(`/mvp/drops/${dropId}/vote`)}
            className="w-full bg-sky-glow hover:bg-sky-glow/90 rounded-card px-4 py-3 text-sm font-medium text-ink-black transition"
          >
            🗳️ Vote on Entries
          </button>
        )}

        {phase.phase === 'execution' && drop.winner_submission_id && (
          <div className="bg-success-green/20 border border-success-green rounded-card p-4 space-y-2">
            <h2 className="text-sm font-semibold text-success-green">🏆 Winner Announced!</h2>
            <p className="text-xs text-success-green/80">Check back to see the winning submission</p>
          </div>
        )}

        {phase.phase === 'closed' && (
          <div className="bg-slate-shadow/40 border border-slate-shadow/50 rounded-card p-4 text-center">
            <p className="text-sm text-slate-shadow/80">This challenge has concluded</p>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.push('/mvp/feed')}
          className="w-full bg-slate-shadow hover:bg-slate-shadow/80 border border-slate-shadow/50 rounded-card px-4 py-3 text-sm font-medium text-pure-snow transition"
        >
          ← Back to Feed
        </button>
      </div>
    </div>
  )
}

export default function DropDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ink-black text-pure-snow flex items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <DropDetailsContent />
    </Suspense>
  )
}
