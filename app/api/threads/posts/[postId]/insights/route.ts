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
    const metrics = searchParams.get('metrics') || 'views,likes,comments'

    console.log(`Fetching insights for post ${postId} with metrics: ${metrics}`)

    const response = await fetch(
      `${THREADS_API_BASE}/${postId}/insights?metric=${metrics}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    const responseText = await response.text()
    console.log(`Insights response status: ${response.status}`)
    console.log(`Insights response: ${responseText.substring(0, 200)}`)

    if (!response.ok) {
      const error = responseText ? JSON.parse(responseText) : {}
      const errorMessage = error.error?.message || error.error?.code || 'Failed to fetch insights'
      console.error('Insights API error:', error)
      return NextResponse.json(
        {
          error: errorMessage,
          data: [],
        },
        { status: response.status }
      )
    }

    const data = JSON.parse(responseText)

    // Threads APIのレスポンス構造に対応
    // data が直接配列の場合と data.data が配列の場合がある
    const insightsData = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : [])

    return NextResponse.json({
      data: insightsData,
    })

  } catch (error) {
    console.error('Insights error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'インサイトの取得に失敗しました',
        data: [],
      },
      { status: 500 }
    )
  }
}
