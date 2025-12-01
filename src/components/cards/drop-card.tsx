'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Drop } from '@/types/mvp'

interface DropCardProps {
  drop: Drop
  userSubmitted?: boolean
}

export function DropCard({ drop, userSubmitted = false }: DropCardProps) {
  const phaseInfo = {
    planning: { label: '📋 Planning', color: 'bg-soft-lavender/20 border-soft-lavender' },
    submission: { label: '📹 Submit Your Drop', color: 'bg-neon-mint/20 border-neon-mint' },
    voting: { label: '🗳️ Voting Now', color: 'bg-sky-glow/20 border-sky-glow' },
    execution: { label: '🏆 Execution Week', color: 'bg-peach-soda/20 border-peach-soda' },
    closed: { label: '✅ Closed', color: 'bg-slate-shadow/20 border-slate-shadow' },
  }

  const phaseData = phaseInfo[drop.status as keyof typeof phaseInfo]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="space-y-3">
          <CardTitle className="text-xl">{drop.title}</CardTitle>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${phaseData.color}`}>
            {phaseData.label}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Guardrails */}
        <div>
          <p className="text-xs font-semibold text-slate-shadow/70 mb-2">📏 Guardrails</p>
          <ul className="space-y-1">
            {(drop.guardrails as string[]).map((rule, idx) => (
              <li key={idx} className="text-xs text-pure-snow/80">
                • {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* Status Message */}
        {drop.status === 'submission' && (
          <p className="text-xs text-sky-glow bg-sky-glow/10 rounded px-3 py-2">
            ⏰ Submit your drop plan before {new Date(drop.submission_phase_end).toLocaleDateString()}
          </p>
        )}

        {drop.status === 'voting' && (
          <p className="text-xs text-neon-mint bg-neon-mint/10 rounded px-3 py-2">
            🗳️ Vote on submissions until {new Date(drop.voting_phase_end).toLocaleDateString()}
          </p>
        )}

        {drop.status === 'execution' && drop.winner_submission_id && (
          <p className="text-xs text-peach-soda bg-peach-soda/10 rounded px-3 py-2">
            🎉 This week's winner is executing! Tag your moments with #ThisWeeksDrop
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {drop.status === 'submission' && !userSubmitted && (
            <button className="flex-1 bg-neon-mint text-ink-black font-semibold py-2 rounded-lg hover:bg-neon-mint/90 transition text-sm">
              📹 Submit Plan
            </button>
          )}
          {(drop.status === 'voting' || drop.status === 'execution') && (
            <button className="flex-1 bg-sky-glow text-ink-black font-semibold py-2 rounded-lg hover:bg-sky-glow/90 transition text-sm">
              🗳️ View Submissions
            </button>
          )}
          <button className="flex-1 bg-slate-shadow border border-slate-shadow/50 text-pure-snow font-semibold py-2 rounded-lg hover:bg-slate-shadow/80 transition text-sm">
            Share
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
