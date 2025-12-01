'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useInView } from 'react-intersection-observer'
import { createClient } from '@/lib/supabase-client'
import { useCampusStore } from '@/lib/store/campus-store'
import { useDeviceId } from '@/lib/hooks/use-device-id'
import { fetchFeedItems, isItemExpired } from '@/lib/feed-service'
import { PollCard } from '@/components/cards/poll-card'
import { MomentCard } from '@/components/cards/moment-card'
import { DropCard } from '@/components/cards/drop-card'
import type { FeedItem } from '@/lib/feed-service'
import type { Campus, User } from '@/types/mvp'

function FeedPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { ref, inView } = useInView()

  const { deviceId, loading: deviceLoading } = useDeviceId()
  const { campusId, campus } = useCampusStore()

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<FeedItem[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initialize campus if needed
  useEffect(() => {
    if (deviceLoading || campusId) return

    const campusSlug = searchParams.get('campus')
    if (!campusSlug) {
      router.push('/mvp/campus')
      return
    }

    const initializeCampus = async () => {
      try {
        const supabase = createClient()
        const { data: campusData } = await supabase
          .from('campuses')
          .select('*')
          .eq('slug', campusSlug)
          .single()

        if (campusData) {
          // Use the store to set campus
          const { setCampus } = useCampusStore.getState()
          setCampus(campusData.id, campusData)
        }
      } catch (e) {
        console.error('Failed to initialize campus:', e)
      }
    }

    initializeCampus()
  }, [deviceLoading, campusId, searchParams, router])

  // Fetch user
  useEffect(() => {
    if (!deviceId || !campusId) return

    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('device_id', deviceId)
          .eq('campus_id', campusId)
          .single()

        if (data) setUser(data)
      } catch (e) {
        console.error('Failed to fetch user:', e)
      }
    }

    fetchUser()
  }, [deviceId, campusId])

  // Fetch feed items
  const loadMoreItems = useCallback(async () => {
    if (!campusId || !hasMore) return

    try {
      const newItems = await fetchFeedItems(campusId, page, 10)

      // Filter out expired items
      const validItems = newItems.filter((item) => !isItemExpired(item))

      if (validItems.length === 0) {
        setHasMore(false)
      } else {
        setItems((prev) => [...prev, ...validItems])
        setPage((prev) => prev + 1)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }, [campusId, page, hasMore])

  // Infinite scroll
  useEffect(() => {
    if (inView && !loading && hasMore) {
      loadMoreItems()
    }
  }, [inView, loading, hasMore, loadMoreItems])

  // Initial load
  useEffect(() => {
    if (!campusId || items.length > 0) return
    setLoading(true)
    loadMoreItems()
  }, [campusId])

  if (!campusId || !user) {
    return (
      <div className="min-h-screen bg-ink-black text-pure-snow flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-black text-pure-snow">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-shadow/80 backdrop-blur border-b border-slate-shadow/50 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{campus?.emoji}</span>
            <div>
              <h1 className="font-bold text-lg">{campus?.name}</h1>
              <p className="text-xs text-slate-shadow/60">{items.length} posts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/mvp/moments/new')}
              className="text-2xl hover:scale-110 transition"
              title="Create moment"
            >
              🎬
            </button>
            <button
              onClick={() => router.push('/mvp/drops/new')}
              className="text-2xl hover:scale-110 transition"
              title="Create challenge"
            >
              🎯
            </button>
            <button className="text-2xl hover:scale-110 transition">⚙️</button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto py-4 px-4 space-y-4">
        {error && (
          <div className="bg-danger-red/20 border border-danger-red rounded-card p-4">
            <p className="text-danger-red text-sm">{error}</p>
          </div>
        )}

        {items.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-slate-shadow">No posts yet. Check back soon!</p>
          </div>
        )}

        {items.map((item) => (
          <div key={item.id}>
            {item.type === 'poll' && deviceId && campusId && (
              <PollCard poll={item.data as any} deviceId={deviceId} campusId={campusId} />
            )}
            {item.type === 'moment' && (
              <MomentCard moment={item.data as any} creator={user} />
            )}
            {(item.type === 'drop_lab' || item.type === 'drop_plan') && (
              <DropCard drop={item.data as any} />
            )}
          </div>
        ))}

        {/* Infinite scroll trigger */}
        {hasMore && (
          <div ref={ref} className="text-center py-8">
            <p className="text-slate-shadow animate-pulse">Loading more...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-black text-pure-snow flex items-center justify-center"><p>Loading...</p></div>}>
      <FeedPageContent />
    </Suspense>
  )
}
