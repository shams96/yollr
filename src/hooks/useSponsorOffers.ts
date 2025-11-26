import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type SponsorOffer = Database['public']['Tables']['sponsor_offers']['Row'] & {
  sponsor?: Database['public']['Tables']['sponsors']['Row'];
};

interface UseSponsorOffersReturn {
  offers: SponsorOffer[];
  loading: boolean;
  error: string | null;
  redeemOffer: (offerId: string) => Promise<void>;
  refreshOffers: () => Promise<void>;
  getActiveOffers: () => SponsorOffer[];
  getOffersByType: (offerType: string) => SponsorOffer[];
}

export function useSponsorOffers(campusId: string | null): UseSponsorOffersReturn {
  const supabase = createClient();
  const [offers, setOffers] = useState<SponsorOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campusId) {
      setLoading(false);
      return;
    }

    loadOffers();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('sponsor_offers')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'sponsor_offers' },
        (payload) => handleRealtimeUpdate(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campusId]);

  const loadOffers = async () => {
    if (!campusId) {
      setOffers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: loadError } = await supabase
        .from('sponsor_offers')
        .select(`
          *,
          sponsor:sponsors(*)
        `)
        .eq('campus_id', campusId)
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (loadError) throw loadError;

      setOffers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sponsor offers');
    } finally {
      setLoading(false);
    }
  };

  const handleRealtimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        setOffers(prev => [newRecord, ...prev]);
        break;
      case 'UPDATE':
        setOffers(prev => prev.map(offer => offer.id === newRecord.id ? newRecord : offer));
        break;
      case 'DELETE':
        setOffers(prev => prev.filter(offer => offer.id !== oldRecord.id));
        break;
    }
  };

  const redeemOffer = async (offerId: string) => {
    try {
      setError(null);
      
      // Check if user has already redeemed this offer
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // In a real implementation, you would check redemption history
      // and create a redemption record. For now, we'll just increment
      // the redemption count
      const { error: redeemError } = await supabase
        .from('sponsor_offers')
        .update({
          redemption_count: supabase.rpc('increment', { column: 'redemption_count' }),
        })
        .eq('id', offerId);

      if (redeemError) throw redeemError;

      // Refresh offers to get updated redemption count
      await loadOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem offer');
      throw err;
    }
  };

  const refreshOffers = async () => {
    await loadOffers();
  };

  const getActiveOffers = () => {
    const now = new Date();
    return offers.filter(offer => 
      new Date(offer.start_date) <= now && 
      new Date(offer.end_date) > now &&
      offer.is_active &&
      (offer.max_redemptions === null || offer.redemption_count < offer.max_redemptions)
    );
  };

  const getOffersByType = (offerType: string) => {
    return offers.filter(offer => offer.offer_type === offerType);
  };

  return {
    offers,
    loading,
    error,
    redeemOffer,
    refreshOffers,
    getActiveOffers,
    getOffersByType,
  };
}