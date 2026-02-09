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

    // クエリパラメータからmetricsを取得
    const { searchParams } = new URL(request.url)
    const metrics = searchParams.get('metrics') || 'views,likes,comments,quotes'

    const response = await fetch(
      `${THREADS_API_BASE}/${postId}/insights?metric=${metrics}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch insights')
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Insights error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'インサイトの取得に失敗しました'
      },
      { status: 500 }
    )
  }
}
