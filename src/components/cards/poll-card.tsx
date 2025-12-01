'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { votePoll, getPollResults, getTimeRemaining, isExpired } from '@/lib/services/poll-service'
import type { Poll } from '@/types/mvp'

interface PollCardProps {
  poll: Poll
  deviceId: string
  campusId: string
  onVoteComplete?: () => void
}

export function PollCard({ poll, deviceId, campusId, onVoteComplete }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [voting, setVoting] = useState(false)
  const [voted, setVoted] = useState(false)
  const [results, setResults] = useState<Record<number, { votes: number; percentage: number }>>({})
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(poll.expires_at))

  // Update time remaining
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(poll.expires_at))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [poll.expires_at])

  // Load poll results on mount
  useEffect(() => {
    const loadResults = async () => {
      try {
        const data = await getPollResults(poll.id, deviceId)
        setResults({
          0: data.results.option_0,
          1: data.results.option_1,
          2: data.results.option_2,
          3: data.results.option_3,
        })
        if (data.user_vote !== null) {
          setSelectedOption(data.user_vote)
          setVoted(true)
        }
      } catch (err) {
        console.error('Failed to load results:', err)
      }
    }

    loadResults()
  }, [poll.id, deviceId])

  const handleVote = async (optionIndex: number) => {
    if (voting || voted || isExpired(poll.expires_at)) return

    try {
      setVoting(true)
      setError(null)

      // Cast vote
      await votePoll(poll.id, optionIndex, deviceId, campusId)

      // Fetch updated results
      const data = await getPollResults(poll.id, deviceId)
      setResults({
        0: data.results.option_0,
        1: data.results.option_1,
        2: data.results.option_2,
        3: data.results.option_3,
      })
      setSelectedOption(optionIndex)
      setVoted(true)
      onVoteComplete?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote')
      console.error('Vote failed:', err)
    } finally {
      setVoting(false)
    }
  }

  const totalVotes = Object.values(results).reduce((sum, opt) => sum + opt.votes, 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-pure-snow flex-1">{poll.question}</h3>
          <span className={`text-xs whitespace-nowrap ml-2 ${isExpired(poll.expires_at) ? 'text-danger-red' : 'text-slate-shadow/60'}`}>
            {timeRemaining}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="bg-danger-red/20 border border-danger-red rounded px-3 py-2 text-xs text-danger-red">
            {error}
          </div>
        )}

        {(poll.options as string[]).map((option, idx) => {
          const optionData = results[idx] || { votes: 0, percentage: 0 }
          const isSelected = selectedOption === idx
          const isDisabled = voting || voted || isExpired(poll.expires_at)

          return (
            <button
              key={idx}
              onClick={() => handleVote(idx)}
              disabled={isDisabled}
              className={`w-full p-3 rounded-lg text-left text-sm font-medium transition-all ${
                voted
                  ? isSelected
                    ? 'bg-neon-mint/20 border border-neon-mint text-pure-snow'
                    : 'bg-slate-shadow border border-slate-shadow/50 text-slate-shadow/70'
                  : isExpired(poll.expires_at)
                    ? 'bg-slate-shadow border border-slate-shadow/50 text-slate-shadow/50 cursor-not-allowed'
                    : 'bg-slate-shadow hover:bg-slate-shadow/80 border border-slate-shadow/50 text-pure-snow cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {voted && <span className="text-xs">{optionData.percentage}%</span>}
              </div>
              {voted && optionData.votes > 0 && (
                <div className="mt-2 h-2 bg-slate-shadow rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neon-mint transition-all"
                    style={{ width: `${optionData.percentage}%` }}
                  />
                </div>
              )}
            </button>
          )
        })}

        <div className="flex items-center justify-between pt-2 text-xs text-slate-shadow/60">
          <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
          <button className="text-sky-glow hover:underline disabled:opacity-50" disabled={voting}>
            {voting ? '⏳' : '📤'} Share
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
