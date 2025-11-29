import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type BellEvent = Database['public']['Tables']['bell_events']['Row'];
type Heist = Database['public']['Tables']['heists']['Row'];
type Poll = Database['public']['Tables']['polls']['Row'] & {
  poll_options: Array<Database['public']['Tables']['poll_options']['Row'] & { percent: number }>;
};
type AthleticsEvent = Database['public']['Tables']['athletics_events']['Row'];

interface LeaderboardUser {
  rank: number;
  username: string;
  total_xp: number;
  level: number;
}

interface FeedData {
  // User data
  profile: Profile | null;
  userLevel: number;
  userXP: number;
  streak: number;
  canOpenBox: boolean;

  // Live stats
  liveUsers: number;

  // Bell event
  activeBell: BellEvent | null;
  bellTimeRemaining: number; // seconds

  // Heist
  activeHeist: Heist | null;
  heistParticipants: number;

  // Athletics
  nextEvent: AthleticsEvent | null;
  squadsGoing: number;

  // Poll
  activePoll: Poll | null;

  // Leaderboard
  topPlayers: LeaderboardUser[];
  userRank: number;

  // Loading states
  loading: boolean;
  error: string | null;
}

export function useFeedData(campusId?: string) {
  const [data, setData] = useState<FeedData>({
    profile: null,
    userLevel: 0,
    userXP: 0,
    streak: 0,
    canOpenBox: false,
    liveUsers: 0,
    activeBell: null,
    bellTimeRemaining: 0,
    activeHeist: null,
    heistParticipants: 0,
    nextEvent: null,
    squadsGoing: 0,
    activePoll: null,
    topPlayers: [],
    userRank: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function fetchFeedData() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        // In development with mock SMS, allow viewing feed without auth
        const isDevelopment = process.env.NODE_ENV === 'development';
        const useMockSms = process.env.NEXT_PUBLIC_USE_MOCK_SMS === 'true';

        if (!user && !(isDevelopment && useMockSms)) {
          if (mounted) {
            setData(prev => ({
              ...prev,
              loading: false,
              error: 'Please log in to view your feed',
            }));
          }
          return;
        }
        if (!mounted) return;

        // Get user's campus if not provided
        let effectiveCampusId = campusId;

        // In mock mode without a user, use a default campus for demo
        if (!user && isDevelopment && useMockSms) {
          if (!effectiveCampusId) {
            // Use first available campus for demo
            const { data: campuses } = await supabase
              .from('campuses')
              .select('id')
              .limit(1);
            effectiveCampusId = (campuses as any)?.[0]?.id;
          }
        } else if (user && !effectiveCampusId) {
          const { data: membership } = await supabase
            .from('campus_memberships')
            .select('campus_id')
            .eq('user_id', user.id)
            .is('left_at', null)
            .single();
          effectiveCampusId = (membership as any)?.campus_id;
        }

        if (!effectiveCampusId) {
          if (mounted) {
            setData(prev => ({
              ...prev,
              loading: false,
              error: 'No campus membership found. Please join a campus first.',
            }));
          }
          return;
        }
        if (!mounted) return;

        // Fetch all data in parallel
        const [
          profileResult,
          liveUsersResult,
          bellResult,
          heistResult,
          pollResult,
          athleticsResult,
          leaderboardResult,
        ] = await Promise.all([
          // User profile (skip in mock mode without user)
          user
            ? supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            : Promise.resolve({ data: null, error: null }),

          // Live users count
          supabase
            .from('campus_memberships')
            .select('user_id', { count: 'exact', head: true })
            .eq('campus_id', effectiveCampusId)
            .is('left_at', null),

          // Active bell event
          supabase
            .from('bell_events')
            .select('*')
            .eq('campus_id', effectiveCampusId)
            .eq('is_active', true)
            .gte('expires_at', new Date().toISOString())
            .order('triggered_at', { ascending: false })
            .limit(1)
            .maybeSingle(),

          // Active heist
          supabase
            .from('heists')
            .select('*')
            .eq('campus_id', effectiveCampusId)
            .eq('is_active', true)
            .in('phase', ['submitting', 'voting'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),

          // Active poll with options
          supabase
            .from('polls')
            .select(`
              *,
              poll_options (
                id,
                option_text,
                vote_count,
                position,
                created_at,
                updated_at
              )
            `)
            .eq('campus_id', effectiveCampusId)
            .eq('is_active', true)
            .gte('closes_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),

          // Next athletics event
          supabase
            .from('athletics_events')
            .select('*')
            .eq('campus_id', effectiveCampusId)
            .gte('event_date', new Date().toISOString())
            .order('event_date', { ascending: true })
            .limit(1)
            .maybeSingle(),

          // Leaderboard
          supabase
            .from('profiles')
            .select('username, total_xp')
            .order('total_xp', { ascending: false })
            .limit(50),
        ]);

        if (!mounted) return;

        // Process profile data
        const profile = profileResult.data;
        const userLevel = profile ? Math.floor((profile as any).total_xp / 1000) + 1 : 0;
        const userXP = profile ? (profile as any).total_xp % 1000 : 0;

        // Process bell event
        const activeBell = bellResult.data;
        let bellTimeRemaining = 0;
        if (activeBell) {
          const expiresAt = new Date((activeBell as any).expires_at).getTime();
          const now = Date.now();
          bellTimeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        }

        // Process poll options with percentages
        let activePoll = pollResult.data as Poll | null;
        if (activePoll && activePoll.poll_options) {
          const totalVotes = activePoll.total_votes || 1; // Avoid division by zero
          activePoll = {
            ...activePoll,
            poll_options: activePoll.poll_options.map((option: any) => ({
              ...option,
              percent: Math.round((option.vote_count / totalVotes) * 100),
            })),
          };
        }

        // Process leaderboard
        const topPlayers = (leaderboardResult.data || [])
          .slice(0, 3)
          .map((player: any, index: number) => ({
            rank: index + 1,
            username: player.username,
            total_xp: player.total_xp,
            level: Math.floor(player.total_xp / 1000) + 1,
          }));

        const userRank = (leaderboardResult.data || [])
          .findIndex((p: any) => p.username === (profile as any)?.username) + 1;

        setData({
          profile,
          userLevel,
          userXP,
          streak: (profile as any)?.current_streak || 0,
          canOpenBox: ((profile as any)?.mystery_boxes_available || 0) > 0,
          liveUsers: liveUsersResult.count || 0,
          activeBell,
          bellTimeRemaining,
          activeHeist: heistResult.data,
          heistParticipants: (heistResult.data as any)?.total_submissions || 0,
          nextEvent: athleticsResult.data,
          squadsGoing: 0, // TODO: Count squads attending event
          activePoll,
          topPlayers,
          userRank,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        console.error('Error fetching feed data:', error);
        if (mounted) {
          setData(prev => ({
            ...prev,
            loading: false,
            error: error.message || 'Failed to load feed data',
          }));
        }
      }
    }

    fetchFeedData();

    // Set up real-time subscriptions
    // Subscribe to bell events
    const bellChannel = supabase
      .channel('bell_events_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bell_events' },
        () => {
          fetchFeedData();
        }
      )
      .subscribe();

    // Subscribe to campus memberships (for live user count)
    const membersChannel = supabase
      .channel('campus_memberships_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'campus_memberships' },
        () => {
          fetchFeedData();
        }
      )
      .subscribe();

    // Refresh every 30 seconds for live data
    const interval = setInterval(() => {
      if (mounted) {
        fetchFeedData();
      }
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
      supabase.removeChannel(bellChannel);
      supabase.removeChannel(membersChannel);
    };
  }, [campusId]);

  return data;
}
