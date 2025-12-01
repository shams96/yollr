import type { Drop, DropSubmission, DropVote } from '@/types/mvp'

interface DropWithSubmissions extends Drop {
  submissions?: DropSubmission[]
  submission_count?: number
  user_voted_submission?: string | null
}

interface DropPhase {
  phase: 'planning' | 'submission' | 'voting' | 'execution' | 'closed'
  timeRemaining: string
}

/**
 * Create a new drop challenge
 */
export async function createDrop(
  title: string,
  guardrails: string[],
  deviceId: string,
  campusId: string
): Promise<Drop> {
  const response = await fetch('/api/mvp/drops', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-device-id': deviceId,
      'x-campus-id': campusId,
    },
    body: JSON.stringify({
      title,
      guardrails,
      deviceId,
      campusId,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create drop')
  }

  return response.json()
}

/**
 * Get all drops for a campus
 */
export async function getDrops(campusId: string): Promise<Drop[]> {
  const response = await fetch('/api/mvp/drops', {
    headers: {
      'x-campus-id': campusId,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch drops')
  }

  return response.json()
}

/**
 * Get a specific drop with submissions and votes
 */
export async function getDrop(
  dropId: string,
  campusId: string,
  deviceId?: string
): Promise<DropWithSubmissions> {
  const response = await fetch(`/api/mvp/drops/${dropId}`, {
    headers: {
      'x-campus-id': campusId,
      ...(deviceId && { 'x-device-id': deviceId }),
    },
  })

  if (!response.ok) {
    throw new Error('Drop not found')
  }

  return response.json()
}

/**
 * Submit an entry to a drop challenge
 */
export async function submitEntry(
  dropId: string,
  video: Blob,
  description: string,
  deviceId: string,
  campusId: string
): Promise<DropSubmission> {
  const formData = new FormData()
  formData.append('video', video)
  formData.append('description', description)

  const response = await fetch(`/api/mvp/drops/${dropId}/submit`, {
    method: 'POST',
    headers: {
      'x-device-id': deviceId,
      'x-campus-id': campusId,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to submit entry')
  }

  return response.json()
}

/**
 * Vote on a drop submission
 */
export async function voteOnSubmission(
  dropId: string,
  submissionId: string,
  deviceId: string,
  campusId: string
): Promise<DropVote> {
  const response = await fetch(`/api/mvp/drops/${dropId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-device-id': deviceId,
      'x-campus-id': campusId,
    },
    body: JSON.stringify({
      submissionId,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to vote')
  }

  return response.json()
}

/**
 * Determine the current phase and time remaining
 */
export function getDropPhase(drop: Drop): DropPhase {
  const now = new Date()

  const submissionStart = new Date(drop.submission_phase_start)
  const submissionEnd = new Date(drop.submission_phase_end)
  const votingStart = new Date(drop.voting_phase_start)
  const votingEnd = new Date(drop.voting_phase_end)

  if (now < submissionStart) {
    return {
      phase: 'planning',
      timeRemaining: getTimeRemaining(drop.submission_phase_start),
    }
  }

  if (now >= submissionStart && now < submissionEnd) {
    return {
      phase: 'submission',
      timeRemaining: getTimeRemaining(drop.submission_phase_end),
    }
  }

  if (now >= submissionEnd && now < votingStart) {
    return {
      phase: 'voting',
      timeRemaining: getTimeRemaining(drop.voting_phase_end),
    }
  }

  if (now >= votingStart && now < votingEnd) {
    return {
      phase: 'voting',
      timeRemaining: getTimeRemaining(drop.voting_phase_end),
    }
  }

  if (drop.status === 'execution') {
    return {
      phase: 'execution',
      timeRemaining: 'Executing',
    }
  }

  return {
    phase: 'closed',
    timeRemaining: 'Closed',
  }
}

/**
 * Format time remaining as human-readable string
 */
export function getTimeRemaining(expiresAt: string): string {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diffMs = expires.getTime() - now.getTime()

  if (diffMs < 0) {
    return 'Expired'
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffDays > 0) {
    return `${diffDays}d left`
  }

  if (diffHours > 0) {
    return `${diffHours}h left`
  }

  return `${diffMinutes}m left`
}

/**
 * Get the winner submission (highest vote count)
 */
export function getWinner(
  submissions: (DropSubmission & { vote_count: number })[]
): (DropSubmission & { vote_count: number }) | null {
  if (submissions.length === 0) return null

  return submissions.reduce((prev, current) =>
    current.vote_count > (prev.vote_count || 0) ? current : prev
  )
}

/**
 * Check if phase is planning
 */
export function isPlanning(drop: Drop): boolean {
  return drop.status === 'planning'
}

/**
 * Check if phase is submission
 */
export function isSubmission(drop: Drop): boolean {
  return drop.status === 'submission'
}

/**
 * Check if phase is voting
 */
export function isVoting(drop: Drop): boolean {
  return drop.status === 'voting'
}

/**
 * Check if phase is execution
 */
export function isExecution(drop: Drop): boolean {
  return drop.status === 'execution'
}
