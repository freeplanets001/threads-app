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
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || 'Failed to get user ID')
  }

  const data = await response.json()
  return data.id
}

async function createContainer(
  userId: string,
  accessToken: string,
  mediaType: 'TEXT' | 'IMAGE' | 'VIDEO',
  text?: string,
  imageUrl?: string,
  videoUrl?: string
): Promise<string> {
  const url = new URL(`${THREADS_API_BASE}/${userId}/threads`)
  url.searchParams.append('media_type', mediaType)

  if (text) {
    url.searchParams.append('text', text)
  }
  if (mediaType === 'IMAGE' && imageUrl) {
    url.searchParams.append('image_url', imageUrl)
  }
  if (mediaType === 'VIDEO' && videoUrl) {
    url.searchParams.append('video_url', videoUrl)
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || 'Failed to create container')
  }

  const data = await response.json()
  return data.id
}

async function publishContainer(
  userId: string,
  accessToken: string,
  containerId: string
): Promise<{ id: string }> {
  const url = new URL(`${THREADS_API_BASE}/${userId}/threads_publish`)
  url.searchParams.append('creation_id', containerId)

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || 'Failed to publish')
  }

  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, imageUrl, videoUrl, mediaType } = body

    // クライアントから送信されたアクセストークンを取得
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

    // コンテナを作成
    const containerId = await createContainer(
      userId,
      accessToken,
      mediaType,
      text,
      imageUrl,
      videoUrl
    )

    // コンテナを公開
    const result = await publishContainer(userId, accessToken, containerId)

    return NextResponse.json({
      success: true,
      postId: result.id,
      containerId,
    })

  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '投稿に失敗しました'
      },
      { status: 500 }
    )
  }
}
