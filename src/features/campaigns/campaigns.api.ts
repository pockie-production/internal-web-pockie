import axios from 'axios';
import type { CreateCampaignDto, Campaign, CampaignsResponse } from './campaigns.types';

export const getCampaigns = async (params?: { skip?: number; take?: number; search?: string; status?: string }) => {
  const { data } = await axios.get<CampaignsResponse>('/api/v1/campaigns', { params });
  return data;
};

export const createCampaign = async (dto: CreateCampaignDto) => {
  const { data } = await axios.post<Campaign>('/api/v1/campaigns', dto);
  return data;
};

export const getCampaign = async (id: string) => {
  const { data } = await axios.get<Campaign>(`/api/v1/campaigns/${id}`);
  return data;
};

export const approveCampaign = async (id: string) => {
  const { data } = await axios.post<Campaign>(`/api/v1/campaigns/${id}/approve`);
  return data;
};

export const rejectCampaign = async (id: string) => {
  const { data } = await axios.post<Campaign>(`/api/v1/campaigns/${id}/reject`);
  return data;
};
