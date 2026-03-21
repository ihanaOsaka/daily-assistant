import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const authHash = process.env.AUTH_PASSWORD_HASH;

  // 認証が設定されていなければスキップ
  if (!authHash) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // 公開パス
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/tasks/poll') ||
    pathname.startsWith('/api/status') ||
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get('session_token')?.value;
  if (!sessionToken) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
