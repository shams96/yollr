import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { handleApiError, createErrorResponse, AppError, createError } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { campus_id, cursor, limit = 10 } = await request.json();

    if (!campus_id) {
      throw createError('campus_id is required', 400, 'VALIDATION_ERROR');
    }

    // Forward to Edge Function
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/rank-feed-page`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ campus_id, cursor, limit }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw createError(
        `Edge function returned ${response.status}: ${errorText}`,
        response.status,
        'EDGE_FUNCTION_ERROR'
      );
    }

    const data = await response.json();
    return Response.json(data);

  } catch (error) {
    const { error: appError, status } = handleApiError(error);
    return createErrorResponse(appError, request);
  }
}