import { ArticleCategory, ContentBlock } from "../api/teacher";
import { ROLES } from "../utils/constants";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: ROLES;
}

export type ContentBlockType = 'text' | 'image' | 'video' | '3d';


export interface Article {
  _id: string;
  title: string;
  category: string;
  contentBlocks: ContentBlock[];
  createdBy: {
    name: string;
    _id: string;
    email: string;

  };
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  id: string;
  articleId: string;
  studentId: string;
  views: number;
  duration: number; // seconds
  lastReadAt: string;
}

export interface Highlight {
  id: string;
  studentId: string;
  articleId: string;
  text: string;
  note: string;
  timestamp: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: ROLES;
  token: string;
}

export type FilterCategory = 'All' | ArticleCategory;