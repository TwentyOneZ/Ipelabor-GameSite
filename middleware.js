import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'ipelabor_secret_key_12345_super_secure_nextjs_custom_jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Paths requiring authentication
  const isAdminPath = pathname.startsWith('/admin');
  const isAccountantPath = pathname.startsWith('/portal');
  const isProfilePath = pathname.startsWith('/profile');
  const isLoginPath = pathname.startsWith('/login');

  if (isAdminPath || isAccountantPath || isProfilePath) {
    if (!token) {
      // Redirect to login page if no token found
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = await verifyJWT(token, JWT_SECRET);
    if (!payload) {
      // Clear invalid cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }

    // Role-based protection
    if (isAdminPath && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/portal', request.url));
    }

    if (isAccountantPath && payload.role !== 'CONTADOR') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Redirect authenticated users trying to access login
  if (isLoginPath && token) {
    const payload = await verifyJWT(token, JWT_SECRET);
    if (payload) {
      if (payload.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else {
        return NextResponse.redirect(new URL('/portal', request.url));
      }
    }
  }

  return NextResponse.next();
}

// Config to target specific routes
export const config = {
  matcher: ['/admin/:path*', '/portal/:path*', '/profile/:path*', '/login'],
};
