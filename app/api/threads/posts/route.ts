import { NextRequest, NextResponse } from 'next/server'

const THREADS_API_BASE = 'https://graph.threads.net/v1.0'

async function getUserId(accessToken: string): Promise<string> {
  const response = await fetch(
    `${THREADS_API_BASE}/me?fields=id`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Get user ID error:', response.status, errorText)
    let error: { error?: { message?: string } } = {}
    try {
      error = JSON.parse(errorText)
    } catch {
      // JSON解析失敗時は空オブジェクトを使用
    }
    throw new Error(error.error?.message || `Failed to get user ID (${response.status})`)
  }

  const data = await response.json()
  return data.id
}

export async function GET(request: NextRequest) {
  try {
    // 現在の実装では、ローカルストレージから設定を取得できないため、
    // クライアントサイドからアクセストークンを受け取る必要があります
    // ヘッダーから取得を試みます

    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'アクセストークンが見つかりません。設定を確認してください。' },
        { status: 401 }
      )
    }

    // ユーザーIDを取得
    const userId = await getUserId(accessToken)

    // 投稿一覧を取得
    const fields = 'id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,thumbnail_url,children,like_count'
    const response = await fetch(
      `${THREADS_API_BASE}/${userId}/threads?fields=${fields}&limit=25`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Fetch threads error:', response.status, errorText)
      let error: { error?: { message?: string } } = {}
      try {
        error = JSON.parse(errorText)
      } catch {
        // JSON解析失敗時は空オブジェクトを使用
      }
      throw new Error(error.error?.message || `Failed to fetch posts (${response.status})`)
    }

    const data = await response.json()

    return NextResponse.json({
      posts: data.data || [],
      paging: data.paging,
    })

  } catch (error) {
    console.error('Fetch posts error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '投稿の取得に失敗しました'
      },
      { status: 500 }
    )
  }
}
