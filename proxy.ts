import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route prefix → allowed roles
const ROLE_ROUTES: Record<string, string[]> = {
  '/admin':    ['ADMIN'],
  '/kaprodi':  ['KAPRODI'],
  '/dosen':    ['DOSEN'],
  '/mahasiswa':['MAHASISWA'],
  '/jamu':     ['JAMU'],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const role = request.cookies.get('role')?.value;

  // Not logged in → redirect to login (except login and home)
  if (!role && pathname !== '/login' && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already logged in → redirect away from login page
  if (role && pathname === '/login') {
    const redirectMap: Record<string, string> = {
      ADMIN: '/admin',
      KAPRODI: '/kaprodi',
      DOSEN: '/dosen',
      MAHASISWA: '/mahasiswa',
      JAMU: '/jamu',
    };
    return NextResponse.redirect(new URL(redirectMap[role] ?? '/', request.url));
  }

  // Check role-based access for protected routes
  if (role) {
    for (const [prefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
      if (pathname.startsWith(prefix) && !allowedRoles.includes(role)) {
        // Redirect to own dashboard
        const redirectMap: Record<string, string> = {
          ADMIN: '/admin',
          KAPRODI: '/kaprodi',
          DOSEN: '/dosen',
          MAHASISWA: '/mahasiswa',
          JAMU: '/jamu',
        };
        return NextResponse.redirect(new URL(redirectMap[role] ?? '/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
