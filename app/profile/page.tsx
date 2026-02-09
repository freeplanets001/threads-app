'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ThreadsUser {
  id: string
  username: string
  threads_profile_picture_url?: string
  threads_biography?: string
  hometile_url?: string
  follower_count?: number
  following_count?: number
  is_private?: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const [accessToken, setAccessToken] = useState<string>('')
  const [user, setUser] = useState<ThreadsUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    loadUserProfile()
  }, [router])

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  })

  const loadUserProfile = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/threads/user', {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/settings')
          return
        }
        throw new Error('Failed to load user profile')
      }

      const data = await response.json()
      setUser(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プロフィールの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
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

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">プロフィール</h1>
            <p className="text-gray-600 mt-1">Threadsアカウント情報</p>
          </div>
          <button
            onClick={loadUserProfile}
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

        {loading && !user ? (
          <div className="text-center py-12 text-gray-500">
            読み込み中...
          </div>
        ) : user ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* ヘッダーセクション */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-32"></div>

            {/* プロフィール情報 */}
            <div className="px-6 pb-6">
              {/* アバター */}
              <div className="-mt-16 mb-4">
                {user.threads_profile_picture_url ? (
                  <img
                    src={user.threads_profile_picture_url}
                    alt={user.username}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-purple-100 flex items-center justify-center text-5xl">
                    👤
                  </div>
                )}
              </div>

              {/* ユーザー名 */}
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  @{user.username}
                </h2>
              </div>

              {/* バイオグラフィー */}
              {user.threads_biography && (
                <div className="mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {user.threads_biography}
                  </p>
                </div>
              )}

              {/* 統計情報 */}
              {(user.follower_count !== undefined || user.following_count !== undefined) && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {user.follower_count !== undefined && (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {user.follower_count.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">フォロワー</div>
                    </div>
                  )}
                  {user.following_count !== undefined && (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {user.following_count.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">フォロー中</div>
                    </div>
                  )}
                </div>
              )}

              {/* アカウント設定 */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">アカウント情報</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ユーザーID</span>
                    <span className="text-gray-900 font-mono">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">アカウント状態</span>
                    <span className={`font-medium ${user.is_private ? 'text-yellow-600' : 'text-green-600'}`}>
                      {user.is_private ? '🔒 非公開' : '🌐 公開'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Threadsリンク */}
              {user.hometile_url && (
                <div className="mt-6">
                  <a
                    href={user.hometile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-3 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Threadsで見る →
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>プロフィール情報が見つかりませんでした</p>
          </div>
        )}

        {/* アクセス権限に関する注意 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">ℹ️ データ取得について</h3>
          <p className="text-sm text-blue-700">
            一部の情報（フォロワー数など）は、Threads APIの権限設定によっては取得できない場合があります。
            必要な権限が有効になっているか確認してください。
          </p>
        </div>
      </div>
    </div>
  )
}
