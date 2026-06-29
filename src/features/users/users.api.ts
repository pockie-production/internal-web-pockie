import axios from 'axios';
import type { UserDetail, UsersListResponse, UserStatus } from './users.types';

export interface GetUsersParams {
  q?: string;
  accountType?: string;
  status?: string;
  kycStatus?: string;
  page?: number;
  pageSize?: number;
}

export const getUsers = async (params: GetUsersParams = {}): Promise<UsersListResponse> => {
  const { data } = await axios.get<UsersListResponse>('/api/v1/internal/users', { params });
  return data;
};

export const getUserDetail = async (id: string): Promise<UserDetail> => {
  const { data } = await axios.get<UserDetail>(`/api/v1/internal/users/${id}`);
  return data;
};

export const updateUserStatus = async (id: string, status: UserStatus, reason?: string) => {
  const { data } = await axios.patch(`/api/v1/internal/users/${id}/status`, { status, reason });
  return data;
};

export interface CreateUserPayload {
  email: string;
  password?: string;
  fullName?: string;
  roles: string[];
}

export const createUser = async (payload: CreateUserPayload) => {
  const { data } = await axios.post('/api/v1/internal/users', payload);
  return data;
};

