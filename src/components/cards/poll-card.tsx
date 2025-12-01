'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { createClient } from '@/lib/supabase-client'
import type { Poll } from '@/types/mvp'

interface PollCardProps {
  poll: Poll
  userId: string
  onVoteComplete?: () => void
}

export function PollCard({ poll, userId, onVoteComplete }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [voting, setVoting] = useState(false)
  const [voted, setVoted] = useState(false)
  const [results, setResults] = useState<Record<number, number>>({})

  const handleVote = async (optionIndex: number) => {
    if (voting || voted) return

    try {
      setVoting(true)
      const supabase = createClient()

      // Insert vote
      await supabase.from('poll_votes').insert({
        poll_id: poll.id,
        user_id: userId,
        option_index: optionIndex,
      })

      // Fetch updated results
      const { data: votes } = await supabase
        .from('poll_votes')
        .select('option_index')
        .eq('poll_id', poll.id)

      const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 }
      votes?.forEach((v) => {
        counts[v.option_index]++
      })

      setResults(counts)
      setSelectedOption(optionIndex)
      setVoted(true)
      onVoteComplete?.()
    } catch (error) {
      console.error('Vote failed:', error)
    } finally {
      setVoting(false)
    }
  }

  const totalVotes = Object.values(results).reduce((a, b) => a + b, 0)
  const expiresIn = Math.max(0, Math.floor((new Date(poll.expires_at).getTime() - Date.now()) / 1000 / 3600))

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-pure-snow flex-1">{poll.question}</h3>
          <span className="text-xs text-slate-shadow/60 whitespace-nowrap ml-2">{expiresIn}h left</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {(poll.options as string[]).map((option, idx) => {
          const votes = results[idx] || 0
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
          const isSelected = selectedOption === idx

          return (
            <button
              key={idx}
              onClick={() => handleVote(idx)}
              disabled={voting || voted}
              className={`w-full p-3 rounded-lg text-left text-sm font-medium transition-all ${
                voted
                  ? isSelected
                    ? 'bg-neon-mint/20 border border-neon-mint text-pure-snow'
                    : 'bg-slate-shadow border border-slate-shadow/50 text-slate-shadow/70'
                  : 'bg-slate-shadow hover:bg-slate-shadow/80 border border-slate-shadow/50 text-pure-snow'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {voted && <span className="text-xs">{percentage}%</span>}
              </div>
              {voted && votes > 0 && (
                <div className="mt-2 h-2 bg-slate-shadow rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neon-mint transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </button>
          )
        })}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-shadow/60">
          <span>{totalVotes} votes</span>
          <button className="text-sky-glow hover:underline">Share</button>
        </div>
      </CardContent>
    </Card>
  )
}
