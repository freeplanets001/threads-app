'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ThreadsPost {
  id: string
  media_type: string
  media_url?: string
  permalink: string
  text?: string
  timestamp: string
  thumbnail_url?: string
}

export default function PostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<ThreadsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPost, setSelectedPost] = useState<ThreadsPost | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string>('')

  useEffect(() => {
    // 設定を読み込む
    const settings = localStorage.getItem('threadsSettings')
    if (!settings) {
      router.push('/settings')
      return
    }
    const parsed = JSON.parse(settings)
    if (!parsed.threadsAccessToken) {
      router.push('/settings')
      return
    }
    setAccessToken(parsed.threadsAccessToken)
    loadPosts()
  }, [router])

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  })

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    if (!accessToken) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/threads/posts', {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401) {
          router.push('/settings')
          return
        }
        throw new Error(errorData.error || 'Failed to load posts')
      }

      const data = await response.json()
      setPosts(data.posts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('この投稿を削除しますか？')) return

    setDeleteLoading(postId)

    try {
      const response = await fetch(`/api/threads/posts/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete post')
      }

      // 投稿一覧から削除
      setPosts(posts.filter(p => p.id !== postId))
      setSelectedPost(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleReply = async () => {
    if (!selectedPost || !replyText.trim()) return

    setReplyLoading(true)

    try {
      const response = await fetch('/api/threads/reply', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          postId: selectedPost.id,
          text: replyText,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to reply')
      }

      setReplyText('')
      alert('返信しました！')
    } catch (err) {
      alert(err instanceof Error ? err.message : '返信に失敗しました')
    } finally {
      setReplyLoading(false)
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">投稿管理</h1>
            <p className="text-gray-600 mt-1">あなたのThreads投稿を管理できます</p>
          </div>
          <button
            onClick={loadPosts}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300"
          >
            {loading ? '読み込み中...' : '更新'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 投稿一覧 */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                読み込み中...
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">まだ投稿がありません</p>
                <button
                  onClick={() => router.push('/publish')}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  最初の投稿を作成
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedPost?.id === post.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {post.thumbnail_url && (
                      <img
                        src={post.thumbnail_url}
                        alt=""
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      {post.text && (
                        <p className="text-gray-900 mb-2 line-clamp-2">
                          {post.text}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{formatDate(post.timestamp)}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {post.media_type === 'IMAGE' ? '🖼️ 画像' :
                           post.media_type === 'VIDEO' ? '🎬 動画' : '📝 テキスト'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 投稿詳細 */}
          <div className="lg:col-span-1">
            {selectedPost ? (
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-lg font-semibold mb-4">投稿詳細</h2>

                {selectedPost.media_url && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    {selectedPost.media_type === 'VIDEO' ? (
                      <video
                        src={selectedPost.media_url}
                        controls
                        className="w-full"
                      />
                    ) : (
                      <img
                        src={selectedPost.media_url}
                        alt=""
                        className="w-full"
                      />
                    )}
                  </div>
                )}

                {selectedPost.text && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedPost.text}
                    </p>
                  </div>
                )}

                <div className="text-sm text-gray-500 mb-4">
                  <p>投稿日時: {formatDate(selectedPost.timestamp)}</p>
                  <a
                    href={selectedPost.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    Threadsで見る →
                  </a>
                </div>

                {/* 返信入力 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    返信
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="返信を入力..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                  />
                  <button
                    onClick={handleReply}
                    disabled={replyLoading || !replyText.trim()}
                    className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                  >
                    {replyLoading ? '送信中...' : '返信する'}
                  </button>
                </div>

                {/* 削除ボタン */}
                <button
                  onClick={() => handleDelete(selectedPost.id)}
                  disabled={deleteLoading === selectedPost.id}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  {deleteLoading === selectedPost.id ? '削除中...' : 'この投稿を削除'}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                <p>投稿を選択すると詳細が表示されます</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
