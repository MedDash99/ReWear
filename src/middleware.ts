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
  const method = request.method; // Get the HTTP method
  const session = await getUserSession(request);

  console.log(
    `Middleware: Path: ${pathname}, Method: ${method}, Auth=${session.isAuthenticated}`
  );

  // 1. Allow static assets and Next.js specific paths (from your config.matcher effectively)
  // Your config.matcher handles this, but explicit check can be an early exit if needed, though usually matcher is enough.
  // For simplicity, assuming your matcher correctly excludes these.

  // 2. Allow critical API routes (like auth routes)
  const isCriticalApiRoute = CRITICAL_API_ROUTES.some(p => pathname.startsWith(p));
  if (isCriticalApiRoute) {
    console.log(`Middleware: Allowing critical API route ${pathname}`);
    return NextResponse.next();
  }

  // 3. Allow specific public API GET paths
  if (method === 'GET' && PUBLIC_API_GET_PATHS.includes(pathname)) {
    console.log(`Middleware: Allowing public GET access to API path: ${pathname}`);
    return NextResponse.next();
  }

  // --- Authenticated Users ---
  if (session.isAuthenticated) {
    console.log(`Middleware: User authenticated. Allowing access to ${pathname}.`);
    return NextResponse.next();
  }

  // --- Unauthenticated Users ---
  // At this point, user is NOT authenticated, AND it's not a critical API route,
  // AND it's not a public GET API path we explicitly allowed.

  const isPublicPagePath = PUBLIC_PATHS.includes(pathname);
  if (isPublicPagePath) {
    console.log(`Middleware: Unauth user, public page path ${pathname}. Allowing.`);
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