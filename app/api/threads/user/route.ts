import { NextRequest, NextResponse } from 'next/server'

const THREADS_API_BASE = 'https://graph.threads.net/v1.0'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'アクセストークンが見つかりません' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const fields = searchParams.get('fields') || 'id,username,threads_profile_picture_url,threads_biography,hometile_url'

    const response = await fetch(
      `${THREADS_API_BASE}/me?fields=${fields}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch user')
    }

    return NextResponse.json(await response.json())

  } catch (error) {
    console.error('Fetch user error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'ユーザー情報の取得に失敗しました'
      },
      { status: 500 }
    )
  }
}
