import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ErrorDisplay } from '@/components/error/ErrorDisplay';

async function getSessionData() {
  const supabase = await createServerClient();
  return supabase.auth.getSession();
}

export default async function HomePage() {
  return (
    <ErrorBoundary
      fallback={<ErrorDisplay error={null} title="Authentication Error" message="Unable to verify your session. Please try again." />}
    >
      <HomePageContent />
    </ErrorBoundary>
  );
}

async function HomePageContent() {
  try {
    const { data: { session } } = await getSessionData();

    if (session) {
      redirect('/feed');
    } else {
      redirect('/login');
    }
  } catch (error) {
    console.error('Error in HomePage:', error);
    return <ErrorDisplay error={error as Error} title="Session Error" message="Unable to load your session. Please try again." />;
  }
}