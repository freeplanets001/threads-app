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
    const fields = searchParams.get('fields') || 'id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,thumbnail_url'

    const response = await fetch(
      `${THREADS_API_BASE}/${postId}/replies?fields=${fields}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch replies')
    }

    const data = await response.json()

    return NextResponse.json({
      replies: data.data || [],
      paging: data.paging,
    })

  } catch (error) {
    console.error('Fetch replies error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '返信の取得に失敗しました'
      },
      { status: 500 }
    )
  }
}
