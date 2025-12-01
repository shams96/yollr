import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export const createServerClient = async () => {
  const cookieStore = await cookies();
  
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: (key: string) => {
            return cookieStore.get(key)?.value || null;
          },
          setItem: (key: string, value: string) => {
            try {
              cookieStore.set({ name: key, value });
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
          removeItem: (key: string) => {
            try {
              cookieStore.set({ name: key, value: '' });
            } catch (error) {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      },
    }
  );
};