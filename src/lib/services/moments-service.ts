'use client'

import type { Moment } from '@/types/mvp'

export async function uploadMoment(
  video: Blob,
  caption: string,
  deviceId: string,
  campusId: string
): Promise<Moment> {
  const formData = new FormData()
  formData.append('video', video)
  formData.append('caption', caption)

  const response = await fetch('/api/mvp/moments', {
    method: 'POST',
    headers: {
      'x-device-id': deviceId,
      'x-campus-id': campusId,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload moment')
  }

  return response.json()
}

export async function getMoments(campusId: string): Promise<Moment[]> {
  const response = await fetch(`/api/mvp/moments?campus_id=${campusId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch moments')
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

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `0:${remainingSeconds.toString().padStart(2, '0')}`
}
