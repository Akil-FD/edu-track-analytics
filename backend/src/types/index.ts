import { Document, Types } from 'mongoose';
import { Request } from 'express';

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum UserRole {
  TEACHER = 'teacher',
  STUDENT = 'student',
}

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

export enum HighlightColor {
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  PINK = 'pink',
}

// ─── Content Block ────────────────────────────────────────────────────────────

export interface IContentBlock {
  type: ContentBlockType;
  content: string;
  fileUrl: string;
  caption: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserPublic {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

// ─── Article ──────────────────────────────────────────────────────────────────

export interface IArticle extends Document {
  _id: Types.ObjectId;
  title: string;
  category: ArticleCategory;
  summary: string;
  contentBlocks: IContentBlock[];
  createdBy: Types.ObjectId | IUser;
  // isPublished: boolean;
  // tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface IAnalytics extends Document {
  _id: Types.ObjectId;
  articleId: Types.ObjectId | IArticle;
  studentId: Types.ObjectId | IUser;
  views: number;
  duration: number;
  lastRead: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Highlight ────────────────────────────────────────────────────────────────

export interface IHighlight extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId | IUser;
  articleId: Types.ObjectId | IArticle;
  text: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Request Extensions ───────────────────────────────────────────────────────

export interface AuthenticatedRequest extends Request {
  user: IUser;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

// ─── Analytics Aggregation Types ─────────────────────────────────────────────

export interface ViewsPerArticle {
  _id: Types.ObjectId;
  title: string;
  category: ArticleCategory;
  totalViews: number;
  totalDuration: number;
  uniqueStudents: number;
}

export interface CategoryStat {
  _id: string;
  totalViews: number;
  totalDuration: number;
}

export interface StudentWiseEngagement {
  _id: string;
  name: string;
  totalRead: number;
  totalViews: number;
  totalDuration: number;
}

export interface DailyEngagement {
  _id: string;
  date: string;
  views: number;
  studentCount: number;
  totalDuration: number;
}

export interface AnalyticsResponse {
  kpis: {
    articlesCreated: number;
    totalStudentsRead: number;
    top3Categories: CategoryStat[];
  };
  viewsPerArticle: ViewsPerArticle[];
  studentWiseEngagement: CategoryStat[];
  dailyEngagement: DailyEngagement[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
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
  readArticles: IAnalytics[];
  timePerCategory: TimePerCategory[];
  stats: StudentAnalyticsStats;
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

// ─── Request Body Types ───────────────────────────────────────────────────────

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface CreateArticleBody {
  title: string;
  category: ArticleCategory;
  summary?: string;
  contentBlocks?: string | IContentBlock[];
  tags?: string | string[];
}

export interface UpdateArticleBody extends Partial<CreateArticleBody> {
  isPublished?: boolean;
}

export interface TrackingBody {
  articleId: string;
  duration?: number;
}

export interface UpdateDurationBody {
  duration: number;
}

export interface CreateHighlightBody {
  articleId: string;
  text: string;
  note?: string;
}

export interface ArticleQueryParams {
  category?: string;
  search?: string;
  page?: string;
  limit?: string;
}

export interface AnalyticsQueryParams {
  category?: string;
  search?: string;
  page?: string;
  limit?: string;
}
