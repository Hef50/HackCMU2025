import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/types';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Allow access to public routes
  const publicRoutes = ['/login', '/signup', '/auth', '/onboarding'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // If user is not authenticated and trying to access protected routes
  if (!session && !isPublicRoute && pathname !== '/') {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated, check onboarding status for dashboard routes
  if (session && pathname.startsWith('/dashboard')) {
    try {
      // Get user profile to check tutorial completion status
      const { data: user, error } = await supabase
        .from('users')
        .select('has_completed_tutorial')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // If we can't fetch user data, redirect to login
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/login';
        return NextResponse.redirect(redirectUrl);
      }

      // If user hasn't completed tutorial, redirect to onboarding
      if (!user.has_completed_tutorial) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/onboarding';
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Middleware error:', error);
      // On error, redirect to login for safety
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If user is authenticated and completed onboarding but trying to access onboarding
  if (session && pathname === '/onboarding') {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('has_completed_tutorial')
        .eq('id', session.user.id)
        .single();

      if (!error && user.has_completed_tutorial) {
        // User has already completed onboarding, redirect to dashboard
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/dashboard';
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Middleware error checking onboarding status:', error);
      // Continue to onboarding page on error
    }
  }

  // If user is authenticated and on root path, redirect appropriately
  if (session && pathname === '/') {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('has_completed_tutorial')
        .eq('id', session.user.id)
        .single();

      const redirectUrl = req.nextUrl.clone();
      
      if (error || !user.has_completed_tutorial) {
        redirectUrl.pathname = '/onboarding';
      } else {
        redirectUrl.pathname = '/dashboard';
      }
      
      return NextResponse.redirect(redirectUrl);
    } catch (error) {
      console.error('Middleware error on root redirect:', error);
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/onboarding';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
