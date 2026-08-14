import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Define public routes (no login required)
  const isPublicRoute = pathname.startsWith('/auth') || 
                        pathname.startsWith('/receipt') || 
                        pathname === '/' ||
                        pathname === '/home' ||
                        pathname === '/api/auth/login' || 
                        pathname === '/api/auth/register' ||
                        pathname.startsWith('/api/public') ||
                        pathname.startsWith('/api/upload');

  // If unauthenticated user lands on root /, redirect to /home
  if (!token && pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  if (!token && !isPublicRoute) {
    // Redirect to login if accessing a protected route without a token
    const url = new URL('/auth/login', request.url);
    return NextResponse.redirect(url);
  }

  if (token) {
    const payload = await verifyToken(token);
    
    if (!payload && !isPublicRoute) {
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }

    // If logged in user lands on root / or /home or auth pages, redirect to dashboard
    if (payload && (pathname === '/' || pathname === '/home' || pathname.startsWith('/auth'))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Protect super-admin route
    if (payload && pathname.startsWith('/super-admin')) {
      if (payload.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    
    // Pass user ID to API routes via headers if valid
    if (payload && pathname.startsWith('/api')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|apk|js|txt)$).*)',
  ],
};
