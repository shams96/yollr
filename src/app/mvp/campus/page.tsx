'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useCampusStore } from '@/lib/store/campus-store'
import { useDeviceId } from '@/lib/hooks/use-device-id'
import type { Campus } from '@/types/mvp'

export default function CampusSelectionPage() {
  const router = useRouter()
  const { deviceId, loading: deviceLoading } = useDeviceId()
  const { setCampus } = useCampusStore()
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!deviceId || deviceLoading) return

    const fetchCampuses = async () => {
      try {
        const supabase = createClient()
        const { data, error: err } = await supabase
          .from('campuses')
          .select('*')
          .order('name')

        if (err) throw err
        setCampuses(data || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load campuses')
      } finally {
        setLoading(false)
      }
    }

    fetchCampuses()
  }, [deviceId, deviceLoading])

  const handleSelectCampus = async (campus: Campus) => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Create or update user
      const { data: user, error: err } = await supabase
        .from('users')
        .insert({
          device_id: deviceId!,
          campus_id: campus.id,
          username: `user_${deviceId!.substring(0, 8)}`,
          avatar_emoji: '🎓',
        })
        .select()
        .single()

      if (err && !err.message.includes('duplicate')) throw err

      // Set in store
      setCampus(campus.id, campus)

      // Navigate to feed
      router.push(`/mvp/feed?campus=${campus.slug}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to select campus')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-black text-pure-snow flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">📱 Select Your Campus</h1>
        <p className="text-slate-shadow text-lg">Choose your school to get started</p>
      </div>

      {/* Campus List */}
      <div className="w-full max-w-md space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin">⏳</div>
            <p className="mt-2 text-slate-shadow">Loading campuses...</p>
          </div>
        ) : error ? (
          <div className="bg-danger-red/20 border border-danger-red rounded-card p-4">
            <p className="text-danger-red font-medium">{error}</p>
          </div>
        ) : campuses.length > 0 ? (
          campuses.map((campus) => (
            <button
              key={campus.id}
              onClick={() => handleSelectCampus(campus)}
              disabled={loading}
              className="w-full bg-slate-shadow hover:bg-slate-shadow/80 border border-slate-shadow/50 rounded-card p-6 text-left transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{campus.emoji}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-pure-snow">{campus.name}</h3>
                  <p className="text-sm text-slate-shadow/70">{campus.location}</p>
                  <span className="inline-block mt-1 text-xs bg-slate-shadow rounded px-2 py-1 text-slate-shadow/70">
                    {campus.tier === 'high_school' ? '🏫 High School' : '🎓 University'}
                  </span>
                </div>
              </div>
            </button>
          ))
        ) : (
          <p className="text-center text-slate-shadow">No campuses available</p>
        )}
      </div>

      {/* Footer */}
      <p className="text-slate-shadow text-sm mt-8">
        Device ID: <code className="bg-slate-shadow px-2 py-1 rounded">{deviceId?.substring(0, 8)}</code>
      </p>
    </div>
  )
}
