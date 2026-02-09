import { NextRequest, NextResponse } from 'next/server'

const THREADS_API_BASE = 'https://graph.threads.net/v1.0'

export async function DELETE(
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

    // Threads APIで投稿を削除
    const response = await fetch(`${THREADS_API_BASE}/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to delete post')
    }

    return NextResponse.json({
      success: true,
      message: '投稿を削除しました'
    })

  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '削除に失敗しました'
      },
      { status: 500 }
    )
  }
}
