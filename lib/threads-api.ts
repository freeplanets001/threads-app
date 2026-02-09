/**
 * Threads API Client
 * Meta Threads API のクライアント実装
 */

const THREADS_API_BASE = 'https://graph.threads.net/v1.0'

export interface ThreadsPost {
  id: string
  media_product_type: string
  media_type: string
  media_url?: string
  permalink: string
  owner: {
    id: string
    username: string
  }
  username: string
  text?: string
  timestamp: string
  thumbnail_url?: string
  is_quote_post?: boolean
  children?: {
    data: ThreadsPost[]
    paging?: {
      next?: string
      previous?: string
    }
  }
  replies?: {
    data: ThreadsPost[]
    paging?: {
      next?: string
      previous?: string
    }
  }
  like_count?: number
}

export interface ThreadsUser {
  id: string
  username: string
  threads_profile_picture_url?: string
  threads_biography?: string
  hometile_url?: string
  follower_count?: number
  following_count?: number
  is_private?: boolean
}

export interface ThreadsContainerResponse {
  id: string
  status: string
}

export interface ThreadsPublishResponse {
  id: string
}

export interface ThreadsLimit {
  config: {
    threads_post_cap_quota: number
    threads_video_post_cap_quota: number
  }
  quota_usage: {
    threads_post_cap_quota: number
    threads_video_post_cap_quota: number
  }
}

export interface ThreadsConfig {
  accessToken: string
  userId?: string
}

export interface ThreadsUser {
  id: string
  username: string
  threads_profile_picture_url?: string
  threads_biography?: string
}

export interface ThreadsPublishResponse {
  id: string
}

export interface ThreadsConfig {
  accessToken: string
  userId?: string
}

export class ThreadsAPI {
  private accessToken: string
  private userId: string

  constructor(config: ThreadsConfig) {
    this.accessToken = config.accessToken
    this.userId = config.userId || ''
  }

  /**
   * ユーザー情報を取得
   */
  async getUser(fields: string = 'id,username,threads_profile_picture_url,threads_biography'): Promise<ThreadsUser> {
    const response = await fetch(
      `${THREADS_API_BASE}/me?fields=${fields}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch user')
    }

    return response.json()
  }

  /**
   * 投稿を作成（テキストのみ）
   * 注意: これはコンテナを作成するだけで、まだ公開されません
   */
  async createPostContainer(text: string, mediaType: 'TEXT' | 'IMAGE' | 'VIDEO' = 'TEXT'): Promise<string> {
    const url = new URL(`${THREADS_API_BASE}/${this.userId}/threads`)
    url.searchParams.append('media_type', mediaType)
    url.searchParams.append('text', text)

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to create post container')
    }

    const data = await response.json()
    return data.id
  }

  /**
   * 画像投稿を作成
   */
  async createImageContainer(imageUrl: string, text?: string): Promise<string> {
    const url = new URL(`${THREADS_API_BASE}/${this.userId}/threads`)
    url.searchParams.append('media_type', 'IMAGE')
    url.searchParams.append('image_url', imageUrl)
    if (text) {
      url.searchParams.append('text', text)
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to create image container')
    }

    const data = await response.json()
    return data.id
  }

  /**
   * ビデオ投稿を作成
   */
  async createVideoContainer(videoUrl: string, text?: string): Promise<string> {
    const url = new URL(`${THREADS_API_BASE}/${this.userId}/threads`)
    url.searchParams.append('media_type', 'VIDEO')
    url.searchParams.append('video_url', videoUrl)
    if (text) {
      url.searchParams.append('text', text)
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to create video container')
    }

    const data = await response.json()
    return data.id
  }

  /**
   * コンテナを公開
   */
  async publishContainer(containerId: string): Promise<ThreadsPublishResponse> {
    const url = new URL(`${THREADS_API_BASE}/${this.userId}/threads_publish`)
    url.searchParams.append('creation_id', containerId)

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to publish container')
    }

    return response.json()
  }

  /**
   * テキスト投稿を作成して公開
   */
  async publishText(text: string): Promise<ThreadsPublishResponse> {
    const containerId = await this.createPostContainer(text)
    return this.publishContainer(containerId)
  }

  /**
   * 画像投稿を作成して公開
   */
  async publishImage(imageUrl: string, text?: string): Promise<ThreadsPublishResponse> {
    const containerId = await this.createImageContainer(imageUrl, text)
    return this.publishContainer(containerId)
  }

  /**
   * ビデオ投稿を作成して公開
   */
  async publishVideo(videoUrl: string, text?: string): Promise<ThreadsPublishResponse> {
    const containerId = await this.createVideoContainer(videoUrl, text)
    return this.publishContainer(containerId)
  }

  /**
   * ユーザーの投稿を取得
   */
  async getUserPosts(fields: string = 'id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,thumbnail_url,children', limit: number = 25): Promise<ThreadsPost[]> {
    const url = new URL(`${THREADS_API_BASE}/${this.userId}/threads`)
    url.searchParams.append('fields', fields)
    url.searchParams.append('limit', limit.toString())

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch user posts')
    }

    const data = await response.json()
    return data.data || []
  }

  /**
   * 投稿の詳細を取得
   */
  async getPost(postId: string, fields: string = 'id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,thumbnail_url,children,replies'): Promise<ThreadsPost> {
    const response = await fetch(
      `${THREADS_API_BASE}/${postId}?fields=${fields}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch post')
    }

    return response.json()
  }

