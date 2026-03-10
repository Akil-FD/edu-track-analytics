
import client from './axios';

import type { ApiResponse } from '../types/api';

// ─── Request Types ───────────────────────────────────────────────────────────

export interface ArticleQueryParams {
  category?: string;
  search?: string;
  page?: string;
  limit?: string;
}

export interface TrackingRequest {
  articleId: string;
  duration?: number;
}

export interface UpdateDurationRequest {
  duration: number;
}

export interface HighlightRequest {
  articleId: string;
  text: string;
  note?: string;
  color?: HighlightColor;
}

export enum HighlightColor {
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  PINK = 'pink',
}

// ─── Analytics Query Params ─────────────────────────────────────────────────

export interface AnalyticsQueryParams {
  category?: string;
  search?: string;
  page?: string;
  limit?: string;
}

// ─── Response Data Types ───────────────────────────────────────────────────

export interface ArticleData {
  _id: string;
  title: string;
  category: string;
  summary?: string;
  contentBlocks: {
    _id: string;
    type: string;
    content: string;
    fileUrl: string;
    caption: string;
  }[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TrackingRecord {
  _id: string;
  articleId: ArticleData;
  studentId: string;
  views: number;
  duration: number;
  lastRead: string;
  createdAt: string;
  updatedAt: string;
}

export interface HighlightData {
  _id: string;
  studentId: string;
  articleId: ArticleData;
  text: string;
  note: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAnalyticsStats {
  totalArticlesRead: number;
  totalReadingTime: number;
  totalViews: number;
}

export interface TimePerCategory {
  _id: string;
  totalDuration: number;
  articleCount: number;
}

export interface StudentAnalyticsData {
  readArticles: TrackingRecord[];
  timePerCategory: TimePerCategory[];
  stats: StudentAnalyticsStats;
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

// ─── Article List Response (wrapped in data) ─────────────────────────────────

export interface ArticlesListResponse {

  articles: ArticleData[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

// ─── Student Service ─────────────────────────────────────────────────────────

export const studentService = {
  async getAnalytics(params?: AnalyticsQueryParams): Promise<ApiResponse<StudentAnalyticsData>> {
    const response = await client.get<ApiResponse<StudentAnalyticsData>>('/analytics/student', {
      params,
    });
    return response.data;
  },

  async getArticles(params?: ArticleQueryParams): Promise<ApiResponse<ArticlesListResponse>> {
    const response = await client.get<ApiResponse<ArticlesListResponse>>('/articles', {
      params,
    });
    return response.data;
  },

  async getArticle(id: string): Promise<ApiResponse<{ article: ArticleData }>> {
    const response = await client.get<ApiResponse<{ article: ArticleData }>>(`/articles/${id}`);
    return response.data;
  },

  async logTracking(request: TrackingRequest): Promise<ApiResponse<{ record: TrackingRecord }>> {
    const response = await client.post<ApiResponse<{ record: TrackingRecord }>>('/tracking', request);
    return response.data;
  },


  async getHighlights(): Promise<ApiResponse<{ highlights: HighlightData[] }>> {
    const response = await client.get<ApiResponse<{ highlights: HighlightData[] }>>('/student/highlights');
    return response.data;
  },


  async getHighlightsByArticle(
    articleId: string
  ): Promise<ApiResponse<{ highlights: HighlightData[] }>> {
    const response = await client.get<ApiResponse<{ highlights: HighlightData[] }>>(
      `/student/highlights/${articleId}`
    );
    return response.data;
  },

  async createHighlight(request: HighlightRequest): Promise<ApiResponse<{ highlight: HighlightData }>> {
    const response = await client.post<ApiResponse<{ highlight: HighlightData }>>(
      '/student/highlights',
      request
    );
    return response.data;
  },

  async deleteHighlight(id: string): Promise<ApiResponse<null>> {
    const response = await client.delete<ApiResponse<null>>(`/student/highlights/${id}`);
    return response.data;
  },
};

