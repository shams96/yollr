import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type MysteryBox = Database['public']['Tables']['mystery_boxes']['Row'];
type RewardType = Database['public']['Enums']['reward_type'];

interface UseMysteryBoxesReturn {
  boxes: MysteryBox[];
  availableCount: number;
  loading: boolean;
  error: string | null;
  openBox: (boxId: string) => Promise<{
    reward_type: RewardType;
    reward_value: any;
  } | null>;
  awardBox: (userId: string, boxType: string) => Promise<void>;
  refreshBoxes: () => Promise<void>;
}

export function useMysteryBoxes(userId: string | null): UseMysteryBoxesReturn {
  const supabase = createClient();
  const [boxes, setBoxes] = useState<MysteryBox[]>([]);
  const [availableCount, setAvailableCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadBoxes();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('mystery_boxes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'mystery_boxes' },
        (payload) => handleRealtimeUpdate(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadBoxes = async () => {
    if (!userId) {
      setBoxes([]);
      setAvailableCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load mystery boxes
      const { data: boxesData, error: boxesError } = await supabase
        .from('mystery_boxes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (boxesError) throw boxesError;

      setBoxes(boxesData || []);

      // Load available count from profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('mystery_boxes_available')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      setAvailableCount((profileData as any)?.mystery_boxes_available || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mystery boxes');
    } finally {
      setLoading(false);
    }
  };

  const handleRealtimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        setBoxes(prev => [newRecord, ...prev]);
        break;
      case 'UPDATE':
        setBoxes(prev => prev.map(box => box.id === newRecord.id ? newRecord : box));
        break;
      case 'DELETE':
        setBoxes(prev => prev.filter(box => box.id !== oldRecord.id));
        break;
    }
  };

  const openBox = async (boxId: string): Promise<{
    reward_type: RewardType;
    reward_value: any;
  } | null> => {
    try {
      setError(null);
      
      const { data, error: openError } = await (supabase.rpc as any)('fn_open_mystery_box', {
        p_box_id: boxId,
        p_user_id: userId,
      });

      if (openError) throw openError;

      // Refresh boxes and count
      await loadBoxes();

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open mystery box');
      throw err;
    }
  };

  const awardBox = async (userId: string, boxType: string) => {
    try {
      setError(null);
      
      const { error: awardError } = await (supabase.rpc as any)('fn_award_mystery_box', {
        p_user_id: userId,
        p_box_type: boxType,
      });

      if (awardError) throw awardError;

      // Refresh boxes and count
      await loadBoxes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to award mystery box');
      throw err;
    }
  };

  const refreshBoxes = async () => {
    await loadBoxes();
  };

  return {
    boxes,
    availableCount,
    loading,
    error,
    openBox,
    awardBox,
    refreshBoxes,
  };
}