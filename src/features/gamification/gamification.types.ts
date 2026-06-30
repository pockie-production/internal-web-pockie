export interface Mission {
  id: string;
  code: string;
  title: string;
  description: string | null;
  missionType: string;
  targetValue: number;
  xpReward: number;
  status: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface GamificationProfile {
  id: string;
  userId: string;
  level: number;
  currentXp: number;
  totalXp: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate: string | null;
  user: {
    id: string;
    fullName: string;
    phoneNumber: string | null;
  };
}
