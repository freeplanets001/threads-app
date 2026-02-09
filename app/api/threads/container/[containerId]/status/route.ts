import { NextRequest, NextResponse } from 'next/server'

const THREADS_API_BASE = 'https://graph.threads.net/v1.0'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ containerId: string }> }
) {
  try {
    const { containerId } = await params

    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'アクセストークンが見つかりません' },
        { status: 401 }
      )
    }

    const response = await fetch(
      `${THREADS_API_BASE}/${containerId}?fields=status`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch container status')
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Container status error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'コンテナステータスの取得に失敗しました'
      },
      { status: 500 }
    )
  }
}
