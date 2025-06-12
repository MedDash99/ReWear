// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Internationalization settings
const locales = ['en', 'fr'];
const defaultLocale = 'en';

// Authentication settings
const LOGIN_PATH = '/'; // Assuming your login page is at the root
const PUBLIC_PATHS = ['/', '/about', '/pricing']; // Your existing public page paths

// Helper to get the locale from the request
function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || '';
  const preferredLanguages = acceptLanguage
    .split(',')
    .map((lang) => lang.split(';')[0].trim());

  for (const lang of preferredLanguages) {
    if (locales.includes(lang)) {
      return lang;
    }
  }
  return defaultLocale;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Skip API routes entirely - they should not have locale prefixes ---
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // --- 1. Handle Locale Detection and Redirection ---
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    const newPath = `/${locale}${pathname === '/' ? '' : pathname}`;
    const url = new URL(newPath, request.url);
    return NextResponse.redirect(url);
  }

  // --- 2. Handle Authentication for localized routes ---
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;
  const locale = pathname.split('/')[1];
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
  
  // Check if the path (without locale) is public
  const isPublicPath = PUBLIC_PATHS.includes(pathWithoutLocale);

  // If user is authenticated or it's a public page, let them proceed
  if (isAuthenticated || isPublicPath) {
    return NextResponse.next();
  }

  // If it's not a public page and user is not authenticated, redirect to login
  const loginUrl = new URL(`/${locale}${LOGIN_PATH === '/' ? '' : LOGIN_PATH}`, request.url);
  if (pathWithoutLocale !== LOGIN_PATH) {
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.href);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next), API routes, and static files
    '/((?!_next/static|_next/image|favicon.ico|images|assets|api|.*\\.(?:png|jpg|jpeg|gif|svg|webmanifest)$).*)',
  ],
};