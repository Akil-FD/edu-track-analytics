
import client from './axios';

import type { ApiResponse } from '../types/api';

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum ArticleCategory {
  SCIENCE = 'Science',
  MATH = 'Math',
  ENGLISH = 'English',
  HISTORY = 'History',
  TECHNOLOGY = 'Technology',
  ART = 'Art',
}

export enum ContentBlockType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  THREE_D = '3d',
}

// ─── Request Types ───────────────────────────────────────────────────────────

export interface ArticleQueryParams {
  category?: ArticleCategory;
  search?: string;
  page?: string;
  limit?: string;
}

export interface ContentBlock {
  _id?: string;
  type: ContentBlockType;
  content: string;
  fileUrl?: string;
  caption?: string;
}

export interface CreateArticleRequest {
  title: string;
  category: ArticleCategory;
  contentBlocks?: ContentBlock[];
}

export interface UpdateArticleRequest {
  title?: string;
  category?: ArticleCategory;
  contentBlocks?: ContentBlock[];
}

export interface AnalyticsQueryParams {
  category?: ArticleCategory;
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
  contentBlocks: ContentBlock[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsResponse {
  kpis: {
    articlesCreated: number;
    totalStudentsRead: number;
    top3Categories: {
      _id: string;
      totalViews: number;
      totalDuration: number;
    }[];
  };
  viewsPerArticle: {
    _id: string;
    title: string;
    category: string;
    totalViews: number;
    totalDuration: number;
    uniqueStudents: number;
  }[];
  studentWiseEngagement: {
    _id: string;
    name: string;
    totalRead: number;
    totalViews: number;
    totalDuration: number;
  }[];
  dailyEngagement: {
    date: string;
    views: number;
    totalDuration: number;
    studentCount: number;
  }[];

}

export interface ArticlesListResponse {
  articles: ArticleData[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export interface ArticleResponse {
  article: ArticleData;
}

// ─── Teacher Service ─────────────────────────────────────────────────────────

export const teacherService = {

  async getAnalytics(params?: AnalyticsQueryParams): Promise<ApiResponse<AnalyticsResponse>> {
    const response = await client.get<ApiResponse<AnalyticsResponse>>('/analytics', {
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


  async getArticle(id: string): Promise<ApiResponse<ArticleResponse>> {
    const response = await client.get<ApiResponse<ArticleResponse>>(`/articles/${id}`);
    return response.data;
  },


  async createArticle(request: CreateArticleRequest): Promise<ApiResponse<{ article: ArticleData }>> {
    const formData = new FormData();
    formData.append('title', request.title);
    formData.append('category', request.category);

    if (request.contentBlocks) {
      formData.append('contentBlocks', JSON.stringify(request.contentBlocks));
    }

    const response = await client.post<ApiResponse<{ article: ArticleData }>>('/articles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateArticle(
    id: string,
    request: UpdateArticleRequest
  ): Promise<ApiResponse<{ article: ArticleData }>> {
    const formData = new FormData();

    if (request.title) formData.append('title', request.title);
    if (request.category) formData.append('category', request.category);
    if (request.contentBlocks) {
      formData.append('contentBlocks', JSON.stringify(request.contentBlocks));
    }

    const response = await client.put<ApiResponse<{ article: ArticleData }>>(`/articles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },


  async deleteArticle(id: string): Promise<ApiResponse<null>> {
    const response = await client.delete<ApiResponse<null>>(`/articles/${id}`);
    return response.data;
  },
};

