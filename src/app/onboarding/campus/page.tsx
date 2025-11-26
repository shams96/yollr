'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { getDistance } from 'geolib';

interface Campus {
  id: string;
  name: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  student_count: number;
  logo_url?: string;
}

export default function CampusSelectionPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [filteredCampuses, setFilteredCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchCampuses();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      // Check if search query is a ZIP code (5 digits)
      const zipMatch = searchQuery.match(/^\d{5}$/);
      
      if (zipMatch) {
        // If it's a ZIP code, call the geo-infer API
        handleZipCodeSearch(searchQuery);
      } else {
        // Otherwise, filter by text search
        const filtered = campuses.filter(
          campus =>
            campus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            campus.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            campus.zip_code.includes(searchQuery)
        );
        setFilteredCampuses(filtered);
      }
    } else if (userLocation) {
      // Sort by distance if we have location
      const sorted = [...campuses].sort((a, b) => {
        const distA = getDistance(
          { latitude: userLocation.lat, longitude: userLocation.lng },
          { latitude: a.latitude, longitude: a.longitude }
        );
        const distB = getDistance(
          { latitude: userLocation.lat, longitude: userLocation.lng },
          { latitude: b.latitude, longitude: b.longitude }
        );
        return distA - distB;
      });
      setFilteredCampuses(sorted);
    } else {
      setFilteredCampuses(campuses);
    }
  }, [searchQuery, campuses, userLocation]);

  const handleZipCodeSearch = async (zipCode: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/geo-infer-campus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zip_code: zipCode,
        }),
      });

      if (response.ok) {
        const { campuses: apiCampuses } = await response.json();
        if (apiCampuses && apiCampuses.length > 0) {
          setFilteredCampuses(apiCampuses);
          setLocationError(null);
        } else {
          setLocationError('No campuses found near that ZIP code. Try a different search.');
        }
      }
    } catch (error) {
      console.error('Error calling geo-infer API with ZIP:', error);
      setLocationError('Failed to search by ZIP code. Try a different search term.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampuses = async () => {
    try {
      const { data, error } = await supabase
        .from('campuses')
        .select('*')
        .order('student_count', { ascending: false });

      if (error) throw error;
      
      setCampuses(data || []);
      setFilteredCampuses(data || []);
    } catch (error) {
      console.error('Error fetching campuses:', error);
      setLocationError('Failed to load campuses');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setLocationError(null);
        
        // Call the geo-infer API to get nearby campuses
        try {
          const response = await fetch('/api/geo-infer-campus', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              latitude: location.lat,
              longitude: location.lng,
            }),
          });

          if (response.ok) {
            const { campuses: apiCampuses } = await response.json();
            if (apiCampuses && apiCampuses.length > 0) {
              setCampuses(apiCampuses);
              setFilteredCampuses(apiCampuses);
            }
          }
        } catch (error) {
          console.error('Error calling geo-infer API:', error);
          // Fallback to local sorting if API fails
          const sorted = [...campuses].sort((a, b) => {
            const distA = getDistance(
              { latitude: location.lat, longitude: location.lng },
              { latitude: a.latitude, longitude: a.longitude }
            );
            const distB = getDistance(
              { latitude: location.lat, longitude: location.lng },
              { latitude: b.latitude, longitude: b.longitude }
            );
            return distA - distB;
          });
          setFilteredCampuses(sorted);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError('Unable to get your location. You can search by ZIP code instead.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleCampusSelect = (campusId: string) => {
    setSelectedCampus(campusId);
  };

  const handleJoinCampus = async () => {
    if (!selectedCampus) return;

    setJoining(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user already has an active membership
      const { data: existingMembership } = await supabase
        .from('campus_memberships')
        .select('id')
        .eq('user_id', user.id)
        .is('left_at', null)
        .single();

      if (existingMembership) {
        // Update existing membership
        const { error } = await supabase
          .from('campus_memberships')
          .update({ campus_id: selectedCampus })
          .eq('id', existingMembership.id);
        
        if (error) throw error;
      } else {
        // Create new membership
        const { error } = await supabase
          .from('campus_memberships')
          .insert({
            user_id: user.id,
            campus_id: selectedCampus,
          });
        
        if (error) throw error;
      }

      // Award XP for joining campus
      await supabase.rpc('award_xp', {
        user_id: user.id,
        amount: 50,
        reason: 'joined_campus',
      });

      router.push('/feed');
    } catch (error) {
      console.error('Error joining campus:', error);
      setLocationError('Failed to join campus. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const getDistanceFromUser = (campus: Campus) => {
    if (!userLocation) return null;
    
    const distance = getDistance(
      { latitude: userLocation.lat, longitude: userLocation.lng },
      { latitude: campus.latitude, longitude: campus.longitude }
    );
    
    return (distance / 1609.34).toFixed(1); // Convert to miles
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cosmic-pink animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black gradient-text mb-2">Choose Your Campus</h1>
          <p className="text-cloud/70">
            {userLocation 
              ? 'We found campuses near you' 
              : 'Search for your campus by name or ZIP code'}
          </p>
        </div>

        <div className="glass-card p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cloud/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-graphite/30 border border-cloud/20 rounded-lg text-cloud placeholder-cloud/50 focus:outline-none focus:border-cosmic-pink focus:ring-2 focus:ring-cosmic-pink/20 focus:neon-glow-pink transition-all duration-200"
              placeholder="Search by campus name, city, or ZIP..."
            />
          </div>
          
          {locationError && (
            <div className="mt-4 p-3 bg-electric-peach/10 border border-electric-peach/30 rounded-lg">
              <p className="text-sm text-electric-peach">{locationError}</p>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          {filteredCampuses.map((campus) => {
            const distance = getDistanceFromUser(campus);
            const isSelected = selectedCampus === campus.id;
            
            return (
              <div
                key={campus.id}
                onClick={() => handleCampusSelect(campus.id)}
                className={`glass-card p-4 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-cosmic-pink bg-graphite/80' 
                    : 'glass-card-hover'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {campus.logo_url ? (
                      <img
                        src={campus.logo_url}
                        alt={campus.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-electric-peach to-cosmic-pink flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {campus.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-bold text-cloud">{campus.name}</h3>
                      <p className="text-sm text-cloud/70">
                        {campus.city}, {campus.state} {campus.zip_code}
                      </p>
                      <p className="text-xs text-cloud/50">
                        {campus.student_count.toLocaleString()} students
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {distance && (
                      <p className="text-sm text-cloud/70">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        {distance} mi
                      </p>
                    )}
                    {isSelected && (
                      <div className="mt-1">
                        <div className="w-6 h-6 rounded-full bg-cosmic-pink flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCampuses.length === 0 && (
          <div className="text-center py-8">
            <p className="text-cloud/70">No campuses found</p>
            <p className="text-sm text-cloud/50 mt-2">Try a different search term</p>
          </div>
        )}

        {selectedCampus && (
          <button
            onClick={handleJoinCampus}
            disabled={joining}
            className="w-full py-4 gradient-btn text-white font-bold rounded-lg haptic-tap disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {joining ? 'Joining...' : 'Join Campus'}
          </button>
        )}
      </div>
    </div>
  );
}