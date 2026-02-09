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
  like_count?: number
}

interface Like {
  id: string
  username: string
}

interface Reply {
  id: string
  text?: string
  username: string
  timestamp: string
}

interface Insight {
  name: string
  values: [{ value: string }]
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

  // 新規追加の状態
  const [likes, setLikes] = useState<Like[]>([])
  const [replies, setReplies] = useState<Reply[]>([])
  const [likesLoading, setLikesLoading] = useState(false)
  const [repliesLoading, setRepliesLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'likes' | 'replies' | 'insights'>('details')
  const [insights, setInsights] = useState<Insight[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [quota, setQuota] = useState<any>(null)

  useEffect(() => {
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
    loadQuota()
  }, [router])

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  })

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

  const loadQuota = async () => {
    if (!accessToken) return

    try {
      const response = await fetch('/api/threads/limits', {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setQuota(data)
      }
    } catch (err) {
      console.error('Failed to load quota:', err)
    }
  }

  const loadLikes = async (postId: string) => {
    setLikesLoading(true)
    try {
      const response = await fetch(`/api/threads/posts/${postId}/likes`, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setLikes(data.likes || [])
      }
    } catch (err) {
      console.error('Failed to load likes:', err)
    } finally {
      setLikesLoading(false)
    }
  }

  const loadReplies = async (postId: string) => {
    setRepliesLoading(true)
    try {
      const response = await fetch(`/api/threads/posts/${postId}/replies`, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setReplies(data.replies || [])
      }
    } catch (err) {
      console.error('Failed to load replies:', err)
    } finally {
      setRepliesLoading(false)
    }
  }

  const handlePostSelect = (post: ThreadsPost) => {
    setSelectedPost(post)
    setActiveTab('details')
    setLikes([])
    setReplies([])
    setInsights([])
    // 自動的にいいねと返信を読み込む
    loadLikes(post.id)
    loadReplies(post.id)
  }

  const loadInsights = async (postId: string) => {
    setInsightsLoading(true)
    try {
      const response = await fetch(`/api/threads/posts/${postId}/insights`, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setInsights(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load insights:', err)
    } finally {
      setInsightsLoading(false)
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
      // 返信一覧を再読み込み
      if (selectedPost) {
        loadReplies(selectedPost.id)
      }
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

  const getMediaTypeEmoji = (type: string) => {
    switch (type) {
      case 'IMAGE': return '🖼️'
      case 'VIDEO': return '🎬'
      case 'CAROUSEL': return '🎠'
      case 'TEXT': return '📝'
      default: return '📄'
    }
  }

  const getInsightLabel = (name: string) => {
    switch (name) {
      case 'views': return '👁️ 閲覧数'
      case 'likes': return '❤️ いいね'
      case 'comments': return '💬 コメント'
      case 'quotes': return '🔄 引用'
      case 'replies': return '↩️ 返信'
      default: return name
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">投稿管理</h1>
            <p className="text-gray-600 mt-1">あなたのThreads投稿を管理できます</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadPosts}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300"
            >
              {loading ? '読み込み中...' : '更新'}
            </button>
            <button
              onClick={() => router.push('/publish')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              新規投稿
            </button>
          </div>
        </div>

        {/* 制限情報表示 */}
        {quota && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">投稿制限</p>
                <p className="text-sm text-blue-700">
                  残り: {quota.remaining_posts} / {quota.quota?.threads_post_cap_quota || 'N/A'} 投稿
                  {quota.remaining_video_posts !== undefined && ` | 動画: ${quota.remaining_video_posts} / ${quota.quota?.threads_video_post_cap_quota || 'N/A'}`}
                </p>
              </div>
              <button
                onClick={loadQuota}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                更新
              </button>
            </div>
          </div>
        )}

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
                  onClick={() => handlePostSelect(post)}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedPost?.id === post.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {post.thumbnail_url ? (
                      <img
                        src={post.thumbnail_url}
                        alt=""
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-3xl">
                        {getMediaTypeEmoji(post.media_type)}
                      </div>
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
                          {getMediaTypeEmoji(post.media_type)} {post.media_type}
                        </span>
                        {post.like_count !== undefined && (
                          <span className="flex items-center gap-1">
                            ❤️ {post.like_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 投稿詳細パネル */}
          <div className="lg:col-span-1">
            {selectedPost ? (
              <div className="bg-white rounded-lg shadow sticky top-4">
                {/* タブ */}
                <div className="flex border-b">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-4 py-3 font-medium text-sm ${
                      activeTab === 'details'
                        ? 'border-b-2 border-purple-500 text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    詳細
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('likes')
                      if (likes.length === 0) loadLikes(selectedPost.id)
                    }}
                    className={`px-4 py-3 font-medium text-sm ${
                      activeTab === 'likes'
                        ? 'border-b-2 border-purple-500 text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    いいね {likes.length > 0 && `(${likes.length})`}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('replies')
                      if (replies.length === 0) loadReplies(selectedPost.id)
                    }}
                    className={`px-4 py-3 font-medium text-sm ${
                      activeTab === 'replies'
                        ? 'border-b-2 border-purple-500 text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    返信 {replies.length > 0 && `(${replies.length})`}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('insights')
                      if (insights.length === 0) loadInsights(selectedPost.id)
                    }}
                    className={`px-4 py-3 font-medium text-sm ${
                      activeTab === 'insights'
                        ? 'border-b-2 border-purple-500 text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    インサイト
                  </button>
                </div>

                <div className="p-4">
                  {/* 詳細タブ */}
                  {activeTab === 'details' && (
                    <>
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
                    </>
                  )}

                  {/* いいねタブ */}
                  {activeTab === 'likes' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">いいね一覧</h3>
                      {likesLoading ? (
                        <div className="text-center py-4 text-gray-500">
                          読み込み中...
                        </div>
                      ) : likes.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          まだいいねがありません
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {likes.map((like) => (
                            <div
                              key={like.id}
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                            >
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                👤
                              </div>
                              <span className="text-sm text-gray-700">{like.username}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => loadLikes(selectedPost.id)}
                        className="mt-3 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        更新
                      </button>
                    </div>
                  )}

                  {/* 返信タブ */}
                  {activeTab === 'replies' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">返信一覧</h3>
                      {repliesLoading ? (
                        <div className="text-center py-4 text-gray-500">
                          読み込み中...
                        </div>
                      ) : replies.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          まだ返信がありません
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-gray-900">
                                  @{reply.username}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(reply.timestamp)}
                                </span>
                              </div>
                              {reply.text && (
                                <p className="text-sm text-gray-700">{reply.text}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => loadReplies(selectedPost.id)}
                        className="mt-3 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        更新
                      </button>
                    </div>
                  )}

                  {/* インサイトタブ */}
                  {activeTab === 'insights' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">インサイト</h3>
                      {insightsLoading ? (
                        <div className="text-center py-4 text-gray-500">
                          読み込み中...
                        </div>
                      ) : insights.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          インサイトデータがありません
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {insights.map((insight, index) => (
                            <div
                              key={index}
                              className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                            >
                              <span className="text-sm text-gray-700 capitalize">
                                {getInsightLabel(insight.name)}
                              </span>
                              <span className="font-semibold text-purple-600">
                                {insight.values[0]?.value || '0'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => loadInsights(selectedPost.id)}
                        className="mt-3 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        更新
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 sticky top-4">
                <p>投稿を選択すると詳細が表示されます</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
