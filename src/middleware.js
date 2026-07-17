import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Define public routes
  const isPublicRoute = pathname.startsWith('/auth') || 
                        pathname.startsWith('/receipt') || 
                        pathname === '/api/auth/login' || 
                        pathname === '/api/auth/register' ||
                        pathname.startsWith('/api/upload'); // temporarily public until we integrate Supabase Storage with tokens if needed

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

    // If logged in and trying to access auth pages, redirect to dashboard
    if (payload && pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/', request.url));
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
