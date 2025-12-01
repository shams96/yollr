import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// DEVELOPMENT-ONLY SMS MOCK LOGIN ENDPOINT

export async function POST(request: NextRequest) {
  // Safety: block production use
  if (
    process.env.NODE_ENV !== 'development' ||
    process.env.NEXT_PUBLIC_USE_MOCK_SMS !== 'true'
  ) {
    return NextResponse.json(
      { error: 'Mock auth only available in development' },
      { status: 403 }
    );
  }

  try {
    const { phone, inviteCode } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      );
    }

    // Supabase admin client
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

    // Pre-check existing users
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = authUsers?.users.find(
      (u) => u.phone === phone
    );

    let userId: string;
    let isNewUser = false;

    if (existingAuthUser) {
      userId = existingAuthUser.id;
      console.log(`🔁 Re-login existing user: ${phone}`);
    } else {
      // Attempt to create a new user
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          phone,
          phone_confirm: true,
          user_metadata: { phone }
        });

      // --- FIXED COLLISION LOGIC ---
      if (createError) {
        console.log(
          `⚠ createUser error: treating as existing user for phone ${phone}`
        );

        const { data: fallbackUsers } =
          await supabaseAdmin.auth.admin.listUsers({
            perPage: 2000
          });

        const fallbackUser = fallbackUsers?.users.find(
          (u) => u.phone === phone
        );

        if (!fallbackUser) {
          // Truly no user exists → real failure
          throw createError;
        }

        userId = fallbackUser.id;
        isNewUser = false;
      } else if (!newUser?.user) {
        throw new Error('Supabase user creation returned no user object');
      } else {
        // Created successfully
        userId = newUser.user.id;
        isNewUser = true;
        console.log(`🆕 New user created: ${phone}`);
      }

      // --- PROFILE SETUP (ONLY FOR NEW USERS) ---
      if (isNewUser) {
        try {
          // Handle referral code
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

          // Invite code generator
          const generateInviteCode = () => {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let code = '';
            for (let i = 0; i < 6; i++) {
              code += chars[Math.floor(Math.random() * chars.length)];
            }
            return code;
          };

          const newInvite = generateInviteCode();

          const profilePayload: any = {
            id: userId,
            username: `user${phone.slice(-4)}`,
            display_name: `User ${phone.slice(-4)}`,
            total_xp: 0,
            current_streak: 0,
            mystery_boxes_available: 1,
            phone_number: phone,
            invite_code: newInvite
          };

          if (referrerId) {
            profilePayload.referred_by = referrerId;
          }

          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert(profilePayload);

          if (profileError) {
            console.error('❌ Profile creation error:', profileError);
          }
        } catch (e) {
          console.error('❌ Profile setup failed:', e);
        }
      }
    }

    // --- CREATE LOGIN SESSION (MAGICLINK) ---
    const { data: sessionData, error: sessionError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: `phone${phone.replace(/\D/g, '')}@yollr.internal`,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/feed`
        }
      });

    if (sessionError || !sessionData) {
      throw sessionError || new Error('Failed to generate session magiclink');
    }

    return NextResponse.json({
      success: true,
      userId,
      redirectUrl: sessionData.properties.action_link
    });
  } catch (error: any) {
    console.error('🚨 Mock phone signin error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
