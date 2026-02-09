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

    const response = await fetch(
      `${THREADS_API_BASE}/me/threads/config`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch limits')
    }

    const data = await response.json()

    return NextResponse.json({
      quota: data.config || {},
      usage: data.quota_usage || {},
      remaining_posts: data.config?.threads_post_cap_quota - (data.quota_usage?.threads_post_cap_quota || 0),
      remaining_video_posts: data.config?.threads_video_post_cap_quota - (data.quota_usage?.threads_video_post_cap_quota || 0),
    })

  } catch (error) {
    console.error('Fetch limits error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '制限情報の取得に失敗しました'
      },
      { status: 500 }
    )
  }
}
