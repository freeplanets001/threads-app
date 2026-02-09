'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    // 設定がされているか確認
    const settings = localStorage.getItem('threadsSettings')
    if (settings) {
      const parsed = JSON.parse(settings)
      setIsConfigured(!!parsed.threadsAccessToken)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヒーローセクション */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
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
        <div className="mb-10">
          {isConfigured ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-green-500 text-3xl leading-none">✓</span>
                <div>
                  <p className="font-semibold text-green-900">API設定済み</p>
                  <p className="text-sm text-green-700">Threads APIに接続できます</p>
                </div>
              </div>
              <Link
                href="/settings"
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
              >
                設定を確認
              </Link>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-yellow-500 text-3xl leading-none">⚠</span>
                <div>
                  <p className="font-semibold text-yellow-900">API未設定</p>
                  <p className="text-sm text-yellow-700">まずはThreads APIの設定を行ってください</p>
                </div>
              </div>
              <Link
                href="/settings"
                className="px-5 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium whitespace-nowrap"
              >
                設定する
              </Link>
            </div>
          )}
        </div>

        {/* 機能カード */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {/* 新規投稿 */}
          <Link
            href="/publish"
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 group"
          >
            <div className="text-4xl mb-4 flex justify-center">✏️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors text-center">
              新規投稿
            </h3>
            <p className="text-gray-600 text-sm text-center">
              テキスト、画像、動画をThreadsに投稿
            </p>
          </Link>

          {/* 投稿管理 */}
          <Link
            href="/posts"
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 group"
          >
            <div className="text-4xl mb-4 flex justify-center">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors text-center">
              投稿管理
            </h3>
            <p className="text-gray-600 text-sm text-center">
              投稿の一覧、削除、返信を管理
            </p>
          </Link>

          {/* アナリティクス */}
          <Link
            href="/analytics"
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 group"
          >
            <div className="text-4xl mb-4 flex justify-center">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors text-center">
              アナリティクス
            </h3>
            <p className="text-gray-600 text-sm text-center">
              投稿のインサイトや統計情報を確認
            </p>
          </Link>

          {/* スケジュール */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 opacity-60">
            <div className="text-4xl mb-4 flex justify-center">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
              予約投稿
            </h3>
            <p className="text-gray-600 text-sm text-center">
              まもなく公開...
            </p>
          </div>
        </div>

        {/* 使い方セクション */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">🚀 使い方</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-4 mx-auto">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">設定</h3>
              <p className="text-gray-600 text-sm">
                まずはThreads APIのアクセストークンを設定します
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-4 mx-auto">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">投稿作成</h3>
              <p className="text-gray-600 text-sm">
                テキストや画像を含む投稿を作成できます
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-4 mx-auto">
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
