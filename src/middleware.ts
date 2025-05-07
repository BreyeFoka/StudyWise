import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// This middleware example assumes you are storing the auth token in a cookie.
// Firebase client SDK manages auth state in IndexedDB and communicates this to the server
// typically via an ID token sent in Authorization headers for API requests,
// or through a server-side session cookie if using Firebase Admin SDK for session management.

// For Next.js App Router with client-side Firebase Auth, protection is usually handled
// in a layout or page component using `useAuth` hook as implemented in `src/app/(app)/layout.tsx`.
// A dedicated middleware like this for page route protection is more common with server-side sessions.

// If you were to use server-side sessions with Firebase (e.g., using Firebase Admin SDK to mint session cookies):
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // List of public paths that don't require authentication
  const publicPaths = ['/login', '/signup', '/']; // Add other public paths like /about, /pricing etc.

  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => pathname === path || (path !== '/' && pathname.startsWith(path + '/')));


  // The actual token check would involve verifying a session cookie or token.
  // For this example, we'll assume client-side auth handles redirection,
  // so this middleware might be more for API route protection or advanced scenarios.
  // const sessionToken = request.cookies.get('__session')?.value;

  // Example: If trying to access a protected app route without a session
  // if (!isPublicPath && !sessionToken && pathname.startsWith('/dashboard')) { // Or any other protected root like /app
  //   const loginUrl = new URL('/login', request.url);
  //   loginUrl.searchParams.set('redirect', pathname);
  //   return NextResponse.redirect(loginUrl);
  // }

  // Example: If trying to access auth pages while already logged in (with a session)
  // if ((pathname === '/login' || pathname === '/signup') && sessionToken) {
  //    // Verify sessionToken with Firebase Admin SDK if this was a server-side session
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }


  // For now, this middleware doesn't do active redirection for page routes
  // as `src/app/(app)/layout.tsx` handles it client-side.
  // If you implement server-side session cookies with Firebase Admin, this is where you'd check them.
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (static assets folder)
     * - images (public images folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|images).*)',
  ],
};
