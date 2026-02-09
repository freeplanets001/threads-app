import { NextRequest, NextResponse } from 'next/server'

const THREADS_API_BASE = 'https://graph.threads.net/v1.0'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accessToken } = body

    if (!accessToken) {
      return NextResponse.json(
        { error: 'アクセストークンは必須です' },
        { status: 400 }
      )
    }

    // Threads API でユーザー情報を取得してテスト
    const response = await fetch(
      `${THREADS_API_BASE}/me?fields=id,username`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: 'Threads API への接続に失敗しました',
          details: errorData.error?.message || response.statusText
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      userId: data.id,
      username: data.username,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: '接続エラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
