import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_API_PATHS = ['/api/auth', '/api/tasks/poll', '/api/status', '/api/projects/seed']
const PUBLIC_PAGE_PATHS = ['/login']

export function middleware(request: NextRequest) {
  const passwordHash = process.env.AUTH_PASSWORD_HASH
  // AUTH_PASSWORD_HASH が未設定の場合は認証をスキップ
  if (!passwordHash) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // パブリックな API パスはスキップ
  if (PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // ログインページはスキップ
  if (PUBLIC_PAGE_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const sessionToken = request.cookies.get('session_token')?.value

  if (!sessionToken) {
    // API リクエストは 401 を返す
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // ページリクエストはログインページにリダイレクト
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのパスにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化)
     * - favicon.ico, その他の静的アセット
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
