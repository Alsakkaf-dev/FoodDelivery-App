import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Refreshes the auth session and guards role-scoped route groups (FR-S-12).
// Fine-grained authorization is re-checked in server actions (RBAC) and the DB (RLS).
export async function middleware(request: NextRequest) {
  const { response, supabase, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const isOperator = path.startsWith('/operator');
  const isRider = path.startsWith('/rider');
  const needsAuth = isOperator || isRider || path.startsWith('/checkout') || path.startsWith('/history');

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  if ((isOperator || isRider) && user && supabase) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    const role = profile?.role;
    if (isOperator && role !== 'operator') return NextResponse.redirect(new URL('/', request.url));
    if (isRider && role !== 'rider') return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons|.*\\.png$).*)'],
};
