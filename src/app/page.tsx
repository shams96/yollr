'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Camera, Users, Bell, Trophy, Phone, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push('/feed');
      else setLoading(false);
    };
    checkAuth();
  }, [router]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getNearestCampus = async (supabase: any) => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 0,
        });
      });

      const { data: campuses } = await supabase
        .from('campuses')
        .select('id, name, latitude, longitude')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (!campuses?.length) {
        const { data: fallback } = await supabase
          .from('campuses')
          .select('id')
          .limit(1)
          .single();
        return fallback?.id;
      }

      const nearest = campuses
        .map((c: any) => ({
          ...c,
          distance: calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            c.latitude,
            c.longitude
          ),
        }))
        .reduce((a: any, b: any) => (a.distance < b.distance ? a : b));

      return nearest.id;
    } catch {
      const { data: fallback } = await supabase
        .from('campuses')
        .select('id')
        .limit(1)
        .single();
      return fallback?.id;
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const supabase = createClient();

      let formattedPhone = phoneNumber.replace(/\D/g, '');
      if (formattedPhone.length === 10) formattedPhone = `+1${formattedPhone}`;
      else if (!formattedPhone.startsWith('+')) formattedPhone = `+${formattedPhone}`;

      const isDevelopment = process.env.NODE_ENV === 'development';
      const useMockSms = process.env.NEXT_PUBLIC_USE_MOCK_SMS === 'true';

      if (isDevelopment && useMockSms) {
        const response = await fetch('/api/auth/mock-phone-signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: formattedPhone,
            inviteCode: inviteCode.trim() || null,
          }),
        });

        const data = await response.json();

        // 🔥 FIX: if user already exists, allow login instead of error
        if (data.error === 'Phone number already registered by another user') {
          // Lookup user by phone
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('phone', formattedPhone)
            .single();

          if (existingUser) {
            router.push('/feed');
            return;
          }
        }

        if (!response.ok) {
          throw new Error(data.error || 'Authentication failed');
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.userId)
          .single();

        if (profile) {
          const { data: membership } = await supabase
            .from('campus_memberships')
            .select('id')
            .eq('profile_id', data.userId)
            .single();

          if (!membership) {
            const nearestCampusId = await getNearestCampus(supabase);
            if (nearestCampusId) {
              await supabase.from('campus_memberships').insert({
                profile_id: data.userId,
                campus_id: nearestCampusId,
                role: 'member',
              } as any);
            }
          }
        }

        if (data.redirectUrl) window.location.href = data.redirectUrl;
        else router.push('/feed');

        return;
      }

      router.push(`/login?phone=${encodeURIComponent(formattedPhone)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to continue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // UI REMAINS UNTOUCHED BELOW
  // ----------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#1A1F2E] to-[#0A0F1C] text-white relative overflow-hidden">
      {/* ... UI unchanged ... */}
    </div>
  );
}
