'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Settings {
  threadsAccessToken: string
  threadsUserId: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    threadsAccessToken: '',
    threadsUserId: '',
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ローカルストレージから設定を読み込む
    const savedSettings = localStorage.getItem('threadsSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
    setLoading(false)
  }, [])

  const handleSave = async () => {
    // ローカルストレージに保存
    localStorage.setItem('threadsSettings', JSON.stringify(settings))

    // APIにも保存（サーバーサイドで使用する場合）
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const handleTestConnection = async () => {
    try {
      const response = await fetch('/api/threads/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: settings.threadsAccessToken }),
      })
      const data = await response.json()
      if (data.success) {
        alert('接続成功！ユーザーID: ' + data.userId)
        setSettings({ ...settings, threadsUserId: data.userId })
      } else {
        alert('接続失敗: ' + data.error)
      }
    } catch (error) {
      alert('接続エラーが発生しました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* ナビゲーション */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            ← ホームに戻る
          </Link>
          {settings.threadsAccessToken && (
            <Link
              href="/profile"
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
            >
              プロフィールを見る
            </Link>
          )}
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Threads API 設定</h1>
            <p className="text-purple-100 mt-1">Threads APIの認証情報を設定してください</p>
          </div>

          <div className="p-6 space-y-6">
            {/* アクセストークン */}
            <div>
              <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700 mb-2">
                アクセストークン <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="accessToken"
                value={settings.threadsAccessToken}
                onChange={(e) => setSettings({ ...settings, threadsAccessToken: e.target.value })}
                placeholder="THREADS_ACCESS_TOKEN"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Threads Graph APIのアクセストークンを入力してください
              </p>
            </div>

            {/* ユーザーID */}
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                ユーザーID
              </label>
              <input
                type="text"
                id="userId"
                value={settings.threadsUserId}
                onChange={(e) => setSettings({ ...settings, threadsUserId: e.target.value })}
                placeholder="自動取得可能"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                ThreadsのユーザーID（「接続テスト」で自動取得できます）
              </p>
            </div>

            {/* ボタン群 */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                設定を保存
              </button>
              <button
                onClick={handleTestConnection}
                disabled={!settings.threadsAccessToken}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                接続テスト
              </button>
            </div>

            {/* 保存成功メッセージ */}
            {saved && (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                設定を保存しました！
              </div>
            )}

            {/* ヘルプセクション */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">💡 アクセストークンの取得方法</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li><a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Meta Graph API Explorer</a>にアクセス</li>
                <li>アプリを選択または作成</li>
                <li>ユーザーアクセストークンを取得</li>
                <li>「threads_basic」「threads_content_publish」などの権限を付与</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
