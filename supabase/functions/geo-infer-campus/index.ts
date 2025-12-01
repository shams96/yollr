import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5';
import { getDistance } from 'https://esm.sh/geolib@3.3.4';
import { geoCache } from '../_shared/cache.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, zip } = await req.json();
    
    // Generate cache key
    const cacheKey = geoCache.generateKey([
      'geo',
      lat ? lat.toFixed(4) : null,
      lng ? lng.toFixed(4) : null,
      zip ? `zip:${zip}` : null
    ].filter(Boolean));

    // Check cache first
    const cached = geoCache.get(cacheKey);
    if (cached) {
      const isStale = geoCache.isStale(cacheKey);
      const cacheHeaders = geoCache.getCacheHeaders(cached.etag, isStale);
      
      return new Response(
        JSON.stringify(cached.data),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            ...cacheHeaders
          },
          status: 200,
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let campuses = [];
    
    if (zip) {
      // Search by ZIP code
      const { data, error } = await supabase
        .from('campuses')
        .select('*')
        .eq('zip_code', zip)
        .limit(10);
      
      if (error) throw error;
      campuses = data || [];
    } else if (lat && lng) {
      // Search by location within 50 miles
      const radiusKm = 80.467; // 50 miles in km
      
      const { data, error } = await supabase
        .from('campuses')
        .select('*');
      
      if (error) throw error;
      
      // Filter by distance and rank by enrollment/distance
      campuses = (data || [])
        .map(campus => ({
          ...campus,
          distance: getDistance(
            { latitude: lat, longitude: lng },
            { latitude: campus.lat, longitude: campus.lng }
          ) / 1000, // Convert to km
        }))
        .filter(campus => campus.distance <= radiusKm)
        .sort((a, b) => {
          // Rank by enrollment / distance^1.5
          const scoreA = a.enrollment / Math.pow(a.distance, 1.5);
          const scoreB = b.enrollment / Math.pow(b.distance, 1.5);
          return scoreB - scoreA;
        })
        .slice(0, 3);
    } else {
      throw new Error('Either lat/lng or zip must be provided');
    }

    const result = { campuses };
    
    // Store in cache
    const etag = geoCache.set(cacheKey, result);
    const cacheHeaders = geoCache.getCacheHeaders(etag, false);

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          ...cacheHeaders
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in geoInferCampus:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});