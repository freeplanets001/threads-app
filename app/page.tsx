'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(() => {
    // 設定がされているか確認
    const settings = localStorage.getItem('threadsSettings')
    if (settings) {
      const parsed = JSON.parse(settings)
      setIsConfigured(!!parsed.threadsAccessToken)
      if (parsed.threadsUserId) {
        setUsername('設定済み')
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヒーローセクション */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Threads Manager
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            🧵 Threads APIを使った投稿管理ツール
          </p>
          <p className="text-gray-500">
            投稿の作成、管理、分析を一つのアプリで
          </p>
        </div>

        {/* 設定ステータス */}
        <div className="mb-12">
          {isConfigured ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-green-500 text-2xl mr-3">✓</span>
                <div>
                  <p className="font-medium text-green-900">API設定済み</p>
                  <p className="text-sm text-green-700">Threads APIに接続できます</p>
                </div>
              </div>
              <Link
                href="/settings"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                設定を確認
              </Link>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-yellow-500 text-2xl mr-3">⚠</span>
                <div>
                  <p className="font-medium text-yellow-900">API未設定</p>
                  <p className="text-sm text-yellow-700">まずはThreads APIの設定を行ってください</p>
                </div>
              </div>
              <Link
                href="/settings"
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                設定する
              </Link>
            </div>
          )}
        </div>

        {/* 機能カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 新規投稿 */}
          <Link
            href="/publish"
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 group"
          >
            <div className="text-4xl mb-4">✏️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
              新規投稿
            </h3>
            <p className="text-gray-600 text-sm">
              テキスト、画像、動画をThreadsに投稿
            </p>
          </Link>

          {/* 投稿管理 */}
          <Link
            href="/posts"
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 group"
          >
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
              投稿管理
            </h3>
            <p className="text-gray-600 text-sm">
              投稿の一覧、削除、返信を管理
            </p>
          </Link>

          {/* アナリティクス */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 opacity-60">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              アナリティクス
            </h3>
            <p className="text-gray-600 text-sm">
              まもなく公開...
            </p>
          </div>

          {/* スケジュール */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 opacity-60">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              予約投稿
            </h3>
            <p className="text-gray-600 text-sm">
              まもなく公開...
            </p>
          </div>
        </div>

        {/* 使い方セクション */}
        <div className="mt-16 bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 使い方</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">設定</h3>
              <p className="text-gray-600 text-sm">
                まずはThreads APIのアクセストークンを設定します
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">投稿作成</h3>
              <p className="text-gray-600 text-sm">
                テキストや画像を含む投稿を作成できます
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">管理</h3>
              <p className="text-gray-600 text-sm">
                投稿の一覧確認、削除、返信ができます
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
