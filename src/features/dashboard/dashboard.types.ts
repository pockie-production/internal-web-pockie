export interface MetricValue {
  value: number | string;
  deltaPercent?: number;
  deltaLabel?: string;
}

export interface DashboardOverview {
  lastUpdatedAt: string;
  metrics: {
    totalUsers: MetricValue;
    newUsersToday: MetricValue;
    ekycVerified: MetricValue;
    ekycReviewRequired: MetricValue;
    chatSessionsToday: MetricValue;
    ocrJobsToday: MetricValue;
    pendingTrends: MetricValue;
    activeVouchers: MetricValue;
  };
  userGrowth: { date: string; users: number }[];
  queues: {
    ekycReview: ActionQueueItem[];
    pendingTrends: ActionQueueItem[];
    expiringVouchers: ActionQueueItem[];
    systemIssues: ActionQueueItem[];
  };
}

export interface ActionQueueItem {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  severity?: 'info' | 'success' | 'warning' | 'danger';
  createdAt: string;
  actionLabel: string;
  actionHref: string;
}

export interface EkycFunnel {
  stages: { key: string; label: string; value: number }[];
}

export interface FeatureUsage {
  features: { key: string; label: string; value: number }[];
}

export interface SystemHealth {
  services: {
    key: string;
    label: string;
    status: 'OK' | 'DEGRADED' | 'DOWN' | 'UNKNOWN';
    latencyMs: number;
    message: string;
  }[];
}
