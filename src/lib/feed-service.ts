import { createClient } from '@/lib/supabase-client'
import type { Poll, Moment, Drop, DropSubmission } from '@/types/mvp'

interface FeedItem {
  id: string
  type: 'poll' | 'moment' | 'drop_plan' | 'drop_lab'
  timestamp: string
  data: Poll | Moment | Drop | DropSubmission
}

export async function fetchFeedItems(
  campusId: string,
  page: number = 0,
  pageSize: number = 10
): Promise<FeedItem[]> {
  const supabase = createClient()
  const offset = page * pageSize

  try {
    // Fetch active polls
    const { data: polls } = await supabase
      .from('polls')
      .select('*')
      .eq('campus_id', campusId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize)

    // Fetch active moments
    const { data: moments } = await supabase
      .from('moments')
      .select('*')
      .eq('campus_id', campusId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize)

    // Fetch active drops
    const { data: drops } = await supabase
      .from('drops')
      .select('*')
      .eq('campus_id', campusId)
      .order('created_at', { ascending: false })

    // Fetch drop submissions (for voting phase)
    const { data: dropSubs } = await supabase
      .from('drop_submissions')
      .select('*')
      .in('drop_id', drops?.map((d) => d.id) || [])
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize)

    // Merge all items
    const items: FeedItem[] = []

    polls?.forEach((poll) => {
      items.push({
        id: poll.id,
        type: 'poll',
        timestamp: poll.created_at,
        data: poll,
      })
    })

    moments?.forEach((moment) => {
      items.push({
        id: moment.id,
        type: 'moment',
        timestamp: moment.created_at,
        data: moment,
      })
    })

    drops?.forEach((drop) => {
      if (drop.status === 'voting' || drop.status === 'execution') {
        items.push({
          id: drop.id,
          type: 'drop_lab',
          timestamp: drop.created_at,
          data: drop,
        })
      }
    })

    dropSubs?.forEach((sub) => {
      items.push({
        id: sub.id,
        type: 'drop_plan',
        timestamp: sub.created_at,
        data: sub,
      })
    })

    // Sort by timestamp
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch (error) {
    console.error('Failed to fetch feed:', error)
    return []
  }
}

export function isItemExpired(item: FeedItem): boolean {
  if (item.type === 'poll' || item.type === 'moment') {
    const expiresAt = new Date((item.data as Poll | Moment).expires_at)
    return expiresAt < new Date()
  }
  return false
}
