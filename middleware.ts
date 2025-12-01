import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  maxRequests: 60, // 60 requests per minute per IP
};

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT.maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  const path = request.nextUrl.pathname;
  
  // Rate limiting for API routes
  if (path.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }
  
  // Protected routes
  const protectedRoutes = ['/feed', '/heist', '/squads', '/capture', '/profile'];
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Auth routes (redirect if already logged in)
  const authRoutes = ['/login', '/verify-otp'];
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));
  
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }
  
  // Add campus context to requests
  const response = NextResponse.next();
  
  if (session) {
    // Get user's active campus membership
    const { data: membership } = await supabase
      .from('campus_memberships')
      .select('campus_id')
      .eq('user_id', session.user.id)
      .is('left_at', null)
      .single();
    
    if (membership?.campus_id) {
      response.headers.set('x-campus-id', membership.campus_id);
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};