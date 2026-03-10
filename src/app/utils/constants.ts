
// ─── Storage Keys ───────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  AUTH: 'edu_auth',
} as const;

// ─── Frontend Routes ─────────────────────────────────────────────────────────

export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  TEACHER: {
    BASE: '/teacher',
    DASHBOARD: '/teacher/dashboard',
    ARTICLES: '/teacher/articles',
    ARTICLE_NEW: '/teacher/articles/new',
    ARTICLE_EDIT: '/teacher/articles/:id/edit',
    ANALYTICS: '/teacher/analytics',
  },
  STUDENT: {
    BASE: '/student',
    DASHBOARD: '/student/dashboard',
    ARTICLES: '/student/articles',
    ARTICLE_READ: '/student/articles/:id',
    PROFILE: '/student/profile',
  },
  NOT_FOUND: '*',
} as const;


export enum ROLES {
  TEACHER = 'teacher',
  STUDENT = 'student'
}

export const CATEGORY_COLORS: Record<string, string> = {
  Science: '#6366f1', Math: '#f59e0b', English: '#10b981',
  History: '#ef4444', Geography: '#8b5cf6', Art: '#ec4899',
  Music: '#14b8a6', Technology: '#f97316', Other: '#64748b',
};