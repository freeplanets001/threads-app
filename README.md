# Threads Manager

Threads APIを使った投稿管理ツール

## 機能

- ✏️ **新規投稿** - テキスト、画像、動画、カルーセル投稿
- 📝 **投稿管理** - 投稿の一覧、削除、返信
- 💬 **返信機能** - 投稿への返信
- ❤️ **いいね一覧** - いいねしたユーザーの一覧
- 📊 **アナリティクス** - 投稿のインサイトや統計情報
- 👤 **プロフィール** - Threadsアカウント情報の表示

## 技術スタック

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS 4
- Threads Graph API v1.0

## 開始方法

```bash
# インストール
npm install

# 開発サーバー起動
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。

## デプロイ

[https://threads-app-awb9.vercel.app](https://threads-app-awb9.vercel.app)

## 使い方

1. `/settings` でThreads APIのアクセストークンを設定
2. `/publish` で新規投稿を作成
3. `/posts` で投稿を管理
4. `/analytics` で統計情報を確認
5. `/profile` でプロフィールを表示

## アクセストークンの取得方法

1. [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/)にアクセス
2. アプリを選択または作成
3. ユーザーアクセストークンを取得
4. 「threads_basic」「threads_content_publish」などの権限を付与
