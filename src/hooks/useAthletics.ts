import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type AthleticsEvent = Database['public']['Tables']['athletics_events']['Row'];
type Campus = Database['public']['Tables']['campuses']['Row'];

interface UseAthleticsReturn {
  events: AthleticsEvent[];
  loading: boolean;
  error: string | null;
  createEvent: (event: Omit<AthleticsEvent, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<AthleticsEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getUpcomingEvents: (limit?: number) => AthleticsEvent[];
  getEventsBySport: (sportType: string) => AthleticsEvent[];
}

export function useAthletics(campusId: string | null): UseAthleticsReturn {
  const supabase = createClient();
  const [events, setEvents] = useState<AthleticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campusId) {
      setLoading(false);
      return;
    }

    loadEvents();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('athletics_events')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'athletics_events' },
        (payload) => handleRealtimeUpdate(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campusId]);

  const loadEvents = async () => {
    if (!campusId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: loadError } = await supabase
        .from('athletics_events')
        .select('*')
        .eq('campus_id', campusId)
        .order('event_date', { ascending: true });

      if (loadError) throw loadError;

      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load athletics events');
    } finally {
      setLoading(false);
    }
  };

  const handleRealtimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        setEvents(prev => [...prev, newRecord]);
        break;
      case 'UPDATE':
        setEvents(prev => prev.map(e => e.id === newRecord.id ? newRecord : e));
        break;
      case 'DELETE':
        setEvents(prev => prev.filter(e => e.id !== oldRecord.id));
        break;
    }
  };

  const createEvent = async (eventData: Omit<AthleticsEvent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      
      const { error: createError } = await supabase
        .from('athletics_events')
        .insert(eventData as any);

      if (createError) throw createError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      throw err;
    }
  };

  const updateEvent = async (id: string, updates: Partial<AthleticsEvent>) => {
    try {
      setError(null);
      
      const { error: updateError } = await (supabase as any)
        .from('athletics_events')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      setError(null);
      
      const { error: deleteError } = await supabase
        .from('athletics_events')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      throw err;
    }
  };

  const getUpcomingEvents = (limit = 10) => {
    const now = new Date();
    return events
      .filter(event => new Date(event.event_date) > now)
      .slice(0, limit);
  };

  const getEventsBySport = (sportType: string) => {
    return events.filter(event => event.sport_type === sportType);
  };

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    getUpcomingEvents,
    getEventsBySport,
  };
}