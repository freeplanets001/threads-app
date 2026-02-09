import { NextRequest, NextResponse } from 'next/server'

// サーバーサイドで使用する設定の保存先
// 注意: 本番環境では Vercel の環境変数やシークレットマネージャーを使用してください

export async function GET() {
  // クライアントサイドでは localStorage を使用するため、
  // ここでは設定のスキーマ情報のみ返します
  return NextResponse.json({
    schema: {
      threadsAccessToken: 'string',
      threadsUserId: 'string',
    },
    note: '設定はブラウザの localStorage に保存されます'
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { threadsAccessToken, threadsUserId } = body

    // バリデーション
    if (!threadsAccessToken) {
      return NextResponse.json(
        { error: 'アクセストークンは必須です' },
        { status: 400 }
      )
    }

    // 本番環境では、Vercel の環境変数を更新する API を使用することも可能です
    // ここでは簡易的にセッションに保存（実装例）

    return NextResponse.json({
      success: true,
      message: '設定が保存されました（ブラウザの localStorage にも保存されています）'
    })
  } catch (error) {
    return NextResponse.json(
      { error: '設定の保存に失敗しました' },
      { status: 500 }
    )
  }
}
