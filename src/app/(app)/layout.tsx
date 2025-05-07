'use client';

import type { PropsWithChildren } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/contexts/auth-context';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // For a more complete loading UI

function ProtectedLayoutContent({ children }: PropsWithChildren) {
  const { user, loading, isFirebaseReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && isFirebaseReady) {
      // Store intended path to redirect after login, if needed
      // For now, simple redirect to login
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname, isFirebaseReady]);

  if (loading || !isFirebaseReady) {
    // Display a full-page loader or skeleton structure
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
         {/* You could use a more sophisticated skeleton loader for AppShell here */}
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // This case is usually covered by the redirect, but as a fallback,
    // or if Firebase is not ready and user is null.
    // It might show a brief "Redirecting..." or this loader again before redirect effect runs.
     return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}


export default function AppLayout({ children }: PropsWithChildren) {
  // AuthProvider is already in RootLayout, so no need to wrap here again.
  return <ProtectedLayoutContent>{children}</ProtectedLayoutContent>;
}
