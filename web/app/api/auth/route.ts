import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const expectedHash = process.env.AUTH_PASSWORD_HASH;
    if (!expectedHash) {
      return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { password } = body;
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    if (hash !== expectedHash) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    // トークンを環境変数に紐づけるのではなく、パスワードハッシュから派生させる
    // 簡易実装: session_token の検証は middleware で行う
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session_token');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
