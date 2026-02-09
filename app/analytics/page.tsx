'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

interface Insight {
  name: string
  values: [{ value: string }]
}

interface PostWithInsights {
  post: ThreadsPost
  insights: Insight[]
  totalViews: number
  totalLikes: number
  totalComments: number
  totalQuotes: number
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [accessToken, setAccessToken] = useState<string>('')
  const [posts, setPosts] = useState<PostWithInsights[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'all'>('all')

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
    loadData()
  }, [router])

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  })

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      // 投稿一覧を取得
      const postsResponse = await fetch('/api/threads/posts', {
        headers: getAuthHeaders(),
      })

      if (!postsResponse.ok) {
        if (postsResponse.status === 401) {
          router.push('/settings')
          return
        }
        throw new Error('Failed to load posts')
      }

      const postsData = await postsResponse.json()
      const postsList = postsData.posts || []

      // 各投稿のインサイトを取得
      const postsWithInsights: PostWithInsights[] = []

      for (const post of postsList) {
        try {
          const insightsResponse = await fetch(
            `/api/threads/posts/${post.id}/insights`,
            { headers: getAuthHeaders() }
          )

          if (insightsResponse.ok) {
            const insightsData = await insightsResponse.json()
            const insights = insightsData.data || []

            // 合計値を計算
            const totalViews = Number(insights.find((i: Insight) => i.name === 'views')?.values[0]?.value || 0)
            const totalLikes = Number(insights.find((i: Insight) => i.name === 'likes')?.values[0]?.value || post.like_count || 0)
            const totalComments = Number(insights.find((i: Insight) => i.name === 'comments')?.values[0]?.value || 0)
            const totalQuotes = Number(insights.find((i: Insight) => i.name === 'quotes')?.values[0]?.value || 0)

            postsWithInsights.push({
              post,
              insights,
              totalViews,
              totalLikes,
              totalComments,
              totalQuotes,
            })
          } else {
            postsWithInsights.push({
              post,
              insights: [],
              totalViews: 0,
              totalLikes: post.like_count || 0,
              totalComments: 0,
              totalQuotes: 0,
            })
          }
        } catch (err) {
          console.error('Failed to load insights for post:', post.id)
          postsWithInsights.push({
            post,
            insights: [],
            totalViews: 0,
            totalLikes: post.like_count || 0,
            totalComments: 0,
            totalQuotes: 0,
          })
        }
      }

      setPosts(postsWithInsights)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // 統計情報を計算
  const totalStats = {
    posts: posts.length,
    views: posts.reduce((sum, p) => sum + p.totalViews, 0),
    likes: posts.reduce((sum, p) => sum + p.totalLikes, 0),
    comments: posts.reduce((sum, p) => sum + p.totalComments, 0),
    quotes: posts.reduce((sum, p) => sum + p.totalQuotes, 0),
  }

  const avgStats = posts.length > 0 ? {
    views: Math.round(totalStats.views / posts.length),
    likes: Math.round(totalStats.likes / posts.length),
    comments: Math.round(totalStats.comments / posts.length),
    quotes: Math.round(totalStats.quotes / posts.length),
  } : { views: 0, likes: 0, comments: 0, quotes: 0 }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ナビゲーション */}
        <div className="mb-4">
          <Link
            href="/"
            className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            ← ホームに戻る
          </Link>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">アナリティクス</h1>
            <p className="text-gray-600 mt-1">投稿のパフォーマンスを分析</p>
          </div>
          <button
            onClick={loadData}
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

        {loading && posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            読み込み中...
          </div>
        ) : (
          <>
            {/* 統計サマリー */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-2">📝</div>
                <div className="text-2xl font-bold text-gray-900">{totalStats.posts}</div>
                <div className="text-sm text-gray-500">総投稿数</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-2">👁️</div>
                <div className="text-2xl font-bold text-gray-900">{totalStats.views.toLocaleString()}</div>
                <div className="text-sm text-gray-500">総閲覧数</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-2">❤️</div>
                <div className="text-2xl font-bold text-gray-900">{totalStats.likes.toLocaleString()}</div>
                <div className="text-sm text-gray-500">総いいね数</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-2">💬</div>
                <div className="text-2xl font-bold text-gray-900">{totalStats.comments.toLocaleString()}</div>
                <div className="text-sm text-gray-500">総コメント数</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-2">🔄</div>
                <div className="text-2xl font-bold text-gray-900">{totalStats.quotes.toLocaleString()}</div>
                <div className="text-sm text-gray-500">総引用数</div>
              </div>
            </div>

            {/* 平均統計 */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">投稿あたりの平均</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{avgStats.views.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">平均閲覧数</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{avgStats.likes.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">平均いいね数</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{avgStats.comments.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">平均コメント数</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{avgStats.quotes.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">平均引用数</div>
                </div>
              </div>
            </div>

            {/* 投稿別インサイト */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">投稿別インサイト</h2>
              </div>
              <div className="divide-y">
                {posts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    投稿がありません
                  </div>
                ) : (
                  posts.map((item) => (
                    <div key={item.post.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start gap-4">
                        {item.post.thumbnail_url ? (
                          <img
                            src={item.post.thumbnail_url}
                            alt=""
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-2xl">
                            📄
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {item.post.text && (
                            <p className="text-gray-900 mb-2 line-clamp-2">
                              {item.post.text}
                            </p>
                          )}
                          <div className="text-sm text-gray-500 mb-3">
                            {formatDate(item.post.timestamp)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <span>👁️</span>
                              <span className="font-medium">{item.totalViews.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>❤️</span>
                              <span className="font-medium">{item.totalLikes.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>💬</span>
                              <span className="font-medium">{item.totalComments.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>🔄</span>
                              <span className="font-medium">{item.totalQuotes.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <a
                          href={item.post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700 text-sm"
                        >
                          Threadsで見る →
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
