import { NextRequest, NextResponse } from 'next/server'

const THREADS_API_BASE = 'https://graph.threads.net/v1.0'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, text } = body

    if (!postId || !text) {
      return NextResponse.json(
        { error: '投稿IDとテキストは必須です' },
        { status: 400 }
      )
    }

    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'アクセストークンが見つかりません' },
        { status: 401 }
      )
    }

    // 返信コンテナを作成
    const containerUrl = new URL(`${THREADS_API_BASE}/${postId}/reply`)
    containerUrl.searchParams.append('media_type', 'TEXT')
    containerUrl.searchParams.append('text', text)

    const containerResponse = await fetch(containerUrl.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!containerResponse.ok) {
      const error = await containerResponse.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to create reply container')
    }

    const containerData = await containerResponse.json()

    // 返信を公開
    const publishUrl = new URL(`${THREADS_API_BASE}/${containerData.id}/threads_publish`)
    publishUrl.searchParams.append('creation_id', containerData.id)

    const publishResponse = await fetch(publishUrl.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!publishResponse.ok) {
      const error = await publishResponse.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to publish reply')
    }

    return NextResponse.json({
      success: true,
      replyId: containerData.id,
    })

  } catch (error) {
    console.error('Reply error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '返信に失敗しました'
      },
      { status: 500 }
    )
  }
}
