import axios from 'axios';
import type { EkycListResponse, EkycSessionDetail } from './ekyc.types';

export const getEkycSessions = async (params: any = {}): Promise<EkycListResponse> => {
  const { data } = await axios.get<EkycListResponse>('/api/v1/internal/ekyc', { params });
  return data;
};

export const getEkycSessionDetail = async (id: string): Promise<EkycSessionDetail> => {
  const { data } = await axios.get<EkycSessionDetail>(`/api/v1/internal/ekyc/${id}`);
  return data;
};

export const approveEkycSession = async (id: string, note?: string): Promise<void> => {
  await axios.post(`/api/v1/internal/ekyc/${id}/approve`, { note });
};

export const rejectEkycSession = async (id: string, reason: string, note?: string): Promise<void> => {
  await axios.post(`/api/v1/internal/ekyc/${id}/reject`, { reason, note });
};

export const retryEkycSession = async (id: string, reason: string, note?: string): Promise<void> => {
  await axios.post(`/api/v1/internal/ekyc/${id}/retry`, { reason, note });
};

export const addEkycNote = async (id: string, note: string): Promise<void> => {
  await axios.post(`/api/v1/internal/ekyc/${id}/notes`, { note });
};
