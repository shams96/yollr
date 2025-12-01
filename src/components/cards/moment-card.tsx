'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { Moment, User } from '@/types/mvp'

interface MomentCardProps {
  moment: Moment
  creator: User
}

export function MomentCard({ moment, creator }: MomentCardProps) {
  const [imageError, setImageError] = useState(false)
  const expiresIn = Math.max(0, Math.floor((new Date(moment.expires_at).getTime() - Date.now()) / 1000 / 3600))

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{creator.avatar_emoji}</span>
          <div className="flex-1">
            <p className="font-semibold text-pure-snow text-sm">{creator.username}</p>
            <p className="text-xs text-slate-shadow/60">{expiresIn}h remaining</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Video Placeholder */}
        <div className="w-full aspect-square bg-slate-shadow rounded-lg overflow-hidden flex items-center justify-center">
          {imageError ? (
            <div className="text-center">
              <p className="text-2xl">🎥</p>
              <p className="text-xs text-slate-shadow/60 mt-2">Video unavailable</p>
            </div>
          ) : (
            <video
              src={moment.video_url}
              controls
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ctext x='8' y='8' text-anchor='middle' dy='.3em' font-size='12'%3E🎥%3C/text%3E%3C/svg%3E"
            />
          )}
        </div>

        {/* Caption */}
        {moment.caption && <p className="text-sm text-pure-snow">{moment.caption}</p>}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-shadow/60">
          <div className="flex gap-4">
            <button className="hover:text-neon-mint transition">❤️ Like</button>
            <button className="hover:text-sky-glow transition">💬 Reply</button>
          </div>
          <button className="hover:text-peach-soda transition">Share</button>
        </div>
      </CardContent>
    </Card>
  )
}
