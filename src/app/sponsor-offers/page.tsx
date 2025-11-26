'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useSponsorOffers } from '@/hooks/useSponsorOffers';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ErrorDisplay } from '@/components/error/ErrorDisplay';
import { ErrorToast } from '@/components/error/ErrorToast';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Tag, Clock, MapPin, Gift, CheckCircle, X, Sparkles } from 'lucide-react';
import type { Database } from '@/types/database';

type SponsorOffer = Database['public']['Tables']['sponsor_offers']['Row'] & {
  sponsor?: Database['public']['Tables']['sponsors']['Row'];
};

export default function SponsorOffersPage() {
  return (
    <ErrorBoundary
      fallback={<ErrorDisplay error={null} title="Sponsor Offers Error" message="Unable to load sponsor offers. Please try again." />}
    >
      <SponsorOffersPageContent />
    </ErrorBoundary>
  );
}

function SponsorOffersPageContent() {
  const router = useRouter();
  const supabase = createClient();
  const [campus, setCampus] = useState<any>(null);
  const [selectedOffer, setSelectedOffer] = useState<SponsorOffer | null>(null);
  const [redeemingOffer, setRedeemingOffer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { offers, loading, redeemOffer, refreshOffers } = useSponsorOffers(campus?.id || null);

  useEffect(() => {
    loadCampus();
  }, []);

  const loadCampus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: membership } = await supabase
        .from('campus_memberships')
        .select('campus_id')
        .eq('user_id', user.id)
        .is('left_at', null)
        .single() as { data: { campus_id: string } | null };

      if (!membership) {
        router.push('/onboarding/campus');
        return;
      }

      const { data: campusData } = await supabase
        .from('campuses')
        .select('*')
        .eq('id', membership.campus_id)
        .single();

      setCampus(campusData);
    } catch (err) {
      setError('Failed to load campus information');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getOfferTypeColor = (offerType: string) => {
    switch (offerType) {
      case 'discount':
        return 'bg-blue-100 text-blue-800';
      case 'free_item':
        return 'bg-green-100 text-green-800';
      case 'experience':
        return 'bg-purple-100 text-purple-800';
      case 'sponsored_challenge':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOfferTypeIcon = (offerType: string) => {
    switch (offerType) {
      case 'discount':
        return '💰';
      case 'free_item':
        return '🎁';
      case 'experience':
        return '✨';
      case 'sponsored_challenge':
        return '🏆';
      default:
        return '🎫';
    }
  };

  const getOfferValue = (offer: SponsorOffer) => {
    try {
      const value = offer.offer_value as any;
      switch (offer.offer_type) {
        case 'discount':
          return `${value.percentage}% off`;
        case 'free_item':
          return `Free ${value.item_name}`;
        case 'experience':
          return value.experience_name;
        case 'sponsored_challenge':
          return `${value.xp_reward} XP reward`;
        default:
          return 'Special offer';
      }
    } catch {
      return 'Special offer';
    }
  };

  const handleRedeemOffer = async (offer: SponsorOffer) => {
    try {
      setRedeemingOffer(true);
      await redeemOffer(offer.id);
      setSelectedOffer(null);
      setError('Offer redeemed successfully! Check your email for details.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem offer');
    } finally {
      setRedeemingOffer(false);
    }
  };

  const activeOffers = offers.filter(offer => {
    const now = new Date();
    const startDate = new Date(offer.start_date);
    const endDate = new Date(offer.end_date);
    return startDate <= now && endDate > now && offer.is_active;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {error && (
        <ErrorToast
          message={error}
          type={error.includes('successfully') ? 'success' : 'error'}
          duration={5000}
          onClose={() => setError(null)}
        />
      )}

      <FeedHeader campus={campus} />

      <main className="flex-1 overflow-y-auto pb-16">
        <div className="px-4 py-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sponsor Offers</h1>
            <p className="text-sm text-gray-600">Exclusive deals and experiences from campus sponsors</p>
          </div>

          {activeOffers.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No offers available</h3>
              <p className="text-sm text-gray-600 mb-4">Check back soon for new sponsor offers!</p>
              <button
                onClick={refreshOffers}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    {offer.sponsor?.logo_url ? (
                      <img
                        src={offer.sponsor.logo_url}
                        alt={offer.sponsor.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">
                          {getOfferTypeIcon(offer.offer_type)}
                        </span>
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {offer.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {offer.sponsor?.name || 'Sponsored Offer'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getOfferTypeColor(offer.offer_type)}`}>
                          {offer.offer_type.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">
                        {offer.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Ends {formatDate(offer.end_date)}</span>
                          </div>
                          {offer.max_redemptions && (
                            <div className="flex items-center space-x-1">
                              <Sparkles className="w-3 h-3" />
                              <span>
                                {offer.max_redemptions - offer.redemption_count} left
                              </span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setSelectedOffer(offer)}
                          className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                        >
                          View Offer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      {/* Offer Detail Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Offer Details</h2>
                <button
                  onClick={() => setSelectedOffer(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  {selectedOffer.sponsor?.logo_url ? (
                    <img
                      src={selectedOffer.sponsor.logo_url}
                      alt={selectedOffer.sponsor.name}
                      className="w-16 h-16 rounded-lg mx-auto mb-3 object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <span className="text-white text-2xl">
                        {getOfferTypeIcon(selectedOffer.offer_type)}
                      </span>
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {selectedOffer.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedOffer.sponsor?.name || 'Sponsored Offer'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    {selectedOffer.description}
                  </p>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">
                      {getOfferValue(selectedOffer)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Offer Type:</span>
                    <span className="font-medium capitalize">
                      {selectedOffer.offer_type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Valid Until:</span>
                    <span className="font-medium">
                      {formatDate(selectedOffer.end_date)}
                    </span>
                  </div>
                  {selectedOffer.max_redemptions && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium">
                        {selectedOffer.max_redemptions - selectedOffer.redemption_count} of {selectedOffer.max_redemptions}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedOffer(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRedeemOffer(selectedOffer)}
                  disabled={redeemingOffer}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {redeemingOffer ? 'Redeeming...' : 'Redeem Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}