import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Allow requests from mobile app
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://localhost:19000', // Expo dev server
    'http://127.0.0.1:19000',
    // Add your production app URLs here
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);

  const origin = request.headers.get('origin') || '';

  // For API routes, add CORS headers
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
