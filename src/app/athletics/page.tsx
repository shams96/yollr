'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAthletics } from '@/hooks/useAthletics';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ErrorDisplay } from '@/components/error/ErrorDisplay';
import { ErrorToast } from '@/components/error/ErrorToast';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Calendar, Clock, MapPin, Trophy, Users, Plus, X, ChevronRight } from 'lucide-react';
import type { Database } from '@/types/database';

type AthleticsEvent = Database['public']['Tables']['athletics_events']['Row'];
type ProfileSportType = Database['public']['Enums']['profile_sport_type'];

const SPORT_TYPES: { value: ProfileSportType; label: string; icon: string }[] = [
  { value: 'football', label: 'Football', icon: '🏈' },
  { value: 'basketball', label: 'Basketball', icon: '🏀' },
  { value: 'soccer', label: 'Soccer', icon: '⚽' },
  { value: 'baseball', label: 'Baseball', icon: '⚾' },
  { value: 'softball', label: 'Softball', icon: '🥎' },
  { value: 'track', label: 'Track', icon: '🏃' },
  { value: 'volleyball', label: 'Volleyball', icon: '🏐' },
  { value: 'tennis', label: 'Tennis', icon: '🎾' },
  { value: 'swimming', label: 'Swimming', icon: '🏊' },
  { value: 'golf', label: 'Golf', icon: '⛳' },
  { value: 'lacrosse', label: 'Lacrosse', icon: '🥍' },
  { value: 'hockey', label: 'Hockey', icon: '🏒' },
  { value: 'wrestling', label: 'Wrestling', icon: '🤼' },
  { value: 'cross_country', label: 'Cross Country', icon: '🏃‍♂️' },
  { value: 'gymnastics', label: 'Gymnastics', icon: '🤸' },
  { value: 'cheer', label: 'Cheer', icon: '📣' },
  { value: 'band', label: 'Band', icon: '🎺' },
  { value: 'other', label: 'Other', icon: '🏅' },
];

export default function AthleticsPage() {
  return (
    <ErrorBoundary
      fallback={<ErrorDisplay error={null} title="Athletics Error" message="Unable to load athletics events. Please try again." />}
    >
      <AthleticsPageContent />
    </ErrorBoundary>
  );
}

function AthleticsPageContent() {
  const router = useRouter();
  const supabase = createClient();
  const [campus, setCampus] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSport, setSelectedSport] = useState<ProfileSportType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { events, loading, createEvent } = useAthletics(campus?.id || null);

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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSportIcon = (sportType: ProfileSportType) => {
    return SPORT_TYPES.find(s => s.value === sportType)?.icon || '🏅';
  };

  const handleCreateEvent = async (formData: FormData) => {
    try {
      if (!campus?.id) {
        setError('Campus information not loaded');
        return;
      }

      const sportType = formData.get('sport_type') as ProfileSportType;
      const opponentName = formData.get('opponent_name') as string;
      const eventDate = formData.get('event_date') as string;
      const location = formData.get('location') as string;
      const isHomeGame = formData.get('is_home_game') === 'on';

      await createEvent({
        campus_id: campus.id,
        sport_type: sportType,
        opponent_name: opponentName,
        event_date: eventDate,
        location: location || null,
        is_home_game: isHomeGame,
        expected_attendance: null,
      });

      setShowCreateModal(false);
      setSelectedSport(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    }
  };

  const upcomingEvents = events.filter(event => new Date(event.event_date) > new Date());

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
          type="error"
          duration={5000}
          onClose={() => setError(null)}
        />
      )}

      <FeedHeader campus={campus} />

      <main className="flex-1 overflow-y-auto pb-16">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Athletics</h1>
              <p className="text-sm text-gray-600 mt-1">Game night features and squad competitions</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Create Event</span>
            </button>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
              <p className="text-sm text-gray-600 mb-4">Create your first athletics event to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Create Event
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{getSportIcon(event.sport_type)}</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {event.sport_type.replace('_', ' ')}
                        </span>
                        {event.is_home_game && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Home Game
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        vs {event.opponent_name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.event_date)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-primary-600">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create Athletics Event</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateEvent(new FormData(e.currentTarget));
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sport Type
                    </label>
                    <select
                      name="sport_type"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a sport</option>
                      {SPORT_TYPES.map((sport) => (
                        <option key={sport.value} value={sport.value}>
                          {sport.icon} {sport.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opponent Name
                    </label>
                    <input
                      type="text"
                      name="opponent_name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter opponent name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      name="event_date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter location (optional)"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_home_game"
                      id="is_home_game"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_home_game" className="ml-2 text-sm text-gray-700">
                      This is a home game
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}