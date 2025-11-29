import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint is ONLY for development/testing with mock SMS
// Uses service role key to create sessions without OTP verification

export async function POST(request: NextRequest) {
  // Only allow in development with mock SMS enabled
  if (process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_USE_MOCK_SMS !== 'true') {
    return NextResponse.json({ error: 'Mock auth only available in development' }, { status: 403 });
  }

  try {
    const { phone, inviteCode } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // First check if auth user exists with this phone
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = authUsers?.users.find(u => u.phone === phone);

    let userId: string;
    let isNewUser = false;

    if (existingAuthUser) {
      // Existing user - just login
      userId = existingAuthUser.id;
      console.log(`✅ Existing user login: ${phone}`);
    } else {
      // New user - create auth user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        phone,
        phone_confirm: true, // Auto-confirm phone in development
        user_metadata: {
          phone
        }
      });

      if (createError || !newUser.user) {
        throw createError || new Error('Failed to create user');
      }

      userId = newUser.user.id;
      isNewUser = true;
      console.log(`🆕 New user created: ${phone}`);

      // Only create profile for new users
      try {
        // Look up referrer by invite code if provided
        let referrerId: string | null = null;
        if (inviteCode?.trim()) {
          const { data: referrer } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('invite_code', inviteCode.toUpperCase().trim())
            .single();

          if (referrer) {
            referrerId = referrer.id;
          }
        }

        // Generate unique invite code
        const generateInviteCode = () => {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          let code = '';
          for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return code;
        };

        const userInviteCode = generateInviteCode();

        // Create profile with all fields (works if migration is applied)
        const profileData: any = {
          id: userId,
          username: `user${phone.slice(-4)}`,
          display_name: `User ${phone.slice(-4)}`,
          total_xp: 0,
          current_streak: 0,
          mystery_boxes_available: 1,
        };

        // Add new fields if migration is applied
        profileData.phone_number = phone;
        profileData.invite_code = userInviteCode;
        if (referrerId) {
          profileData.referred_by = referrerId;
        }

        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert(profileData);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw - allow login even if profile creation fails
          console.log('⚠️ Profile creation failed, but user can still login');
        }
      } catch (err) {
        console.error('Profile setup error:', err);
        // Don't block login if profile creation fails
      }
    }

    // Create session for this user
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `phone${phone.replace(/\D/g, '')}@yollr.internal`, // Internal placeholder, not used
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'}/feed`
      }
    });

    if (sessionError || !sessionData) {
      throw sessionError || new Error('Failed to create session');
    }

    return NextResponse.json({
      success: true,
      userId,
      // Return the magic link URL which contains the access token
      redirectUrl: sessionData.properties.action_link
    });

  } catch (error: any) {
    console.error('Mock phone signin error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
