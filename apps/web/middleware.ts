import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const API_URL = process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:3001";
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

interface JWTPayload {
  id: string;
  name: string;
  email: string;
  iat: number;
  exp: number;
}

export async function middleware(request: NextRequest) {
  try {
    // Get token from cookie
    const authToken = request.cookies.get('auth-token');
    
    // No token? Redirect to signin
    if (!authToken) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    
    // Verify JWT directly - NO API CALLS!
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(authToken.value, secret) as { payload: JWTPayload };
    
    // Check payload has required fields
    if (!payload.id || !payload.email) {
      throw new Error('Invalid token payload');
    }
    
    // ✅ Token is valid - let them through!
    return NextResponse.next();
    
  } catch (error) {
    // ❌ JWT verification failed - redirect to signin
    console.log('JWT verification failed:', error);
    return NextResponse.redirect(new URL('/signin', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - signin, signup (auth pages)
     * - page (home page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|signin|signup).*)',
  ],
}; 