import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5';
import { feedCache } from '../_shared/cache.ts';
import type { Database } from '../../../src/types/database';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedItem {
  id: string;
  type: 'heist' | 'poll' | 'moment' | 'squad_activity';
  score: number;
  created_at: string;
  campus_id: string;
  [key: string]: any;
}

function calculateScore(item: any, now: number): number {
  const baseScores = {
    heist_reveal: 1_000_000,
    heist_voting: 900_000,
    poll: 800_000,
    moment: 700_000,
    squad_activity: 600_000,
  };
  
  let score = baseScores[item.type as keyof typeof baseScores] || 0;
  
  if (item.type === 'heist') {
    const heistItem = item as Database['public']['Tables']['heists']['Row'];
    if (heistItem.phase === 'won') {
      score += (new Date(heistItem.voting_closes_at).getTime() - now) / 1000;
    } else if (heistItem.phase === 'voting') {
      score += (heistItem.vote_velocity || 0) * 100;
    }
  } else if (item.type === 'poll') {
    score += (item.total_votes || 0) * 10;
    score += (now - new Date(item.created_at).getTime()) / 100;

    const timeLeft = new Date(item.closes_at).getTime() - now;
    const duration = new Date(item.closes_at).getTime() - new Date(item.created_at).getTime();
    if (timeLeft < duration * 0.1) score += 50000;
    else if (timeLeft < duration * 0.3) score += 20000;
    else if (timeLeft < duration * 0.6) score += 10000;

  } else if (item.type === 'moment') {
    score += (item.reaction_count || 0) * 50;
    score += (item.view_count || 0) * 5;
    score += Math.max(0, 10000 - (now - new Date(item.created_at).getTime()) / 60000);

  } else if (item.type === 'squad_activity') {
    score += (item.squad_affinity || 0) * 100;
  }
  
  return score;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campus_id, cursor, limit = 10 } = await req.json();
    
    if (!campus_id) {
      throw new Error('campus_id is required');
    }

    const cacheKey = feedCache.generateKey(['feed', campus_id, cursor || 'start', limit]);

    const ifNoneMatch = req.headers.get('If-None-Match');
    const cached = feedCache.get(cacheKey) as 
      | { data: { items: FeedItem[]; next_cursor: string | null }; etag: string }
      | undefined;
    
    if (cached && ifNoneMatch === cached.etag) {
      return new Response(null, {
        headers: { ...corsHeaders },
        status: 304,
      });
    }

    if (cached) {
      const isStale = feedCache.isStale(cacheKey);
      const cacheHeaders = feedCache.getCacheHeaders(cached.etag, isStale);
      
      return new Response(
        JSON.stringify({
          items: cached.data.items,
          next_cursor: cached.data.next_cursor,
          is_stale: isStale,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            ...cacheHeaders,
          },
          status: 200,
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const now = Date.now();
    const cursorScore = cursor ? parseFloat(cursor.split('_')[0]) : null;
    const cursorId = cursor ? cursor.split('_')[1] : null;

    const { data: heists, error: heistsError } = await supabase
      .from('heists')
      .select('*')
      .eq('campus_id', campus_id)
      .in('phase', ['voting', 'won'])
      .order('voting_closes_at', { ascending: false })
      .limit(limit);

    if (heistsError) throw heistsError;

    const { data: polls, error: pollsError } = await supabase
      .from('polls')
      .select(`*, poll_options (*)`)
      .eq('campus_id', campus_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (pollsError) throw pollsError;

    const { data: moments, error: momentsError } = await supabase
      .from('moments')
      .select(`*, profiles:author_id (username, avatar_url)`)
      .eq('campus_id', campus_id)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit * 2);

    if (momentsError) throw momentsError;

    const items: FeedItem[] = [
      ...heists.map(h => ({ ...h, type: 'heist' as const })),
      ...polls.map(p => ({ ...p, type: 'poll' as const })),
      ...moments.map(m => ({
        ...m,
        type: 'moment' as const,
        author_username: m.profiles?.username,
        author_avatar: m.profiles?.avatar_url,
      })),
    ]
      .map(item => ({ ...item, score: calculateScore(item, now) }))
      .sort((a, b) => b.score - a.score)
      .filter(item => {
        if (!cursorScore || !cursorId) return true;
        return item.score < cursorScore || (item.score === cursorScore && item.id < cursorId);
      })
      .slice(0, limit);

    const nextCursor =
      items.length > 0
        ? `${items[items.length - 1].score}_${items[items.length - 1].id}`
        : null;

    const result = { items, next_cursor: nextCursor, is_stale: false };

    // Store in cache
    const etag = feedCache.set(cacheKey, result);
    const cacheHeaders = feedCache.getCacheHeaders(etag, false);

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        ...cacheHeaders,
      },
      status: 200,
    });
  } catch (error) {
    console.error('Error in rankFeedPage:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
