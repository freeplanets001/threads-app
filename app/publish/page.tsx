'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PublishPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [mediaType, setMediaType] = useState<'TEXT' | 'IMAGE' | 'VIDEO'>('TEXT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    const settings = localStorage.getItem('threadsSettings')
    if (!settings || !JSON.parse(settings).threadsAccessToken) {
      router.push('/settings')
    } else {
      setIsConfigured(true)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!text.trim() && !imageUrl && !videoUrl) {
      setError('テキスト、画像URL、または動画URLのいずれかを入力してください')
      return
    }

    setLoading(true)

    try {
      const settings = JSON.parse(localStorage.getItem('threadsSettings') || '{}')
      const accessToken = settings.threadsAccessToken
      const userId = settings.threadsUserId

      if (!userId) {
        // まずユーザーIDを取得
        const userResponse = await fetch('/api/threads/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken }),
        })
        if (!userResponse.ok) {
          throw new Error('ユーザー情報の取得に失敗しました')
        }
        const userData = await userResponse.json()
        localStorage.setItem('threadsSettings', JSON.stringify({
          ...settings,
          threadsUserId: userData.userId,
        }))
      }

      // 投稿を作成
      const publishResponse = await fetch('/api/threads/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          text,
          imageUrl,
          videoUrl,
          mediaType,
        }),
      })

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json().catch(() => ({}))
        throw new Error(errorData.error || '投稿に失敗しました')
      }

      const result = await publishResponse.json()
      setSuccess(true)
      setText('')
      setImageUrl('')
      setVideoUrl('')

      // 3秒後に投稿管理ページへ
      setTimeout(() => {
        router.push('/posts')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">新規投稿</h1>
          <p className="text-gray-600 mt-1">Threadsに新しい投稿を作成します</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* メディアタイプ選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                投稿タイプ
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setMediaType('TEXT')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    mediaType === 'TEXT'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📝 テキスト
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('IMAGE')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    mediaType === 'IMAGE'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🖼️ 画像
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('VIDEO')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    mediaType === 'VIDEO'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🎬 動画
                </button>
              </div>
            </div>

            {/* テキスト入力 */}
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                テキスト
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="投稿内容を入力してください..."
                rows={5}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <p className="mt-1 text-sm text-gray-500 text-right">
                {text.length} / 500
              </p>
            </div>

            {/* 画像URL入力 */}
            {mediaType === 'IMAGE' && (
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  画像URL
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  公開されている画像のURLを入力してください
                </p>
                {imageUrl && (
                  <div className="mt-3">
                    <img
                      src={imageUrl}
                      alt="プレビュー"
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                      onError={() => setError('画像を読み込めませんでした')}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 動画URL入力 */}
            {mediaType === 'VIDEO' && (
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  動画URL
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  公開されている動画のURLを入力してください（MP4推奨）
                </p>
              </div>
            )}

            {/* エラーメッセージ */}
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* 成功メッセージ */}
            {success && (
              <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                投稿しました！投稿管理ページに移動します...
              </div>
            )}

            {/* ボタン */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? '投稿中...' : '投稿する'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
