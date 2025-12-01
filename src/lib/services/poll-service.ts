'use client'

import type { Poll } from '@/types/mvp'

interface PollResults {
  poll: Poll
  results: {
    option_0: { votes: number; percentage: number }
    option_1: { votes: number; percentage: number }
    option_2: { votes: number; percentage: number }
    option_3: { votes: number; percentage: number }
    total_votes: number
  }
  user_vote: number | null
  is_active: boolean
}

export async function createPoll(
  question: string,
  options: [string, string, string, string],
  deviceId: string,
  campusId: string
): Promise<Poll> {
  const response = await fetch('/api/mvp/polls', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-device-id': deviceId,
      'x-campus-id': campusId,
    },
    body: JSON.stringify({ question, options }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create poll')
  }

  return response.json()
}

export async function votePoll(
  pollId: string,
  optionIndex: number,
  deviceId: string,
  campusId: string
): Promise<void> {
  const response = await fetch('/api/mvp/polls/vote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-device-id': deviceId,
      'x-campus-id': campusId,
    },
    body: JSON.stringify({ poll_id: pollId, option_index: optionIndex }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to vote on poll')
  }
}

export async function getPollResults(
  pollId: string,
  deviceId?: string
): Promise<PollResults> {
  const headers: Record<string, string> = {}
  if (deviceId) {
    headers['x-device-id'] = deviceId
  }

  const response = await fetch(`/api/mvp/polls/${pollId}/results`, {
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch poll results')
  }

  return response.json()
}

export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

export function getTimeRemaining(expiresAt: string): string {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diff = expires.getTime() - now.getTime()

  if (diff <= 0) return 'Expired'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) return `${hours}h left`
  if (minutes > 0) return `${minutes}m left`
  return 'Expiring soon'
}
