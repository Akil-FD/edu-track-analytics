
import client, {  } from './axios';

import type { ApiResponse } from '../types/api';
import { ROLES } from '../utils/constants';

// ─── Request Types ───────────────────────────────────────────────────────────

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: ROLES;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ─── Response Data Types ───────────────────────────────────────────────────

export interface UserData {
  _id: string;
  name: string;
  email: string;
  role: ROLES;
  avatar?: string;
}

export interface AuthData {
  token: string;
  user: UserData;
}

// ─── Auth Service ───────────────────────────────────────────────────────────

export const authService = {
  /**
   * Register a new user
   */
  async register(request: RegisterRequest): Promise<ApiResponse<AuthData>> {
    const response = await client.post<ApiResponse<AuthData>>('/auth/register', request);
    return response.data;
  },

  /**
   * Login user
   */
  async login(request: LoginRequest): Promise<ApiResponse<AuthData>> {
    const response = await client.post<ApiResponse<AuthData>>('/auth/login', request);
    return response.data;
  },
}