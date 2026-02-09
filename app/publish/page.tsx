'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PublishPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [mediaType, setMediaType] = useState<'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL'>('TEXT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [quota, setQuota] = useState<any>(null)

  useEffect(() => {
    const settings = localStorage.getItem('threadsSettings')
    if (!settings || !JSON.parse(settings).threadsAccessToken) {
      router.push('/settings')
    } else {
      setIsConfigured(true)
      loadQuota()
    }
  }, [router])

  const loadQuota = async () => {
    const settings = JSON.parse(localStorage.getItem('threadsSettings') || '{}')
    try {
      const response = await fetch('/api/threads/limits', {
        headers: { 'Authorization': `Bearer ${settings.threadsAccessToken}` },
      })
      if (response.ok) {
        const data = await response.json()
        setQuota(data)
      }
    } catch (err) {
      console.error('Failed to load quota:', err)
    }
  }

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImageUrls([...imageUrls, imageUrlInput.trim()])
      setImageUrlInput('')
    }
  }

  const handleRemoveImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // バリデーション
    if (mediaType === 'TEXT' && !text.trim()) {
      setError('テキストを入力してください')
      return
    }
    if (mediaType === 'IMAGE' && !imageUrl) {
      setError('画像URLを入力してください')
      return
    }
    if (mediaType === 'VIDEO' && !videoUrl) {
      setError('動画URLを入力してください')
      return
    }
    if (mediaType === 'CAROUSEL' && imageUrls.length === 0) {
      setError('少なくとも1つの画像URLを入力してください')
      return
    }
    if (mediaType !== 'TEXT' && !text.trim() && !imageUrl && !videoUrl && imageUrls.length === 0) {
      setError('テキスト、画像、または動画のいずれかを入力してください')
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
      const requestBody = {
        text,
        mediaType,
        ...(mediaType === 'IMAGE' && { imageUrl }),
        ...(mediaType === 'VIDEO' && { videoUrl }),
        ...(mediaType === 'CAROUSEL' && { imageUrls }),
      }

      const publishResponse = await fetch('/api/threads/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
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
      setImageUrls([])

      // 制限情報を更新
      loadQuota()

      // 2秒後に投稿管理ページへ
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
        {/* ナビゲーション */}
        <div className="mb-4">
          <Link
            href="/"
            className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            ← ホームに戻る
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">新規投稿</h1>
          <p className="text-gray-600 mt-1">Threadsに新しい投稿を作成します</p>
        </div>

        {/* 制限情報表示 */}
        {quota && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              残り投稿可能数: <span className="font-bold">{quota.remaining_posts}</span>
              {quota.remaining_video_posts !== undefined && ` | 動画: ${quota.remaining_video_posts}`}
            </p>
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* メディアタイプ選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                投稿タイプ
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setMediaType('TEXT')}
                  className={`px-4 py-3 rounded-lg transition-colors ${
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
                  className={`px-4 py-3 rounded-lg transition-colors ${
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
                  className={`px-4 py-3 rounded-lg transition-colors ${
                    mediaType === 'VIDEO'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🎬 動画
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('CAROUSEL')}
                  className={`px-4 py-3 rounded-lg transition-colors ${
                    mediaType === 'CAROUSEL'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🎠 カルーセル
                </button>
              </div>
            </div>

            {/* テキスト入力 */}
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                テキスト {mediaType === 'TEXT' && <span className="text-red-500">*</span>}
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
                  画像URL <span className="text-red-500">*</span>
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
                  動画URL <span className="text-red-500">*</span>
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
                  公開されている動画のURLを入力してください（MP4推奨、最大15分）
                </p>
              </div>
            )}

            {/* カルーセル画像入力 */}
            {mediaType === 'CAROUSEL' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  画像URL（複数可） <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="画像URLを入力..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      追加
                    </button>
                  </div>
                  {imageUrls.length > 0 && (
                    <div className="space-y-2">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <span className="flex-1 text-sm text-gray-700 truncate">{url}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveImageUrl(index)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            削除
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {imageUrls.length} 枚の画像が追加されました（最大10枚）
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
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 0 00016zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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
                onClick={() => router.push('/posts')}
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
