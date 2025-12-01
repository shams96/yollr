'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createDrop } from '@/lib/services/drop-service'
import { useDeviceId } from '@/lib/hooks/use-device-id'
import { useCampusStore } from '@/lib/store/campus-store'

const DEFAULT_GUARDRAILS = [
  'Keep it safe and respectful',
  'No harmful or illegal content',
  'Include clear instructions',
  'Respect privacy of others',
  'Have fun and be creative',
]

export default function CreateDropPage() {
  const router = useRouter()
  const { deviceId } = useDeviceId()
  const { campusId } = useCampusStore()
  const [title, setTitle] = useState('')
  const [guardrails, setGuardrails] = useState<string[]>(DEFAULT_GUARDRAILS)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!deviceId || !campusId) {
      router.push('/mvp/campus')
    }
  }, [deviceId, campusId, router])

  const handleGuardrailChange = (index: number, value: string) => {
    const newGuardrails = [...guardrails]
    newGuardrails[index] = value
    setGuardrails(newGuardrails)
  }

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Challenge title required')
      return
    }

    if (guardrails.some((g) => !g.trim())) {
      setError('All 5 guardrails must be filled')
      return
    }

    if (!deviceId || !campusId) {
      setError('Missing device or campus ID')
      return
    }

    try {
      setCreating(true)
      setError(null)
      await createDrop(title, guardrails, deviceId, campusId)
      // Redirect to feed after successful creation
      router.push('/mvp/feed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-black text-pure-snow">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-ink-black/80 backdrop-blur border-b border-slate-shadow/20 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-semibold">Create Challenge</h1>
          <p className="text-xs text-slate-shadow/60">Start a new weekly drop</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Title Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-pure-snow">Challenge Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Best lip sync, Funniest fail, Coolest trick..."
            className="w-full bg-slate-shadow border border-slate-shadow/50 rounded-card px-3 py-2 text-sm text-pure-snow placeholder-slate-shadow/50 focus:outline-none focus:border-neon-mint"
            maxLength={100}
          />
          <p className="text-xs text-slate-shadow/60">{title.length}/100</p>
        </div>

        {/* Guardrails */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-pure-snow">5 Guardrails (Rules)</label>
          <p className="text-xs text-slate-shadow/60">Set boundaries for safe, respectful participation</p>

          {guardrails.map((guardrail, index) => (
            <textarea
              key={index}
              value={guardrail}
              onChange={(e) => handleGuardrailChange(index, e.target.value)}
              placeholder={`Guardrail ${index + 1}...`}
              className="w-full bg-slate-shadow border border-slate-shadow/50 rounded-card px-3 py-2 text-sm text-pure-snow placeholder-slate-shadow/50 focus:outline-none focus:border-neon-mint resize-none"
              rows={2}
              maxLength={100}
            />
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-danger-red/20 border border-danger-red rounded-card px-3 py-2 text-xs text-danger-red">
            {error}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-slate-shadow/40 border border-slate-shadow/50 rounded-card px-3 py-3 text-xs text-slate-shadow/80 space-y-1">
          <p className="font-medium text-pure-snow">📅 Challenge Timeline</p>
          <p>• Mon-Wed: Planning phase (visible to all)</p>
          <p>• Wed-Fri: Submission phase (users submit entries)</p>
          <p>• Fri-Sun: Voting phase (users vote on entries)</p>
          <p>• Sun-Mon: Execution phase (winner announced)</p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCreate}
          disabled={creating}
          className="w-full bg-neon-mint hover:bg-neon-mint/90 rounded-card px-4 py-3 text-sm font-medium text-ink-black transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? '⏳ Creating...' : '🚀 Create Challenge'}
        </button>
      </div>
    </div>
  )
}
