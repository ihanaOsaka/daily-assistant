import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createHash, randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const passwordHash = process.env.AUTH_PASSWORD_HASH
    if (!passwordHash) {
      // 認証無効時は常に成功
      return Response.json({ ok: true })
    }

    const body = await request.json()
    const { password } = body

    if (!password || typeof password !== 'string') {
      return Response.json({ error: 'password is required' }, { status: 400 })
    }

    const inputHash = createHash('sha256').update(password).digest('hex')
    if (inputHash !== passwordHash) {
      return Response.json({ error: 'Invalid password' }, { status: 401 })
    }

    const token = randomBytes(32).toString('hex')
    const cookieStore = await cookies()
    cookieStore.set('session_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 24時間
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return Response.json({ ok: true })
  } catch (error) {
    console.error('POST /api/auth error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('session_token')
    return Response.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/auth error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