  /**
   * 投稿を削除
   */
  async deletePost(postId: string): Promise<boolean> {
    const response = await fetch(`${THREADS_API_BASE}/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    })

    return response.ok
  }

  /**
   * 返信を投稿
   */
  async reply(postId: string, text: string): Promise<ThreadsPublishResponse> {
    const url = new URL(`${THREADS_API_BASE}/${postId}/reply`)
    url.searchParams.append('media_type', 'TEXT')
    url.searchParams.append('text', text)

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to reply')
    }

    return response.json()
  }

  /**
   * 投稿に対するいいねを取得
   */
  async getLikes(postId: string, limit: number = 25): Promise<{ data: { id: string; username: string }[] }> {
    const response = await fetch(
      `${THREADS_API_BASE}/${postId}/likes?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch likes')
    }

    return response.json()
  }

  /**
   * 投稿に対する返信一覧を取得
   */
  async getReplies(postId: string, fields: string = 'id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,thumbnail_url', limit: number = 25): Promise<ThreadsPost[]> {
    const response = await fetch(
      `${THREADS_API_BASE}/${postId}/replies?fields=${fields}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch replies')
    }

    const data = await response.json()
    return data.data || []
  }

  /**
   * 複数ユーザーの情報を取得
   */
  async getUsers(userIds: string[], fields: string = 'id,username,threads_profile_picture_url,threads_biography'): Promise<ThreadsUser[]> {
    const response = await fetch(
      `${THREADS_API_BASE}/?ids=${userIds.join(',')}&fields=${fields}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch users')
    }

    const data = await response.json()
    return data.data || []
  }

  /**
   * ユーザーIDからユーザー情報を取得
   */
  async getUserById(userId: string, fields: string = 'id,username,threads_profile_picture_url,threads_biography,hometile_url,follower_count'): Promise<ThreadsUser> {
    const response = await fetch(
      `${THREADS_API_BASE}/${userId}?fields=${fields}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch user')
    }

    return response.json()
  }

  /**
   * 投稿制限を確認
   */
  async getContainerLimit(): Promise<ThreadsLimit> {
    const response = await fetch(
      `${THREADS_API_BASE}/me/threads/config`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch limits')
    }

    return response.json()
  }

  /**
   * カルーセル投稿を作成（複数画像）
   */
  async createCarouselContainer(imageUrls: string[], text?: string): Promise<string> {
    const children = imageUrls.map(url => ({
      media_type: 'IMAGE',
      image_url: url,
    }))

    const url = new URL(`${THREADS_API_BASE}/${this.userId}/threads`)
    url.searchParams.append('media_type', 'CAROUSEL')
    url.searchParams.append('children', JSON.stringify(children))
    if (text) {
      url.searchParams.append('text', text)
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        media_type: 'CAROUSEL',
        children,
        text,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to create carousel container')
    }

    const data = await response.json()
    return data.id
  }

  /**
   * カルーセル投稿を作成して公開
   */
  async publishCarousel(imageUrls: string[], text?: string): Promise<ThreadsPublishResponse> {
    const containerId = await this.createCarouselContainer(imageUrls, text)
    return this.publishContainer(containerId)
  }

  /**
   * 特定ユーザーの投稿を取得
   */
  async getUserPostsById(userId: string, fields: string = 'id,media_product_type,media_type,media_url,permalink,owner,username,text,timestamp,thumbnail_url', limit: number = 25): Promise<ThreadsPost[]> {
    const url = new URL(`${THREADS_API_BASE}/${userId}/threads`)
    url.searchParams.append('fields', fields)
    url.searchParams.append('limit', limit.toString())

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch user posts')
    }

    const data = await response.json()
    return data.data || []
  }

  /**
   * 投稿のinsights（分析データ）を取得
   */
  async getInsights(postId: string, metrics: string = 'views,likes,comments,quotes'): Promise<any> {
    const response = await fetch(
      `${THREADS_API_BASE}/${postId}/insights?metric=${metrics}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch insights')
    }

    return response.json()
  }

  /**
   * コンテナのステータスを確認
   */
  async getContainerStatus(containerId: string): Promise<ThreadsContainerResponse> {
    const response = await fetch(
      `${THREADS_API_BASE}/${containerId}?fields=status`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to fetch container status')
    }

    return response.json()
  }
}

/**
 * クライアントサイド用のヘルパー関数
 */
export async function createThreadsClient(): Promise<ThreadsAPI | null> {
  if (typeof window === 'undefined') return null

  const settings = localStorage.getItem('threadsSettings')
  if (!settings) return null

  const parsed = JSON.parse(settings)
  if (!parsed.threadsAccessToken) return null

  return new ThreadsAPI({
    accessToken: parsed.threadsAccessToken,
    userId: parsed.threadsUserId,
  })
}
