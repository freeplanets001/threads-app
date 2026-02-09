import { NextRequest, NextResponse } from 'next/server'

const THREADS_API_BASE = 'https://graph.threads.net/v1.0'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'アクセストークンが見つかりません' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') || '25'

    const response = await fetch(
      `${THREADS_API_BASE}/${postId}/likes?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch likes')
    }

    const data = await response.json()

    return NextResponse.json({
      likes: data.data || [],
      paging: data.paging,
      total: data.data?.length || 0,
    })

  } catch (error) {
    console.error('Fetch likes error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'いいねの取得に失敗しました'
      },
      { status: 500 }
    )
  }
}
