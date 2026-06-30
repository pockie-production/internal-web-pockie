import axios from 'axios';
import type { Mission, GamificationProfile } from './gamification.types';

export const getMissions = async (): Promise<Mission[]> => {
  const { data } = await axios.get<Mission[]>('/api/v1/internal/gamification/missions');
  return data;
};

export const createMission = async (payload: Partial<Mission>): Promise<Mission> => {
  const { data } = await axios.post<Mission>('/api/v1/internal/gamification/missions', payload);
  return data;
};

export const updateMission = async (id: string, payload: Partial<Mission>): Promise<Mission> => {
  const { data } = await axios.put<Mission>(`/api/v1/internal/gamification/missions/${id}`, payload);
  return data;
};

export const getGamificationProfiles = async (): Promise<GamificationProfile[]> => {
  const { data } = await axios.get<GamificationProfile[]>('/api/v1/internal/gamification/profiles');
  return data;
};
