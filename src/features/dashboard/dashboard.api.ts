import axios from 'axios';
import type { DashboardOverview, EkycFunnel, FeatureUsage, SystemHealth } from './dashboard.types';

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const { data } = await axios.get<DashboardOverview>('/api/v1/internal/dashboard/overview');
  return data;
};

export const getEkycFunnel = async (): Promise<EkycFunnel> => {
  const { data } = await axios.get<EkycFunnel>('/api/v1/internal/dashboard/ekyc-funnel');
  return data;
};

export const getFeatureUsage = async (): Promise<FeatureUsage> => {
  const { data } = await axios.get<FeatureUsage>('/api/v1/internal/dashboard/feature-usage');
  return data;
};

export const getSystemHealth = async (): Promise<SystemHealth> => {
  const { data } = await axios.get<SystemHealth>('/api/v1/internal/dashboard/system-health');
  return data;
};
