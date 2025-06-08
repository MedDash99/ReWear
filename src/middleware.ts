// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const LOGIN_PATH = '/'; // Assuming your login page is at the root
const PUBLIC_PATHS = ['/', '/about', '/pricing']; // Your existing public page paths
const CRITICAL_API_ROUTES = ['/api/auth/'];
// Define /api/products as a specific public API endpoint for GET requests
const PUBLIC_API_GET_PATHS = ['/api/products']; // New constant

const secret = process.env.NEXTAUTH_SECRET;

interface UserSessionInfo {
  isAuthenticated: boolean;
  userId: string | null;
}

async function getUserSession(request: NextRequest): Promise<UserSessionInfo> {
  const token = await getToken({ req: request, secret: secret });

  if (!token) {
    return { isAuthenticated: false, userId: null };
  }

  const userId = token.sub || token.userId as string | null; // Use token.sub as a common default for ID
  return {
    isAuthenticated: true,
    userId: userId,
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const session = await getUserSession(request);

  // Only log in development and for specific debugging needs
  // console.log(`Middleware: Path: ${pathname}, Method: ${method}, Auth=${session.isAuthenticated}`);

  // --- Public API Access Control ---
  // 2. Allow critical API routes (like auth routes)
  const isCriticalApiRoute = CRITICAL_API_ROUTES.some(p => pathname.startsWith(p));
  if (isCriticalApiRoute) {
    return NextResponse.next();
  }

  // 3. Allow specific public API GET paths
  if (method === 'GET' && PUBLIC_API_GET_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // --- Authenticated Users ---
  if (session.isAuthenticated) {
    return NextResponse.next();
  }

  // --- Unauthenticated Users ---
  const isPublicPagePath = PUBLIC_PATHS.includes(pathname);
  if (isPublicPagePath) {
    return NextResponse.next();
  }

  // If it's not a public page and user is not authenticated, redirect to login.
  console.log(`Middleware: Unauth user, protected path ${pathname}. Redirecting to ${LOGIN_PATH}`);
  const loginUrl = new URL(LOGIN_PATH, request.url);
  if (pathname !== LOGIN_PATH && !pathname.startsWith('/_next')) { // Avoid callbackUrl for static assets or if already on login
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.href);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:png|jpg|jpeg|gif|svg|webmanifest)$).*)',
  ],
};