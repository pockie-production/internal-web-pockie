import axios from 'axios';
import type { SyncJobsResponse, TrendDetail, TrendsResponse, VnSocialProjectsResponse } from './trends.types';

export interface GetTrendsParams {
  q?: string;
  status?: string;
  sentiment?: string;
  sourceChannel?: string;
  projectId?: string;
  page?: number;
  pageSize?: number;
}

export const getVnSocialProjects = async (): Promise<VnSocialProjectsResponse> => {
  const { data } = await axios.get<VnSocialProjectsResponse>('/api/v1/internal/vnsocial/projects');
  return data;
};

export const getVnSocialSyncJobs = async (): Promise<SyncJobsResponse> => {
  const { data } = await axios.get<SyncJobsResponse>('/api/v1/internal/vnsocial/sync-jobs');
  return data;
};

export const syncVnSocialProjects = async () => {
  const { data } = await axios.post('/api/v1/internal/vnsocial/sync-projects');
  return data;
};

export const syncVnSocialProjectPosts = async (projectId: string) => {
  const { data } = await axios.post(`/api/v1/internal/vnsocial/projects/${projectId}/sync-posts`);
  return data;
};

export const syncVnSocialProjectHotKeywords = async (projectId: string) => {
  const { data } = await axios.post(`/api/v1/internal/vnsocial/projects/${projectId}/sync-hot-keywords`);
  return data;
};

export const syncVnSocialProjectHotPosts = async (projectId: string) => {
  const { data } = await axios.post(`/api/v1/internal/vnsocial/projects/${projectId}/sync-hot-posts`);
  return data;
};

export const getTrends = async (params: GetTrendsParams = {}): Promise<TrendsResponse> => {
  const { data } = await axios.get<TrendsResponse>('/api/v1/internal/trends', { params });
  return data;
};

export const getTrendDetail = async (id: string): Promise<TrendDetail> => {
  const { data } = await axios.get<TrendDetail>(`/api/v1/internal/trends/${id}`);
  return data;
};

export const approveTrend = async (id: string, note?: string) => {
  const { data } = await axios.post(`/api/v1/internal/trends/${id}/approve`, { note });
  return data;
};

export const rejectTrend = async (id: string, reason?: string) => {
  const { data } = await axios.post(`/api/v1/internal/trends/${id}/reject`, { reason });
  return data;
};

export const deployTrend = async (id: string, note?: string) => {
  const { data } = await axios.post(`/api/v1/internal/trends/${id}/deploy`, { note });
  return data;
};

export const archiveTrend = async (id: string, note?: string) => {
  const { data } = await axios.post(`/api/v1/internal/trends/${id}/archive`, { note });
  return data;
};
