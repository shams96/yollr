import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getDistance } from 'geolib';
import type { Database } from '@/types/database';

interface GeoInferRequest {
  latitude: number;
  longitude: number;
  zip_code?: string;
}

type CampusRow = Database['public']['Tables']['campuses']['Row'];

interface Campus extends CampusRow {
  distance_miles?: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body: GeoInferRequest = await request.json();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let campuses: Campus[] = [];
    
    // Fetch all campuses
    const { data, error } = await supabase
      .from('campuses')
      .select('*')
      .order('enrollment', { ascending: false });

    if (error) {
      console.error('Error fetching campuses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campuses' },
        { status: 500 }
      );
    }

    campuses = data || [];

    // If we have coordinates, calculate distances and sort by proximity
    if (body.latitude && body.longitude) {
      campuses = campuses
        .filter(campus => campus.latitude && campus.longitude)
        .map(campus => ({
          ...campus,
          distance_miles: getDistance(
            { latitude: body.latitude, longitude: body.longitude },
            { latitude: campus.latitude!, longitude: campus.longitude! }
          ) / 1609.34 // Convert meters to miles
        }))
        .sort((a, b) => (a.distance_miles || 0) - (b.distance_miles || 0));
    }
    // If we have ZIP code, filter by ZIP prefix
    else if (body.zip_code) {
      const zipPrefix = body.zip_code.substring(0, 3);
      campuses = campuses.filter(campus =>
        campus.zip_code?.startsWith(zipPrefix)
      );
    }

    // Return top 5 closest campuses
    const topCampuses = campuses.slice(0, 5);

    return NextResponse.json({
      campuses: topCampuses,
      location_used: body.latitude && body.longitude ? 'coordinates' : 'zip_code',
      total_found: campuses.length
    });

  } catch (error) {
    console.error('Error in geo-infer-campus:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}